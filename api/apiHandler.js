const serverless = require("serverless-http");
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const AWS = require("aws-sdk");
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan("dev"));
app.use(express.static("uploads"));

AWS.config.update({region: "us-east-1"});

app.use(fileUpload({
  createParentPath: true,
}));

const BUCKET_NAME = "BUCKET_NAME";

async function uploadToS3(file) {
  const s3 = new AWS.S3({apiVersion: "2006-03-01"});
  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: file.name,
    Body: file.data,
  };

  try {
    const stored = await s3.upload(uploadParams).promise();
    return stored;
  } catch (err) {
    console.log(err);
    return err;
  }
}

app.post("/upload", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded",
      });
      return;
    }
    const data = [];
    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    const fullResponse = [];

    files.forEach(async (file) => {
      const response = await uploadToS3(file);
      fullResponse.push(response);

      data.push({
        name: file.name,
        mimetype: file.mimetype,
        size: file.size,
      });

      if (fullResponse.length === files.length) {
        res.send({
          details: fullResponse,
          status: true,
          data: data,
        });
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const port = 3000;

app.listen(port, () =>
  console.log(`App is listening on port ${port}.`),
);

module.exports.handler = serverless(app);
