const sqlPool = require('./sqlConnectionPool.js');

/**
 * Get the userID from a google ID account
 * @param {string} googleID
 * @return {Promise<{ID: (number|undefined)}>}
 */
module.exports.findUserFromGoogleID = (googleID) => {
  return new Promise((resolve, reject) => {
    sqlPool.query('SELECT userID as ID FROM auth WHERE googleID = ?;', [googleID], (err, res) => {
      if (err) {
        return reject(err);
      }
      if (res.length === 0) {
        return resolve(undefined);
      }
      resolve({ID: res[0].ID});
    });
  });
};

module.exports.insertUserGoogleID = (userID, googleID) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO auth (userID, googleID) VALUES (?, ?) ON DUPLICATE KEY UPDATE googleID = ?;';
    sqlPool.query(query, [userID, googleID, googleID], (err, res) => {
      if (err || res.affectedRows !== 1) {
        return reject(err || new Error('Could not insert auth with that googleID'));
      }
      resolve();
    });
  });
};

/**
 * Get the userID from a google ID account
 * @param {string} twitterID
 * @return {Promise<{ID: (number|undefined)}>}
 */
module.exports.findUserFromTwitterID = (twitterID) => {
  return new Promise((resolve, reject) => {
    sqlPool.query('SELECT userID as ID FROM auth WHERE twitterID = ?;', [twitterID], (err, res) => {
      if (err) {
        return reject(err);
      }
      if (res.length === 0) {
        return resolve(undefined);
      }
      resolve({ID: res[0].ID});
    });
  });
};

module.exports.insertUserTwitterID = (userID, twitterID) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO auth (userID, twitterID) VALUES (?, ?) ON DUPLICATE KEY UPDATE twitterID = ?;';
    sqlPool.query(query, [userID, twitterID, twitterID], (err, res) => {
      if (err || res.affectedRows !== 1) {
        return reject(err || new Error('Could not insert auth with that twitterID'));
      }
      resolve();
    });
  });
};

/**
 * Get the userID from a twitch ID account
 * @param {string} twitchID
 * @return {Promise<{ID: (string|undefined)}>}
 */
module.exports.findUserFromTwitchAccountID = (twitchID) => {
  return new Promise((resolve, reject) => {
    sqlPool.query('SELECT userID as ID FROM auth WHERE twitchID = ?;', [twitchID], (err, res) => {
      if (err) {
        return reject(err);
      }
      if (res.length === 0) {
        return resolve(undefined);
      }
      resolve({ID: res[0].ID});
    });
  });
};

/**
 * Select the user password
 * @param {string} userID
 * @return {Promise<{password: (string|undefined)}>}
 */
module.exports.selectUserPasswordFromUserID = (userID) => {
  return new Promise((resolve, reject) => {
    sqlPool.query('SELECT password FROM user WHERE ID = ?;', [userID], (err, res) => {
      if (err || res.length === 0) {
        return reject(err || new Error('User not found'));
      }
      resolve(res[0]);
    });
  });
};

/**
 * Select the user password from its nickname
 * @param {string} username
 * @return {Promise<{password: (string|undefined)}>}
 */
module.exports.selectUserPasswordFromUsername = ({username}) => {
  return new Promise((resolve, reject) => {
    sqlPool.query('SELECT password, ID FROM user WHERE nickname = ?;', [username], (err, res) => {
      if (err || res.length === 0) {
        return reject(err || new Error('User not found'));
      }
      resolve(res[0]);
    });
  });
};

/**
 * Update user password
 * @param {string} password
 * @param {string} userID
 * @return {Promise<undefined>}
 */
module.exports.updateUserPassword = (password, userID) => {
  return new Promise((resolve, reject) => {
    sqlPool.query('UPDATE user SET password = ? WHERE ID = ?;', [password, userID], (err, res) => {
      if (err || res.affectedRows !== 1) {
        return reject(err || new Error('User not found'));
      }
      resolve();
    });
  });
};

module.exports.insertUserTwitchID = (userID, twitchID) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO auth (userID, twitchID) VALUES (?, ?) ON DUPLICATE KEY UPDATE twitchID = ?;';
    sqlPool.query(query, [userID, twitchID, twitchID], (err, res) => {
      if (err || res.affectedRows !== 1) {
        return reject(err || new Error('Could not insert auth with that twitchID'));
      }
      resolve();
    });
  });
};

module.exports.isUserOauthOnly = (userID) => {
  return new Promise((resolve, reject) => {
    sqlPool.query('SELECT password FROM user WHERE ID=?;', [userID], (err, res) => {
      if (err) {
        return reject(err);
      }
      if (res.length === 0) {
        return reject(new Error(`User ${userID} was not found`));
      }
      resolve(res[0].password == null);
    });
  });
};
