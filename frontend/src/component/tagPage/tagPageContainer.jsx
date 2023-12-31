// React
import React from "react";
import PropTypes from "prop-types";
// MUI
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
// Misc
import Chart from "chart.js";
import { Helmet } from "react-helmet";
// Saltymotion
import { atelierPropTypes, userPublicProfilePropTypes } from "../../../typedef/propTypes";
import { ReviewerCardV2 } from "../widget/reviewerCard";
import { EmptyReviewsSet } from "../placeholder/emptyResult";
import { privacyChartConfig, statusChartConfig } from "../../lib/chart/chartConfig";
import AtelierCard from "../widget/atelierCard";

/**
 * Create the container for the tag page
 * @param {object} props
 * @return {JSX.Element}
 * @constructor
 */
export default function TagPageContainer(props) {
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.down("xs"));
  const atelierPrivacyChartRef = React.createRef();
  const atelierStatusChartRef = React.createRef();

  const { statistics } = props.tag;
  React.useEffect(() => {
    const atelierPrivacyChartContext = atelierPrivacyChartRef.current.getContext("2d");
    const atelierStatusChartContext = atelierStatusChartRef.current.getContext("2d");
    new Chart(atelierPrivacyChartContext, privacyChartConfig(statistics));
    new Chart(atelierStatusChartContext, statusChartConfig(statistics));
  }, [atelierPrivacyChartRef, atelierStatusChartRef, statistics]);

  const buildAteliers = (ateliers) =>
    ateliers.length === 0 ? (
      <EmptyReviewsSet label={props.tag.name} isAlternativeOffered={false} />
    ) : (
      ateliers.map((atelier) => (
        <Grid item xs={12} sm={6} lg={3} key={atelier.ID}>
          <AtelierCard atelier={atelier} />
        </Grid>
      ))
    );

  const buildReviewers = (reviewers) =>
    [...Array(Math.min(reviewers.length, isXS ? 2 : 3)).keys()].map((idx) => (
      <Grid item xs={6} sm={4} key={reviewers[idx].ID} sx={{ flexShrink: 0 }}>
        <ReviewerCardV2 reviewer={reviewers[idx]} />
      </Grid>
    ));

  const header = (tag) => {
    const content = "Tag showcase, details and popular works related to a particular tag in the e-sports scene";
    const title = `Saltymotion - ${tag.name}`;
    return (
      <Helmet>
        <meta name="description" content={content} />
        <meta name="og:description" content={content} />
        <meta name="twitter:description" content={content} />
        <meta name="title" content={title} />
        <meta name="og:title" content={title} />
        <meta name="twitter:title" content={title} />
      </Helmet>
    );
  };

  return (
    <>
      {header(props.tag)}
      <Grid container spacing={1} alignItems="stretch">
        <Grid item xs={12} style={{ marginBottom: 8 }}>
          <Typography variant="h4">#{props.tag.name}</Typography>
          <Typography variant="subtitle2" color="textSecondary">
            You will find here a showcase of atelier related to this tag
          </Typography>
          <Divider />
        </Grid>
        <Grid item container xs={12} sm={6} md={5} spacing={1} style={{ alignContent: "flex-start" }}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">Top reviewers</Typography>
          </Grid>
          {buildReviewers(props.reviewers)}
        </Grid>
        <Grid item xs={12} sm={6} md={5} container style={{ alignContent: "flex-start" }}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">Breakdown</Typography>
          </Grid>
          <Grid item xs={12} style={{ height: isXS ? "100px" : "135px" }}>
            <canvas id="atelierPrivacyChartID" ref={atelierPrivacyChartRef} />
          </Grid>
          <Grid item xs={12} style={{ height: isXS ? "100px" : "135px" }}>
            <canvas id="atelierStatusChartID" ref={atelierStatusChartRef} />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12} style={{ marginTop: 16 }}>
          <Grid container spacing={2}>
            {buildAteliers(props.ateliers)}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

TagPageContainer.propTypes = {
  tag: PropTypes.shape({
    ID: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    relatedTags: PropTypes.arrayOf(
      PropTypes.shape({
        ID: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }),
    ).isRequired,
    statistics: PropTypes.shape({
      public: PropTypes.number.isRequired,
      private: PropTypes.number.isRequired,
      inAuction: PropTypes.number.isRequired,
      inProgress: PropTypes.number.isRequired,
      complete: PropTypes.number.isRequired,
    }).isRequired,
  }),
  reviewers: PropTypes.arrayOf(userPublicProfilePropTypes).isRequired,
  ateliers: PropTypes.arrayOf(atelierPropTypes).isRequired,
};
