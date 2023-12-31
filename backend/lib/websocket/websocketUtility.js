
/**
 * Translate a user ID to a room identifier for socketIO
 * @param {string} userID - User ID
 * @return {string} - Room identifier
 */
const getRoomForUserID = (userID) => (`users/${userID}`);

/**
 * Send a message to the client using SocketIO
 * @param {any} socketIO - Raw Socket IO object
 * @param {string} roomID - Socket IO room identifier
 * @param {string} msgType - Either of 'status' or 'error' to qualify the type of message
 * @param {string} msgContent - Actual payload of the message
 */
const sendMsgToClient = (socketIO, roomID, msgType, msgContent) => {
  // console.debug(`Sending ${msgType}:${msgContent} to ${roomID}`);
  socketIO.to(roomID).emit(msgType, msgContent);
};

/**
 * Send a notification to the client, potentially with a payload object
 * @param {any} socketIO
 * @param {string} userID
 * @param {string} msgType
 * @param {boolean} [isStatus=true]
 * @param {boolean} [isError=false]
 * @param {boolean} [isActivity=false]
 * @param {object} [payload=undefined]
 */
module.exports.sendIoNotification = ({
  socketIO,
  userID,
  msgType,
  isStatus = true, // should be level in [info, error]
  isError = false,
  isActivity = false,
  payload = undefined,
}) => {
  const standardNotification = {
    isError,
    isStatus,
    isActivity,
    type: msgType,
    payload: payload,
  };
  console.debug(`Sending ${JSON.stringify(standardNotification)} to user ${userID}:${getRoomForUserID(userID)}`);
  sendMsgToClient(socketIO, getRoomForUserID(userID), 'notification', JSON.stringify(standardNotification));
};

module.exports.getRoomForUserID = getRoomForUserID;

