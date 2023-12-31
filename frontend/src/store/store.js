import { buildInitialApplicationState, buildInitialNotificationsState, buildInitialUserProfile } from "./initializers";
import { buildInitialState as buildInitialReviewState } from "../state/review/common";

/**
 * @typedef RootStore
 * @property {UserProfile} userProfile
 * @property {ApplicationStore} application
 * @property {NotificationStore} notification
 */

/**
 * @typedef ApplicationStore
 * @property {string} statusMessage
 * @property {string} errorMessage
 * @property {ApiCallStatus} loginStatus
 * @property {boolean} isVisitor
 * @property {boolean} isDarkMode
 * @property {(UserProfile|undefined)} userProfile
 * @property {ApiCallStatus} userProfileUpdateStatus
 * @property {ApiCallStatus} quickAccessWorkshopsLoadChunkStatus
 * @property {boolean} hasMoreQuickAccessWorkshops
 * @property {ShortWorkshopDescription[]} quickAccessWorkshops
 * @property {JWT|undefined} jwt
 * @property {ReviewWorkshopState} review
 */

/**
 * @typedef NotificationStore
 * @property {ApiCallStatus} loadingStatus
 * @property {Notification[]} data
 * @property {boolean} hasUnreadNotification
 */

/**
 * Build the global store
 * @param {Object} [overrideUserProfile] Use those properties to override user profile initial state
 * @param {Object} [overrideApplicationState] Use those properties to override app initial state
 * @param {Object} [overrideNotification] Use those properties to override notifications initial state
 * @return {RootStore}
 */
const buildStore = ({ overrideUserProfile, overrideApplicationState, overrideNotification }) => ({
  userProfile: overrideUserProfile ? buildInitialUserProfile(overrideUserProfile) : null,
  application: buildInitialApplicationState(overrideApplicationState),
  notification: buildInitialNotificationsState(overrideNotification),
  review: buildInitialReviewState(),
});

export { buildStore as default };
