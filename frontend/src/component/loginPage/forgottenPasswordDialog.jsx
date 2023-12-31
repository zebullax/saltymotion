// React
import React from "react";
import PropTypes from "prop-types";
// MUI
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";

/**
 * Render the forgotten password dialog
 * @params {boolean} isSendingPasswordReset
 * @params {boolean} isOpen
 * @params {function} onPasswordReset
 * @params {function} onClose
 * @return {JSX.Element}
 * @constructor
 */
const ForgottenPasswordDialog = ({ isSendingPasswordReset, isOpen, onPasswordReset, onClose }) => {
  const theme = useTheme();

  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  return (
    <Dialog open={isOpen} maxWidth="xs" onClose={onClose}>
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent>
        <form
          method="post"
          onSubmit={(evt) => {
            evt.preventDefault();
            onPasswordReset(username, email);
          }}
        >
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField
                label="Enter your username"
                type="text"
                autoComplete="username"
                fullWidth
                required
                value={username}
                onChange={(evt) => setUsername(evt.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Enter your email"
                type="email"
                autoComplete="email"
                fullWidth
                required
                value={email}
                onChange={(evt) => setEmail(evt.target.value)}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} justify="flex-end" style={{ paddingTop: theme.spacing(2) }}>
            <Grid item>
              <Button color="primary" type="submit" variant="contained">
                Send reset email
                {isSendingPasswordReset && <CircularProgress color="secondary" size={24} />}
              </Button>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};

ForgottenPasswordDialog.propTypes = {
  isSendingPasswordReset: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onPasswordReset: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ForgottenPasswordDialog;
