// React
import React from "react";
import PropTypes from "prop-types";
// MUI
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import RotateLeftIcon from "@mui/icons-material//RotateLeft";
import PublishIcon from "@mui/icons-material//Publish";

const PreviewCompositionVideoDialog = (props) => (
  <Dialog open={props.isOpen} maxWidth="sm" fullWidth onBackdropClick={() => {}} disableEscapeKeyDown>
    <DialogTitle>Preview</DialogTitle>
    <DialogContent sx={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
      <video controls autoPlay src={props.reviewVideoURL} style={{ width: "90%", paddingTop: "20px" }} />
    </DialogContent>
    <DialogActions>
      <Button onClick={props.onCancel} color="secondary" startIcon={<RotateLeftIcon />}>
        Start Over
      </Button>
      <Button onClick={props.onSubmit} color="primary" startIcon={<PublishIcon />}>
        Submit
      </Button>
    </DialogActions>
  </Dialog>
);

PreviewCompositionVideoDialog.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  reviewVideoURL: PropTypes.string.isRequired,
  atelierTitle: PropTypes.string.isRequired,
};

export default PreviewCompositionVideoDialog;
