const {userType, activityRefID} = require('../activity.js');
const sqlPool = require('./sqlConnectionPool.js');

/**
 * Insert a new activity row
 * No validation done on the input parameter
 * @param {ActivityDescription} activityDescription
 * @return {Promise<err|number>}
 */
module.exports.insertAtelierActivity = (activityDescription) => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line max-len
    const query = 'INSERT INTO activity (sourceTypeID, sourceUserID, targetTypeID, targetUserID, activityRefID, linkedID, timestamp) VALUES (?,?,?,?,?,?,?);';
    sqlPool.query(query, [
      activityDescription.sourceActor.typeID,
      activityDescription.sourceActor.typeID === userType.user ? activityDescription.sourceActor.userID : null,
      activityDescription.targetActor.typeID,
      activityDescription.targetActor.typeID === userType.user ? activityDescription.targetActor.userID : null,
      activityDescription.activityRefID,
      activityDescription.linkedID,
      activityDescription.timestamp,
    ], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result.insertId);
    });
  });
};

/**
 * Delete activity row linked to a message post
 * @param {number} msgID
 * @param {number} posterID
 * @return {Promise<number|Error>}
 */
module.exports.removeMessageActivity = function(msgID, posterID) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line max-len
    const query = 'DELETE FROM activity WHERE linkedID = ? AND activityRefID = ? AND sourceTypeID = 1 AND sourceUserID = ?;';
    sqlPool.query(query, [msgID, activityRefID.commentAtelier, posterID], (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res.affectedRows);
    });
  });
};
