// React
import React from "react";
import PropTypes from "prop-types";
// MUI
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";

/**
 * Create the backdrop for review submission
 * @param {boolean} isOpen
 * @param {number} [submitProgressCurrent]
 * @param {number} [submitProgressTotal]
 * @return {JSX.Element}
 * @constructor
 */
export default function ReviewSubmitProgressBackdrop({ isOpen, submitProgressCurrent, submitProgressTotal }) {
  const isMeasurable = submitProgressCurrent && submitProgressTotal;
  const isUploadComplete = isMeasurable && submitProgressCurrent === submitProgressTotal;
  const uploadProgress =
    isMeasurable && submitProgressTotal !== 0 ? (
      <LinearProgress
        color="primary"
        variant="determinate"
        value={100 * (submitProgressCurrent / submitProgressTotal)}
      />
    ) : (
      <CircularProgress color="primary" />
    );

  return (
    <Modal open={isOpen} disableEscapeKeyDown disableBackdropClick>
      <div
        style={{
          position: "absolute",
          left: "50%",
          textAlign: "center",
          top: "50%",
        }}
      >
        <Typography variant="h6" color="textPrimary">
          {/* eslint-disable-next-line max-len */}
          {isUploadComplete ? "Upload complete ! You can leave that page" : "Upload in progress... please wait"}
        </Typography>
        {uploadProgress}
      </div>
    </Modal>
  );
}

ReviewSubmitProgressBackdrop.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  submitProgressCurrent: PropTypes.number,
  submitProgressTotal: PropTypes.number,
};

ReviewSubmitProgressBackdrop.defaultProps = {
  submitProgressCurrent: undefined,
  submitProgressTotal: undefined,
};
