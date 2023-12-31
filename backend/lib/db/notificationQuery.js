/* eslint-disable max-len */
// Node/Express
const path = require('path');
// Misc
const _ = require('underscore');
// Saltymotion
const activityReference = require('../activity');
const sqlPool = require('./sqlConnectionPool');
const dbUtil = require('./dbUtil');
const appLogger = require('../log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

/**
 * Build and return a default constructed query filter for notification
 * @return {object}
 */

/**
 * Build and return a default notification query parametrization object
 * @return {NotificationQueryParameter}
 */
module.exports.buildNotificationQueryParameter = () => ({
  filter: {
    sourceUserID: undefined,
    targetUserID: undefined,
    activityRefID: undefined,
    linkedID: undefined,
    startFrom: undefined,
  },
  tweaker: {
    isActiveOnly: true,
    isTransitiveOnly: false,
    isIntransitiveOnly: false,
    isCountOnly: false,
    isIDOnly: false,
  },
  sort: {
    field: '`createdAt`',
    isAsc: false,
  },
  /**
   * Set linked ID filter
   * @param {number} linkedID
   * @return {module.exports.buildNotificationQueryParameter}
   */
  setLinkedID(linkedID) {
    this.filter.linkedID = linkedID;
    return this;
  },
  /**
   * Set source user ID filter
   * @param {string} sourceUserID
   * @return {module.exports.buildNotificationQueryParameter}
   */
  setSourceUserID(sourceUserID) {
    this.filter.sourceUserID = sourceUserID;
    return this;
  },
  /**
   * Set target user ID filter
   * @param {string} targetUserID
   * @return {module.exports.buildNotificationQueryParameter}
   */
  setTargetUserID(targetUserID) {
    this.filter.targetUserID = targetUserID;
    return this;
  },
  /**
   * Set activity ID filter
   * @param {number|number[]} activityID
   * @return {module.exports.buildNotificationQueryParameter}
   */
  setActivityID(activityID) {
    this.filter.activityRefID = activityID;
    return this;
  },
  setStartFrom(startFrom) {
    this.filter.startFrom = startFrom;
    return this;
  },
  /**
   * Filter on active notification only
   * @param {boolean} isActiveOnly
   * @return {module.exports.buildNotificationQueryParameter}
   */
  setIsActiveOnly(isActiveOnly) {
    this.tweaker.isActiveOnly = isActiveOnly;
    return this;
  },
  /**
   * Whether to return the ID only
   * @param {boolean} isIDOnly
   * @return {module.exports.buildNotificationQueryParameter}
   */
  setIsIDOnly(isIDOnly) {
    this.tweaker.isIDOnly = isIDOnly;
    return this;
  },
  /**
   * Whether to return the nb of result rows only
   * @param {boolean} isCountOnly
   * @return {module.exports.buildNotificationQueryParameter}
   */
  setIsCountOnly(isCountOnly) {
    this.tweaker.isCountOnly = isCountOnly;
    return this;
  },
  /**
   * Whether to return transitive only notifications
   * @param {boolean} isTransitiveOnly
   * @return {module.exports.buildNotificationQueryParameter}
   */
  setIsTransitiveOnly(isTransitiveOnly) {
    this.tweaker.isTransitiveOnly = isTransitiveOnly;
    return this;
  },
  /**
   * Whether to return intransitive only notifications
   * @param {number} isIntransitiveOnly
   * @return {module.exports.buildNotificationQueryParameter}
   */
  setIsIntransitiveOnly(isIntransitiveOnly) {
    this.tweaker.isTransitiveOnly = isIntransitiveOnly;
    return this;
  },
  /**
   * Set the field to use for sort
   * @param {string} sortField
   * @param {boolean} isAsc
   * @return {module.exports.buildNotificationQueryParameter}
   */
  setSortField(sortField, isAsc) {
    this.sort.field = sortField;
    this.sort.isAdc = isAsc;
    return this;
  },
});

/**
 * Build SQL WHERE string from the query filter object
 * @param {object} connection
 * @param {NotificationQueryParameter} queryParam
 * @return {string}
 */
const buildWhereSQLStringFromFilter = (connection, queryParam) => {
  const filters = [];
  if (queryParam.filter.sourceUserID && queryParam.filter.targetUserID) {
    filters.push(`sourceUserID = ${connection.escape(queryParam.filter.sourceUserID)} `
                 + `AND targetUserID = ${connection.escape(queryParam.filter.targetUserID)}`);
  } else {
    if (queryParam.filter.sourceUserID) filters.push(`sourceUserID = ${connection.escape(queryParam.filter.sourceUserID)}`);
    if (queryParam.filter.targetUserID) filters.push(`targetUserID = ${connection.escape(queryParam.filter.targetUserID)}`);
  }
  if (queryParam.filter.linkedID !== undefined) {
    if (_.isArray(queryParam.filter.linkedID)) {
      filters.push(`linkedID in ${connection.escape(dbUtil.buildInStringFromSequence(queryParam.filter.linkedID))}`);
    } else {
      filters.push(`linkedID = ${connection.escape(queryParam.filter.linkedID)}`);
    }
  }
  if (queryParam.filter.startFrom) {
    filters.push(`createdAt < ${connection.escape(queryParam.filter.startFrom)}`);
  }
  if (queryParam.filter.activityRefID) {
    if (_.isArray(queryParam.filter.activityRefID)) {
      filters.push(`activityRefID in ${connection.escape(dbUtil.buildInStringFromSequence(queryParam.filter.activityRefID))}`);
    } else {
      filters.push(`activityRefID = ${connection.escape(queryParam.filter.activityRefID)}`);
    }
  }
  if (queryParam.tweaker.isActiveOnly) filters.push('isActive = 1');
  if (queryParam.tweaker.isTransitiveOnly) filters.push(`targetTypeID = ${connection.escape(activityReference.userType.user)}`);
  else if (queryParam.tweaker.isIntransitiveOnly) filters.push(`targetTypeID = ${connection.escape(activityReference.userType.application)}`);

  if (filters.length === 0) {
    return '';
  }
  return `WHERE ${_.reduce(filters, (accu, val) => `${accu} AND ${val}`)} `;
};

/**
 * Select notifications following some passed filter
 * @param {NotificationQueryParameter} queryFilter - Filter results specification
 * @param {(number|undefined)} [count=undefined]
 * @return {Promise<({nbNotification: number}|[RawActivity]|[{activityID: number, linkedID: number}])>}
 */
module.exports.selectNotification = (queryFilter, count = undefined) => new Promise((resolve, reject) => {
  sqlPool.getConnection((err, connection) => {
    if (err) {
      reject(err);
    } else {
      const { isCountOnly } = queryFilter.tweaker;
      let query = isCountOnly
        ? 'SELECT COUNT(activityID) AS nbNotification FROM user_notification__view '
        : 'SELECT activityID, sourceTypeID, sourceUserID, createdAt, isActive, sourceUserNickname, targetTypeID, targetUserID, targetUserNickname, activityRefID, activityRefName as activityName, linkedID '
              + 'FROM user_notification__view ';
      query += buildWhereSQLStringFromFilter(connection, queryFilter);
      if (!isCountOnly) {
        query += `ORDER BY createdAt ${queryFilter.sort.isAsc ? 'ASC' : 'DESC'} `;
        query += count !== undefined ? `LIMIT ${connection.escape(count)}` : '';
      }
      connection.query(query, (queryErr, result) => {
        if (queryErr) {
          appLogger.error(`Error in selectNotification: ${queryErr}`);
          connection.release();
          reject(queryErr);
        } else if (isCountOnly) {
          connection.release();
          resolve(result[0]);
        } else {
          connection.release();
          resolve(result);
        }
      });
    }
  });
});

/**
 * Mark a sequence of activityID notification as being observed
 * @async
 * @param {[number]} activityID
 * @return {Promise<Error|undefined>}
 */
module.exports.markNotificationObserved = async (activityID) => {
  const conditionString = dbUtil.buildBooleanCondition('ID', activityID, 'OR');
  return new Promise((resolve, reject) => {
    sqlPool.query(`UPDATE activity SET isActive = 0 WHERE ${conditionString};`, [], (err, result) => {
      if (err) {
        appLogger.error(`Error in markNotificationObserved: ${err}`);
        return reject(err);
      }
      if (result.affectedRows !== activityID.length) {
        return resolve(new Error(`Error updating some rows, ${result.affectedRows} updates OK`));
      }
      return resolve(undefined);
    });
  });
};

/**
 * Select the number of unread notifications targeting user
 * @param {string} userID
 * @return {Promise<number>}
 */
module.exports.selectNbUnreadNotifications = async ({ userID }) => {
  const query = 'SELECT count(*) as nbActive FROM activity WHERE isActive = true AND targetUserID = ?;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [userID], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res[0].nbActive);
      }
    });
  });
};
