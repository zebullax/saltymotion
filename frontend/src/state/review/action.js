// Saltymotion
import adapter from "webrtc-adapter";
import { ProgressiveProcessStatus } from "./common";
import { postReview } from "../../lib/api/saltymotionApi";
// Misc
// eslint-disable-next-line no-console
console.log(adapter.browserDetails.browser); // This does away with the unused warning on adapter

/**
 * @typedef {string} WorkshopReviewActionType
 * @property {string} updateBrowserSupportedStatus
 * @property {string} updateStreamSource
 * @property {string} updateStreamSourceLoadingStatus
 * @property {string} updateAvailableMediaSourcesEnumerationStatus
 * @property {string} killStreamSource
 * @property {string} updateAvailableStreamSources
 * @property {string} updateReviewSubmissionStatus
 * @property {string} enumerateAvailableMediaSources
 * @property {string} updateVideoResolution
 * @property {string} cleanup
 * @property {string} startReview
 * @property {string} stopReview
 * @property {string} submitReview
 */
const actionType = {
  // #private
  updateBrowserSupportedStatus: "BROWSER_SUPPORTED_STATUS__UPDATE",
  updateStreamSource: "STREAM_SOURCE__UPDATE",
  updateStreamSourceLoadingStatus: "STREAM_SOURCE__LOADING_STATUS__UPDATE",
  updateAvailableMediaSourcesEnumerationStatus: "UPDATE_STREAM_SOURCES_ENUMERATION_STATUS",
  killStreamSource: "STREAM_SOURCE__KILL",
  updateAvailableStreamSources: "AVAILABLE_STREAM_SOURCES__UPDATE",
  updateReviewSubmissionStatus: "REVIEW__SUBMISSION_STATUS__UPDATE",
  // #public
  enumerateAvailableMediaSources: "AVAILABLE_STREAM_SOURCES__ENUMERATE",
  updateVideoResolution: "VIDEO_RESOLUTION__UPDATE",
  cleanup: "REVIEW_PAGE__CLEANUP",
  startReview: "REVIEW__START_RECORDING",
  stopReview: "REVIEW__STOP_RECORDING",
  submitReview: "REVIEW__SUBMIT",
};

// Not exported, used internally by public action creators implementations
const impActionCreators = {
  updateBrowserSupportedStatus({ isSupported }) {
    return {
      type: actionType.updateBrowserSupportedStatus,
      payload: { isSupported },
    };
  },

  /**
   * Setter for currently live input source
   * @param {MediaStreamTrack} videoSource
   * @param {MediaStreamTrack} audioSource
   * @param {MediaStream} stream
   * @return {WorkshopReviewAction}
   */
  updateStreamSource({ videoSource, audioSource, stream }) {
    return {
      type: actionType.updateStreamSource,
      payload: { audioSource, videoSource, stream },
    };
  },

  /**
   * Setter for stream source loading status
   * @return {WorkshopReviewAction}
   */
  updateStreamSourceLoadingStatus({ isLoading }) {
    return {
      type: actionType.updateStreamSourceLoadingStatus,
      payload: { isLoading },
    };
  },

  /**
   * Set the available media sources after enumeration
   * @param {MediaStreamTrack[]} videoSources
   * @param {MediaStreamTrack[]} audioSources
   * @return {WorkshopReviewAction}
   */
  updateAvailableStreamSources({ videoSources, audioSources }) {
    return {
      type: actionType.updateAvailableStreamSources,
      payload: { audioSources, videoSources },
    };
  },

  /**
   * Set status of review submission
   * @param {ProgressiveProcessStatus} status
   * @return {WorkshopReviewAction}
   */
  updateReviewSubmissionStatus({ status }) {
    return {
      type: actionType.updateReviewSubmissionStatus,
      payload: { status },
    };
  },

  /**
   * Update the stream enumeration process status
   * @param {ProgressiveProcessStatus} status
   * @return {WorkshopReviewAction}
   */
  updateAvailableMediaSourcesEnumerationStatus({ status }) {
    return {
      type: actionType.updateAvailableMediaSourcesEnumerationStatus,
      payload: { status },
    };
  },

  killStreamSource({ isSwitchingToNewSource }) {
    return {
      type: actionType.killStreamSource,
      payload: { isSwitchingToNewSource },
    };
  },
};

const actionCreator = {
  requestUserMedia: (constraints) => (dispatch) => {
    if (typeof navigator?.mediaDevices?.getUserMedia !== "function" || typeof window.MediaRecorder !== "function") {
      dispatch(impActionCreators.updateBrowserSupportedStatus({ isSupported: false }));
      return;
    }
    dispatch(impActionCreators.updateStreamSourceLoadingStatus({ isLoading: true }));
    console.debug("Asking user media");
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(async (value) => {
        const [audioDevice] = value.getAudioTracks();
        const [videoDevice] = value.getVideoTracks();
        console.debug("Init web stream", audioDevice, videoDevice);
        // TODO : Serialization issue on media track type
        dispatch(
          impActionCreators.updateStreamSource({
            videoSource: videoDevice,
            audioSource: audioDevice,
            stream: value,
          }),
        );
      })
      .catch((e) => {
        console.error(`Error while requesting user media: ${e}`);
      });
  },

  /**
   * Clean up resources and restore base state
   * @return {WorkshopReviewAction}
   */
  cleanup: () => ({
    type: actionType.cleanup,
    payload: {},
  }),

  /**
   * Enumerate all available media sources
   * User needs to have accepted a media request first before being able to enumerate
   * @return {function(): WorkshopReviewAction}
   */
  enumerateAvailableMediaSources: () => (dispatch) => {
    dispatch(
      impActionCreators.updateAvailableMediaSourcesEnumerationStatus({
        status: ProgressiveProcessStatus.IN_PROGRESS,
      }),
    );
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const audioSources = [];
        const videoSources = [];
        devices.forEach((device) => {
          console.debug(`Kind: ${device.kind}, label: ${device.label}, id: ${device.deviceId}`);
          if (device.kind === "audioinput") {
            audioSources.push(device);
          } else if (device.kind === "videoinput") {
            videoSources.push(device);
          }
        });
        dispatch(
          impActionCreators.updateAvailableStreamSources({
            audioSources,
            videoSources,
          }),
        );
      })
      .catch((err) => {
        console.error(`Error while enumerating media sources: ${err}`);
      })
      .finally(() => {
        dispatch(
          impActionCreators.updateAvailableMediaSourcesEnumerationStatus({
            status: ProgressiveProcessStatus.DONE,
          }),
        );
      });
  },

  switchStreamSource:
    ({ audioSourceId, videoSourceId, resolution }) =>
    (dispatch) => {
      dispatch(impActionCreators.killStreamSource({ isSwitchingToNewSource: true }));
      const constraints = {
        audio: {
          deviceId: audioSourceId ? { exact: audioSourceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          sampleSize: 16,
          sampleRate: 22050,
        },
        video: {
          deviceId: videoSourceId ? { exact: videoSourceId } : undefined,
          width: { exact: resolution.width },
          height: { exact: resolution.height },
        },
      };
      console.log("Switching to", constraints);
      dispatch(actionCreator.requestUserMedia(constraints));
    },

  /**
   * Signal the end of the review process
   * @param {string} reviewURL
   * @return {Action}
   */
  stopReview: ({ reviewURL }) => ({
    type: actionType.stopReview,
    payload: {
      reviewURL,
    },
  }),

  startReview: () => ({
    type: actionType.startReview,
    payload: {},
  }),

  submitReview:
    ({ reviewBlob, workshopID, mimeType }) =>
    (dispatch) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        postReview({
          atelierID: workshopID,
          encodedBlob: reader.result,
          mimeType,
        })
          .then((response) => {
            console.debug(response);
            dispatch(
              impActionCreators.updateReviewSubmissionStatus({
                status: ProgressiveProcessStatus.DONE,
              }),
            );
            // // TODO Disable review buttons ?
            // document.location.reload();
          })
          .catch((err) => {
            console.error(err);
            dispatch(
              impActionCreators.updateReviewSubmissionStatus({
                status: ProgressiveProcessStatus.UNDEFINED,
                err: "Error while submitting review",
              }),
            );
          });
      dispatch(impActionCreators.updateReviewSubmissionStatus({ status: ProgressiveProcessStatus.IN_PROGRESS }));
      reader.readAsDataURL(reviewBlob);
    },
};

export { ProgressiveProcessStatus, actionCreator, actionType };
