// Saltymotion
import { getNotifications } from "../../lib/api/saltymotionApi";
import { ApiCallStatus } from "../../lib/api/xhrWrapper";
import { setErrorMessage } from "../app/action";

/**
 * @typedef {object} NotificationActionType
 * @property {string} loadNotification
 * @property {string} setNotification
 * @property {string} updateUnreadNotification
 * @property {string} signalUnreadNotification
 * @property {string} setNotificationLoadStatus
 */
const actionType = {
  loadNotification: "NOTIFICATION:DATA__LOAD",
  setNotification: "NOTIFICATION:DATA__SET",
  updateUnreadNotification: "NOTIFICATION:UNREAD__UPDATE",
  signalUnreadNotification: "NOTIFICATION:UNREAD__SIGNAL",
  setNotificationLoadStatus: "NOTIFICATION:LOAD_STATUS__SET",
};

export { actionType };

/**
 * Set the notifications load status
 * @param {ApiCallStatus} status
 * @return {Action}
 */
export function setNotificationLoadStatus({ status }) {
  return {
    type: actionType.setNotificationLoadStatus,
    payload: status,
  };
}
/**
 * Set notifications
 * @param {Notification[]} notifications
 * @param {boolean} isCleared Whether we should clear current content before setting
 * @return {Action}
 */
export function setNotification({ notifications, isCleared }) {
  return {
    type: actionType.setNotification,
    payload: { notifications, isCleared },
  };
}

/**
 * Set the status of unread notifications
 * @param {boolean} hasUnreadNotification
 * @return {Action}
 */
export function updateUnreadNotification({ hasUnreadNotification }) {
  return {
    type: actionType.updateUnreadNotification,
    payload: { hasUnreadNotification },
  };
}

/**
 * Load a chunk of user notifications
 * @param {string} [startFrom]
 * @param {number} limit
 * @param {string} userID
 * @return {function(*): {type: string}}
 */
export function loadNotification({ startFrom, limit, userID }) {
  return (dispatch) => {
    const [notificationPromise] = getNotifications({ userID, startFrom, limit });
    dispatch(setNotificationLoadStatus({ status: ApiCallStatus.IN_PROGRESS }));
    notificationPromise
      .then((notifications) => {
        dispatch(
          setNotification({
            notifications,
            isCleared: startFrom === undefined,
            requestedCount: limit,
          }),
        );
      })
      .catch(() => {
        dispatch(setErrorMessage("Error while loading notifications"));
      })
      .finally(() => {
        dispatch(setNotificationLoadStatus({ status: ApiCallStatus.COMPLETE }));
      });
    return { type: actionType.loadNotification };
  };
}
