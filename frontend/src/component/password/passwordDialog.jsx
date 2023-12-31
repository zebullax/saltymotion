// React
import React from "react";
import PropTypes from "prop-types";
// MUI
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import SaveIcon from "@mui/icons-material//Save";
import { useTheme } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
// Saltymotion
import { MINIMUM_PASSWORD_LENGTH } from "../../lib/property";

/**
 * Render the password change dialog
 * {boolean} isSaving
 * {boolean} isOauth
 * {boolean} isOpen
 * {function} onClose
 * {function} onSubmit
 * @return {JSX.Element}
 * @constructor
 */
export default function PasswordDialog({ isSaving, isOauth, isOpen, onClose, onSubmit }) {
  const theme = useTheme();

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = React.useState("");

  const isSubmitDisabled = () =>
    (!isOauth && currentPassword.length < MINIMUM_PASSWORD_LENGTH) ||
    newPassword.length < MINIMUM_PASSWORD_LENGTH ||
    newPassword !== newPasswordConfirm;

  const resetFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        onClose();
        resetFields();
      }}
      maxWidth="xs"
    >
      <DialogTitle>Update password</DialogTitle>
      <DialogContent>
        <form onSubmit={(event) => event.preventDefault()}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Current password"
                type="password"
                disabled={isOauth}
                helperText={isOauth && "Signed up through OAuth"}
                fullWidth
                autoComplete="current-password"
                required={!isOauth}
                error={!isOauth && currentPassword.length < MINIMUM_PASSWORD_LENGTH}
                value={currentPassword}
                onChange={(evt) => setCurrentPassword(evt.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="New password"
                type="password"
                autoComplete="new-password"
                fullWidth
                required
                helperText={newPassword.length < MINIMUM_PASSWORD_LENGTH && "8 characters minimum"}
                error={newPassword.length < MINIMUM_PASSWORD_LENGTH}
                value={newPassword}
                onChange={(evt) => setNewPassword(evt.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Confirm new password"
                autoComplete="new-password"
                type="password"
                fullWidth
                required
                helperText={
                  newPasswordConfirm < MINIMUM_PASSWORD_LENGTH
                    ? "8 characters minimum"
                    : newPassword !== newPasswordConfirm
                    ? "Passwords don't match"
                    : ""
                }
                error={newPasswordConfirm < MINIMUM_PASSWORD_LENGTH && newPassword !== newPasswordConfirm}
                value={newPasswordConfirm}
                onChange={(evt) => setNewPasswordConfirm(evt.target.value)}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} justify="flex-end" style={{ paddingTop: theme.spacing(4) }}>
            <Grid item>
              <Button
                color="secondary"
                startIcon={<SaveIcon />}
                variant="contained"
                type="submit"
                disabled={isSubmitDisabled()}
                onClick={() => onSubmit(currentPassword, newPassword)}
              >
                Save
                {isSaving && <CircularProgress size={24} />}
              </Button>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
}

PasswordDialog.propTypes = {
  isSaving: PropTypes.bool.isRequired,
  isOauth: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

/**
 * Render a password reset dialog
 * {boolean} isSaving
 * {boolean} isOpen
 * {function} onClose
 * {function} onSubmit
 * @return {JSX.Element}
 * @constructor
 */
export function ResetPasswordDialog({ isSaving, isOpen, onClose, onSubmit }) {
  const theme = useTheme();

  const [newPassword, setNewPassword] = React.useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = React.useState("");

  const isSubmitDisabled = () => newPassword.length < MINIMUM_PASSWORD_LENGTH || newPassword !== newPasswordConfirm;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" data-testid="ResetPasswordDialogTestID">
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent>
        <form onSubmit={(event) => event.preventDefault()}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="New password"
                type="password"
                autoComplete="new-password"
                fullWidth
                required
                helperText={newPassword.length < MINIMUM_PASSWORD_LENGTH && "8 characters minimum"}
                error={newPassword.length < MINIMUM_PASSWORD_LENGTH}
                value={newPassword}
                onChange={(evt) => setNewPassword(evt.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Confirm new password"
                autoComplete="new-password"
                type="password"
                fullWidth
                required
                helperText={
                  newPasswordConfirm < MINIMUM_PASSWORD_LENGTH
                    ? "8 characters minimum"
                    : newPassword !== newPasswordConfirm
                    ? "Passwords don't match"
                    : ""
                }
                error={newPasswordConfirm < MINIMUM_PASSWORD_LENGTH && newPassword !== newPasswordConfirm}
                value={newPasswordConfirm}
                onChange={(evt) => setNewPasswordConfirm(evt.target.value)}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} justify="flex-end" style={{ paddingTop: theme.spacing(2) }}>
            <Grid item>
              <Button
                color="primary"
                variant="contained"
                type="submit"
                disabled={isSubmitDisabled()}
                onClick={() => onSubmit(newPassword)}
              >
                update password
                {isSaving && <CircularProgress color="secondary" size={24} />}
              </Button>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
}

ResetPasswordDialog.propTypes = {
  isSaving: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
