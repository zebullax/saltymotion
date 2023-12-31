/**
 * Convert ISO date range to epoch range
 * @param {Date} [startDate]
 * @param {Date} [endDate]
 * @return {{startFrom: number, endBefore: number}}
 */
const isoToEpochTimeRange = ({startDate, endDate}) => {
  // Default to the last 1 months of charges
  const normalizedDateRange = {};
  if (startDate === undefined) {
    const now = new Date(Date.now());
    normalizedDateRange.startFrom = Math.floor(now.setMonth(now.getMonth() - 1) / 1000);
  } else {
    normalizedDateRange.startFrom = Math.floor(startDate.valueOf() / 1000);
  }
  if (endDate === undefined) {
    const now = new Date(Date.now());
    normalizedDateRange.endBefore = Math.floor(now.getTime() / 1000);
  } else {
    normalizedDateRange.endBefore = Math.floor(endDate.valueOf() / 1000);
  }
  return normalizedDateRange;
};

/**
 * Build a string filter based on a date range
 * @param {string} fieldName
 * @param {string} startDate - exclusive lower bound
 * @param {string} endDate - exclusive upper bound
 * @return {string}
 */
const stringifyDateRange = ({fieldName, startDate, endDate}) => {
  let result = '';
  let isCombined = false;
  if (startDate !== undefined) {
    result += `${fieldName} > '${startDate}'`;
    isCombined = endDate !== undefined;
  }
  if (endDate !== undefined) {
    result += `${isCombined ? ' AND ' : ''}${fieldName} < '${endDate}'`;
  }
  return result;
};

/**
 * Build a default time range of one year until now
 * @return {{gt: Date, lt: Date}}
 */
const buildOneYearRangeToNow = () => {
  const gt = new Date(Date.now());
  gt.setFullYear(gt.getFullYear() - 2);
  const lt = new Date(Date.now());
  return {gt, lt};
};

const now = (isSec = true) => {
  return Math.trunc((new Date()) / (isSec ? 1000 : 1));
};

module.exports = {
  isoToEpochTimeRange,
  stringifyDateRange,
  buildOneYearRangeToNow,
  now,
};
