// React/Redux
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
// Mui
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
// Saltymotion
import { ReviewerCardV2 } from "../widget/reviewerCard";
import { userPublicProfilePropTypes } from "../../../typedef/propTypes";

function ReviewerSection({ reviewers, nbReviewers }) {
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.down("lg"));

  // eslint-disable-next-line max-len
  const buildReviewerCards = (items) =>
    items.map((item) => (
      <Grid item xs={6} sm={4} lg={1} key={item.ID} sx={{ flexShrink: 0 }}>
        <ReviewerCardV2 reviewer={item} />
      </Grid>
    ));

  return (
    <Box>
      <Grid container pb={theme.spacing(2)} spacing={1}>
        <Grid item>
          <Typography variant="h6" fontWeight="bold">
            Reviewers
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="h6" fontWeight="bold" color="primary">
            {`(${nbReviewers})`}
          </Typography>
        </Grid>
      </Grid>
      <Grid
        sx={{ xs: { flexWrap: "nowrap", overflowX: "scroll" }, lg: { flexWrap: "wrap" } }}
        container
        spacing={{ xs: 1, lg: 2 }}
        columns={{ xs: 12, lg: 8 }}
      >
        {buildReviewerCards(reviewers)}
      </Grid>
    </Box>
  );
}

ReviewerSection.propTypes = {
  reviewers: PropTypes.arrayOf(userPublicProfilePropTypes).isRequired,
  nbReviewers: PropTypes.number,
};

ReviewerSection.defaultProps = {
  nbReviewers: 0,
};

export default connect()(ReviewerSection);
