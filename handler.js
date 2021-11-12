const serverless = require("serverless-http");
const express = require("express");
const fileUpload = require('express-fileupload');

const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
var AWS = require('aws-sdk');
const app = express();

AWS.config.update({region: 'us-east-1'});

app.use(fileUpload({
  createParentPath: true
}));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(express.static('uploads'));

const BUCKET_NAME = 'BUCKET_NAME';

async function uploadToS3 (file) {
  var s3 = new AWS.S3({apiVersion: '2006-03-01'});

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: file.name,
    Body: file.data
  };

  try {
    const res = await s3.upload (uploadParams, function (err, data) {
      if (err) {
        console.log("Error", err);
      } if (data) {
        console.log("Upload Success", data.Location);
      }
    });
    console.log(res)
  } catch (err) {
    console.log(err)
  }

  return res;
}

app.post('/upload', async (req, res) => {
  try {
      if(!req.files) {
          res.send({
              status: false,
              message: 'No file uploaded'
          });
      } else {
          const data = []; 
          const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];

          console.log(files)
          files.forEach(async (file) => {
            uploadToS3(file);
            
            data.push({
              name: file.name,
              mimetype: file.mimetype,
              size: file.size
            });
          })

          res.send({
            message: "File Uploaded",
              status: true,
              data: data
          });
      }
  } catch (err) {
      res.status(500).send(err.message);
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () =>
    console.log(`App is listening on port ${port}.`)
);

module.exports.handler = serverless(app);
