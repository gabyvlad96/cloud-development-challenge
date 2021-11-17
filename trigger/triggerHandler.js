const aws = require("aws-sdk");

aws.config.update({region: "us-east-1"});
const s3 = new aws.S3({apiVersion: "2006-03-01"});
const ddb = new aws.DynamoDB.DocumentClient();
const TABLE_NAME = "files_data_table";

async function writeToDb(key, contentType, ContentLength) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      "key": key,
      "content_type": contentType,
      "content_length": ContentLength,
    },
  };

  try {
    const res = await ddb.put(params).promise();
    console.log("Item was added to the database");
    return res;
  } catch (err) {
    console.log(err);
    return err;
  }
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.Records[0].body);
    const bucket = body.Records[0].s3.bucket.name;
    const key = decodeURIComponent(body.Records[0].s3.object.key.replace(/\+/g, " "));
    const params = {
      Bucket: bucket,
      Key: key,
    };
    const {ContentType, ContentLength} = await s3.getObject(params).promise();
    const result = await writeToDb(key, ContentType, ContentLength);
    return result;
  } catch (err) {
    console.error(err);
    reject(Error(err));
  }
};
