import { persistUserPreference } from "../../lib/storage";
import { searchAtelier } from "../../lib/api/saltymotionApi";
import { ApiCallStatus } from "../../lib/api/xhrWrapper";
import actionType from "./actionType";

/**
 * Create action to update error message
 * @param {string} message
 * @return {Action}
 */
export function setErrorMessage(message) {
  return {
    type: actionType.setErrorMessage,
    payload: message,
  };
}

/**
 * Create action to update status message
 * @param {string} message
 * @return {Action}
 */
export function setStatusMessage(message) {
  return {
    type: actionType.setStatusMessage,
    payload: message,
  };
}

/**
 * Update login status
 * @param {ApiCallStatus} status
 * @param {string} [msg]
 * @param {JWT} [jwt]
 * @return {Action}
 */
export function setLoginStatus({ status, msg, jwt }) {
  return {
    type: actionType.setLoginStatus,
    payload: { status, jwt, msg },
  };
}

export function setUserProfileUpdateStatus(status) {
  return {
    type: actionType.setUserProfileUpdateStatus,
    payload: status,
  };
}

/**
 * Create action to toggle dark mode
 * @param {boolean} isCurrentlyDarkMode
 * @return {Action}
 */
export function toggleDarkMode(isCurrentlyDarkMode) {
  // We re flipping to counter state
  persistUserPreference(!isCurrentlyDarkMode);
  return {
    type: actionType.toggleDarkMode,
    payload: {},
  };
}

/**
 * Create an action updating the status of load next workshop chunk
 * @param {ApiCallStatus} status
 * @return {Action}
 */
export function updateQuickAccessWorkshopsLoadChunkStatus({ status }) {
  return {
    type: actionType.updateQuickAccessWorkshopsLoadChunkStatus,
    payload: status,
  };
}

/**
 * Push chunk of workshop items to our state
 * @param {[ShortWorkshopDescription]} workshops
 * @return {Action}
 */
export function pushQuickAccessWorkshopsNextChunk({ workshops }) {
  return {
    type: actionType.pushQuickAccessWorkshopsNextChunk,
    payload: workshops,
  };
}

/**
 * Clear the content of shortcuts to workshops
 * @return {Action}
 */
export function clearQuickAccessWorkshopsNextChunk() {
  return {
    type: actionType.clearQuickAccessWorkshopsNextChunk,
  };
}

/**
 * Create action to initiate loading of next chunk of workshop items for a reviewer
 * Used to display shortcut in sidebar
 * @param {string} userID
 * @param {number} [offset]
 * @param {number} limit
 * @return {function(*): void}
 */
export function loadQuickAccessWorkshopsNextChunk({ userID, offset, limit }) {
  return (dispatch) => {
    dispatch(updateQuickAccessWorkshopsLoadChunkStatus({ status: ApiCallStatus.IN_PROGRESS }));
    const [getWorkshopsPromise] = searchAtelier({
      userID,
      offset,
      limit,
      isNbResultsReturned: false,
      isShortFormat: true,
    });
    getWorkshopsPromise
      .then((workshops) => {
        dispatch(pushQuickAccessWorkshopsNextChunk({ workshops }));
        dispatch(updateQuickAccessWorkshopsLoadChunkStatus({ status: ApiCallStatus.SUCCESS }));
      })
      .catch((e) => {
        console.error(e);
        dispatch(updateQuickAccessWorkshopsLoadChunkStatus({ status: ApiCallStatus.FAILURE }));
      });
  };
}

/**
 * Create the action to trim the workshops quick access as displayed in sidebar
 * @param {number} trimCount
 * @return {Action}
 */
export function trimQuickAccessWorkshops({ count: trimCount }) {
  return {
    type: actionType.trimQuickAccessWorkshops,
    payload: trimCount,
  };
}
