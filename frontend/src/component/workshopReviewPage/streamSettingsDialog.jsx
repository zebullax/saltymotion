// React/Redux
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
// MUI
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
// Saltymotion
import { actionCreator } from "../../state/review/action";
import { videoResolution } from "../../state/review/common";

/**
 * Render the dialog responsible to change the video/audio settings
 * @param {boolean} isOpen
 * @param {MediaDeviceInfo[]} availableVideoSources
 * @param {MediaDeviceInfo[]} availableAudioSources
 * @param {boolean} isLoadingSource
 * @param {MediaStreamTrack} selectedVideoSource
 * @param {MediaStreamTrack} selectedAudioSource
 * @param {MediaStream} stream
 * @param {function} onClose
 * @param {function} dispatch
 * @return {JSX.Element}
 */
function StreamSettingsDialog({
  isOpen,
  availableVideoSources,
  availableAudioSources,
  isLoadingSource,
  selectedVideoSource,
  selectedAudioSource,
  stream,
  onClose,
  dispatch,
}) {
  const previewVidRef = React.useCallback(
    (node) => {
      if (node != null) {
        node.srcObject = stream;
      }
    },
    [stream],
  );

  const theme = useTheme();
  const availableHeight = Object.keys(videoResolution);
  const videoSettings = isLoadingSource ? undefined : selectedVideoSource.getSettings();
  const audioSettings = isLoadingSource ? undefined : selectedAudioSource.getSettings();
  const videoCapabilities = isLoadingSource ? undefined : selectedVideoSource.getCapabilities();

  const renderSourceValue = (deviceId, available) => {
    if (deviceId === "") {
      return <MenuItem value="" />;
    }
    const deviceIdx = available.findIndex((val) => val.deviceId === deviceId);
    return <MenuItem value={deviceId}>{available[deviceIdx].label}</MenuItem>;
  };

  const renderSourceOptions = (available) =>
    available.map((source) => (
      <MenuItem key={source.deviceId} value={source.deviceId}>
        {source.label}
      </MenuItem>
    ));

  const renderResolutionOptions = (availableHeightOptions) => {
    if (isLoadingSource) {
      return null;
    }
    const applicableHeights = availableHeightOptions.filter((val) => val <= videoCapabilities.height.max);
    return applicableHeights.map((height) => (
      <MenuItem key={height} value={height}>
        {`${height}p`}
      </MenuItem>
    ));
  };

  const onSourceChange = ({ audioSourceId, videoSourceId, resolution }) => {
    dispatch(actionCreator.switchStreamSource({ audioSourceId, videoSourceId, resolution }));
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Media source settings</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <video
              ref={previewVidRef}
              style={{
                width: "100%",
                height: "auto",
                // objectFit: 'cover',
                boxShadow: "2px 2px 8px 2px rgb(0, 0, 0)",
              }}
              playsInline
              muted
              autoPlay
              crossOrigin="anonymous"
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1} mb={theme.spacing(1)} alignItems="flex-end">
              <Grid item>
                <VideoCameraFrontIcon fontSize="large" />
              </Grid>
              <Grid item flexGrow={1}>
                <Select
                  disabled={isLoadingSource}
                  fullWidth
                  variant="filled"
                  displayEmpty
                  renderValue={(value) => renderSourceValue(value, availableVideoSources)}
                  value={videoSettings?.deviceId ?? ""}
                  onChange={(e) =>
                    onSourceChange({
                      videoSourceId: e.target.value,
                      audioSource: audioSettings?.deviceId,
                      resolution: videoResolution["480"], // We switch to new video source , we dont know supported res.
                    })
                  }
                >
                  {renderSourceOptions(availableVideoSources, videoSettings)}
                </Select>
              </Grid>
              <Grid item>
                <Select
                  disabled={isLoadingSource}
                  fullWidth
                  variant="filled"
                  displayEmpty
                  renderValue={(value) => <MenuItem value={value}>{value}</MenuItem>}
                  value={videoSettings?.height ?? ""}
                  onChange={(e) =>
                    onSourceChange({
                      videoSourceId: videoSettings?.deviceId,
                      audioSource: audioSettings?.deviceId,
                      resolution: videoResolution[e.target.value],
                    })
                  }
                >
                  {renderResolutionOptions(availableHeight)}
                </Select>
              </Grid>
            </Grid>
            <Grid container spacing={1} alignItems="flex-end">
              <Grid item>
                <AudiotrackIcon fontSize="large" />
              </Grid>
              <Grid item flexGrow={1}>
                <Select
                  disabled={isLoadingSource}
                  variant="filled"
                  displayEmpty
                  style={{ width: "100%" }}
                  renderValue={(value) => renderSourceValue(value, availableAudioSources)}
                  value={audioSettings?.deviceId ?? ""}
                  onChange={(e) =>
                    onSourceChange({
                      videoSourceId: videoSettings?.deviceId,
                      audioSource: e.target.value,
                      resolution: videoResolution[videoSettings?.width],
                    })
                  }
                >
                  {renderSourceOptions(availableAudioSources, audioSettings)}
                </Select>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()} disabled={isLoadingSource}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const mapStateToProps = (state) => ({
  availableVideoSources: state.review.videoSources,
  availableAudioSources: state.review.audioSources,
  isLoadingSource: state.review.isLoadingSource,
  selectedVideoSource: state.review.selectedVideoSource,
  selectedAudioSource: state.review.selectedAudioSource,
  stream: state.review.stream,
});

StreamSettingsDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  availableVideoSources: PropTypes.arrayOf(PropTypes.instanceOf(MediaDeviceInfo)).isRequired,
  availableAudioSources: PropTypes.arrayOf(PropTypes.instanceOf(MediaDeviceInfo)).isRequired,
  isLoadingSource: PropTypes.bool.isRequired,
  selectedVideoSource: PropTypes.instanceOf(MediaStreamTrack),
  selectedAudioSource: PropTypes.instanceOf(MediaStreamTrack),
  stream: PropTypes.any,
};

export default connect(mapStateToProps)(StreamSettingsDialog);
