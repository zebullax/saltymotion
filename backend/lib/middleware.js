// Saltymotion
const {validateJWT} = require('./auth/token');
// Misc
const {StatusCodes} = require('http-status-codes');

/**
 * Extract the JWT from auth headers
 * @param {object} req - Express object
 * @param {object} res - Express object
 * @param {function} next
 */
module.exports.extractJWT = (req, res, next) => {
  const bearerToken = req.headers.authorization;
  if (bearerToken) {
    validateJWT(
        bearerToken,
        (user) => {
          req.jwt = user;
          next();
        },
        () => {
          req.jwt = undefined;
          next();
        },
    );
  } else {
    req.jwt = undefined;
    next();
  }
};

/**
 * Verify the existence of a JWT before passing to next middleware
 * @param {object} req - Express object
 * @param {object} res - Express object
 * @param {function} next
 */
module.exports.enforceJWT = (req, res, next) => {
  if (req.jwt !== undefined) {
    next();
  } else {
    console.error(`Error validating JWT in ${req.originalUrl}`);
    res.sendStatus(StatusCodes.BAD_REQUEST);
  }
};

/**
 * Verify that the userID in the route params match the token ID
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
module.exports.checkIsUserIDSelf = (req, res, next) => {
  const queryUserID = req.params.userID;
  const jwtID = req.jwt.ID;
  if (jwtID !== queryUserID) {
    res.sendStatus(StatusCodes.FORBIDDEN);
  } else {
    next();
  }
};

/**
 * Verify that the reviewerID in the route params match the token ID
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
module.exports.checkIsReviewerIDSelf = (req, res, next) => {
  const queryUserID = req.params.reviewerID;
  const jwtID = req.jwt.ID;
  if (jwtID !== queryUserID) {
    res.sendStatus(StatusCodes.FORBIDDEN);
  } else {
    next();
  }
};
