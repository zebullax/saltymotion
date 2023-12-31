/**
 * @typedef {object} WorkshopReviewAction
 * @property {WorkshopReviewActionType} type
 * @property {object} payload
 */

/**
 * @typedef {object} WorkshopReviewActionType
 * @property {string} updateAvailableMediaSourcesEnumerationStatus
 * @property {string} enumerateAvailableMediaSources
 * @property {string} updateStreamSource
 * @property {string} killStreamSource
 * @property {string} updateVideoResolution
 * @property {string} updateBrowserSupportedStatus
 * @property {string} stopReview
 * @property {string} cleanup
 */

/**
 * @enum {string} ProgressiveProcessStatus
 * @readonly
 * @property {string} UNDEFINED
 * @property {string} IN_PROGRESS
 * @property {string} DONE
 */
const ProgressiveProcessStatus = {
  UNDEFINED: "UNDEFINED",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
};
export { ProgressiveProcessStatus };

/**
 * @typedef {object} ReviewWorkshopState
 * @property {ProgressiveProcessStatus} streamSourcesEnumerationStatus
 * @property {ProgressiveProcessStatus} reviewSubmissionStatus
 * @property {MediaStream} stream
 * @property {MediaDeviceInfo[]} videoSources
 * @property {MediaDeviceInfo[]} audioSources
 * @property {MediaStreamTrack} selectedAudioSource
 * @property {MediaStreamTrack} selectedVideoSource
 * @property {boolean} isBrowserSupported
 * @property {boolean} isMediaAccepted
 * @property {boolean} isLoadingSource
 * @property {boolean} isRecording
 * @property {boolean} isComplete
 * @property {string} errorMessage
 * @property {string} statusMessage
 * @property {string} reviewURL
 */

const videoResolution = {
  480: {
    width: 640,
    height: 480,
    default: {
      width: 120,
      height: 90,
    },
  },
  720: {
    width: 1280,
    height: 720,
    default: {
      width: 160,
      height: 90,
    },
  },
  1080: {
    width: 1920,
    height: 1080,
    default: {
      width: 160,
      height: 90,
    },
  },
};
export { videoResolution };

const fps = [30, 60];
export { fps };

const initialConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleSize: 16,
    sampleRate: 22050,
  },
  video: {
    frameRate: 30,
  },
};
export { initialConstraints };

/**
 * Build initial state for review slice
 * @param {ReviewWorkshopState} [override]
 * @return {ReviewWorkshopState}
 */
export function buildInitialState(override = {}) {
  return {
    streamSourcesEnumerationStatus: ProgressiveProcessStatus.UNDEFINED,
    reviewSubmissionStatus: ProgressiveProcessStatus.UNDEFINED,
    videoSources: [],
    audioSources: [],
    selectedVideoSource: null,
    selectedAudioSource: null,
    stream: null,
    isMediaAccepted: false,
    isLoadingSource: false,
    isRecording: false,
    isComplete: false,
    isBrowserSupported: true,
    errorMessage: "",
    statusMessage: "",
    reviewURL: "",
    ...override,
  };
}

/**
 * Detect supported mime type
 * @return {{mimeType: string}|undefined}
 */
export function getMimeType() {
  if (MediaRecorder.isTypeSupported("video/mp4;codecs=h264")) {
    return { mimeType: "video/mp4;codecs=h264" };
  }
  if (MediaRecorder.isTypeSupported("video/webm;codecs=h264")) {
    return { mimeType: "video/webm;codecs=h264" };
  }
  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
    return { mimeType: "video/webm;codecs=vp8,opus" };
  }
  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
    return { mimeType: "video/webm;codecs=vp9" };
  }
  return undefined;
}
