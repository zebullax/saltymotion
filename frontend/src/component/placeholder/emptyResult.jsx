// React
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import PropTypes from "prop-types";
// MUI
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
// Saltymotion
import { makeS3Link, s3LinkCategory } from "../../lib/utility";

/**
 * Render a placeholder for empty reviews set
 * @param {object} props
 * @return {JSX.Element}
 * @constructor
 */
function EmptyReviewsSet({ label, isAlternativeOffered, category, alternativeLink }) {
  const theme = useTheme();
  return (
    <Grid container pt={theme.spacing(8)}>
      <Grid item xs={12}>
        <Typography variant="h6" style={{ textAlign: "center" }}>
          No reviews found for &apos;
          {label}
          &apos;
        </Typography>
      </Grid>
      {isAlternativeOffered && (
        <Grid item xs={12} container justifyContent="center">
          <Grid item>
            <Typography variant="subtitle2" display="inline-flex">
              Try your luck with another&nbsp;
            </Typography>
            <Link variant="h6" component={RouterLink} to={alternativeLink}>
              {category}
            </Link>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}

EmptyReviewsSet.propTypes = {
  label: PropTypes.string.isRequired,
  isAlternativeOffered: PropTypes.bool,
  category: PropTypes.string,
  alternativeLink: PropTypes.string,
};

EmptyReviewsSet.defaultProps = {
  isAlternativeOffered: true,
  category: "game",
  alternativeLink: "/browse/game",
};

/**
 *********************************************************************************************************
 *********************************************************************************************************
 *********************************************************************************************************
 * */

/**
 * Render a placeholder for empty reviewers set
 * @return {JSX.Element}
 * @constructor
 */
function EmptyReviewersSet() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Grid container>
      <Grid item xs={5} />
      <Grid item xs={2} style={{ textAlign: "center" }}>
        <img
          crossOrigin="anonymous"
          style={{ width: "80px", borderRadius: "12%", padding: "8px" }}
          src={makeS3Link(
            s3LinkCategory.staticPicture,
            isDarkMode ? "transparentLogo.png" : "saltyLogoDarkBackground.png",
          )}
          alt="logo"
        />
      </Grid>
      <Grid item xs={5} />
      <Grid item xs={12}>
        <Typography variant="h6" style={{ textAlign: "center" }}>
          No reviewers found obeying those filters
        </Typography>
      </Grid>
    </Grid>
  );
}

/**
 *********************************************************************************************************
 *********************************************************************************************************
 *********************************************************************************************************
 * */

/**
 * Render a placeholder for empty reviewers set
 * @return {JSX.Element}
 * @constructor
 */
function EmptyGamesSet() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  return (
    <Grid container>
      <Grid item xs={5} />
      <Grid item xs={2} style={{ textAlign: "center" }}>
        <img
          crossOrigin="anonymous"
          style={{ width: "80px", borderRadius: "12%", padding: "8px" }}
          src={makeS3Link(
            s3LinkCategory.staticPicture,
            isDarkMode ? "transparentLogo.png" : "saltyLogoDarkBackground.png",
          )}
        />
      </Grid>
      <Grid item xs={5} />
      <Grid item xs={12}>
        <Typography variant="h6" style={{ textAlign: "center" }}>
          No games found obeying those filters
        </Typography>
      </Grid>
    </Grid>
  );
}

export { EmptyReviewsSet, EmptyReviewersSet, EmptyGamesSet };
