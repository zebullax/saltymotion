const atelierQuery = require('./db/atelierQuery.js');
const cashQuery = require('./db/cashQuery.js');
const auctionQuery = require('./db/auctionQuery.js');
const atelierUtil = require('./atelierStatus.js');
const {
  isAtelierInAuction, isAtelierComplete, isAtelierInProgress,
} = require('./atelierStatus.js');
const _ = require('underscore');

const {
  GAME_CATEGORY_LABEL,
  REVIEWER_CATEGORY_LABEL,
  UPLOADER_CATEGORY_LABEL,
  TAG_CATEGORY_LABEL,
  ATELIER_CATEGORY_LABEL,
  EXPLORE_CATEGORY_LABEL,
} = require('./applicationSettings.js');

const checkIsAtelierEditable = async (atelierID) => {
  const {currentStatus} = await atelierQuery.selectAtelierStatus(atelierID);
  return atelierUtil.isAtelierInAuction(currentStatus) || atelierUtil.isAtelierInProgress(currentStatus);
};

module.exports.checkIsAtelierEditable = checkIsAtelierEditable;

const checkIsAtelierInAuction = async (atelierID) => {
  const {currentStatus} = await atelierQuery.selectAtelierStatus(atelierID);
  return atelierUtil.isAtelierInAuction(currentStatus);
};
module.exports.checkIsAtelierInAuction = checkIsAtelierInAuction;

const checkIsAtelierOwner = async (atelierID, userID) => {
  const uploaderID = await atelierQuery.selectAtelierUploaderID(atelierID);
  return uploaderID === userID;
};
module.exports.checkIsAtelierOwner = checkIsAtelierOwner;

const checkIsAtelierReviewer = async (atelierID, userID) => {
  const reviewer = await atelierQuery.selectAtelierReviewer(atelierID);
  return reviewer.reviewerID === userID;
};
module.exports.checkIsAtelierReviewer = checkIsAtelierReviewer;

/**
 * Check whether an user is among an atelier auction candidate
 * @param {number} atelierID
 * @param {string} userID
 * @return {Promise<boolean>}
 */
const checkIsAtelierCandidate = async (atelierID, userID) => {
  const candidates = await auctionQuery.selectCandidateReviewerFromAtelier(atelierID);
  if (candidates === undefined) {
    return false;
  }
  return candidates.find((candidate) => (candidate.reviewerID === userID)) !== undefined;
};
module.exports.checkIsAtelierCandidate = checkIsAtelierCandidate;

/**
 * Check if user wallet has enough free coins
 * @param {string} userID - User whose account is checked
 * @param {number} amount - Threshold against which we check
 * @return {Promise<boolean>}
 */
module.exports.checkAccountBalance = async (userID, amount) => {
  try {
    const {freeCoin} = await cashQuery.selectUserBalance(userID);
    return amount <= freeCoin;
  } catch (e) {
    return false;
  }
};

module.exports.checkIsEmailValid = (email) => {
  // eslint-disable-next-line max-len
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

module.exports.checkIsPictureTypeValid = (pictureType) => _.contains(['jpeg', 'png'], pictureType);

module.exports.checkIsBrowseCategoryValid = (category) => {
  const validCategory = [
    GAME_CATEGORY_LABEL, REVIEWER_CATEGORY_LABEL, UPLOADER_CATEGORY_LABEL,
    TAG_CATEGORY_LABEL, ATELIER_CATEGORY_LABEL, EXPLORE_CATEGORY_LABEL,
  ];
  return _.contains(validCategory, category);
};

module.exports.checkIsAtelierAccessible = ({
  isCandidate,
  isVisitor,
  isReviewer,
  isUploader,
  isPrivate,
  atelierStatusID,
}) => {
  const isComplete = isAtelierComplete(atelierStatusID);
  const isAuction = isAtelierInAuction(atelierStatusID);
  const isInProgress = isAtelierInProgress(atelierStatusID);
  if (isVisitor) {
    return !(isPrivate || !isComplete);
  }
  if (!isComplete && !isAuction && !isInProgress) {
    return false;
  }
  if (isUploader) {
    return true;
  }
  if (isReviewer) {
    return isInProgress || isComplete;
  }
  if (isCandidate) {
    return isAuction;
  }
  if (!isCandidate && !isReviewer && !isUploader) {
    return !isPrivate;
  }
  return false;
};

/**
 * Check if the user is allowed to post on the atelier
 * Messaging is allowed if either : The atelier is public or ...
 *                                  The user is the owner or the reviewer, or ...
 *                                  The atelier is in auction and the user is a candidate reviewer
 * @param {number} atelierID
 * @param {string} userID
 * @return {Promise<boolean|*>}
 */
module.exports.checkIsMessageAllowed = async (atelierID, userID) => {
  const {uploaderID, reviewerID} = await atelierQuery.selectAtelierReviewerAndUploader(atelierID);
  return !await atelierQuery.selectAtelierIsPrivate(atelierID)
    || (uploaderID === userID || reviewerID === userID)
    || (await checkIsAtelierInAuction(atelierID) && await checkIsAtelierCandidate(atelierID, userID));
};

/**
 * Check that a mime type is appropriate for video upload
 * @param {string} mimeType
 * @return {boolean}
 */
module.exports.checkIsVideoMimeType = function(mimeType) {
  const allowedTypes = ['mp4', 'webm'];
  return allowedTypes.indexOf(mimeType) !== -1;
};
