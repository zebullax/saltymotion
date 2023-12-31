// React
import React from "react";
import PropTypes from "prop-types";
// MUI
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

const LoadingScreen = ({ isOpen, loadingText }) => {
  const theme = useTheme();
  return (
    <Backdrop open={isOpen}>
      <Typography variant="h6" color="textPrimary" style={{ marginRight: theme.spacing(1) }}>
        {loadingText}
      </Typography>
      <CircularProgress color="primary" />
    </Backdrop>
  );
};

LoadingScreen.propTypes = {
  isOpen: PropTypes.bool,
  loadingText: PropTypes.string,
};

LoadingScreen.defaultProps = {
  isOpen: false,
  loadingText: "",
};

export default LoadingScreen;
