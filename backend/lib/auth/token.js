const jwt = require('jsonwebtoken');

/**
 * Generate a JWT using userID as payload
 * @deprecated
 * @param {object} req
 * @param {object} res
 */
function generateJWT(req, res) {
  jwt.sign({ID: req.user.ID}, process.env.JWT_SECRET, {expiresIn: '1y', algorithm: 'HS256'}, (err, token) => {
    if (err) {
      console.error(`Error in jwt.sign: ${err}`);
      res.redirect('/login?jwtState=error');
    }
    res.redirect(`/login?jwtState=success&jwt=${token}`);
  });
}

/**
 * Generate a signed token from a userID
 * @async
 * @param {string} userID
 * @return {Promise<error|object>}
 */
function generateJwtFromUserID({userID}) {
  return new Promise((resolve, reject) => {
    jwt.sign({ID: userID}, process.env.JWT_SECRET, {expiresIn: '1y', algorithm: 'HS256'}, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
}

/**
 * Validate a JWT
 * @param {string} header
 * @param {function} onSuccess
 * @param {function} onError
 */
function validateJWT(header, onSuccess, onError) {
  const payload = header.split(' ')[1];
  jwt.verify(payload, process.env.JWT_SECRET, {algorithms: ['HS256']}, (err, user) => {
    if (err) {
      console.error(err);
      onError();
    }
    onSuccess(user);
  });
}

module.exports.generateJwtFromUserID = generateJwtFromUserID;
module.exports.generateJWT = generateJWT;
module.exports.validateJWT = validateJWT;
