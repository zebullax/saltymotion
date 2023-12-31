const sqlPool = require('./sqlConnectionPool.js');
const _ = require('underscore');
const buildInStringFromSequence = require('./dbUtil.js').buildInStringFromSequence;

const selectAuctionHistoryForAtelier = async (atelierID) => {
  return new Promise(async (resolve, reject) => {
    sqlPool.query('' +
      'SELECT reviewerID as ID, nickname, bounty, timestamp ' +
      'FROM atelier_auction, user ' +
      'WHERE atelierID = ? AND user.ID = atelier_auction.reviewerID ' +
      'ORDER BY timestamp DESC;', [atelierID], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

module.exports.selectAuctionHistoryForAtelier = selectAuctionHistoryForAtelier;

const selectLatestAuctionValuesForUploader = async (uploaderID, idSequence = undefined) => {
  return new Promise(async (resolve, reject) => {
    sqlPool.query('' +
      'SELECT timestamp, atelierID, bounty, reviewerID as ID, nickname ' +
      'FROM latest_auction__view ' +
      'WHERE atelierID IN ' +
      `  (SELECT ID FROM atelier WHERE uploaderID = ? ${idSequence === undefined || _.isEmpty(idSequence) ? '' : ' and atelierID in ' + buildInStringFromSequence(idSequence)});`, [uploaderID],
    (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

module.exports.selectLatestAuctionValuesForReviewer = async (reviewerID, idSequence = undefined) => {
  return new Promise(async (resolve, reject) => {
    sqlPool.query('' +
      'SELECT timestamp, atelierID, bounty, reviewerID as ID, nickname ' +
      'FROM latest_auction__view ' +
      `WHERE reviewerID = ? ${idSequence === undefined ? '' : ' and atelierID in ' + buildInStringFromSequence(idSequence)}`, [reviewerID],
      (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

module.exports.selectLatestAuctionValuesForUploader = selectLatestAuctionValuesForUploader;

module.exports.selectCandidateReviewerFromAtelier = async (atelierID) => {
  return new Promise(async (resolve, reject) => {
    sqlPool.query('SELECT reviewerID from atelier_auction where atelierID = ?;', [atelierID], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};
