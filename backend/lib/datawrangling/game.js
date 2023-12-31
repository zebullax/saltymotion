// Node/Express
const path = require('path');
// Saltymotion
const gameQuery = require('../db/gameQuery');
const tagQuery = require('../db/tagQuery');
const reviewerQuery = require('../db/reviewerQuery');
const { MAX_SHOWCASE_TOP_REVIEWERS } = require('../applicationSettings');
const { user: userDataLayer, game: gameDataLayer } = require('../datalayer/dataLayer');
const appLogger = require('../log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

const utility = {
  /**
   * Return a sampling of games
   * @param {number} sampleSize
   * @return {Promise<Game[]>}
   */
  sample: async ({ sampleSize }) => {
    const idSample = await gameQuery.selectGamesSample({ sampleSize });
    const samplePromise = await Promise.allSettled(
      idSample.map(({ ID }) => gameDataLayer({ gameID: ID })
        .get()),
    );
    const result = [];
    for (let i = 0; i < samplePromise.length; i++) {
      if (samplePromise[i].status === 'fulfilled') {
        result.push(samplePromise[i].value);
      }
    }
    return result;
  },

  /**
   * Get tags related to a game by its ID
   * Does not require a live instance, no need to fetch.
   * No caching is done on that query
   * @param {number} gameID
   * @return {Promise<Tag[]>}
   */
  getRelatedTags: ({ gameID }) => {
    const result = tagQuery.selectShowcaseTagFilterOnGame(gameID);
    return result == null ? [] : result;
  },

  /**
   * Fetch game statistics
   * @param {number} gameID
   * @return {GameStatistics}
   */
  getStatistics: async ({ gameID }) => {
    try {
      return gameQuery.selectGameStatistics({ gameID });
    } catch (e) {
      appLogger(`Error in getStatistics: ${e}`);
      return ({ ID: gameID, nbWorkshops: 0, nbReviewers: 0 });
    }
  },

  /**
   * Get reviewers name and ID ranked on best score
   * @param {number} gameID
   * @param {number} [limit]
   * @return {Promise<{ID: string, stats: {avgScore: number, nbWorkshops: number}, profile: userProfile}[]>}
   */
  getRelatedReviewers: async ({ gameID, limit = MAX_SHOWCASE_TOP_REVIEWERS }) => {
    const topReviewersShortData = await reviewerQuery.selectTopReviewerFromGameID({
      gameID,
      limit,
    });
    let topReviewerFullProfile = await Promise.allSettled(
      topReviewersShortData.map(({ ID }) => userDataLayer({ userID: ID }).get()),
    );
    // Keep only success promise and key on userID
    topReviewerFullProfile = topReviewerFullProfile.reduce((accu, item) => {
      if (item.status === 'fulfilled') {
        return { ...accu, ...{ [item.value.ID]: item.value } };
      }
      return accu;
    }, {});
    // Now `topReviewerFullProfile` is { ID: { profile }, ... }
    return topReviewersShortData.reduce((accu, val) => {
      const { ID, avgScore, nbWorkshops } = val;
      if (topReviewerFullProfile[ID] !== undefined) {
        accu.push({
          ID,
          stats: {
            nbWorkshops,
            avgScore,
          },
          profile: topReviewerFullProfile[ID],
        });
      }
      return accu;
    }, []);
  },
};

module.exports.gameWrangler = utility;
