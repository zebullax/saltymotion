// Node/Express
// eslint-disable-next-line new-cap
const sessionApiRouter = require('express').Router();

const handlers = {
  /**
   * @deprecated We dont want session
   * @param {object} req
   * @param {object} res
   * @return {Promise<this>}
   */
  deleteSession: async (req, res) => {
    const userID = Number.parseInt(req.params.userID, 10);
    if (userID !== req.jwt.ID) {
      return res.sendStatus(403);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error(`Error while logging out for ${userID}`);
        res.sendStatus(500);
      } else {
        res.sendStatus(204);
      }
    });
  },
};

sessionApiRouter.delete('/sessions/:userID', (req, res) => handlers.deleteSession(req, res));// eslint-disable-line max-len

module.exports = sessionApiRouter;
