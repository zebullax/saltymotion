// Misc
import _ from "underscore";
// Saltymotion
import { searchAtelier } from "../../lib/api/saltymotionApi";
import { ATELIER_LIST_LOAD_CHUNK_SIZE } from "../../lib/property";

/**
 * @typedef {Object} atelierListActionType
 * @property {string} setFilterStatus
 * @property {string} loadChunk
 * @property {string} pushChunk
 */
export const atelierListActionType = {
  setFilterStatus: "ATELIER_LIST:SET_FILTER_STATUS",
  switchItemType: "ATELIER_LIST:SWITCH_ITEM_TYPE",
  loadChunk: "ATELIER_LIST:LOAD_CHUNK",
  pushChunk: "ATELIER_LIST:PUSH_CHUNK",
};

/**
 * Create action to load a chunk of items
 * Will query API
 * @param {string} userID
 * @param {boolean} isAtelier
 * @param {(number)} status
 * @param {number} offset
 * @param {(function (undefined, [AtelierDescription])|function (err))} onLoad - Error first callback on items loaded
 * @return {Action}
 */
export function loadChunk(userID, isAtelier, status, offset, onLoad) {
  const [promise] = searchAtelier({
    [isAtelier ? "uploaderID" : "reviewerID"]: userID,
    offset,
    limit: ATELIER_LIST_LOAD_CHUNK_SIZE,
    atelierStatus: Number.isNaN(status) ? undefined : status,
  });
  // Returning an empty array on error allows caller to send it pushChunk (setting `isLoading` to false)
  promise.then((response) => onLoad(undefined, response)).catch((error) => onLoad(error));
  return { type: atelierListActionType.loadChunk };
}

/**
 * Switch item type between atelier or reviews
 * @param {boolean} isAtelier
 * @return {Action}
 */
export function switchItemType(isAtelier) {
  return { type: atelierListActionType.switchItemType, payload: isAtelier };
}

/**
 * Create action that push a chunk of items to the state
 * @param {AtelierDescription[]} ateliers
 * @return {Action}
 */
export function pushChunk(ateliers) {
  return {
    type: atelierListActionType.pushChunk,
    payload: ateliers,
  };
}

/**
 * Update the filter status
 * @param {(number)}status
 * @return {Action}
 */
export function setFilterStatus(status) {
  return {
    type: atelierListActionType.setFilterStatus,
    payload: status,
  };
}

/**
 * @typedef {Object} AtelierListState
 * @property {boolean} isAtelier
 * @property {boolean} isLoadingChunk
 * @property {boolean} hasMoreItems
 * @property {(number)} statusFilter
 * @property {[AtelierDescription]} ateliers
 */

/**
 * Create the initialStat for atelier list page
 * @param {boolean} isAtelier - Whether this is atelier or review list
 * @return {AtelierListState}
 */
export function buildInitialState(isAtelier) {
  return {
    isAtelier,
    isLoadingChunk: false,
    hasMoreItems: true,
    statusFilter: Number.NaN,
    ateliers: [],
  };
}

/**
 * Reduce atelier list state
 * @param {AtelierListState} currentState
 * @param {Action} action
 * @return {AtelierListState}
 */
export function atelierListStateReducer(currentState, action) {
  switch (action.type) {
    case atelierListActionType.setFilterStatus: {
      return {
        ...currentState,
        ateliers: [],
        hasMoreItems: true,
        statusFilter: action.payload,
      };
    }
    case atelierListActionType.switchItemType: {
      return {
        ...currentState,
        ateliers: [],
        isAtelier: action.payload,
        statusFilter: Number.NaN,
        hasMoreItems: true,
      };
    }
    case atelierListActionType.pushChunk: {
      return {
        ...currentState,
        ateliers: _.uniq([...currentState.ateliers, ...action.payload], (atelier) => atelier.ID),
        isLoadingChunk: false,
        hasMoreItems: action.payload.length === ATELIER_LIST_LOAD_CHUNK_SIZE,
      };
    }
    case atelierListActionType.loadChunk: {
      return {
        ...currentState,
        isLoadingChunk: true,
      };
    }
    default:
      return currentState;
  }
}
