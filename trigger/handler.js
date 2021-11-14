const aws = require('aws-sdk');

aws.config.update({region: 'us-east-1'});
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
var ddb = new aws.DynamoDB.DocumentClient();

async function writeToDb (key, contentType, ContentLength) {
	var params = {
		TableName: 'files_data_table',
		Item: {
			'key': key,
			'content_type' : contentType,
			'content_length': ContentLength
		}
	};
   	try {
			const res = await ddb.put(params).promise();
			return("Item was added to the database");
		} catch (err) {
			console.log(err);
			return err;
		}
}

exports.handler = async (event, context) => {
	console.log('Received event:', JSON.stringify(event, null, 2));

	const bucket = event.Records[0].s3.bucket.name;
	const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
	const params = {
		Bucket: bucket,
		Key: key,
	}; 
	try {
		const { ContentType, ContentLength } = await s3.getObject(params).promise();
		const result = await writeToDb(key, ContentType, ContentLength);
		return result;
	} catch (err) {
		console.log(err);
		throw new Error(message);
	}
};