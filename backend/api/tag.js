// Node/Express
const path = require('path');
// eslint-disable-next-line new-cap
const tagApiRouter = require('express').Router();
// Saltymotion
const { StatusCodes } = require('http-status-codes');
const tagQuery = require('../lib/db/tagQuery');
const queryWrangling = require('../lib/queryWrangling');
const atelierQuery = require('../lib/db/atelierQuery');
const appLogger = require('../lib/log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

const ApiHandler = {
  /**
   * Get a single tag
   * @async
   * @param {object} req
   * @param {object} res
   * @return {Promise<void>}
   */
  async getTag(req, res) {
    try {
      const tagID = Number.parseInt(req.params.tagID, 10);
      const tag = await tagQuery.selectTagFromID(tagID);
      if (tag.length === 0) {
        res.sendStatus(StatusCodes.NOT_FOUND);
      } else {
        const rawNbAtelier = await atelierQuery.selectNbAtelierFilterOnTag(tagID);
        const nbAtelier = queryWrangling.normalizeAtelierNumber(rawNbAtelier);
        const relatedTags = await tagQuery.selectShowcaseTagWithExclusion(tagID);
        res.send({
          ID: tagID,
          name: tag.name,
          statistics: nbAtelier,
          relatedTags,
        });
      }
    } catch (e) {
      appLogger.error(`Error in getTag: ${e}`);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * List all tags
   * @param {object} req
   * @param {object} res
   * @return {Promise<Tag[]>}
   */
  async listTags(req, res) {
    try {
      const { hint, offset, limit } = req.query;
      if (hint !== undefined) {
        const tagInfo = await tagQuery.selectTagFromHint(hint, offset, limit);
        const autoCompleteResult = tagInfo.map((info) => ({
          name: info.name,
          ID: info.ID,
        }));
        return res.json(autoCompleteResult);
      }
      const tagInfo = await tagQuery.selectAllTags();
      const autoCompleteResult = tagInfo.map((info) => ({
        label: info.name,
        name: info.name,
        ID: info.ID,
      }));
      return res.json(autoCompleteResult);
    } catch (err) {
      appLogger.error(`Error in listTags: ${err}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

tagApiRouter.get('/tags/:tagID', ApiHandler.getTag);
tagApiRouter.get('/tags', ApiHandler.listTags);

module.exports = tagApiRouter;
