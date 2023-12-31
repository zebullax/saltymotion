const aws = require('aws-sdk');

module.exports.s3Client = new aws.S3({
  credentials: new aws.SharedIniFileCredentials({profile: process.env.AWS_CREDENTIAL_PROFILE}),
  region: process.env.AWS_REGION,
});
