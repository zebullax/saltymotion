// Node/Express
const path = require('path');
// Misc
const _ = require('underscore');
// Saltymotion
const userQuery = require('../db/userQuery');
const queryWrangling = require('../queryWrangling');
const appLogger = require('../log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

const utility = {
  /**
   * Build a list of recommended reviews from a user favorites
   * @param {string} userID
   * @param {boolean} isSelf
   * @param {{offset: number, limit: number}} gamesRecommendationSlice
   * @param {{offset: number, limit: number}} reviewersRecommendationSlice
   * @return {Promise<{fromReviewers: NormalizedAtelierDescription[], fromGames: NormalizedAtelierDescription[]}>}
   */
  getFeedReviews: async ({
    userID,
    isSelf,
    gamesRecommendationSlice,
    reviewersRecommendationSlice,
  }) => {
    try {
      const fromFavoriteReviewers = await userQuery.selectUserRecommendationsFromFavoriteReviewer({
        userID,
        isPrivateFiltered: !isSelf,
        offset: reviewersRecommendationSlice?.offset,
        limit: reviewersRecommendationSlice?.limit,
      });
      const fromFavoriteGames = await userQuery.selectUserRecommendationsFromFavoriteGame({
        userID,
        isPrivateFiltered: !isSelf,
        offset: gamesRecommendationSlice?.offset,
        limit: gamesRecommendationSlice?.limit,
      });
      return {
        fromGames: queryWrangling.normalizeAtelierDescription(fromFavoriteGames),
        fromReviewers: queryWrangling.normalizeAtelierDescription(fromFavoriteReviewers),
      };
    } catch (e) {
      appLogger.error(`Error in getFeedReviews: ${e}`);
      return undefined;
    }
  },

  cleanPrivateInfo: (profile) => {
    const privateFields = [
      'wallet',
      'isOauth',
      'email',
      'nbUnreadNotification',
      'favoriteReviewers',
      'stripeCustomerID',
      'isStripeAccountLinked',
      'notificationPreference',
    ];
    return _.omit(profile, ...privateFields);
  },
};
module.exports.userWrangler = utility;
