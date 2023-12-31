// React/Redux
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
// Mui
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
// Saltymotion
import { ReviewerCardV2 } from "../widget/reviewerCard";
import { sampleReviewers } from "../../lib/api/saltymotionApi";
import { REVIEWER_SAMPLE_COUNT, TOP_PAGE__MAX_REVIEWERS_DISPLAYED } from "../../lib/property";
import { setErrorMessage } from "../../state/app/action";

function ReviewerSection({ dispatch }) {
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.down("lg"));
  const [reviewers, setReviewers] = React.useState([]);

  // Sample reviewers on mount
  React.useEffect(() => {
    const [reviewersPromise, reviewersXHR] = sampleReviewers({ count: REVIEWER_SAMPLE_COUNT });
    reviewersPromise
      .then((result) => {
        setReviewers(result);
      })
      .catch((e) => {
        console.error(e);
        dispatch(setErrorMessage("Error while sampling reviewers"));
      });
    return () => reviewersXHR.abort();
  }, [dispatch]);

  // eslint-disable-next-line max-len
  const buildReviewerCards = (items) =>
    [...Array(Math.min(items.length, TOP_PAGE__MAX_REVIEWERS_DISPLAYED)).keys()].map((idx) => (
      <Grid item xs={6} sm={4} lg={1} key={items[idx].ID} sx={{ flexShrink: 0 }}>
        <ReviewerCardV2 reviewer={items[idx]} />
      </Grid>
    ));

  return (
    <Box>
      <Grid container item xs={12} spacing={1} pb={theme.spacing(2)}>
        <Grid item>
          <Typography variant="h6" style={{ fontWeight: "bold" }}>
            Featured
          </Typography>
        </Grid>
        <Grid item>
          <Link component={RouterLink} to="/browse/reviewer" variant="h6" style={{ fontWeight: "bold" }}>
            Reviewers
          </Link>
        </Grid>
      </Grid>
      <Grid
        sx={{ xs: { flexWrap: "nowrap", overflowX: "scroll" }, lg: { flexWrap: "wrap" } }}
        container
        columns={{ xs: 12, lg: 8 }}
        spacing={{ xs: 1, lg: 2 }}
      >
        {buildReviewerCards(reviewers)}
      </Grid>
    </Box>
  );
}

ReviewerSection.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(ReviewerSection);
