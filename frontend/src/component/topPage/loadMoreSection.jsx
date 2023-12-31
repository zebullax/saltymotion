// React
import PropTypes from "prop-types";
import React from "react";
// MUI
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
// Saltymotion
import { noop } from "../../lib/utility";

/**
 * Render a load more section as footer of a category on main page
 * @param {function} onClick
 * @return {JSX.Element}
 */
export default function LoadMoreSection({ onClick }) {
  const theme = useTheme();

  return (
    <Grid container mb={theme.spacing(2)}>
      <Grid item flexGrow={1} margin="auto">
        <Divider />
      </Grid>
      <Grid
        item
        sx={{
          cursor: "pointer",
          pl: theme.spacing(2),
          pr: theme.spacing(2),
          "&:hover": {
            backgroundColor: `${alpha(theme.palette.primary.main, 0.15)}`,
            borderRadius: "8px",
          },
        }}
        onClick={onClick}
      >
        <Typography variant="caption" pr={theme.spacing(1)}>
          {" "}
          See More{" "}
        </Typography>
        <Typography variant="caption" fontWeight="bold">
          {" "}
          {"\u25b6"}{" "}
        </Typography>
      </Grid>
      <Grid item flexGrow={1} margin="auto">
        <Divider />
      </Grid>
    </Grid>
  );
}

LoadMoreSection.propTypes = {
  onClick: PropTypes.func,
};

LoadMoreSection.defaultProps = {
  onClick: noop,
};
