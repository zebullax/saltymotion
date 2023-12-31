const _ = require('underscore');

/**
 * Build a limit, offset string
 * @param {number} offset - Offset to start query from
 * @param {number} limit - Limit of rows to return
 * @return {string} limit,offset SQL string
 */
module.exports.buildLimitString = (offset, limit) => {
  let limitString = '';
  if (Number.isNaN(offset) || Number.isNaN(limit) || offset === undefined || limit === undefined) {
    return limitString;
  }
  limitString += ` LIMIT ${limit} `;
  if (offset !== 0) {
    limitString += ` OFFSET ${offset} `;
  }
  return limitString;
};

/**
 * Build a SQL LIKE string
 * @param {string|string[]} columnName - Column names to apply LIKE to
 * @param {string|string[]} columnHint - Hints to use on each column
 * @param {string} logicalOperator
 * @return {string} Built-up LIKE string
 */
module.exports.buildLikeString = (columnName, columnHint, logicalOperator) => {
  if (columnHint === undefined || columnName === undefined) {
    return '';
  }
  let likeString;
  if (_.isString(columnHint)) {
    likeString = ` ${logicalOperator} ${columnName} LIKE %${columnHint}% `;
  } else if (_.isString(columnName) && _.isArray(columnHint)) {
    // If columnName is not an array we use the same column name for each LIKE operation
    likeString = _.reduce(columnHint, (accu, hint) => {
      return ` ${accu} ${logicalOperator} ${columnName} LIKE %${hint}% `;
    });
  } else if (_.isArray(columnName) && _.isArray(columnHint)) {
    likeString = _.reduce(columnName, (accu, name, i) => {
      return ` ${accu} ${logicalOperator} ${name} LIKE %${columnHint[i]}% `;
    });
  }
  return likeString;
};

/**
 * Build a '(X)' type string from an array, where X = x,y,...
 * If sequence is not an array or is empty, X will be empty
 * @deprecated Use native SQL
 * @param {[*]} sequence
 * @return {string}
 */
module.exports.buildInStringFromSequence = (sequence) => {
  if (sequence === undefined || !sequence instanceof Array || sequence.length === 0) {
    return '()';
  }
  let reviewerSequenceStr = _.reduce(sequence, (accum, value) => `${accum} ${value.toString()}, `, '( ');
  reviewerSequenceStr = `${reviewerSequenceStr.slice(0, -2)} )`;
  return reviewerSequenceStr;
};

/**
 * Build a condition to be used in WHERE statement (such as `i = 2 OR i = 3 OR i = 5`)
 * @param {(string|[string])} columnName
 * @param {(string|[(string|number)])} columnValue
 * @param {string} logicalOperator to be used in between each equality statement
 * @return {string}
 */
module.exports.buildBooleanCondition = (columnName, columnValue, logicalOperator) => {
  if (columnName === undefined || columnValue === undefined) {
    return '';
  }
  let conditionString;
  if (_.isString(columnValue)) {
    conditionString = ` ${columnName} = ${columnValue}%`;
  } else if (_.isString(columnName) && _.isArray(columnValue)) {
    // If columnName is not an array we use the same column name for each operation
    conditionString = _.reduce(
        _.map(columnValue, (value) => ` ${columnName} = ${value} `),
        (accu, val) => ` ${accu} ${logicalOperator} ${val} `);
  } else if (_.isArray(columnName) && _.isArray(columnValue)) {
    conditionString
      = _.reduce(_.map(_.zip(columnName, columnValue), (nameValue) => ` ${nameValue[0]} = ${nameValue[1]} `),
          (accu, val) => ` ${accu} ${logicalOperator} ${val} `);
  }
  return conditionString;
};
