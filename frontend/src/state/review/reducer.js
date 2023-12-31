// Saltymotion
import { actionType, ProgressiveProcessStatus } from "./action";
import { buildInitialState } from "./common";

/**
 * Reducer for review workshop page
 * @param {ReviewWorkshopState} currentState
 * @param {WorkshopReviewAction} action
 * @return {(ReviewWorkshopState|null)}
 */
export default function reducer(currentState, action) {
  if (currentState === undefined) {
    return null;
  }

  switch (action.type) {
    case actionType.updateBrowserSupportedStatus: {
      return {
        ...currentState,
        isBrowserSupported: action.payload.isSupported,
      };
    }
    case actionType.updateAvailableMediaSourcesEnumerationStatus: {
      return {
        ...currentState,
        streamSourcesEnumerationStatus: action.payload.status,
      };
    }
    case actionType.updateStreamSourceLoadingStatus: {
      if (action.payload.err) {
        return {
          ...currentState,
          errorMessage: "Unknown error while submitting the review... try reloading the page :(",
          reviewSubmissionStatus: ProgressiveProcessStatus.UNDEFINED,
        };
      }
      if (action.payload.status === ProgressiveProcessStatus.DONE) {
        return {
          ...currentState,
          statusMessage: "Review submitted successfully, the page will automatically reload in 5 seconds",
          reviewSubmissionStatus: ProgressiveProcessStatus.DONE,
        };
      }
      return {
        ...currentState,
        reviewSubmissionStatus: action.payload.status,
      };
    }
    case actionType.updateReviewSubmissionStatus: {
      return {
        ...currentState,
        isLoadingSource: action.payload.isLoading,
      };
    }
    case actionType.updateStreamSource: {
      const { audioSource, videoSource, stream } = action.payload;
      if (stream != null) {
        stream.oninactive = () => {
          if (currentState.isRecording) {
            console.error("Stream went inactive while recording...");
          }
        };
      }
      return {
        ...currentState,
        isMediaAccepted: true,
        isBrowserSupported: true,
        isLoadingSource: false,
        selectedAudioSource: audioSource ?? currentState.selectedAudioSource,
        selectedVideoSource: videoSource ?? currentState.selectedVideoSource,
        stream: stream ?? currentState.stream,
      };
    }
    case actionType.killStreamSource: {
      currentState.stream.getTracks().forEach((track) => {
        console.log("Killing track", track);
        track.stop();
      });
      return {
        ...currentState,
        selectedAudioSource: null,
        selectedVideoSource: null,
        isLoadingSource: action.payload?.isSwitchingToNewSource === true,
        stream: null,
      };
    }
    case actionType.cleanup: {
      if (currentState.stream != null) {
        currentState.stream.getTracks().forEach((track) => {
          console.log("Killing track", track);
          track.stop();
        });
      }
      return buildInitialState();
    }
    case actionType.updateAvailableStreamSources: {
      return {
        ...currentState,
        audioSources: action.payload.audioSources,
        videoSources: action.payload.videoSources,
      };
    }
    case actionType.stopReview: {
      return {
        ...currentState,
        isRecording: false,
        isComplete: true,
        statusMessage: "Recording stopped",
        reviewURL: action.payload.reviewURL,
      };
    }
    case actionType.startReview: {
      return {
        ...currentState,
        isRecording: true,
        isComplete: false,
        statusMessage: "Recording started",
      };
    }

    default:
      return currentState;
  }
}
