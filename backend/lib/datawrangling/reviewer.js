// Saltymotion
const reviewerQuery = require('../db/reviewerQuery');
const queryWrangling = require('../queryWrangling');

const utility = {
  /**
   * Get a random sample of reviewers
   * @param {number} sampleSize
   * @return {Promise<Reviewer[]>}
   */
  sample: async ({ sampleSize }) => {
    const rawReviewers = await reviewerQuery.selectReviewersSample({ sampleSize });
    return queryWrangling.normalizeReviewer(false, rawReviewers, true);
  },
};

module.exports.reviewerWrangler = utility;
