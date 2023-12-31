// React/Redux
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Helmet } from "react-helmet";
import { useHistory } from "react-router-dom";
// MUI
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
// Misc
import _ from "underscore";
// Saltymotion
import TopHeroSection from "./topHeroSection";
import { getReviewsSample, getUserFeed } from "../../lib/api/saltymotionApi";
import LoadingScreen from "../placeholder/loadingScreen";
import AtelierCard from "../widget/atelierCard";
import { userProfilePropTypes } from "../../../typedef/propTypes";
import LoadMoreSection from "./loadMoreSection";
import { setErrorMessage } from "../../state/app/action";
import GameSection from "./gameSection";
import ReviewerSection from "./reviewerSection";

/**
 * Create component to contain top page
 * @property {function} dispatch
 * @property {boolean} isVisitor
 * @property {UserProfile} [userProfile]
 * @return {JSX.Element}
 */
function TopPageContainer({ dispatch, isVisitor, userProfile }) {
  const theme = useTheme();
  const history = useHistory();

  const isOverXL = useMediaQuery(theme.breakpoints.up("xl"));
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [isLoading, setIsLoading] = React.useState(true);
  const [topAtelier, setTopAtelier] = React.useState();

  const [reviews, setReviews] = React.useState([]);

  // TODO This is way too long for an effect... extract
  React.useEffect(() => {
    setIsLoading(true);
    const scalingFactor = isOverXL ? 6 : 4;
    if (!isVisitor) {
      const [feedPromise, feedXHR] = getUserFeed({ userID: userProfile.ID });
      const [topReviewPromise, topReviewXHR] = getReviewsSample({ count: 1 });
      Promise.all([feedPromise, topReviewPromise])
        .then(([recommendations, topReviews]) => {
          setTopAtelier(topReviews[0]);
          // truncate to the highest integer multiple of 4, and remove duplicates
          let truncatedReviews = [...recommendations.reviews.fromGames, ...recommendations.reviews.fromReviewers];
          truncatedReviews = _.uniq(truncatedReviews, false, (item) => item.ID);
          setReviews(truncatedReviews.slice(0, scalingFactor * Math.floor(truncatedReviews.length / scalingFactor)));
        })
        .catch((error) => {
          console.error(error);
          dispatch(setErrorMessage("Error while loading recommendations"));
        })
        .finally(() => {
          setIsLoading(false);
        });
      return () => {
        feedXHR.abort();
        topReviewXHR.abort();
      };
    }
    // Visitor: sample reviews randomly
    const [workshopsPromise, workshopsXHR] = getReviewsSample({ count: 1 + scalingFactor });
    workshopsPromise.then((workshops) => {
      if (workshops.length) {
        const [first, ...rest] = workshops;
        setTopAtelier(first);
        setReviews(rest);
      }
      setIsLoading(false);
    });
    return () => workshopsXHR.abort();
  }, [isOverXL, dispatch, userProfile, isVisitor]);

  const featuredReviews = (items) =>
    items.map((atelier) => (
      <Grid item xs={12} sm={6} md={3} xl={2} key={atelier.ID} sx={{ flexShrink: 0 }}>
        <AtelierCard atelier={atelier} />
      </Grid>
    ));

  const header = () => {
    const content = "Home of Saltymotion: highlights of the day, new featured games, reviews...";
    const title = "Saltymotion - Home";
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
      {header()}
      {isLoading && <LoadingScreen isOpen />}
      {!isLoading && (
        <Grid container spacing={1} data-testid="TopPageContainerTestID">
          <Grid item xs={12}>
            <TopHeroSection backdropID={topAtelier.game.ID} atelier={topAtelier} />
          </Grid>
          {reviews.length !== 0 && (
            <Grid container item xs={12} spacing={1}>
              <Grid item xs={12}>
                <Typography variant="h6" style={{ fontWeight: "bold" }}>
                  Featured reviews
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                container
                spacing={2}
                sx={isMobile ? { flexWrap: "nowrap", overflowX: "scroll" } : { flexWrap: "wrap" }}
              >
                {featuredReviews(reviews)}
              </Grid>
            </Grid>
          )}
          {!isMobile && (
            <Grid item xs={12}>
              <LoadMoreSection onClick={() => history.push("/workshop")} />
            </Grid>
          )}
          {isMobile && (
            <Grid container item xs={12} sx={{ marginBottom: theme.spacing(2) }}>
              <Grid item sx={{ flexGrow: 1, margin: "auto" }}>
                <Divider />
              </Grid>
            </Grid>
          )}
          <Grid item xs={12}>
            <GameSection />
          </Grid>
          {!isMobile && (
            <Grid item xs={12}>
              <LoadMoreSection onClick={() => history.push("/browse/game")} />
            </Grid>
          )}
          {isMobile && (
            <Grid container mb={theme.spacing(2)}>
              <Grid item margin="auto" flexGrow={1}>
                <Divider />
              </Grid>
            </Grid>
          )}
          <Grid item xs={12}>
            <ReviewerSection />
          </Grid>
        </Grid>
      )}
    </>
  );
}

TopPageContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  isVisitor: PropTypes.bool.isRequired,
  userProfile: userProfilePropTypes,
};

TopPageContainer.defaultProps = {
  userProfile: undefined,
};

const mapStateToProps = (state) => ({
  userProfile: state.userProfile,
  isVisitor: state.application.isVisitor,
});

export default connect(mapStateToProps)(TopPageContainer);
