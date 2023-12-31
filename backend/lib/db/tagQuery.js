/* eslint-disable max-len */
const _ = require('underscore');
const dbUtil = require('./dbUtil.js');
const sqlPool = require('./sqlConnectionPool.js');

/**
 * Select tags based on auto-complete hint
 * @param {string} hint - Hint to use for looking up the tag description
 * @param {number} [offset=0]
 * @param {number} [limit=undefined]
 * @return {Promise<Tag[]>} Fulfilled with list of tags if available
 */
module.exports.selectTagFromHint = async function (hint, offset = 0, limit = undefined) {
  const query = 'SELECT ID, description AS name '
      + 'FROM tag_ref '
      + 'WHERE description LIKE ? ORDER BY name ASC'
      + `${dbUtil.buildLimitString(offset, limit)};`;
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [`%${hint.toLowerCase()}%`], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

/**
 * Select all tags
 * @todo Factor all tag select
 * @return {Promise<object[]>}
 */
module.exports.selectAllTags = () => new Promise((resolve, reject) => {
  sqlPool.query('SELECT ID, description as name FROM tag_ref;', (err, result) => {
    if (err) {
      return reject(err);
    }
    return resolve(result);
  });
});

/**
 * Select tags based on auto-complete hint
 * @param {number} tagID -
 * @return {Promise<Tag[]>} Fulfilled with list of tags if available
 */
module.exports.selectTagFromID = async (tagID) => new Promise((resolve, reject) => {
  sqlPool.query('SELECT ID, description as name FROM tag_ref where ID = ?;', [tagID], (err, result) => {
    if (err) {
      return reject(err);
    }
    return resolve(result[0]);
  });
});

/**
 * Select a game tag (every game name is also a tag) from the game ID
 * @param {number} gameID - Hint to use for looking up the tag description
 * @return {Promise<Tag[]>} Fulfilled with list of tags if available
 */
module.exports.selectTagFromGameID = async (gameID) => new Promise((resolve, reject) => {
  sqlPool.query('SELECT ID, description as name FROM tag_ref WHERE description = (SELECT name from game_ref where ID = ?)', [gameID], (err, result) => {
    if (err) {
      return reject(err);
    }
    return resolve(result[0]);
  });
});

module.exports.selectTagFromReviewerIdSequence = async (idSequence) => new Promise((resolve, reject) => {
  const reviewerSequenceStr = dbUtil.buildInStringFromSequence(idSequence);
  sqlPool.query(`SELECT nb_atelier, tagID, tagDescription, reviewerID FROM nb_atelier_per_reviewer_per_tag__view WHERE reviewerID in ${reviewerSequenceStr}`, (err, result) => {
    if (err) {
      return reject(err);
    }
    return resolve(result);
  });
});

async function selectTagFromReviewerId({ reviewerID }) {
  const query = ''
    + 'SELECT tagID as ID, tagDescription as name '
    + 'FROM nb_atelier_per_reviewer_per_tag__view '
    + 'WHERE reviewerID = ? '
    + 'ORDER BY nb_atelier DESC;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [reviewerID], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}
module.exports.selectTagFromReviewerId = selectTagFromReviewerId;

/**
 * Select tags to showcase from related game
 * @param {number} gameID
 * @return {Promise<Tag[]>}
 */
module.exports.selectShowcaseTagFilterOnGame = async (gameID) => new Promise((resolve, reject) => {
  const query = ''
    + 'SELECT tagID as ID, tag_ref.description as name '
    + 'FROM atelier, atelier_tag, tag_ref '
    + 'WHERE atelier_tag.atelierID = atelier.ID AND gameID = ? AND atelier_tag.tagID = tag_ref.ID '
    + 'GROUP BY tagID '
    + 'ORDER BY count(atelierID) desc;';
  sqlPool.query(query, [gameID], (err, result) => {
    if (err) {
      return reject(err);
    }
    return resolve(result);
  });
});

/**
 * Select tags to showcase from related reviewer
 * @async
 * @param {number} reviewerID
 * @return {Promise<object[]>} Fulfilled with list of tags if available
 */
module.exports.selectShowcaseTagFilterOnReviewer = async (reviewerID) => new Promise((resolve, reject) => {
  sqlPool.query('SELECT DISTINCT tagID AS ID, tagDescription AS name '
      + 'FROM nb_atelier_per_reviewer_per_tag__view '
      + 'WHERE reviewerID = ?;', [reviewerID], (err, result) => {
    if (err) {
      return reject(err);
    }
    return resolve(result);
  });
});

/**
 * Select tags excluding a tag, limit to 5 results
 * @param {number} tagID
 * @return {Promise<object[]|Error>}
 * FIXME this is retarded & useless...
 */
module.exports.selectShowcaseTagWithExclusion = async (tagID) => new Promise((resolve, reject) => {
  sqlPool.query('SELECT tagID as ID, nb_atelier, tagDescription as name '
      + 'FROM nb_atelier_per_reviewer_per_tag__view '
      + 'WHERE tagID != ? ORDER BY nb_atelier DESC LIMIT 5;', [tagID], (err, result) => {
    if (err) {
      return reject(err);
    }
    return resolve(result);
  });
});

/**
 * Select the list of tags related to an atelier
 * @param {number|number[]} atelierID - Atelier numerical ID
 * @return {Promise<Tags>}
 */
module.exports.selectTagsForAtelier = async (atelierID) => new Promise((resolve, reject) => {
  if (_.isNumber(atelierID)) {
    const query = 'SELECT description as name, tag_ref.id as ID FROM atelier_tag, tag_ref WHERE atelier_tag.atelierID = ? AND atelier_tag.tagID = tag_ref.ID;';
    sqlPool.query(query, [atelierID], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  } else if (_.isArray(atelierID)) {
    const query = 'SELECT atelierID, description as name, tag_ref.id as ID FROM atelier_tag, tag_ref WHERE atelier_tag.atelierID IN (?) AND atelier_tag.tagID = tag_ref.ID;';
    sqlPool.query(query, [atelierID], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  }
});

/**
 * Insert tags related to an atelier
 * @param {number} atelierID - Atelier ID
 * @param {number[]} tagList - Sequence of tag ID to insert for this atelier
 * @return {Promise<*>}
 */
module.exports.insertTagForAtelier = (atelierID, tagList) => new Promise((resolve, reject) => {
  if (tagList.length === 0) {
    return resolve(undefined);
  }
  sqlPool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    let queryString = 'INSERT INTO atelier_tag (atelierID, tagID) VALUES ';
    _.each(tagList, (tag) => {
      queryString += `(${connection.escape(atelierID)}, ${connection.escape(tag)}),`;
    });
    queryString = `${queryString.slice(0, -1)};`;
    connection.query(queryString, (err, result) => {
      if (err || result.affectedRows !== tagList.length) {
        connection.release();
        return reject(err || `Error while updating the tags for atelier ${atelierID}`);
      }
      connection.release();
      return resolve(result);
    });
  });
});

/**
 * Update tags related to an atelier
 * @param {number} atelierID - Atelier ID
 * @param {Object[]} tagDelta - List of action to update tag list
 * @return {Promise<*>}
 */
module.exports.updateTagForAtelier = async (atelierID, tagDelta) => new Promise((resolve, reject) => {
  sqlPool.getConnection(async (err, connection) => {
    if (err) {
      return reject(err);
    }
    try {
      connection.beginTransaction(async (err) => {
        if (err) {
          connection.release();
          return reject(err);
        }
        await Promise.all(_.map(tagDelta, async (delta) => {
          if (delta.type === 'insert') {
            return new Promise((resolve, reject) => {
              connection.query('INSERT INTO atelier_tag (atelierID, tagID) VALUES (?, ?);', [atelierID, delta.id], (err, res) => {
                if (err || res.affectedRows !== 1) {
                  return reject(new Error(err || `Could not insert ${JSON.stringify(delta)} for atelier ${atelierID}, aborting tag update`));
                }
                return resolve(undefined);
              });
            });
          } if (delta.type === 'remove') {
            return new Promise((resolve, reject) => {
              connection.query('DELETE FROM atelier_tag WHERE atelierID = ? and tagID = ?;', [atelierID, delta.id], (err, res) => {
                if (err || res.affectedRows !== 1) {
                  return reject(new Error(`Could not insert ${JSON.stringify(delta)} for atelier ${atelierID}, aborting tag update`));
                }
                return resolve(undefined);
              });
            });
          }
        }));
        connection.commit((err) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
              return reject(err);
            });
          }
          connection.release();
          return resolve(undefined);
        });
      }); // beginTransaction
    } catch (err) {
      connection.rollback(() => {
        connection.release();
        return reject(err);
      });
    } // catch
  }); // getConnection
});
