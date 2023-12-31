const sqlPool = require('./sqlConnectionPool');

/**
 * Select favorite reviewers ID and name for a user
 * @param {string} userID
 * @return {Promise<[{ID: string, name: string}]>}
 */
module.exports.selectUserFavorite = ({ userID }) => {
  const query = ''
    + 'SELECT reviewerID as ID, user.nickname AS name '
    + 'FROM reviewer_follower INNER JOIN user ON user.ID = reviewer_follower.reviewerID '
    + 'WHERE reviewer_follower.userID = ?;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [userID], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

/**
 * Insert reviewer ID into the set of user favorite reviewers
 * @param {number} userID
 * @param {number} reviewerID
 * @return {Promise<boolean>}
 */
module.exports.insertUserFavorite = function(userID, reviewerID) {
  return new Promise((resolve, reject) => {
    sqlPool.query(
        'INSERT INTO reviewer_follower (userID, reviewerID) values (?,?);',
        [userID, reviewerID],
        (err, res) => {
          if (err) {
            return reject(err);
          }
          resolve(res.affectedRows === 1);
        });
  });
};


/**
 * Remove reviewer ID from the set of user favorite reviewers
 * @param {number} userID
 * @param {number} reviewerID
 * @return {Promise<boolean>}
 */
module.exports.removeUserFavorite = function(userID, reviewerID) {
  return new Promise((resolve, reject) => {
    sqlPool.query(
        'DELETE FROM reviewer_follower WHERE userID = ? and reviewerID = ?;',
        [userID, reviewerID],
        (err, res) => {
          if (err) {
            return reject(err);
          }
          resolve(res.affectedRows === 1);
        });
  });
};
