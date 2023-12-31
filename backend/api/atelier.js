// Node/Express
// eslint-disable-next-line new-cap
const atelierAPIRouter = require('express').Router();
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { exec } = require('child_process');
// Misc
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const _ = require('underscore');
const { StatusCodes } = require('http-status-codes');
// Saltymotion
const atelierQuery = require('../lib/db/atelierQuery');
const gameQuery = require('../lib/db/gameQuery');
const userQuery = require('../lib/db/userQuery');
const queryWrangling = require('../lib/queryWrangling');
const middleware = require('../lib/middleware');
const atelierReference = require('../lib/atelierStatus');
const sanityCheck = require('../lib/sanityCheck');
const { notificationType } = require('../lib/notificationReference');
const s3Util = require('../lib/staticStorage/s3Util');
const socketUtil = require('../lib/websocket/websocketUtility');
const { checkIsVideoMimeType } = require('../lib/sanityCheck');
const messageQuery = require('../lib/db/messageQuery');
const activityQuery = require('../lib/db/activityQuery');
const activityRef = require('../lib/activity');
const { MAX_EXCERPT_LENGTH } = require('../lib/applicationSettings');
const {
  sendNewAtelierCommentEmail,
  sendReviewCompleteEmail,
  sendReviewOpportunityEmail,
} = require('../lib/mail/mailer');
const {
  GAME_CATEGORY_LABEL,
  USER_CATEGORY_LABEL,
  ATELIER_CATEGORY_LABEL,
  REVIEWER_CATEGORY_LABEL,
  UPLOADER_CATEGORY_LABEL,
} = require('../lib/applicationSettings');
const dataLayer = require('../lib/datalayer/dataLayer');
const appLogger = require('../lib/log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

const WEBSITE_ROOT_FOLDER = path.normalize(path.join(__dirname, '..'));
const UPLOAD_FOLDER = path.normalize(path.join(WEBSITE_ROOT_FOLDER, process.env.ATELIER_UPLOAD_PATH));

/**
 * Create thumbnails for the atelier based on the uploaded video
 * @param {string} uniqueKey
 * @param {string} videoFilename
 * @param {string} previewFilename
 * @return {Promise<any>}
 */
const createAtelierThumbnail = (uniqueKey, videoFilename, previewFilename) => new Promise((resolve, reject) => {
  exec(
    `ffmpeg -y -i '${videoFilename}' -ss 00:00:01.000 -vframes 1 -f apng '${previewFilename}'`,
    (err, stdout, stderr) => {
      if (err) {
        appLogger.error(`Error in createAtelierThumbnail: ${stderr}`);
        reject(err);
      }
      resolve(previewFilename);
    },
  );
});

const transcodeToMp4 = (inFile, outFile) => new Promise((resolve, reject) => {
  exec(
    `ffmpeg -i '${inFile}' -f mp4 '${outFile}'`,
    (err, stdout, stderr) => {
      if (err) {
        appLogger.error(`Error in transcodeToMp4: ${stderr}`);
        reject(err);
      }
      resolve();
    },
  );
});

const handlerApiRoute = {
  /**
   * Create the atelier
   * @async
   * @param {object} req
   * @param {object} req.app
   * @param {object} req.file
   * @param {object} req.body
   * @param {string} req.jwt.ID
   * @param {object} res
   * @return {Promise<*>}
   */
  async createAtelier(req, res) {
    let atelierID;
    const socketIO = req.app.io;
    const uploaderID = req.jwt.ID;
    try {
      const uploaderNickname = await userQuery.selectUserNickname(uploaderID);
      const gameID = parseInt(req.body.gameID, 10);
      const reviewers = JSON.parse(req.body.reviewers);
      const { description, title } = req.body;
      const tags = JSON.parse(req.body.tags);
      const isPrivate = JSON.parse(req.body.isPrivate);
      const originalFilename = req.file.originalname;
      const candidateLocalPath = req.file.path;

      const gameInfo = await gameQuery.selectGameFromID(gameID);
      if (gameInfo === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).json({ err: 'Game not found' });
      }

      // Check that the max bounty is less than uploader free coin
      const maxBounty = _.max(reviewers, (reviewer) => parseInt(reviewer.bounty, 10)).bounty;
      if (Number.isNaN(maxBounty)) {
        socketUtil.sendIoNotification({
          socketIO,
          userID: uploaderID,
          msgType: notificationType.error.creationAtelier.parameter,
          isStatus: false,
          isActivity: false,
          isError: true,
        });
        return res.status(StatusCodes.BAD_REQUEST).json({ err: 'Validation failed' }); // TODO use express validator
      }
      if (!await sanityCheck.checkAccountBalance(uploaderID, maxBounty)) {
        socketUtil.sendIoNotification({
          socketIO,
          userID: uploaderID,
          msgType: notificationType.error.creationAtelier.insufficientFund,
          isStatus: false,
          isActivity: false,
          isError: true,
        });
        return res.status(StatusCodes.PAYMENT_REQUIRED).json({ err: 'Insufficient funds' });
      }

      // TODO Check on reviewers = their min bounty and if they exist...

      appLogger.debug(`Creating ${isPrivate ? 'private' : 'public'} atelier: Game (${gameID}) `
        + `assigned to candidate reviewers [${JSON.stringify(reviewers)}], tags: ${tags}. `
        + `Video ${originalFilename} -> to ${candidateLocalPath}`);
      // Create atelier in DB
      const uniqueKey = crypto.randomUUID();
      atelierID = await atelierQuery.createAtelier(
        gameID,
        reviewers,
        uploaderID,
        uniqueKey,
        title,
        description,
        tags,
        isPrivate,
      );

      // Upload video to S3
      let s3Err = await s3Util.uploadAtelierCandidateFile(candidateLocalPath, uniqueKey);
      if (s3Err !== undefined) {
        appLogger.error(`Error in createAtelier: Failure uploading ${candidateLocalPath} to S3 with key ${uniqueKey}`);
        await atelierQuery.abortAtelierCreation(atelierID, atelierReference.atelierStatus.ErrorOnCreate);
        socketUtil.sendIoNotification({
          socketIO,
          userID: uploaderID,
          msgType: notificationType.error.creationAtelier.uploadFailure,
          isStatus: false,
          isActivity: false,
          isError: true,
        });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
      }

      // Upload thumbnail
      // TODO Why not have the client generate the thumbnail
      const previewFileFullPath = path.join(UPLOAD_FOLDER, `${uniqueKey}_preview`);
      let thumbnailFilePath;
      try {
        thumbnailFilePath = await createAtelierThumbnail(
          uniqueKey,
          candidateLocalPath,
          previewFileFullPath,
        );
      } catch (thumbErr) {
        if (thumbErr !== undefined) {
          appLogger.error(`Error in createAtelier: Creating thumbnail failed, ${thumbErr}`);
          await atelierQuery.abortAtelierCreation(atelierID, atelierReference.atelierStatus.ErrorOnCreate);
          socketUtil.sendIoNotification({
            socketIO,
            userID: uploaderID,
            msgType: notificationType.error.creationAtelier.uploadFailure,
            isStatus: false,
            isActivity: false,
            isError: true,
          });
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err: 'Unknown error while creating thumbnail' });
        }
      }
      s3Err = await s3Util.uploadAtelierPreviewFile(thumbnailFilePath, uniqueKey);
      if (s3Err === undefined) {
        await fs.unlink(thumbnailFilePath);
      } else {
        // Error uploading the thumbnail... Use a placeholder ?
        appLogger.error(`Error while uploading thumbnail ${thumbnailFilePath}_preview to S3: ${s3Err}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
      }

      // Send alert & mail to reviewer and status update to uploader
      appLogger.debug(`Created atelier ${atelierID}`);
      socketUtil.sendIoNotification({
        socketIO,
        userID: uploaderID,
        msgType: notificationType.status.atelier.creation.complete,
        isStatus: true,
        isActivity: false,
        isError: false,
      });
      await Promise.allSettled(reviewers.map((reviewer) => async () => {
        const notificationPreference = await userQuery.selectUserNotificationPreference(reviewer.ID);
        if (notificationPreference.isNotifyOnReviewOpportunity) {
          const reviewerDestination = await userQuery.selectUserEmailFromID(reviewer.ID);
          if (reviewerDestination) {
            await sendReviewOpportunityEmail({
              address: reviewerDestination.email,
              toName: reviewer.name,
              bounty: reviewer.bounty,
              game: gameInfo.name,
              fromName: uploaderNickname,
            });
          }
        }
        socketUtil.sendIoNotification({
          socketIO,
          userID: reviewer.ID,
          msgType: notificationType.status.auction.askCandidate,
          isStatus: false,
          isActivity: true,
          isError: false,
        });
        return undefined;
      }));
      return res.status(StatusCodes.CREATED).send({ ID: atelierID });
    } catch (err) {
      appLogger.error(`Unknown error in createAtelier: ${err}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Update an atelier rating
   * The atelier must be complete and the requester must be the atelier owner
   * @param {object} req
   * @param {object} res
   * @return {Promise<void>}
   */
  async rateAtelier(req, res) {
    const { ID } = req.jwt;
    const atelierID = Number.parseInt(req.params.atelierID, 10);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      appLogger.error(`Errors on rateAtelier: ${JSON.stringify(errors.mapped())}`);
      return res.status(StatusCodes.BAD_REQUEST).json({ err: 'Error validating parameters' });
    }
    const { score } = req.body;
    try {
      await atelierQuery.updateAtelierScore(ID, atelierID, score);
      return res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (err) {
      appLogger.error(`Error in rateAtelier: ${err}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  async acceptAtelier(req, res) {
    const atelierID = Number.parseInt(req.params.atelierID, 10);
    const reviewerID = req.jwt.ID;
    try {
      // Sanity check
      // Atelier must be in auction and the user an auction candidate
      if (!await sanityCheck.checkIsAtelierCandidate(atelierID, reviewerID)
        || !await sanityCheck.checkIsAtelierInAuction(atelierID)) {
        appLogger.error(`Error in acceptAtelier: user ${reviewerID} is not allowed to accept atelier ${atelierID}`);
        return res.sendStatus(StatusCodes.FORBIDDEN);
      }
      await atelierQuery.acceptAtelier(reviewerID, atelierID);
      appLogger.debug(`Atelier ${atelierID} accepted by ${reviewerID}`);
      return res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (err) {
      appLogger.error(`Error in acceptAtelier : ${err}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Cancel an atelier
   * This should be called by the uploader, on an atelier in auction, it will be rejected otherwise
   * @async
   * @param {object} req
   * @param {object} res
   */
  async cancelAtelier(req, res) {
    const atelierID = Number.parseInt(req.params.atelierID, 10);
    const userID = req.jwt.ID;
    try {
      const atelierFilter = atelierQuery.buildAtelierQueryParameter().setAtelierID(atelierID);
      const atelierInfo = (await atelierQuery.selectAtelier(atelierFilter)).atelierDescription[0];
      if (atelierInfo === undefined) {
        appLogger.error(`Error in cancelAtelier: could not find atelier ${atelierID}`);
        return res.sendStatus(StatusCodes.NOT_FOUND);
      }
      if (userID !== atelierInfo.uploaderID || atelierInfo.currentStatus >= atelierReference.atelierStatus.Complete) {
        appLogger.error(`Error while canceling an atelier: user ${userID} is not allowed to cancel atelier ${atelierID}`);
        return res.status(StatusCodes.FORBIDDEN).json({ err: 'This atelier can\'t be cancelled by this user' });
      }
      await atelierQuery.cancelAtelier(atelierID);
      const deleteFileErr = await s3Util.removeAtelierCandidateFile(atelierInfo.originalName);
      if (deleteFileErr !== undefined) {
        appLogger.error(`cancelAtelier: could not delete the file ${atelierInfo.originalName}: ${deleteFileErr}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err: 'Error while deleting video files' });
      }
      return res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (err) {
      appLogger.error(`cancelAtelier: Atelier ${atelierID}, User ${userID}, exception: ${err}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  async declineAtelier(req, res) {
    const atelierID = Number.parseInt(req.params.atelierID, 10);
    if (Number.isNaN(atelierID)) {
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    }
    const reviewerID = req.jwt.ID;
    try {
      // Sanity check
      //  - Atelier must be in auction
      const atelierFilter = atelierQuery.buildAtelierQueryParameter()
        .setAtelierID(atelierID)
        .setCurrentStatus(atelierReference.atelierStatus.InAuction);
      const atelierDescription = (await atelierQuery.selectAtelier(atelierFilter)).atelierDescription[0];
      if (atelierDescription === undefined) {
        appLogger.error(`Error in declineAtelier: ${atelierID} not found, initiated by reviewer ${reviewerID}`);
        return res.sendStatus(StatusCodes.NOT_FOUND);
      }
      //  - The user must be a candidate reviewer
      if (!await sanityCheck.checkIsAtelierCandidate(atelierID, reviewerID)) {
        appLogger.error(`Error in declineAtelier: ${atelierID} cant be declined by reviewer ${reviewerID}`);
        return res.status(StatusCodes.FORBIDDEN).json({ err: 'This user can not decline this atelier' });
      }

      // If the last candidate declined we cancel the atelier
      const nbCandidateLeft = await atelierQuery.declineAtelier(reviewerID, atelierID);
      if (nbCandidateLeft === 0) {
        appLogger.debug(`Last candidate declined, cancelling atelier ${atelierID}`);
        await atelierQuery.cancelAtelier(atelierID);
        socketUtil.sendIoNotification({
          socketIO: req.app.io,
          userID: atelierDescription.uploaderID,
          msgType: notificationType.status.auction.cancelFromLastDecline,
          isActivity: true,
          isError: false,
          isStatus: true,
        });
      }
      appLogger.debug(`Atelier ${atelierID}: ${reviewerID} successfully declined`);
      return res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (err) {
      appLogger.error(`Error in declineAtelier: ${err}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Delete an atelier
   * @async
   * @param {object} req
   * @param {object} res
   * @return {Promise<this>}
   */
  async deleteAtelier(req, res) {
    const userID = req.jwt.ID;
    const atelierID = Number.parseInt(req.params.atelierID, 10);
    if (Number.isNaN(atelierID)) {
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    }
    try {
      const uploaderID = await atelierQuery.selectAtelierUploaderID(atelierID);
      if (uploaderID === undefined) {
        return res.sendStatus(StatusCodes.NOT_FOUND);
      }
      if (uploaderID !== userID) {
        return res.status(StatusCodes.FORBIDDEN).json({ err: 'This user does not own this atelier' });
      }
      await atelierQuery.setStatus({ atelierID, statusID: atelierReference.atelierStatus.Deleted });
      appLogger.debug(`Deleted atelier ${atelierID}`);
      return res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (err) {
      appLogger.error(`Error in deleteAtelier: ${err}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Sample reviews
   * @param {Object} req
   * @param {Object} res
   * @return {Promise<*>}
   */
  async getSample(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      appLogger.error(`Errors on sampleGames: ${JSON.stringify(errors.mapped())}`);
      return res.status(StatusCodes.BAD_REQUEST);
    }
    const { count } = req.body;
    try {
      const samples = await dataLayer.workshop.sampleCompleted({ sampleSize: count });
      return res.json(samples);
    } catch (e) {
      appLogger.error(`Error in getSample: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Get atelier object
   * @async
   * @param {object} req
   * @param {object} res
   * @return {Promise<this|*>}
   */
  async getAtelier(req, res) {
    const userID = req.jwt?.ID;
    const isVisitor = userID === undefined;
    const atelierID = Number.parseInt(req.params.atelierID, 10);
    if (Number.isNaN(atelierID)) {
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    }
    try {
      let { atelierDescription } = await queryWrangling.buildAtelierDescriptionWithFilter({
        filterCategory: ATELIER_CATEGORY_LABEL,
        isAuctionFilteredOut: isVisitor,
        isTagFilteredOut: false,
        isReviewerStatFilteredOut: false,
        filterValue: atelierID,
        isAsc: false,
        sortingColumn: 'creationTimestamp',
      });
      if (atelierDescription.length !== 1) {
        return res.sendStatus(StatusCodes.NOT_FOUND);
      }
      atelierDescription = atelierDescription[0];
      const { isPrivate } = atelierDescription;
      let isAllowed = false;
      if (isVisitor) {
        // Visitors may only see videos that are complete and public
        isAllowed = sanityCheck.checkIsAtelierAccessible({
          isCandidate: false,
          isReviewer: false,
          isUploader: false,
          isPrivate,
          isVisitor: true,
          atelierStatusID: atelierDescription.currentStatus.ID,
        });
      } else {
        const userCandidateAuction = atelierDescription.auctions.find((auction) => auction.ID === userID);
        const isUploader = atelierDescription.uploader.ID === userID;
        const isReviewer = atelierDescription.reviewer.ID === userID;
        const isCandidate = userCandidateAuction !== undefined;

        // If the atelier is private, the requester must either be the uploader or one of the reviewer
        isAllowed = sanityCheck.checkIsAtelierAccessible({
          isCandidate,
          isReviewer,
          isUploader,
          isPrivate,
          isVisitor,
          atelierStatusID: atelierDescription.currentStatus.ID,
        });
      }
      if (!isAllowed) {
        appLogger.error(`${isVisitor ? 'Visitor' : `User ${userID}`} is not allowed to get atelier ${atelierID}`);
        return res.sendStatus(StatusCodes.FORBIDDEN);
      }
      return res.json(atelierDescription);
    } catch (e) {
      appLogger.error(`Error in getAtelier: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  async searchAtelier(req, res) {
    let {
      filterCategory,
      filterValue,
      searchTerm,
      offset,
      limit,
      isShortFormat,
      isNbTotalResultsIncluded,
      atelierStatus,
    } = req.query;
    if (filterCategory === undefined) {
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    }
    atelierStatus = Number.parseInt(atelierStatus, 10);
    offset = offset !== undefined ? Number.parseInt(offset, 10) : undefined;
    limit = Number.parseInt(limit, 10);
    if (filterCategory === GAME_CATEGORY_LABEL) {
      filterValue = Number.parseInt(filterValue, 10);
    }
    const userID = req?.jwt?.ID;
    const isVisitor = userID === undefined;
    isShortFormat = isShortFormat !== undefined && isShortFormat.toLowerCase() === 'true';
    isNbTotalResultsIncluded = isNbTotalResultsIncluded !== undefined
      && isNbTotalResultsIncluded.toLowerCase() === 'true';

    try {
      // Short circuit execution if we are querying short format
      if (isShortFormat) {
        switch (filterCategory) {
          case GAME_CATEGORY_LABEL: {
            if (Number.isNaN(limit) || Number.isNaN(filterValue)) {
              return res.status(StatusCodes.BAD_REQUEST).json({ err: 'Missing mandatory field' });
            }
            const results = await atelierQuery.selectRecommendedAtelier({
              gameID: filterValue,
              userID,
              offset,
              limit,
            });
            return res.json({ value: results });
          }
          case USER_CATEGORY_LABEL: {
            if (Number.isNaN(limit) || filterValue === undefined) {
              return res.status(StatusCodes.BAD_REQUEST).json({ err: 'Missing mandatory field' });
            }
            const results = await dataLayer.workshop.listSummaryAsUser({ userID: filterValue, offset, limit });
            return res.json(results);
          }
          case UPLOADER_CATEGORY_LABEL: {
            if (Number.isNaN(limit) || filterValue === undefined) {
              return res.status(StatusCodes.BAD_REQUEST).json({ err: 'Missing mandatory field' });
            }
            const results = await dataLayer.workshop.listSummaryAsUploader({ uploaderID: filterValue, offset, limit });
            return res.json(results);
          }
          case REVIEWER_CATEGORY_LABEL: {
            if (Number.isNaN(limit) || filterValue === undefined) {
              return res.status(StatusCodes.BAD_REQUEST).json({ err: 'Missing mandatory field' });
            }
            const results = await dataLayer.workshop.listSummaryAsReviewer({ reviewerID: filterValue, offset, limit });
            return res.json(results);
          }
          default:
            return res.sendStatus(StatusCodes.BAD_REQUEST);
        }
      } else {
        const isOwnWorkshops = !isVisitor
            && (filterCategory === REVIEWER_CATEGORY_LABEL || filterCategory === UPLOADER_CATEGORY_LABEL)
            && filterValue === userID;
        const isAuctionFilteredOut = isVisitor || atelierStatus !== atelierReference.atelierStatus.InAuction;
        const result = await queryWrangling.buildAtelierDescriptionWithFilter({
          filterCategory,
          filterValue,
          searchTerm,
          atelierStatus,
          isPrivateFilteredOut: !isOwnWorkshops,
          isAuctionFilteredOut,
          isNbTotalResultsIncluded: !isShortFormat,
          offset,
          limit,
          sortField: 'creationTimestamp',
          isAsc: false,
        });
        return res.json({
          nbRowTotal: isNbTotalResultsIncluded ? result.nbRowTotal : undefined,
          value: result.atelierDescription,
        });
      }
    } catch (e) {
      appLogger.error(`Error in searchAtelier: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  getAtelierComment: async (req, res) => {
    const atelierID = Number.parseInt(req.params.atelierID, 10);
    if (Number.isNaN(atelierID)) {
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    }
    const { offset, limit } = req.query;
    try {
      const comments = await messageQuery.selectAtelierMessage(atelierID, offset, limit);
      return res.json({ value: comments });
    } catch (e) {
      appLogger.error(`Error in getAtelierComment: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  postAtelierComment: async (req, res) => {
    const atelierID = Number.parseInt(req.params.atelierID, 10);
    if (Number.isNaN(atelierID)) {
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    }
    const userID = req.jwt.ID;
    const now = new Date();
    const { comment } = req.body;
    try {
      const uploaderNickname = await userQuery.selectUserNickname(userID);
      const atelierDescription = (await queryWrangling.buildAtelierDescriptionWithFilter({
        filterCategory: ATELIER_CATEGORY_LABEL,
        filterValue: atelierID,
      })).atelierDescription[0];
      if (atelierDescription === undefined) {
        return res.sendStatus(StatusCodes.NOT_FOUND);
      }
      const uploaderID = atelierDescription.uploader.ID;
      const reviewerID = atelierDescription.reviewer.ID;
      if (atelierDescription.isPrivate && (userID !== uploaderID || userID !== reviewerID)) {
        appLogger.error(
          `AtelierMessage failed validation for user ${userID}, uploader `
            + `${uploaderID}, reviewer ${reviewerID} on atelier ${atelierID}`,
        );
        return res.sendStatus(StatusCodes.FORBIDDEN);
      }
      // Insert message
      const insertID = await messageQuery.insertAtelierMessage(atelierID, userID, comment, now);
      // Insert activity
      if (userID !== uploaderID) {
        const activityDescription = activityRef.buildActivityFilter()
          .setSourceActor(activityRef.userType.user, userID)
          .setTargetActor(activityRef.userType.user, uploaderID)
          .setLinkedID(atelierID)
          .setActivityRefID(activityRef.activityRefID.commentAtelier)
          .setTimestamp(now);
        await activityQuery.insertAtelierActivity(activityDescription);
        socketUtil.sendIoNotification({
          socketIO: req.app.io,
          userID,
          msgType: notificationType.status.comment.creation.complete,
          isStatus: false,
          isActivity: true,
          isError: false,
        });
        const notificationPreference = await userQuery.selectUserNotificationPreference(uploaderID);
        if (notificationPreference.isNotifyOnNewComment) {
          const userEmail = await userQuery.selectUserEmailFromID(uploaderID);
          if (userEmail.email !== undefined && userEmail.email.length > 0) {
            const excerpt = comment.length < MAX_EXCERPT_LENGTH ? comment
              : `${comment.substr(0, MAX_EXCERPT_LENGTH)}...`;
            await sendNewAtelierCommentEmail({
              address: userEmail.email,
              fromName: uploaderNickname,
              excerpt,
              toName: atelierDescription.uploader.name,
              atelierTitle: atelierDescription.title,
              atelierID,
            });
          }
        }
      }
      return res.status(StatusCodes.CREATED).json({
        ID: insertID,
        content: comment,
        timestamp: now,
      });
    } catch (err) {
      appLogger.error(`Error in postAtelierMessage: ${err}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Delete an atelier comment
   * @param {object} req
   * @param {number} req.jwt.ID
   * @param {string} req.params.atelierID
   * @param {string} req.params.commentID
   * @param {object} res
   * @return {Promise<this>}
   */
  async deleteAtelierComment(req, res) {
    const atelierID = Number.parseInt(req.params.atelierID, 10);
    if (Number.isNaN(atelierID)) {
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    }
    const commentID = Number.parseInt(req.params.commentID, 10);
    if (Number.isNaN(commentID)) {
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    }
    const userID = req.jwt.ID;
    try {
      const nbRowDelete = await messageQuery.removeAtelierMessage(userID, commentID);
      if (nbRowDelete === 0) {
        return res.sendStatus(405);
      }
      await activityQuery.removeMessageActivity(commentID, userID); // Could be 0 ?
      return res.sendStatus(204);
    } catch (err) {
      appLogger.error(`Error in deleteAtelierComment: ${err}`);
      return res.sendStatus(500);
    }
  },

  /**
   * Post a review video
   * @async
   * @param {object} req
   * @param {object} res
   * @return {Promise<this|*>}
   */
  postReview: async (req, res) => {
    const atelierID = Number.parseInt(req.params.atelierID, 10);
    if (Number.isNaN(atelierID)) {
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    }
    let { encodedVideoBlob } = req.body;
    const mimeType = JSON.parse(req.body.mimeType);

    const errors = validationResult(req);
    if (encodedVideoBlob === undefined || mimeType === undefined) {
      appLogger.error(`Errors validating body on postReview: ${JSON.stringify(errors.mapped())}`);
      return res.status(StatusCodes.BAD_REQUEST).json({ err: 'Missing fields in body' });
    }
    const userID = req.jwt.ID;
    const socketIO = req.app.io;

    try {
      const queryFilter = atelierQuery.buildAtelierQueryParameter().setAtelierID(atelierID);
      const atelierDescription = (await atelierQuery.selectAtelier(queryFilter)).atelierDescription[0];
      if (atelierDescription === undefined) {
        appLogger.error(`Error in postReview: atelier ${atelierID} was not found`);
        return res.sendStatus(StatusCodes.NOT_FOUND);
      }
      if (!atelierReference.isAtelierInProgress(atelierDescription.currentStatus)) {
        appLogger.error(`Error in postReview: ${atelierID} is not in progress`);
        return res.status(StatusCodes.BAD_REQUEST).json({ err: 'The atelier is not in progress' });
      }
      if (atelierDescription.reviewerID !== userID) {
        appLogger.error(`Error in postReview: User ${userID} is unauthorized to review atelier ${atelierID}`);
        return res.status(StatusCodes.FORBIDDEN).json({ err: 'User is not the reviewer' });
      }

      // Get rid of the prepended mime type 'data:video/webm;codec=vp9;base64,' and extract the stream type
      const videoTypeRegex = /data:video\/(.+?);/i;
      const match = videoTypeRegex.exec(encodedVideoBlob.substr(0, encodedVideoBlob.indexOf(',')));
      if (!match) {
        appLogger.error(`Error in postReview: Can not detect video format from ${match}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err: 'Can not detect video format' });
      }
      const [, videoFormat] = match;
      if (!checkIsVideoMimeType(videoFormat)) {
        appLogger.error(`Error in postReview: ${videoFormat} is not a supported video type`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err: `${videoFormat} is not a supported format` });
      }
      const base64MagicString = 'base64,';
      const base64MagicStringIndex = encodedVideoBlob.indexOf(base64MagicString);
      if (base64MagicStringIndex === -1) {
        appLogger.error('Error in postReview: does not seem to base 64 encoded');
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err: 'The video is not properly encoded' });
      }
      const s3Key = atelierDescription.originalName;
      // Save adjusted (no mime-type) review file locally before uploading
      // We ll save that blob under th name [originalFilename]_raw
      const reviewFullFilename = path.normalize(path.join(
        WEBSITE_ROOT_FOLDER,
        process.env.ATELIER_UPLOAD_PATH,
        atelierID.toString(),
        s3Key,
      ));
      appLogger.debug(`Saving atelier ${atelierID} review to ${reviewFullFilename}`);
      encodedVideoBlob = encodedVideoBlob.substr(base64MagicStringIndex + base64MagicString.length);
      await fs.mkdir(path.join(UPLOAD_FOLDER, atelierID.toString()));
      await fs.writeFile(`${reviewFullFilename}_raw`, encodedVideoBlob, 'base64');
      appLogger.log(`Transcoding from ${mimeType} to mp4 ${reviewFullFilename}_raw => ${reviewFullFilename}`);
      await transcodeToMp4(`${reviewFullFilename}_raw`, `${reviewFullFilename}`);
      // Send to S3
      await s3Util.uploadReviewFile(reviewFullFilename, s3Key, 'video/mp4');
      await atelierQuery.completeReview(atelierID, userID);
      appLogger.debug(`Review submission successful for atelier ${atelierID}`);
      // Alert reviewer about bounty transfer
      socketUtil.sendIoNotification({
        socketIO,
        userID,
        msgType: notificationType.status.bounty.receive,
        isStatus: false,
        isActivity: true,
        isError: false,
      });
      // Alert atelier uploader about review availability
      socketUtil.sendIoNotification({
        socketIO,
        userID: atelierDescription.uploaderID,
        msgType: notificationType.status.review.complete,
        isStatus: false,
        isActivity: true,
        isError: false,
      });
      // Send email, error is not fatal
      try {
        const uploaderEmail = await userQuery.selectUserEmailFromID(atelierDescription.uploaderID);
        if (uploaderEmail) {
          await sendReviewCompleteEmail({
            game: atelierDescription.gameName,
            address: uploaderEmail.email,
            fromName: atelierDescription.reviewerNickname,
            toName: atelierDescription.uploaderNickname,
            atelierID,
          });
        }
      } catch (error) {
        appLogger.error(`Error while sending mail on atelier ${atelierID}`);
      }
      return res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (err) {
      // Clean up potentially any tmp folder
      fs.rmdir(path.join(UPLOAD_FOLDER, atelierID.toString()), { recursive: true, force: true })
        .catch((e) => appLogger.error(e));
      // Should we set atelier as in error
      appLogger.error(`Error in postReview: User ${userID}, atelier ${atelierID}: ${err}`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err: 'Unknown error while uploading review' });
    }
  },
};

atelierAPIRouter.get(
  '/ateliers',
  handlerApiRoute.searchAtelier,
);

atelierAPIRouter.post(
  '/ateliers/sample',
  body('count').exists().isNumeric(),
  handlerApiRoute.getSample,
);

atelierAPIRouter.post(
  '/ateliers',
  middleware.enforceJWT,
  multer({
    dest: UPLOAD_FOLDER,
    limits: { fieldSize: 1024 * 1024 * 1024 },
  }).single('video'),
  handlerApiRoute.createAtelier,
);

atelierAPIRouter.get(
  '/ateliers/:atelierID',
  handlerApiRoute.getAtelier,
);

atelierAPIRouter.post(
  '/ateliers/:atelierID/review',
  middleware.enforceJWT,
  multer({
    dest: 'uploads',
    limits: { fieldSize: 1024 * 1024 * 1024 },
  }).fields([{
    name: 'encodedVideoBlob',
    maxCount: 1,
  }]),
  (req, res) => handlerApiRoute.postReview(req, res),
);

atelierAPIRouter.patch(
  '/ateliers/:atelierID/rating',
  middleware.enforceJWT,
  body('score').exists().isFloat({ min: 0, max: 5 }),
  (req, res) => handlerApiRoute.rateAtelier(req, res),
);

atelierAPIRouter.post(
  '/ateliers/:atelierID/accept',
  middleware.enforceJWT,
  handlerApiRoute.acceptAtelier,
);

atelierAPIRouter.delete(
  '/ateliers/:atelierID',
  middleware.enforceJWT,
  handlerApiRoute.deleteAtelier,
);

atelierAPIRouter.post(
  '/ateliers/:atelierID/decline',
  middleware.enforceJWT,
  handlerApiRoute.declineAtelier,
);

atelierAPIRouter.post(
  '/ateliers/:atelierID/cancel',
  middleware.enforceJWT,
  handlerApiRoute.cancelAtelier,
);

atelierAPIRouter.post(
  '/ateliers/:atelierID/comments',
  middleware.enforceJWT,
  handlerApiRoute.postAtelierComment,
);

atelierAPIRouter.get(
  '/ateliers/:atelierID/comments',
  handlerApiRoute.getAtelierComment,
);

atelierAPIRouter.delete(
  '/ateliers/:atelierID/comments/:commentID',
  middleware.enforceJWT,
  handlerApiRoute.deleteAtelierComment,
);

module.exports = atelierAPIRouter;
