// React
import React from "react";
import PropTypes from "prop-types";
// MUI
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

export default function ReviewConfirmationDialog(props) {
  return (
    <Dialog open={props.isOpen} onClose={props.onClose}>
      <DialogTitle>
        Review &apos;
        {props.atelierTitle}
        &apos; ?
      </DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <Typography variant="subtitle1" component="div">
            This atelier is waiting on your review, would you like to review it now ?
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onPostponeReview} color="secondary">
          Postpone
        </Button>
        <Button onClick={props.onAcceptReview} color="primary">
          Review now
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ReviewConfirmationDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  atelierTitle: PropTypes.string.isRequired,
  onPostponeReview: PropTypes.func.isRequired,
  onAcceptReview: PropTypes.func.isRequired,
};
