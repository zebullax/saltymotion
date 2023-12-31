const fs = require('fs').promises;
const {s3Client} = require('./s3Client.js');

/**
 * Upload a local file to S3 bucket
 * @async
 * @param {string} bucketName
 * @param {string} localFilename
 * @param {string} keyName
 * @param {string} contentType
 * @return {Promise<undefined|Error>}
 */
const uploadFileToS3Bucket = async function(bucketName, localFilename, keyName, contentType = undefined) {
  try {
    const blob = await fs.readFile(localFilename);
    const params = {
      Body: blob,
      ACL: 'public-read',
      Bucket: bucketName,
      Key: keyName,
      ContentType: contentType,
      s3BucketEndpoint: true,
    };
    await s3Client.upload(params).promise();
    return undefined;
  } catch (err) {
    console.error(`Error in uploadFileToS3Bucket with file ${localFilename}: ${JSON.stringify(err)}`);
    return err;
  }
};

/**
 * Remove a file from a S3 bucket
 * @async
 * @param {string} bucketName
 * @param {string} filename
 * @return {Promise<undefined|Error>}
 */
const removeFileFromS3Bucket = async function(bucketName, filename) {
  const params = {Bucket: bucketName, Key: filename};
  // Check for file existence
  try {
    await s3Client.headObject(params).promise();
  } catch (err) {
    console.error(`Error in removeFileFromS3Bucket, ${filename} in ${bucketName} does not exist: ${err}`);
    return err;
  }
  try {
    await s3Client.deleteObject(params).promise();
  } catch (err) {
    console.error(`Error in removeFileFromS3Bucket, can not delete ${filename} in ${bucketName}: ${err}`);
    return err;
  }
  return undefined;
};

/**
 * Rename a file sitting in a S3 bucket
 * @param {string} from
 * @param {string} to
 * @param {string} bucketName
 * @param {string} [ACL]
 * @return {Promise<undefined|Error>}
 */
module.exports.renameFileInBucket = async ({
  from,
  to,
  bucketName,
  ACL = 'public-read',
}) => {
  try {
    await s3Client.copyObject({
      Bucket: bucketName,
      ACL,
      CopySource: `/${bucketName}/${from}`,
      Key: to,
    }).promise();
  } catch (e) {
    return new Error(`Error in renameFileInBucket, ${from} to ${to} in ${bucketName}: ${e}`);
  }
  try {
    await s3Client.deleteObject({Key: from, Bucket: bucketName}).promise();
  } catch (e) {
    return new Error(`Error in deleteObject, ${from} in ${bucketName}: ${e}`);
  }
  return undefined;
};

/**
 * Upload an atelier preview picture to S3
 * @param {string} localFilename Local candidate video filename
 * @param {string} keyName Target filename to save under S3
 * @return {Promise<undefined|Object>}
 */
module.exports.uploadAtelierPreviewFile = async function(localFilename, keyName) {
  return await uploadFileToS3Bucket('saltymotion-atelier-preview', localFilename, keyName);
};

/**
 * Upload a local candidate video to S3
 * @param {string} localFilename Local candidate video filename
 * @param {string} keyName Target filename to save under S3
 * @return {Promise<undefined|Object>}
 */
module.exports.uploadAtelierCandidateFile = async function(localFilename, keyName) {
  return await uploadFileToS3Bucket('saltymotion-atelier-candidate', localFilename, keyName, 'video/mp4');
};

/**
 * Remove an uploaded match video file
 * @async
 * @param {string} keyName
 * @return {Promise<Error|undefined>}
 */
module.exports.removeAtelierCandidateFile = async function(keyName) {
  return await removeFileFromS3Bucket('saltymotion-atelier-candidate', keyName);
};

/**
 * Upload a local profile picture file to S3
 * @param {string} localFilename - Local profile picture
 * @param {string} keyName - Target filename to save under S3
 * @return {Promise<undefined|Error>}
 */
module.exports.uploadUserProfilePictureFile = async function(localFilename, keyName) {
  return await uploadFileToS3Bucket('saltymotion-user-profile', localFilename, keyName);
};

/**
 * Upload a review video to S3
 * @param {string} localFilename - Local file path
 * @param {string} keyName - object key on S3 bucket
 * @param {string} mimeType
 * @return {Promise<undefined|Error>}
 */
module.exports.uploadReviewFile = async function(localFilename, keyName, mimeType) {
  return await uploadFileToS3Bucket('saltymotion-atelier-review', localFilename, keyName, mimeType);
};
