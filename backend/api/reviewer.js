// Node/Express
// eslint-disable-next-line new-cap
const reviewerApiRouter = require('express').Router();
const path = require('path');
// Misc
const { StatusCodes } = require('http-status-codes');
const { body, validationResult } = require('express-validator');
// Saltymotion
const reviewerQuery = require('../lib/db/reviewerQuery');
const tagQuery = require('../lib/db/tagQuery');
const queryWrangling = require('../lib/queryWrangling');
const userQuery = require('../lib/db/userQuery');
const { checkIsReviewerIDSelf, enforceJWT } = require('../lib/middleware');
const { BROWSE_REVIEWER_INITIAL_LOAD_CHUNK_SIZE } = require('../lib/applicationSettings');
const datalayer = require('../lib/datalayer/dataLayer');
const { reviewerWrangler } = require('../lib/datawrangling/reviewer');

const appLogger = require('../lib/log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

const handlerApiRoute = {
  /**
   * Select the stripe connected account ID for the user
   * @async
   * @param {object} req
   * @param {object} res
   */
  async getReviewerConnectedAccount(req, res) {
    const { ID } = req.jwt;
    try {
      const stripeID = (await userQuery.getUserStripeAccountID(ID)).ID;
      res.json({ stripeID });
    } catch (e) {
      appLogger.error(`Error in getReviewerConnectedAccount: ${e}`);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Clear the user connected Stripe account
   * @async
   * @param {object} req
   * @param {object} res
   */
  async deleteReviewerConnectedAccount(req, res) {
    const { ID } = req.jwt;
    try {
      await userQuery.setStripeAccountID(ID, null);
      res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (e) {
      appLogger.error(`Error in deleteReviewerConnectedAccount: ${e}`);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Get a reviewer most connected tags
   * @async
   * @param {object} req
   * @param {object} res
   */
  async getReviewerRelatedTags(req, res) {
    const { reviewerID } = req.params;
    if (Number.isNaN(reviewerID)) {
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    }
    try {
      // TODO would be cleaner to return 404 for not-found reviewer
      const relatedTags = await tagQuery.selectShowcaseTagFilterOnReviewer(reviewerID);
      return res.send(relatedTags);
    } catch (e) {
      appLogger.error(`Error in getReviewerRelatedTags: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Get a reviewer profile
   * @async
   * @param {object} req
   * @param {string} req.params.reviewerID
   * @param {object} res
   */
  async getReviewer(req, res) {
    const { reviewerID } = req.params;
    try {
      const fullProfile = await datalayer.user({ userID: reviewerID }).get();

      // No profile isn't an error
      // It means that the user's game pool is empty
      // By extension he isn't a reviewer, just a user
      if (fullProfile === undefined) {
        res.sendStatus(StatusCodes.NOT_FOUND);
      } else {
        res.json(fullProfile);
      }
    } catch (e) {
      appLogger.error(`Error in getReviewer: ${e}`);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Get a sample of reviewers for visitor view
   * @async
   * @param {object} req
   * @param {object} res
   * @return {Promise<*>}
   */
  async sampleReviewers(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      appLogger.error(`Errors on sampleReviewers: ${JSON.stringify(errors.mapped())}`);
      return res.status(StatusCodes.BAD_REQUEST);
    }
    const { count } = req.body;
    try {
      const reviewers = await reviewerWrangler.sample({ sampleSize: count });
      return res.json(reviewers);
    } catch (e) {
      appLogger.error(`Error in sampleReviewers: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Find reviewers based on filter
   * @async
   * @param {object} req
   * @param {object} res
   * @return {Promise<this|*>}
   */
  async searchReviewers(req, res) {
    // Filter values
    const { hint, name } = req.query;
    let { tagsID } = req.query;
    const gameID = Number.parseInt(req.query.gameID, 10);
    // Tweak results
    const offset = Number.parseInt(req.query.offset, 10);
    const limit = Number.parseInt(req.query.limit, 10);
    const isShort = Boolean(req.query.isShort);
    // const fetchTags = Boolean(req.query.fetchTags);
    const fetchLanguages = Boolean(req.query.fetchLanguages);

    try {
      if (hint !== undefined) {
        if (!Number.isNaN(gameID)) { // autocomplete reviewer
          const reviewers = await reviewerQuery.selectReviewersFromGameIDAndHint(hint, gameID);
          const normalizedProfiles = await queryWrangling.normalizeReviewer(false, reviewers, true);
          return res.json(normalizedProfiles);
        }
        if (isShort) {
          const shortResult = await reviewerQuery.selectReviewerShortIDFromHint({ hint, offset, limit });
          return res.json(shortResult);
        }
        const profiles = await reviewerQuery.selectReviewerFromHint({
          hint, gameID, offset, limit,
        });
        if (profiles.length === 0) {
          return res.sendStatus(StatusCodes.NO_CONTENT);
        }
        const normalizedProfiles = await queryWrangling.normalizeReviewer(
          fetchLanguages,
          profiles,
          Number.isNaN(gameID),
        );
        return res.json(normalizedProfiles);
      } if (tagsID !== undefined) {
        // This usually come from browse reviewer page
        tagsID = JSON.parse(tagsID);
        if (tagsID.length === 0) {
          if (Number.isNaN(gameID)) {
            // If tags was passed but is empty this would mean that user cleared the tag filter in browseReviewer
            const result = await reviewerQuery.selectReviewers(offset, BROWSE_REVIEWER_INITIAL_LOAD_CHUNK_SIZE);
            const normalizedProfiles = await queryWrangling.normalizeReviewer(true, result, true);
            return res.json(normalizedProfiles);
          }
          const result = await reviewerQuery.selectReviewersFromGameID(
            gameID,
            offset,
            BROWSE_REVIEWER_INITIAL_LOAD_CHUNK_SIZE,
          );
          const normalizedProfiles = await queryWrangling.normalizeReviewer(true, result, true);
          return res.json(normalizedProfiles);
        }
        const reviewersID = (await reviewerQuery.selectReviewerIdFilterOnTag(tagsID)).map((row) => row.ID);
        if (reviewersID.length === 0) {
          return res.json([]);
        }
        if (Number.isNaN(gameID)) {
          const reviewers = await reviewerQuery.selectReviewersFromID(reviewersID);
          const normalizedProfiles = await queryWrangling.normalizeReviewer(fetchLanguages, reviewers, true);
          return res.json(normalizedProfiles);
        }
        const reviewers = await reviewerQuery.selectReviewersFromIDAndGameID(reviewersID, gameID);
        const normalizedProfiles = await queryWrangling.normalizeReviewer(fetchLanguages, reviewers, true);
        return res.json(normalizedProfiles);
      } if (!Number.isNaN(gameID)) {
        const reviewers = await reviewerQuery.selectReviewersFromGameID(gameID, offset, limit);
        const normalizedProfiles = await queryWrangling.normalizeReviewer(fetchLanguages, reviewers, true);
        return res.json(normalizedProfiles);
      } if (name !== undefined) {
        // TODO
      }
      return res.json([]);
    } catch (err) {
      appLogger.error(`Error in getReviewerProfile: ${err}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Update a reviewer game pool
   * @async
   * @param {object} req
   * @param {object} res
   * @return {Promise<this|*>}
   */
  async patchReviewerProfile(req, res) {
    const { ID } = req.jwt;
    try {
      const { delta, selfIntroduction } = req.body;
      if (delta === undefined && selfIntroduction === undefined) {
        return res.sendStatus(StatusCodes.NO_CONTENT);
      }
      const updateErr = await datalayer.user({ userID: ID }).update({ selfIntroduction, gamePoolDelta: delta });
      return res.sendStatus(updateErr ? StatusCodes.INTERNAL_SERVER_ERROR : StatusCodes.NO_CONTENT);
    } catch (err) {
      appLogger.error(`Error in patchReviewerProfile: ${err}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

reviewerApiRouter.get(
  '/reviewers',
  handlerApiRoute.searchReviewers,
);

reviewerApiRouter.post(
  '/reviewers/sample',
  body('count').exists().isNumeric(),
  handlerApiRoute.sampleReviewers,
);

reviewerApiRouter.patch(
  '/reviewers/:reviewerID',
  checkIsReviewerIDSelf,
  handlerApiRoute.patchReviewerProfile,
);

reviewerApiRouter.get(
  '/reviewers/:reviewerID',
  handlerApiRoute.getReviewer,
);

reviewerApiRouter.get(
  '/reviewers/:reviewerID/tags',
  enforceJWT,
  (req, res) => handlerApiRoute.getReviewerRelatedTags(req, res),
);

reviewerApiRouter.get(
  '/reviewers/:reviewerID/connectedAccount',
  enforceJWT,
  checkIsReviewerIDSelf,
  (req, res) => handlerApiRoute.getReviewerConnectedAccount(req, res),
);

reviewerApiRouter.delete(
  '/reviewers/:reviewerID/connectedAccount',
  enforceJWT,
  checkIsReviewerIDSelf,
  (req, res) => handlerApiRoute.deleteReviewerConnectedAccount(req, res),
);

module.exports = reviewerApiRouter;
