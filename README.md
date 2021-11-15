## Introduction
The application is composed of a back-end service that exposes an API endpoint used for uploading files. The service stores the files in AWS S3 and adds details about the files into a DynamoDB database.

## Usage
The endpoint is available at https://5q2f6fyes7.execute-api.us-east-1.amazonaws.com/dev/upload  
For authorization, you need to set the following header when making the request
```
{"Authorization": "allowTest"}
```

To upload the application to AWS you need to have **Serverless** configured.  
The next step is to modify the `env_var` inside `serverless.yml` to add a name for the S3 bucket you want to store the files in and to add your own AWS ARN. Also, you need to add the name of the bucket in `api/apiHandler.js`  
Then, deploy the architecture to AWS using

```
serverless deploy
```

## Architecture diagram

![Diagram](https://github.com/gabyvlad96/cloud-development-challenge/blob/main/Diagram.png)
