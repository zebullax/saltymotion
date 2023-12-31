// Misc
import _ from "underscore";
// Saltymotion
import { getReviewerProfile, postCreateAtelier } from "../../lib/api/saltymotionApi";
import { dirtyClone } from "../../lib/utility";

/**
 * @typedef {Object} CandidateReviewer
 * @property {number} ID
 * @property {string} name
 * @property {Date} registrationDate
 * @property {number} nbReview
 * @property {number} avgScore
 * @property {number} bounty
 */

/**
 * @typedef {Object} CreateAtelierState
 * @property {string} title
 * @property {string} description
 * @property {(Game|null)} game
 * @property {CandidateReviewer[]} reviewers
 * @property {Tag[]} tags
 * @property {boolean} isPrivate
 * @property {string} videoURL
 * @property {Game[]} availableGames
 * @property {Tag[]} availableTags
 * @property {boolean} isConstructable
 * @property {boolean} isSubmitting
 * @property {boolean} isLoadingReviewer
 */

/**
 * Build component initial state
 * @param {(undefined|Object)} [override=undefined]
 * @return {CreateAtelierState}
 */
export function buildInitialState(override = undefined) {
  /**
   * @type {CreateAtelierState}
   */
  const defaultState = {
    title: "",
    description: "",
    game: null,
    reviewers: [],
    tags: [],
    isPrivate: false,
    // video: undefined,
    videoURL: "",
    availableGames: [],
    availableTags: [],
    isConstructable: false,
    isSubmitting: false,
    isLoadingReviewer: false,
  };
  if (override !== undefined) {
    return { ...defaultState, ...override };
  }
  return defaultState;
}

/**
 * createAtelier view action type
 * @type {{resetCharacteristics: string, updateCharacteristics: string}}
 */
export const ActionType = {
  updateCharacteristics: "ATELIER_CREATION:UPDATE_CHARACTERISTICS",
  resetCharacteristics: "ATELIER_CREATION:RESET_CHARACTERISTICS",
  setVideoURL: "ATELIER_CREATION:SET_VIDEO_URL",
  loadReviewer: "ATELIER_CREATION:LOAD_REVIEWER",
  addReviewer: "ATELIER_CREATION:ADD_REVIEWER",
  removeReviewer: "ATELIER_CREATION:REMOVE_REVIEWER",
  updateReviewerBounty: "ATELIER_CREATION:UPDATE_REVIEWER_BOUNTY",
  submit: "ATELIER_CREATION:SUBMIT",
  abort: "ATELIER_CREATION:ABORT",
  identity: "ATELIER_CREATION:IDENTITY",
};

/**
 * Check if the atelier has enough details to be constructible
 * @param {CreateAtelierState} state
 * @return {boolean}
 */
function isAtelierConstructible(state) {
  // eslint-disable-next-line max-len
  return (
    state.title.length !== 0 &&
    state.game != null &&
    state.videoURL.length > 0 &&
    state.reviewers.length !== 0 &&
    state.tags.length !== 0
  );
}

/**
 * Create action to update atelier property
 * @param {string} [title]
 * @param {string} [description]
 * @param {(Object|undefined)} [game]
 * @param {CandidateReviewer[]} [reviewers]
 * @param {Tag[]} [tags]
 * @param {boolean} [isPrivate]
 * @param {string} [videoURL]
 * @return {Action}
 */
export function updateCharacteristics({ title, description, game, reviewers, tags, isPrivate, videoURL }) {
  return {
    type: ActionType.updateCharacteristics,
    payload: {
      title,
      description,
      game,
      reviewers,
      tags,
      isPrivate,
      videoURL,
    },
  };
}

/**
 * Create action to load reviewer
 * @param {number} ID
 * @param {(function(error) | function(undefined, Reviewer))} onLoad
 * @return {Action}
 */
export function loadReviewer(ID, onLoad) {
  const [reviewerPromise] = getReviewerProfile(ID);
  reviewerPromise.then((reviewer) => onLoad(undefined, reviewer)).catch((e) => onLoad(e));
  return {
    type: ActionType.loadReviewer,
  };
}

/**
 * Create action to add reviewer
 * @param {Reviewer} reviewer
 * @return {Action}
 */
export function addReviewer(reviewer) {
  return {
    type: ActionType.addReviewer,
    payload: reviewer,
  };
}

/**
 * Create action to remove reviewer
 * @param {number} reviewerID
 * @return {Action}
 */
export function removeReviewer(reviewerID) {
  if (Number.isNaN(reviewerID)) {
    return { type: ActionType.identity };
  }
  return {
    type: ActionType.removeReviewer,
    payload: reviewerID,
  };
}

/**
 * @param {number} reviewerID
 * @param {number} bounty
 * @return {Action}
 */
export function updateReviewerBounty(reviewerID, bounty) {
  if (Number.isNaN(bounty) || Number.isNaN(reviewerID)) {
    return { type: ActionType.identity };
  }
  return {
    type: ActionType.updateReviewerBounty,
    payload: { reviewerID, bounty },
  };
}

/**
 * Create action to set video file
 * @param {string} url
 * @return {Action}
 */
export function setVideoURL(url) {
  return {
    type: ActionType.setVideoURL,
    payload: url,
  };
}

/**
 * Create action to reset modal
 * @return {Action}
 */
export function resetCharacteristics() {
  return { type: ActionType.resetCharacteristics };
}

/**
 * Create action to submit atelier
 * @param {Object} atelierCharacteristics
 * @param {string} atelierCharacteristics.title
 * @param {string} atelierCharacteristics.description
 * @param {(Game|undefined)} atelierCharacteristics.game
 * @param {CandidateReviewer[]} atelierCharacteristics.reviewers
 * @param {Tag[]} atelierCharacteristics.tags
 * @param {boolean} atelierCharacteristics.isPrivate
 * @param {Blob} video
 * @param {function} onSubmit
 * @return {Action}
 */
export function submit(atelierCharacteristics, video, onSubmit) {
  postCreateAtelier({
    gameID: atelierCharacteristics.game.ID,
    isPrivate: atelierCharacteristics.isPrivate,
    title: atelierCharacteristics.title,
    description: atelierCharacteristics.description,
    tags: atelierCharacteristics.tags,
    reviewers: atelierCharacteristics.reviewers,
    videoFile: video,
  })
    .then((val) => onSubmit(undefined, val))
    .catch((e) => onSubmit(e));
  return { type: ActionType.submit };
}

/**
 * Create abort action
 * @return {Action}
 */
export function abort() {
  return { type: ActionType.abort };
}

/**
 * Reduce state for createAtelier modal
 * @param {CreateAtelierState} currentState
 * @param {Action} action
 * @return {CreateAtelierState}
 */
export function createAtelierStateReducer(currentState, action) {
  const clonedState = dirtyClone(currentState);
  switch (action.type) {
    // Update atelier characteristics
    case ActionType.updateCharacteristics: {
      const updatedState = Object.assign(
        clonedState,
        _.omit(action.payload, (val) => val === undefined),
      );
      // If we update the selected game, we should clear the selected reviewers since they may not be compatible
      if (action.payload.game != null) {
        updatedState.reviewers = [];
      }
      updatedState.isConstructable = isAtelierConstructible(updatedState);
      return updatedState;
    }

    // Set the start of the reviewer loading process
    case ActionType.loadReviewer: {
      return {
        ...clonedState,
        isLoadingReviewer: true,
      };
    }

    // Add a reviewer to the pool of candidates
    case ActionType.addReviewer: {
      // const candidateReviewer = deserializeCandidateReviewer(action.payload, currentState.game.ID);
      clonedState.reviewers = _.uniq([...currentState.reviewers, action.payload], (user) => user.ID);
      clonedState.isLoadingReviewer = false;
      clonedState.isConstructable = isAtelierConstructible(clonedState);
      return clonedState;
    }

    // Update the bounty of one of our candidate reviewer
    case ActionType.updateReviewerBounty: {
      const { reviewerID, bounty } = action.payload;
      const updatedReviewers = [...clonedState.reviewers];
      const reviewerIdx = updatedReviewers.findIndex((reviewer) => reviewer.ID === reviewerID);
      if (reviewerIdx === -1) {
        return clonedState;
      }
      updatedReviewers[reviewerIdx].bounty = bounty;
      clonedState.reviewers = updatedReviewers;
      return clonedState;
    }

    // Remove a reviewer from our pool of candidates
    case ActionType.removeReviewer: {
      const updatedReviewers = [...clonedState.reviewers];
      const reviewerIdx = updatedReviewers.findIndex((reviewer) => reviewer.ID === action.payload);
      if (reviewerIdx === -1) {
        return clonedState;
      }
      updatedReviewers.splice(reviewerIdx, 1);
      clonedState.reviewers = updatedReviewers;
      clonedState.isConstructable = isAtelierConstructible(clonedState);
      return clonedState;
    }

    // Revert to baseline for atelier characteristics
    case ActionType.resetCharacteristics: {
      return buildInitialState({
        availableGames: clonedState.availableGames,
        availableTags: clonedState.availableTags,
      });
    }

    // Set the videoURL
    case ActionType.setVideoURL: {
      clonedState.videoURL = action.payload;
      clonedState.isConstructable = isAtelierConstructible(clonedState);
      return clonedState;
    }

    // Set the start of the submission process
    case ActionType.submit: {
      return {
        ...clonedState,
        isSubmitting: true,
      };
    }

    case ActionType.abort: {
      return {
        ...clonedState,
        isSubmitting: false,
      };
    }
    default:
      return currentState;
  }
}
