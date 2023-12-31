/* eslint-disable max-len */

// Node/Express
const crypto = require('crypto');
const path = require('path');
// Saltymotion
const _ = require('underscore');
const sqlPool = require('./sqlConnectionPool');
const dbUtil = require('./dbUtil');
const snsQuery = require('./snsQuery');
const appLogger = require('../log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

// Libs

/**
 * Return a query parameter object
 * @return {buildUserQueryParameter}
 */
module.exports.buildUserQueryParameter = () => ({
  filter: {
    name: undefined,
    nameHint: undefined,
    userID: undefined,
    stripeCustomerID: undefined,
  },
  tweaker: {
    keepPrivateFields: false,
    getLanguageFields: false, // Not available on every filter type, check code to make sure you get the languages back
    getSnsAccounts: false,
    getFavoriteReviewers: false,
    isMinimumQuery: false,
  },
  setFullName(newFullName) {
    this.filter.name = newFullName;
    return this;
  },
  setHintName(newHintName) {
    this.filter.nameHint = newHintName;
    return this;
  },
  setUserID(newUserID) {
    this.filter.userID = newUserID;
    return this;
  },
  setStripeCustomerID(stripeCustomerID) {
    this.filter.stripeCustomerID = stripeCustomerID;
    return this;
  },
  setKeepPrivateFields(newKeep) {
    this.tweaker.keepPrivateFields = newKeep;
    return this;
  },
  setSnsAccountsSelected(isSelected) {
    this.tweaker.getSnsAccounts = isSelected;
    return this;
  },
  setGetLanguageFields(isGet) {
    this.tweaker.getLanguageFields = isGet;
    return this;
  },
  setIsMinimumQuery(isMinimumQuery) {
    this.tweaker.isMinimumQuery = isMinimumQuery;
    return this;
  },
});

/**
 * Select the nickname of user from ID
 * @param {string} userID
 * @return {Promise<string>}
 */
module.exports.selectUserNickname = async (userID) => new Promise((resolve, reject) => {
  sqlPool.query('SELECT nickname FROM user WHERE ID = ?;', [userID], (err, res) => {
    if (err) {
      reject(err);
    } else {
      resolve(res[0].nickname);
    }
  });
});

/**
 * Update a user to set the stripe customer ID
 * @param {string} userID
 * @param {string} stripeCustomerID
 * @return {Promise<unknown>}
 */
module.exports.setStripeCustomerID = async ({ userID, stripeCustomerID }) => new Promise((resolve, reject) => {
  sqlPool.query('update user set stripeCustomerID = ? where ID = ?', [stripeCustomerID, userID], (err, result) => {
    if (err || result.affectedRows !== 1) {
      reject(err || `Error in setStripeCustomerID: No update for user ${userID}`);
    } else {
      resolve();
    }
  });
});

/**
 * Select the user customerID
 * @param {string} userID
 * @return {Promise<string>}
 */
module.exports.selectStripeCustomerID = async ({ userID }) => new Promise((resolve, reject) => {
  const query = 'SELECT stripeCustomerID FROM user WHERE ID = ?;';
  sqlPool.query(query, [userID], (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result[0]?.stripeCustomerID);
    }
  });
});

/**
 * Update a user set of languages
 * @param {string} userID
 * @param {Language[]} languages
 * @return {Promise<object[]|void>}
 */
module.exports.updateUserLanguage = async ({
  userID,
  languages,
}) => {
  if (languages.length === 0) {
    return Promise.resolve();
  }
  const languageCodes = languages.map((language) => language.isoCode);
  const removeLanguagePromise = () => new Promise((resolve, reject) => {
    const query = ''
      + 'WITH currentLanguages AS (SELECT languageID FROM user_language WHERE userID = ?) '
      + 'DELETE FROM user_language '
      + 'WHERE languageID IN (SELECT languageID FROM currentLanguages) '
      + 'AND languageID NOT IN (?) '
      + 'AND userID = ?; ';
    sqlPool.query(query, [userID, languageCodes, userID], (err) => {
      if (err) {
        appLogger.error(`Error in updateLanguage del: ${err}`);
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });

  const addLanguagePromise = () => new Promise((resolve, reject) => {
    const query = ''
      + 'INSERT IGNORE INTO user_language(userID, languageID) '
      + 'SELECT ? as userID, id as languageID from language_ref where `iso_639-1` in (?);';
    sqlPool.query(query, [userID, languageCodes], (err) => {
      if (err) {
        appLogger.error(`Error in updateLanguage add: ${err}`);
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
  return Promise.all([
    languageCodes.length === 0 ? Promise.resolve() : removeLanguagePromise(),
    languageCodes.length === 0 ? Promise.resolve() : addLanguagePromise(),
  ]);
};

/**
 * Update an user profile
 * @param {string} userID
 * @param {string} [email]
 * @param {string} [selfIntroduction]
 * @param {string} [countryCode]
 * @param {number} [accountStatusID]
 * @param {string} [timezone]
 * @return {Promise<Error|undefined>}
 */
module.exports.updateUser = ({
  userID,
  email,
  countryCode,
  selfIntroduction,
  accountStatusID,
  timezone,
}) => {
  if (userID === undefined) {
    return Promise.reject(new Error('Missing userID in updateUser'));
  }
  // All fields being optional, this is not considered an error
  if (_.every([email, countryCode, selfIntroduction, accountStatusID, timezone], (elem) => elem === undefined)) {
    return Promise.resolve(undefined);
  }
  return new Promise((resolve, reject) => {
    sqlPool.getConnection((errConnect, connection) => {
      if (errConnect) {
        reject(errConnect);
      }
      let query = `update user set ${email !== undefined ? `email = ${connection.escape(email)},` : ''}`
        + `${selfIntroduction !== undefined ? `selfIntroduction = ${connection.escape(selfIntroduction)},` : ''}`
        + `${timezone !== undefined ? `timezone = ${connection.escape(timezone)},` : ''}`
        + `${countryCode !== undefined ? `countryCode = ${connection.escape(countryCode)},` : ''}`
        + `${accountStatusID !== undefined ? `accountStatusID = ${connection.escape(accountStatusID)},` : ''}`;
      query = `${query.slice(0, -1)} where ID = ${connection.escape(userID)};`;
      sqlPool.query(query, (err, result) => {
        if (err || result.affectedRows !== 1) {
          appLogger.error(`Error in updateUser: ${err}`);
          connection.release();
          reject(err || 'No rows were updated');
        }
        resolve(undefined);
      });
    });
  });
};

/**
 * Create a new user
 * @param {string} userID
 * @param {string} nickname
 * @param {string} [password]
 * @param {string} [email]
 * @param {string} [timezone]
 * @param {string} [countryCode]
 * @return {Promise<Error|number>}
 */
module.exports.createUser = async ({
  userID, nickname, password, email, timezone, countryCode,
}) => {
  const query = 'INSERT INTO user (ID, password, nickname, email, timezone, countryCode, accountStatusID) '
      + 'VALUES (?, ?, ?, ?, ?, ?, ?)';
  return new Promise((resolve, reject) => {
    const ACCOUNT_CREATED_STATUS = 0;
    sqlPool.query(
      query,
      [userID, password, nickname, email, timezone, countryCode, ACCOUNT_CREATED_STATUS],
      (err, result) => {
        if (err || result.affectedRows !== 1) {
          reject(err || new Error(`Could not create user ${nickname}, ${email}, ${timezone}/${countryCode}`));
        } else {
          resolve(undefined);
        }
      },
    );
  });
};

/**
 * Create a new user without a password, auth will be done through oauth only
 * @param {string} userID
 * @param {string} nickname
 * @param {string} email
 * @return {Promise<unknown>}
 */
module.exports.createOauthUser = async ({ userID, nickname, email }) => {
  const ACCOUNT_CONFIRMED_STATUS = 1;
  const query = 'INSERT INTO user (ID, nickname, email, accountStatusID) VALUES (?, ?, ?, ?)';
  return new Promise((resolve, reject) => {
    sqlPool.query(
      query,
      [userID, nickname, email, ACCOUNT_CONFIRMED_STATUS],
      (err, result) => {
        if (err || result.affectedRows !== 1) {
          return reject(err || new Error(`Could not create user ${nickname} with email ${email}`));
        }
        return resolve(undefined);
      },
    );
  });
};

/**
 * Select a list of ateliers for a user from his list of favorite games
 * @param {number} userID - Assume is a valid number
 * @param {boolean} isPrivateFiltered
 * @param {number} [offset]
 * @param {number} [limit]
 * @return {Promise<[Object]>}
 */
module.exports.selectUserRecommendationsFromFavoriteGame = async ({
  userID,
  isPrivateFiltered,
  offset = 0,
  limit = undefined,
}) => {
  const query = ''
    + 'SELECT atelierID,originalName, creationTimestamp, reviewerID, reviewerNickname, uploaderID, '
      + 'uploaderNickname, bounty, gameName, currentStatus, atelier_aggregated_info__view.gameID, isPrivate, description, title, score, nbViews, candidateReviewerID '
    + 'FROM atelier_aggregated_info__view INNER JOIN game_follower ON game_follower.gameID = atelier_aggregated_info__view.gameID '
    + `WHERE game_follower.userID = ? ${isPrivateFiltered ? 'AND isPrivate = 0' : ''} `
    + 'ORDER BY creationTimestamp DESC, nbViews DESC '
    + `${dbUtil.buildLimitString(offset, limit)} ;`;

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
 * Select a list of ateliers for a user from his list of favorite games
 * @param {number} userID - Assume is a valid number
 * @param {boolean} isPrivateFiltered
 * @param {number} [offset]
 * @param {number} [limit]
 * @return {Promise<[Object]>}
 */
module.exports.selectUserRecommendationsFromFavoriteReviewer = async ({
  userID,
  isPrivateFiltered,
  offset = undefined,
  limit = undefined,
}) => {
  const query = ''
    + 'SELECT atelierID,originalName, creationTimestamp, reviewer_follower.reviewerID, reviewerNickname, uploaderID, '
      + 'uploaderNickname, bounty, gameName, currentStatus, gameID, isPrivate, description, title, score, nbViews, candidateReviewerID '
    + 'FROM atelier_aggregated_info__view INNER JOIN reviewer_follower ON reviewer_follower.reviewerID = atelier_aggregated_info__view.reviewerID '
    + `WHERE reviewer_follower.userID = ? ${isPrivateFiltered ? 'AND isPrivate = 0' : ''} `
    + 'ORDER BY creationTimestamp DESC, nbViews DESC '
    + `${dbUtil.buildLimitString(offset, limit)} ;`;

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
 * Get an user Stripe Account ID
 * @param {string} userID
 * @return {Promise<{ID: (number|undefined)}>}
 */
module.exports.getUserStripeAccountID = (userID) => new Promise((resolve, reject) => {
  sqlPool.query('SELECT stripeAccountID as ID FROM user WHERE ID = ?;', [userID], (err, res) => {
    if (err) {
      reject(err);
    }
    if (res.length === 0) {
      resolve({ ID: undefined });
    } else {
      resolve({ ID: res[0].ID });
    }
  });
});

/**
 * Link a saltyID with a stripe accountID
 * @param {number} userID
 * @param {string|null} stripeAccountID
 * @return {Promise<(undefined|Error)>}
 */
module.exports.setStripeAccountID = (userID, stripeAccountID) => new Promise((resolve, reject) => {
  sqlPool.query(
    'UPDATE user SET stripeAccountID = ? where ID = ?;',
    [stripeAccountID, userID],
    (err, res) => {
      if (err || res.affectedRows !== 1) {
        return reject(err || new Error('Could not insert auth with that stripeAccountID'));
      }
      return resolve();
    },
  );
});

/**
 * Create and store a secret token to be used for account confirmation
 * @async
 * @param {number} userID
 * @return {Promise<Error|number>}
 */
module.exports.createUserAccountConfirmationSecret = async (userID) => new Promise((resolve, reject) => {
  const secret = crypto.randomUUID();
  sqlPool.query(
    'INSERT INTO registration_stash (userID, uuid, expire) VALUES (?,?, (SELECT NOW() + 1 day));',
    [userID, secret],
    (err, result) => {
      if (err || result.affectedRows !== 1) {
        return reject(err || new Error(`Could not create email validation link for user ${userID}`));
      }
      return resolve(secret);
    },
  );
});

/**
 * Select the expiration timestamp for account validation secret link
 * @param {string} userID
 * @param {string} secret
 * @return {Promise<Error|Date>}
 */
module.exports.selectSecretExpirationForUser = async ({ userID, secret }) => new Promise((resolve, reject) => {
  sqlPool.query('SELECT `expire` from registration_stash where userID = ? and uuid = ?;', [userID, secret], (err, result) => {
    if (err || result.length === 0) {
      return reject(err || new Error(`No confirmation record found for user ${userID} and secret ${secret}`));
    }
    return resolve(_.first(result).expire);
  });
});

/**
 * Set an account as active
 * @todo merge with update user
 * @param {string} userID
 * @param {number} accountStatusID
 * @return {Promise<Error|object>}
 */
module.exports.updateUserAccountStatus = async ({ userID, accountStatusID }) => new Promise((resolve, reject) => {
  sqlPool.query(
    'update user set accountStatusID = ?  where ID = ?;',
    [accountStatusID, userID],
    (err, result) => {
      if (err || result.affectedRows !== 1) {
        reject(err || new Error(`No update for user ${userID}`));
      } else {
        resolve(result);
      }
    },
  );
});

/**
 * Count how many rows would be returned when running the query
 * @param {buildUserQueryParameter} queryParam -
 * @return {Promise<number>}
 */
module.exports.countQueryResult = async (queryParam) => {
  const { userID, nameHint, name } = queryParam.filter;

  return new Promise((resolve, reject) => {
    // 1.User ID to filter on
    if (userID !== undefined) {
      if (_.isArray(userID)) {
        sqlPool.query('SELECT count(*) as count FROM user WHERE user.ID in ();', [userID], (err, result) => {
          if (err) {
            return reject(err);
          }
          return resolve(result[0].count);
        });
      } else if (_.isNumber(userID)) {
        sqlPool.query('SELECT count(*) as count FROM user WHERE user.ID = ?;', [userID], (err, result) => {
          if (err) {
            return reject(err);
          }
          return resolve(result[0].count);
        });
      } else {
        reject(new Error(`Argument type invalid for 'userID': ${userID}`));
      }
    }
    // 2.Full nickname
    if (name !== undefined) {
      sqlPool.query('SELECT count(*) as count FROM user WHERE user.nickname = ?;', [name], (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result[0].count);
      });
    } else if (nameHint !== undefined) {
      sqlPool.query('SELECT count(*) as count FROM user WHERE user.nickname LIKE ?', [`%${nameHint}%`], (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result[0].count);
      });
    } else {
      sqlPool.query('SELECT count(*) as count FROM user', (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result[0].count);
      });
    }
  });
};

/**
 * Select an user spoken language
 * @param {string} userID
 * @return {Promise<[{isoCode: string, name: string}]>}
 */
const selectUserLanguage = async (userID) => {
  const query = 'SELECT GROUP_CONCAT(`iso_639-1`) as isoCode, GROUP_CONCAT(`name`) as name '
    + 'FROM user_language '
    + 'INNER JOIN language_ref '
    + 'ON user_language.languageID = language_ref.id '
    + 'WHERE user_language.userID = ?';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [userID], (err, result) => {
      if (err) {
        appLogger.error(`Error in selectUserLanguage: ${err}`);
        return reject(err);
      }
      // We ll split the concat...
      if (result.length !== 1 || result[0].isoCode === null) {
        return resolve([]);
      }
      const code = result[0].isoCode.split(',');
      const name = result[0].name.split(',');
      const language = [];
      for (let i = 0; i < code.length; i += 1) {
        language.push({ isoCode: code[i], name: name[i] });
      }
      return resolve(language);
    });
  });
};
module.exports.selectUserLanguage = selectUserLanguage;

/**
 * Select a user along with his details based on some filter if any
 * @param {buildUserQueryParameter} queryParam -
 * @param {number} offset -
 * @param {number} limit -
 * @return {Promise<undefined|UserProfile>}
 */
module.exports.selectUser = async (queryParam, offset = undefined, limit = undefined) => {
  const {
    userID, nameHint, name, stripeCustomerID,
  } = queryParam.filter;
  const {
    keepPrivateFields, getLanguageFields, isMinimumQuery, getSnsAccounts,
  } = queryParam.tweaker;
  return new Promise((resolve, reject) => {
    const limitString = dbUtil.buildLimitString(offset, limit);
    const privateFields = 'user.password, user.frozenCoin, user.freeCoin, user.redeemableCoin, user.email, IFNULL(user.selfIntroduction, \'\') as selfIntroduction, user.stripeCustomerID, user.stripeAccountID, user.accountStatusID ';
    const defaultField = `user.ID as ID, user.nickname ${!isMinimumQuery ? ', user.countryCode, user.timezone, user.registrationDate, user.isNotifyOnReviewOpportunity, user.isNotifyOnReviewComplete, user.isNotifyOnNewComment, user.isNotifyOnFavoriteActivity' : ''}`;

    // 1.User ID to filter on
    if (userID !== undefined) {
      if (_.isArray(userID)) {
        sqlPool.query(`SELECT ${defaultField} ${keepPrivateFields ? `,${privateFields}` : ''} FROM user WHERE user.ID in () ${limitString};`, [userID], async (err, result) => {
          if (err) {
            return reject(err);
          }
          if (getLanguageFields) {
            try {
              // FIXME this is shit
              _.each(result, async (row) => {
                row.languages = await selectUserLanguage(row.ID);
              });
            } catch (e) {
              appLogger.error(`Error in selectUser: ${e}`);
              return reject(e);
            }
          }
          if (getSnsAccounts) {
            try {
              // FIXME this is shit, use await promise.all
              _.each(result, async (row) => {
                const snsAccounts = await snsQuery.selectSnsAccountsFromUserID(row.ID);
                row.snsAccounts = snsAccounts.length === 0 ? { youtubeName: '', twitchName: '', twitterName: '' } : snsAccounts[0];
              });
            } catch (e) {
              appLogger.error(`Error in selectUser: ${e}`);
              return reject(e);
            }
          }
          return resolve(result);
        });
      } else if (_.isString(userID)) {
        sqlPool.query(`SELECT ${defaultField} ` + `${keepPrivateFields ? `,${privateFields}` : ''} FROM user WHERE user.ID = ? ${limitString};`, [userID], async (err, result) => {
          if (err || result.length === 0) {
            return reject(err || new Error(`User ${userID} not found`));
          }
          if (getLanguageFields) {
            try {
              result[0].languages = await selectUserLanguage(userID);
            } catch (e) {
              appLogger.error(`Error in selectUser: ${e}`);
              return reject(e);
            }
          }
          if (getSnsAccounts) {
            try {
              const snsAccounts = await snsQuery.selectSnsAccountsFromUserID(userID);
              result[0].snsAccounts = snsAccounts.length === 0 ? { youtubeName: '', twitchName: '', twitterName: '' } : snsAccounts[0];
            } catch (e) {
              appLogger.error(`Error in selectUser: ${e}`);
              return reject(e);
            }
          }
          return resolve(result);
        });
      }
    } else if (stripeCustomerID !== undefined) {
      sqlPool.query(`SELECT ${defaultField} ` + `${keepPrivateFields ? `,${privateFields}` : ''} FROM user WHERE user.stripeCustomerID = ? ${limitString};`, [stripeCustomerID], (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    } else {
      // 2.Full nickname
      if (name !== undefined) {
        sqlPool.query(`SELECT ${defaultField} ${keepPrivateFields ? `,${privateFields}` : ''} FROM user WHERE user.nickname = ?;`, [name], async (err, result) => {
          if (err) {
            return reject(err);
          }
          if (result.length === 0) {
            return resolve([]);
          }
          const userID = result[0].ID;
          if (getLanguageFields) {
            try {
              result[0].languages = await (userID !== undefined ? selectUserLanguage(userID) : []);
            } catch (e) {
              appLogger.error(`Error in selectUser: ${e}`);
              return reject(e);
            }
          }
          if (getSnsAccounts) {
            try {
              const snsAccounts = await snsQuery.selectSnsAccountsFromUserID(userID);
              result[0].snsAccounts = snsAccounts.length === 0 ? { youtubeName: '', twitchName: '', twitterName: '' } : snsAccounts[0];
            } catch (e) {
              appLogger.error(`Error in selectUser: ${e}`);
              return reject(e);
            }
          }
          return resolve(result);
        });
      } else {
        // 3.Hint on nickname
        if (nameHint !== undefined) {
          sqlPool.query(`SELECT ${defaultField} ${keepPrivateFields ? `,${privateFields}` : ''} FROM user WHERE user.nickname LIKE ? ${limitString};`, [`%${nameHint}%`], (err, result) => {
            if (err) {
              return reject(err);
            }
            return resolve(result);
          });
        } else {
          // 4...Return everybody
          sqlPool.query(`SELECT ${defaultField} ${keepPrivateFields ? `,${privateFields}` : ''} FROM user ${limitString};`, async (err, result) => {
            if (err) {
              return reject(err);
            }
            if (getLanguageFields) {
              try {
                _.each(result, async (row) => {
                  row.languages = await selectUserLanguage(row.ID);
                });
              } catch (e) {
                appLogger.error(`Error in selectUser: ${e}`);
                return reject(e);
              }
            }
            return resolve(result);
          });
        }
      }
    }
  }); // new Promise
};

/**
 * Return ID and email address from a user na,e
 * @param {string} username
 * @return {Promise<{ID: number, email: string}>}
 */
module.exports.selectUserEmailAndID = async (username) => new Promise((resolve, reject) => {
  sqlPool.query('select ID, email from user where nickname=?;', [username], (err, result) => {
    if (err) {
      reject(err);
    } else if (result.length === 0) {
      resolve(undefined);
    } else {
      resolve(result[0]);
    }
  });
});

/**
 * Return ID and email address from a user ID
 * @param {number} userID
 * @return {Promise<{ID: number, email: string}>}
 */
module.exports.selectUserEmailFromID = async (userID) => new Promise((resolve, reject) => {
  sqlPool.query('select ID, email from user where ID=?;', [userID], (err, result) => {
    if (err) {
      return reject(err);
    }
    if (result.length === 0) {
      return resolve(undefined);
    }
    return resolve(result[0]);
  });
});

/**
 * Create and store a secret token to be used for account confirmation
 * @async
 * @param {number} userID
 * @return {Promise<Error|string>}
 */
module.exports.createPasswordResetTempLink = async (userID) => new Promise((resolve, reject) => {
  const secret = crypto.randomUUID();
  sqlPool.query(
    ''
      + 'INSERT INTO reset_password_stash (userID, secret, expire) VALUES (?, ?, (SELECT NOW() + 1 day)) '
      + 'ON DUPLICATE KEY UPDATE secret = ?, expire = (SELECT NOW() + 1 day);',
    [userID, secret, secret],
    (err, result) => {
      if (err || result.affectedRows === 0) {
        reject(err || new Error(`Could not create password reset temporary link for user ${userID}`));
      } else {
        resolve(secret);
      }
    },
  );
});

/**
 * Delete the temp password reset secret
 * @async
 * @param {number} userID
 * @return {Promise<Error|string>}
 */
module.exports.deletePasswordResetTempLink = async (userID) => new Promise((resolve, reject) => {
  sqlPool.query(
    'DELETE FROM reset_password_stash WHERE userID = ?;',
    [userID],
    (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    },
  );
});

/**
 * Return the ID of the user with the passed reset password token
 * @async
 * @param {string} token
 * @return {Promise<undefined|string>}
 */
module.exports.selectUserIDFromResetPasswordToken = async (token) => new Promise((resolve, reject) => {
  sqlPool.query('select userID as ID FROM reset_password_stash WHERE secret=?;', [token], (err, result) => {
    if (err) {
      reject(err);
    } else if (result.length === 0) {
      resolve(undefined);
    } else {
      resolve(result[0].ID);
    }
  });
});

/**
 * Update a user notification preferences
 * @param {string} userID
 * @param {object} notificationPreference
 * @param {boolean} notificationPreference.isNotifyOnReviewOpportunity
 * @param {boolean} notificationPreference.isNotifyOnReviewComplete
 * @param {boolean} notificationPreference.isNotifyOnNewComment
 * @param {boolean} notificationPreference.isNotifyOnFavoriteActivity
 * @return {Promise<Error|undefined>}
 */
module.exports.updateUserNotificationPreference = async ({ userID, notificationPreference }) => new Promise((resolve, reject) => {
  const {
    isNotifyOnFavoriteActivity, isNotifyOnNewComment, isNotifyOnReviewComplete, isNotifyOnReviewOpportunity,
  } = notificationPreference;
  sqlPool.query(
    'UPDATE user '
          + 'SET isNotifyOnReviewOpportunity = ?, isNotifyOnReviewComplete = ?, isNotifyOnNewComment = ?, isNotifyOnFavoriteActivity = ? '
          + 'WHERE ID = ?;',
    [isNotifyOnReviewOpportunity, isNotifyOnReviewComplete, isNotifyOnNewComment, isNotifyOnFavoriteActivity, userID],
    (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    },
  );
});

/**
 * Select the set of notification preferences from a user
 * @async
 * @param {number} userID
 * @return {Promise<{isNotifyOnReviewOpportunity: boolean, isNotifyOnReviewComplete: boolean, isNotifyOnNewComment: boolean, isNotifyOnFavoriteActivity: boolean}>}
 */
module.exports.selectUserNotificationPreference = async (userID) => new Promise((resolve, reject) => {
  sqlPool.query(
    'SELECT isNotifyOnReviewOpportunity, isNotifyOnReviewComplete, isNotifyOnNewComment, isNotifyOnFavoriteActivity '
        + 'FROM user '
        + 'WHERE ID = ?;',
    [userID],
    (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res[0]);
    },
  );
});
