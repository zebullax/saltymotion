// Saltymotion
const atelierQuery = require('../db/atelierQuery');
// const logger = require('../logger').getLogger();
const tagQuery = require('../db/tagQuery');
const {normalizeAtelierDescription} = require('../queryWrangling');
// misc
const _ = require('underscore');

/**
 * Normalize short description for workshop
 * @param {Object} workshop
 * @return {ShortWorkshopDescription}
 */
const normalizeWorkshopSummary = (workshop) => ({
  uploader: {ID: workshop.uploaderID},
  ID: workshop.ID,
  title: workshop.title,
  creationTimestamp: workshop.creationTimestamp,
  game: {ID: workshop.gameID, name: workshop.gameName},
});

const workshop = {
  /**
   * Build a sample of completed and public workshops
   * @sync
   * @param {number} sampleSize
   * @return {Promise<[Object]>}
   */
  async sampleCompleted({sampleSize}) {
    let samples = await atelierQuery.selectReviewsSample({sampleSize});
    if (samples.length !== 0) {
      const allTags = await tagQuery.selectTagsForAtelier(samples.map((sample) => sample.atelierID));
      const tagsByAtelierID = _.groupBy(allTags, 'atelierID');
      samples = samples.map((sample) => ({
        ...sample,
        tags: tagsByAtelierID[sample.atelierID]?.map((tag) => _.omit(tag, 'atelierID')) ?? [],
      }));
      return normalizeAtelierDescription(samples);
    }
  },
  /**
   * Build a sample of workshops
   * @sync
   * @param {AtelierStatus} status
   * @param {number} sampleSize
   * @return {Promise<[Object]>}
   */
  async sample({status, sampleSize}) {
    if (status === AtelierStatus.Complete) {
      return this.sampleCompleted({sampleSize});
    }
  },
  /**
   * List workshop related to a uploader using short description
   * @async
   * @param {number} uploaderID - uploader ID
   * @param {number} offset
   * @param {number} limit
   * @return {Promise<[ShortWorkshopDescription]>}
   */
  async listSummaryAsUploader({uploaderID, offset, limit}) {
    const workshops = await atelierQuery.selectAtelierFilterOnUploader({
      uploaderID,
      offset,
      limit,
    });
    return workshops.map((workshop) => normalizeWorkshopSummary(workshop));
  },
  /**
   * List workshop related to a reviewer using short description
   * @async
   * @param {number} reviewerID - uploader ID
   * @param {number} offset
   * @param {number} limit
   * @return {Promise<[ShortWorkshopDescription]>}
   */
  async listSummaryAsReviewer({reviewerID, offset, limit}) {
    const workshops = await atelierQuery.selectAtelierFilterOnReviewer({
      reviewerID,
      offset,
      limit,
    });
    return workshops.map((workshop) => normalizeWorkshopSummary(workshop));
  },
  /**
   * List workshop related to a user using short description
   * @async
   * @param {number} userID
   * @param {number} [offset]
   * @param {number} limit
   * @return {Promise<[ShortWorkshopDescription]>}
   */
  async listSummaryAsUser({userID, offset, limit}) {
    const workshops = await atelierQuery.selectAtelierFilterOnUser({
      userID,
      offset,
      limit,
    });
    return workshops.map((workshop) => normalizeWorkshopSummary(workshop));
  },
};

module.exports = workshop;
