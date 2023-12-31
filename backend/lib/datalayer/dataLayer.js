// Saltymotion
const user = require('./user/user');
const game = require('./game/game');
const workshop = require('./workshop');
const wallet = require('./wallet');

const dataLayer = {
  user,
  game,
  workshop,
  wallet,
};

module.exports = dataLayer;
