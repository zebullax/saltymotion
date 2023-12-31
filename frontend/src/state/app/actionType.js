/**
 * @typedef {Object} AppActionType
 * @property {string} setErrorMessage
 * @property {string} setStatusMessage
 * @property {string} identity
 * @property {string} setLoginStatus
 * @property {string} logout
 * @property {string} setUserProfileUpdateStatus
 * @property {string} toggleDarkMode
 * @property {string} updateQuickAccessWorkshopsLoadChunkStatus
 * @property {string} clearQuickAccessWorkshopsNextChunk
 * @property {string} loadQuickAccessWorkshopsNextChunk
 * @property {string} trimQuickAccessWorkshops
 * @property {string} pushQuickAccessWorkshopsNextChunk
 */
const actionType = {
  setErrorMessage: "APP:SET_ERROR_MSG",
  setStatusMessage: "APP:SET_STATUS_MSG",
  identity: "APP:IDENTITY",
  setLoginStatus: "APP:LOGIN_STATUS__SET",
  setUserProfileUpdateStatus: "APP:USER_PROFILE__UPDATE_STATUS__SET",
  toggleDarkMode: "APP:DARK_MODE__TOGGLE",
  logout: "APP:LOGOUT",
  updateQuickAccessWorkshopsLoadChunkStatus: "APP:CONTENT_SHORTCUT__UPDATE_WORKSHOP_LOAD_CHUNK_STATUS",
  clearQuickAccessWorkshopsNextChunk: "APP:CONTENT_SHORTCUT__CLEAR_WORKSHOP_LOAD_CHUNK_STATUS",
  loadQuickAccessWorkshopsNextChunk: "APP:CONTENT_SHORTCUT__LOAD_WORKSHOP_NEXT_CHUNK",
  trimQuickAccessWorkshops: "APP:CONTENT_SHORTCUT__TRIM",
  pushQuickAccessWorkshopsNextChunk: "APP:CONTENT_SHORTCUT__PUSH_WORKSHOP_NEXT_CHUNK",
};

export { actionType as default };
