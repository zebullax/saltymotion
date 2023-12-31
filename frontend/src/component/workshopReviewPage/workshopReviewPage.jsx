/* eslint-disable no-console */
// React/Redux
import React from "react";
import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom";
import { connect } from "react-redux";
// MUI
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import VideoSettingsIcon from "@mui/icons-material//VideoSettings";
import PlayCircleFilledWhiteIcon from "@mui/icons-material//PlayCircleFilledWhite";
import StopCircleIcon from "@mui/icons-material//StopCircle";
import Divider from "@mui/material/Divider";
// Misc
import { Helmet } from "react-helmet";
import { Rnd } from "react-rnd";
// Saltymotion
import ReviewSubmitProgressBackdrop from "./reviewSubmitProgressBackdrop";
import { getMimeType, initialConstraints } from "../../state/review/common";
import { actionCreator, ProgressiveProcessStatus } from "../../state/review/action";
import StreamSettingsDialog from "./streamSettingsDialog";
import AboutUploaderTab from "../workshopViewPage/aboutUploaderTab";
import { atelierPropTypes } from "../../../typedef/propTypes";
import PreviewCompositionVideoDialog from "./previewCompositionVideoDialog";
import Tag from "../widget/tag";
import { RecommendedWorkshop } from "../widget/atelierCard";
import { makeS3Link, s3LinkCategory } from "../../lib/utility";
import { getRecommendedAtelier } from "../../lib/api/saltymotionApi";
import { RECOMMENDATION_LOAD_CHUNK_SIZE } from "../../lib/property";
import { setErrorMessage, setStatusMessage } from "../../state/app/action";

/**
 * Container element for the view atelier page
 * @param {function} dispatch
 * @param {NormalizedAtelierDescription} atelier
 * @param {MediaStreamTrack} [selectedVideoSource]
 * @param {MediaStreamTrack} [selectedAudioSource]
 * @param {MediaStream} [stream]
 * @param {string} reviewURL
 * @param {boolean} isMediaAccepted
 * @param {boolean} isRecording
 * @param {boolean} isBrowserSupported
 * @param {boolean} isReviewComplete
 * @param {boolean} isReviewSubmissionComplete
 * @param {string} errorMessage
 * @param {string} statusMessage
 * @return {JSX.Element}
 * @constructor
 */
function WorkshopReviewPage({
  dispatch,
  atelier,
  selectedVideoSource,
  selectedAudioSource,
  stream,
  reviewURL,
  isMediaAccepted,
  isRecording,
  isBrowserSupported,
  isReviewComplete,
  isReviewSubmissionComplete,
  errorMessage,
  statusMessage,
}) {
  const theme = useTheme();
  const isOverMD = useMediaQuery(theme.breakpoints.up("md"));
  const { ID: gameID } = atelier.game;
  const [isSettingsEnabled, setIsSettingsEnabled] = React.useState(selectedVideoSource && selectedAudioSource);

  const [recommendedAteliers, setRecommendedAteliers] = React.useState([]);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = React.useState(false);
  const [isWebcamMetadataLoaded, setIsWebcamMetadataLoaded] = React.useState(false);
  const [isWorkshopMetadataLoaded, setIsWorkshopMetadataLoaded] = React.useState(false);

  /**
   * Hold media recorder used on compo canvas
   * @type {React.MutableRefObject<MediaRecorder>}
   */
  const compoCanvasRecorder = React.useRef();

  /**
   * @type {React.MutableRefObject<string>}
   */
  const blobMimeType = React.useRef();

  /**
   *
   * @type {React.MutableRefObject<CanvasRenderingContext2D>}
   */
  const compoCanvasContext = React.useRef();
  const matchNativeWidth = React.useRef(0);
  const matchNativeHeight = React.useRef(0);

  /**
   * Whether the next compo canvas update loop should clear the drawing overlay
   * @type {React.MutableRefObject<boolean>}
   */
  const clearOnNextCompoLoop = React.useRef(false);

  /**
   * hold the media blob created from chunks of media recorder
   * @type {React.MutableRefObject<Blob>}
   */
  const compoVideoBlob = React.useRef(undefined);

  /**
   * Canvas onto which we will leave drawn strokes
   * @type {React.MutableRefObject<HTMLVideoElement>}
   */
  const webcamRef = React.useRef();

  /**
   * Canvas onto which we do the compo (webcam picture, match video picture)
   * @type {React.MutableRefObject<HTMLCanvasElement>}
   */
  const compoCanvasRef = React.useRef();

  /**
   * Stream extracted from the composition canvas
   * @type {React.MutableRefObject<MediaStream>}
   */
  const compoCanvasStream = React.useRef();

  /**
   * Canvas onto which we will leave drawn strokes
   * @type {React.MutableRefObject<HTMLCanvasElement>}
   */
  const drawingCanvasRef = React.useRef();

  /**
   * Uploaded match video
   * @type {React.MutableRefObject<HTMLVideoElement>}
   */
  const matchVideoRef = React.useRef();

  /**
   * Timer holding callback for call to drawAnimationFrame
   * @type {React.MutableRefObject<undefined|number>}
   */
  const compoUpdateTimer = React.useRef(undefined);

  /**
   * Draggable webcam
   * @type {React.MutableRefObject<HTMLVideoElement>}
   */
  const dragCamRef = React.useRef();

  /**
   * Set webcam video source on stream update
   */
  React.useEffect(() => {
    if (webcamRef.current != null && stream != null) {
      webcamRef.current.srcObject = stream;
    }
  }, [webcamRef, stream]);

  /**
   * Once workshop metadata is loaded we'll persist the native dimensions and resize compo canvas
   */
  React.useEffect(() => {
    if (!isWorkshopMetadataLoaded || compoCanvasRef == null || matchVideoRef == null) {
      return;
    }
    matchNativeHeight.current = matchVideoRef.current.videoHeight;
    matchNativeWidth.current = matchVideoRef.current.videoWidth;
    compoCanvasRef.current.width = matchVideoRef.current.videoWidth;
    compoCanvasRef.current.height = matchVideoRef.current.videoHeight;
  }, [isWorkshopMetadataLoaded, compoCanvasRef, matchVideoRef]);

  // On mount, request initial user media
  // On unmount, clean up
  React.useEffect(() => {
    dispatch(actionCreator.requestUserMedia(initialConstraints));
    return () => dispatch(actionCreator.cleanup());
  }, [dispatch]);

  // Once user has accepted original media request: enumerate all available media source & enable settings dialog
  React.useEffect(() => {
    if (isMediaAccepted) {
      dispatch(actionCreator.enumerateAvailableMediaSources());
    }
    setIsSettingsEnabled(isMediaAccepted);
  }, [dispatch, isMediaAccepted]);

  // Load recommended ateliers on game change
  // NOTE Could we lift it up in loaders?
  React.useEffect(() => {
    const [recommendationPromise, recommendationXHR] = getRecommendedAtelier({
      gameID,
      isShortFormat: false,
      offset: 0,
      limit: RECOMMENDATION_LOAD_CHUNK_SIZE,
    });
    recommendationPromise
      .then(({ value }) => {
        setRecommendedAteliers((currentRecommendations) => [...value, ...currentRecommendations]);
      })
      .catch((error) => {
        console.error(`Error while loading chunk of recommended atelier: ${error}`);
        dispatch(setErrorMessage("Error while loading chunk of recommended atelier"));
      });
    return () => recommendationXHR.abort();
  }, [dispatch, gameID]);

  // Update global error or status message when review state find error or status update
  React.useEffect(() => {
    if (errorMessage !== "") {
      dispatch(setErrorMessage(errorMessage));
    }
    if (statusMessage !== "") {
      dispatch(setStatusMessage(statusMessage));
    }
  }, [dispatch, errorMessage, statusMessage]);

  /**
   * Stop compo canvas poll / update loop
   */
  const stopUpdateCompoCanvas = () => {
    window.cancelAnimationFrame(compoUpdateTimer.current);
  };

  /**
   * Handle the start of polling process for updating composition canvas
   * @param {HTMLVideoElement} webcamVideo
   * @param {HTMLVideoElement} matchVideo
   */
  const startUpdateCompoCanvas = ({ webcamVideo, matchVideo }) => {
    /**
     * Main update loop for composition canvas
     * Copy the frame from the workshop video
     * Copy the webcam thumbnail
     * Copy the drawing strokes
     */
    const copyOverToCompoCanvas = () => {
      const matchVideoNativeWidth = matchNativeWidth.current;
      const matchVideoNativeHeight = matchNativeHeight.current;
      // console.log(webcamVideo, matchVideo, matchVideoNativeWidth, matchNativeHeight);

      /**
       * Calculate the top left corner and dimension for the webcam overlay
       * @return {{top: number, left: number, width: number, height: number}}
       */
      const getWebcamOverlayPosition = () => {
        const matchVideoBoundingBox = matchVideo.getBoundingClientRect();
        const matchVideoOriginalToScreenXRatio = matchVideoNativeWidth / matchVideoBoundingBox.width;
        const matchVideoOriginalToScreenYRatio = matchVideoNativeHeight / matchVideoBoundingBox.height;

        const webcamVideoBoundingBox = webcamVideo.getBoundingClientRect();
        return {
          left: (webcamVideoBoundingBox.x - matchVideoBoundingBox.x) * matchVideoOriginalToScreenXRatio,
          top: (webcamVideoBoundingBox.y - matchVideoBoundingBox.y) * matchVideoOriginalToScreenYRatio,
          width: (webcamVideoBoundingBox.width / matchVideoBoundingBox.width) * matchVideoNativeWidth,
          height: (webcamVideoBoundingBox.height / matchVideoBoundingBox.height) * matchVideoNativeHeight,
        };
      };

      const { top, left, width, height } = getWebcamOverlayPosition();
      // console.debug(`Webcam rectified overlay : ${top}/${left}:${width}*${height}`);

      if (isDrawing) {
        if (clearOnNextCompoLoop.current) {
          compoCanvasContext.current.drawImage(matchVideo, 0, 0, matchVideoNativeWidth, matchVideoNativeHeight);
          clearOnNextCompoLoop.current = false;
        }
        compoCanvasContext.current.drawImage(
          drawingCanvasRef.current,
          0,
          0,
          matchVideoNativeWidth,
          matchVideoNativeHeight,
        );
      } else {
        compoCanvasContext.current.drawImage(matchVideo, 0, 0, matchVideoNativeWidth, matchVideoNativeHeight);
      }
      compoCanvasContext.current.drawImage(webcamVideo, left, top, width, height);
      compoUpdateTimer.current = window.requestAnimationFrame(copyOverToCompoCanvas);
    };
    compoUpdateTimer.current = window.requestAnimationFrame(copyOverToCompoCanvas);
  };

  /**
   * Create objects for composition canvas and start recording streams
   */
  const onStartReview = () => {
    if (isRecording) {
      return;
    }
    const k_BASE_VIDEO_BPS = 2500000;
    compoCanvasContext.current = compoCanvasRef.current.getContext("2d", { desynchronized: true });
    // Stream from the composition canvas
    compoCanvasStream.current = compoCanvasRef.current.captureStream(initialConstraints.video.frameRate);

    // Stream from the composition canvas
    compoCanvasStream.current.oninactive = () => {
      dispatch(setErrorMessage("The stream became inactive... Try reloading the page"));
    };
    startUpdateCompoCanvas({ webcamVideo: webcamRef.current, matchVideo: matchVideoRef.current });
    const { mimeType } = getMimeType();
    console.debug(mimeType);
    blobMimeType.current = mimeType;
    const audioTrack = stream.getAudioTracks()[0];
    compoCanvasStream.current.addTrack(audioTrack);

    // ////////////////////////////////////////////////////
    // Create the media recorder off the composition canvas
    // ////////////////////////////////////////////////////
    const recorderChunks = []; // Kept in mediaRecorder's listeners closure
    compoCanvasRecorder.current = new MediaRecorder(compoCanvasStream.current, {
      mimeType,
      videoBitsPerSecond: 2 * k_BASE_VIDEO_BPS,
    });
    // ////////////////////////////
    // Set up media recorder events
    // ////////////////////////////
    compoCanvasRecorder.current.onstart = () => console.debug("Recorder: onStart");
    compoCanvasRecorder.current.onresume = () => console.debug("Recorder: onResume");
    compoCanvasRecorder.current.ondataavailable = (event) => {
      console.log("size", event.data.size);
      if (event.data.size > 0) {
        recorderChunks.push(event.data);
      }
    };
    compoCanvasRecorder.current.onerror = (e) => {
      dispatch(setErrorMessage(`Error from the recorder: ${e}`));
    };
    compoCanvasRecorder.current.onstop = () => {
      // That runs after the last dataAvailable event
      console.debug("Recorder: onStop");
      compoVideoBlob.current = new Blob(recorderChunks, { type: mimeType });
      dispatch(actionCreator.stopReview({ reviewURL: window.URL.createObjectURL(compoVideoBlob.current) }));
    };

    console.log("Starting compoCanvasRecorder");
    compoCanvasRecorder.current.start();
    dispatch(actionCreator.startReview());
  };

  const tags = (items) => items.map((tag) => <Tag key={tag.ID} size="small" name={tag.name} id={tag.ID} />);
  const header = () => {
    // eslint-disable-next-line max-len
    const content =
      atelier.title ??
      "Review the video submitted to you, analyze the plays and help your partner. Once submitted, collect your bounty";
    const title = `Saltymotion - ${atelier.title ?? "Review atelier"}`;
    return (
      <Helmet>
        <meta name="description" content={content} />
        <meta name="og:description" content={content} />
        <meta name="twitter:description" content={content} />
        <meta name="title" content={title} />
        <meta name="og:title" content={title} />
        <meta name="twitter:title" content={title} />
      </Helmet>
    );
  };

  const recommendedVideos = (ateliers) =>
    ateliers.map((atelier) => (
      <Box style={{ paddingBottom: theme.spacing(2) }} key={atelier.ID}>
        <RecommendedWorkshop atelier={atelier} />
      </Box>
    ));

  const onStopReview = () => {
    if (!isRecording) {
      return;
    }
    stopUpdateCompoCanvas();
    compoCanvasRecorder.current.stop();
    matchVideoRef.current.pause();
  };

  return (
    <Grid container spacing={1}>
      {header()}
      {isSettingsEnabled && isSettingsDialogOpen && (
        <StreamSettingsDialog isOpen onClose={() => setIsSettingsDialogOpen(false)} />
      )}
      {isReviewComplete && !isReviewSubmissionComplete && (
        <PreviewCompositionVideoDialog
          atelierTitle={atelier.title}
          isOpen
          onCancel={() => document.location.reload()}
          onSubmit={() =>
            dispatch(
              actionCreator.submitReview({
                reviewBlob: compoVideoBlob.current,
                workshopID: atelier.ID,
                mimeType: blobMimeType.current,
              }),
            )
          }
          reviewVideoURL={reviewURL}
        />
      )}
      {isReviewSubmissionComplete && <ReviewSubmitProgressBackdrop isOpen />}
      <Grid
        item
        xs={12}
        md={9}
        container
        spacing={1}
        alignContent="flex-start"
        style={
          isOverMD
            ? {
                paddingRight: theme.spacing(4),
                flexGrow: 1,
                maxWidth: "calc(100% - 250px)",
              }
            : {}
        }
      >
        <Grid item xs={12}>
          <video
            controls
            ref={matchVideoRef}
            autoPlay={false}
            playsInline
            style={{ width: "100%" }}
            crossOrigin="anonymous"
            src={makeS3Link(s3LinkCategory.matchVideo, atelier.s3Key)}
            onLoadedMetadata={() => setIsWorkshopMetadataLoaded(true)}
          />
          <Rnd
            bounds="parent"
            ref={dragCamRef}
            enableResizing={{ bottomRight: true, bottomLeft: true }}
            disableDragging={isRecording}
            lockAspectRatio
            default={{
              x: parseInt(theme.spacing(1), 10),
              y: parseInt(theme.spacing(1), 10),
              width: 160,
              height: 90,
            }}
          >
            <div style={{ width: "inherit", height: "inherit" }}>
              <video
                ref={webcamRef}
                style={{
                  width: "100%",
                  height: "inherit",
                  objectFit: "cover",
                  boxShadow: "2px 2px 8px 2px rgb(0, 0, 0)",
                }}
                playsInline
                muted
                autoPlay
                crossOrigin="anonymous"
                onLoadedMetadata={() => setIsWebcamMetadataLoaded(true)}
              />
            </div>
          </Rnd>
          <canvas
            ref={compoCanvasRef}
            style={{
              display: "none",
              position: "absolute",
              left: 0,
              top: 0,
            }}
          />
        </Grid>
        <Grid item xs={12} container spacing={1}>
          <Grid item>
            <Button
              disabled={isRecording || !isBrowserSupported}
              startIcon={<VideoSettingsIcon />}
              variant="contained"
              onClick={() => setIsSettingsDialogOpen(true)}
            >
              Settings
            </Button>
          </Grid>
          <Grid item>
            <Button
              disabled={
                isReviewSubmissionComplete ||
                (!isReviewComplete && (isRecording || !isWorkshopMetadataLoaded || !isWebcamMetadataLoaded))
              }
              startIcon={<PlayCircleFilledWhiteIcon />}
              variant="contained"
              color="error"
              onClick={onStartReview}
            >
              Start recording
            </Button>
          </Grid>
          <Grid item>
            <Button
              disabled={isReviewSubmissionComplete || (!isRecording && !isReviewComplete)}
              variant="contained"
              onClick={onStopReview}
              startIcon={<StopCircleIcon />}
            >
              Stop
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12} container spacing={1}>
          <Grid item xs={12} container>
            <Grid item xs={12}>
              <Typography variant="h6" component="h1">
                {atelier.title}
              </Typography>
            </Grid>
            {atelier.description.length !== 0 && (
              <Grid item xs={12} sx={{ marginBottom: theme.spacing(3) }}>
                <Typography variant="caption">{atelier.description}</Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Link component={RouterLink} to={`/game/${atelier.game.ID}`}>
                {atelier.game.name}
              </Link>
            </Grid>
            <Grid item xs={12} container spacing={1}>
              <Grid item style={{ alignSelf: "flex-end" }}>
                <Typography variant="caption">{atelier.stats.nbViews} views</Typography>
              </Grid>
              <Grid item style={{ alignSelf: "flex-end" }}>
                <Typography variant="caption">•</Typography>
              </Grid>
              <Grid item style={{ alignSelf: "flex-end" }}>
                <Typography variant="caption">{new Date(atelier.creationTimestamp).toDateString()}</Typography>
              </Grid>
              <Grid item className="tag_list" style={{ alignSelf: "flex-end" }}>
                {tags(atelier.tags)}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <AboutUploaderTab uploaderID={atelier.uploader.ID} />
        </Grid>
      </Grid>
      <Grid item xs={12} md={3}>
        {recommendedVideos(recommendedAteliers)}
      </Grid>
    </Grid>
  );
}

WorkshopReviewPage.propTypes = {
  atelier: atelierPropTypes.isRequired,
  selectedVideoSource: PropTypes.instanceOf(MediaStreamTrack),
  selectedAudioSource: PropTypes.instanceOf(MediaStreamTrack),
  stream: PropTypes.instanceOf(MediaStream),
  isMediaAccepted: PropTypes.bool.isRequired,
  isRecording: PropTypes.bool.isRequired,
  isBrowserSupported: PropTypes.bool.isRequired,
  reviewURL: PropTypes.string.isRequired,
  isReviewComplete: PropTypes.bool.isRequired,
  isReviewSubmissionComplete: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  statusMessage: PropTypes.string,
};

const mapStateToProps = (state) => ({
  selectedVideoSource: state.review.selectedVideoSource,
  selectedAudioSource: state.review.selectedAudioSource,
  stream: state.review.stream,
  reviewURL: state.review.reviewURL,
  isMediaAccepted: state.review.isMediaAccepted,
  isRecording: state.review.isRecording,
  isBrowserSupported: state.review.isBrowserSupported,
  isReviewComplete: state.review.isComplete,
  isReviewSubmissionComplete: state.review.reviewSubmissionStatus === ProgressiveProcessStatus.DONE,
  errorMessage: state.review.errorMessage,
  statusMessage: state.review.statusMessage,
});

export default connect(mapStateToProps)(WorkshopReviewPage);
