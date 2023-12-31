// Node/Express
// eslint-disable-next-line new-cap
const gameApiRouter = require('express').Router();
const path = require('path');
// Misc
const { StatusCodes } = require('http-status-codes');
// Saltymotion
const { body, validationResult } = require('express-validator');
const datalayer = require('../lib/datalayer/dataLayer');
const gameQuery = require('../lib/db/gameQuery');
const { gameWrangler } = require('../lib/datawrangling/game');

const appLogger = require('../lib/log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

const apiHandler = {

  /**
   * GET list of games
   * Optionally filtered on tags passed as filter
   *
   * @async
   * @param {object} req
   * @param {string} req.query.tagsID
   * @param {string} req.query.offset
   * @param {string} req.query.limit
   * @param {object} res
   */
  getGames: async (req, res) => {
    const tagsID = req.query.tagsID !== undefined ? JSON.parse(req.query.tagsID) : undefined;
    const offset = req.query.offset !== undefined ? Number.parseInt(req.query.offset, 10) : 0;
    const limit = req.query.limit !== undefined ? Number.parseInt(req.query.limit, 10) : undefined;
    try {
      const gameQueryParameter = gameQuery.buildGameQueryParameter().setIsNbAtelierIncluded(true);
      if (tagsID !== undefined) {
        const filter = gameQueryParameter.setTagID(tagsID);
        const games = await gameQuery.selectGame({ queryParameter: filter, offset, limit });
        return res.json(games);
      }
      const games = await gameQuery.selectGame({ queryParameter: gameQueryParameter, offset, limit });
      return res.json(games);
    } catch (e) {
      appLogger.error(`Error in getGames: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Sample randomly a subset of games
   * @param {object} req
   * @param {object} res
   */
  sampleGames: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      appLogger.error(`Errors on sampleGames: ${JSON.stringify(errors.array())}`);
      return res.status(StatusCodes.BAD_REQUEST);
    }
    const { count } = req.body;
    try {
      const games = await gameWrangler.sample({ sampleSize: count });
      return res.json(games);
    } catch (e) {
      appLogger.error(`Error in sampleGames: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Get game description
   * @param {object} req
   * @param {object} req.params
   * @param {string} req.params.gameID
   * @param {object} res
   */
  getGame: async (req, res) => {
    const gameID = parseInt(req.params.gameID, 10);
    if (Number.isNaN(gameID)) {
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    }
    try {
      const gameDatalayer = datalayer.game({ gameID });
      const game = await gameDatalayer.get();
      if (game === undefined) {
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
      }
      return res.json(game);
    } catch (e) {
      appLogger.error(`Error in getGame: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Get game related tags
   * @param {object} req
   * @param {object} req.params
   * @param {string} req.params.gameID
   * @param {object} res
   */
  getGameTags: async (req, res) => {
    const gameID = parseInt(req.params.gameID, 10);
    if (Number.isNaN(gameID)) {
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    }
    try {
      const tags = await gameWrangler.getRelatedTags({ gameID });
      return res.json(tags);
    } catch (e) {
      appLogger.error(`Error in getGameTags: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Get game statistics
   * @param {object} req
   * @param {object} req.params
   * @param {string} req.params.gameID
   * @param {object} res
   */
  getGameStatistics: async (req, res) => {
    const gameID = parseInt(req.params.gameID, 10);
    if (Number.isNaN(gameID)) {
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    }
    try {
      const stats = await gameWrangler.getStatistics({ gameID });
      return res.json(stats);
    } catch (e) {
      appLogger.error(`Error in getGameStatistics: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Get game related top reviewers
   * @param {object} req
   * @param {object} req.params
   * @param {string} req.params.gameID
   * @param {string} [req.query.offset]
   * @param {string} [req.query.limit]
   * @param {object} res
   */
  getGameReviewers: async (req, res) => {
    const gameID = parseInt(req.params.gameID, 10);
    const limit = req.query.limit !== undefined ? Number.parseInt(req.query.limit, 10) : undefined;
    if (Number.isNaN(gameID)) {
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    }
    try {
      const result = await gameWrangler.getRelatedReviewers({ gameID, limit });
      return res.json(result);
    } catch (e) {
      appLogger.error(`Error in getGameReviewers: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  searchGameFromHint: async (req, res) => {
    const { hint, offset, limit } = req.query;
    try {
      const gameInfo = await gameQuery.selectGamesFromHint(hint, offset, limit);
      const autoCompleteResult = gameInfo.map((info) => ({
        name: info.name,
        ID: info.ID,
      }));
      res.json(autoCompleteResult);
    } catch (err) {
      appLogger.error(`Error in searchGameFromHint: ${err}`);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

gameApiRouter.get(
  '/games',
  apiHandler.getGames,
);

gameApiRouter.post(
  '/games/sample',
  body('count').exists().isNumeric(),
  apiHandler.sampleGames,
);

gameApiRouter.get(
  '/games/:gameID',
  apiHandler.getGame,
);

gameApiRouter.get(
  '/games/:gameID/tags',
  apiHandler.getGameTags,
);

gameApiRouter.get(
  '/games/:gameID/statistics',
  apiHandler.getGameStatistics,
);

gameApiRouter.get(
  '/games/:gameID/reviewers',
  apiHandler.getGameReviewers,
);

gameApiRouter.get('/games/search/fromHint', apiHandler.searchGameFromHint);

module.exports = gameApiRouter;
