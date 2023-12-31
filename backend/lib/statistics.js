// Saltymotion
const atelierQuery = require('./db/atelierQuery');
const atelierReference = require('./atelierStatus');
// Misc
const _ = require('underscore');

/**
 * Build a breakdown of atelier and review numbers by status and visibility
 * @param {number} userID
 * @param {boolean} isPrivateIncluded
 * @return {Promise<{atelier: {complete: number, inAuction: number, inProgress: number, public: number, private: number}, review: {complete: number, inAuction: number, inProgress: number, public: number, private: number}}>}
 */
module.exports.buildAtelierReviewStat = function(userID, isPrivateIncluded) {
  return new Promise(async (resolve, reject) => {
    try {
      // TODO Why not cache this value
      const atelierQueryDescription = atelierQuery
        .buildAtelierQueryParameter()
        .setUploaderID(userID)
        .setFilterPrivate(!isPrivateIncluded);
      const ateliers = await atelierQuery.selectAtelier(atelierQueryDescription);
      const reviewQueryDescription = atelierQuery
        .buildAtelierQueryParameter()
        .setIncludeCandidateReview(true)
        .setReviewerID(userID)
        .setFilterPrivate(!isPrivateIncluded);
      const reviews = await atelierQuery.selectAtelier(reviewQueryDescription);

      // Build the stats
      const statistics = {
        atelier: {
          complete: 0,
          inProgress: 0,
          inAuction: 0,
          public: 0,
          private: 0,
        },
        review: {
          complete: 0,
          inProgress: 0,
          inAuction: 0,
          public: 0,
          private: 0,
        },
      };

      const statBuilder = (statObj, descriptions, asReviewer) => {
        _.each(descriptions, (description) => {
          const isComplete = atelierReference.isAtelierComplete(description.currentStatus);
          const isProgress = atelierReference.isAtelierInProgress(description.currentStatus);
          const isAuction = atelierReference.isAtelierInAuction(description.currentStatus);
          if (!isComplete && !isProgress && !isAuction) {
            return;
          }
          if (isComplete) {
            statObj.complete += 1;
          } else if (isAuction) {
            statObj.inAuction += 1;
          } else if (isProgress && (!asReviewer || description.reviewerID === userID)) {
            statObj.inProgress += 1;
          }
          if (description.isPrivate === 1) {
            statObj.private += 1;
          } else {
            statObj.public += 1;
          }
        });
      };
      statBuilder(statistics.atelier, ateliers.atelierDescription);
      statBuilder(statistics.review, reviews.atelierDescription, true);
      resolve(statistics);
    } catch (err) {
      console.error(`Error in buildAtelierReviewStat: ${err}`);
      reject(err);
    }
  });
};
