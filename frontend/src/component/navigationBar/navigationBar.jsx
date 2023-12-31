// React
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link as RouterLink, NavLink, useHistory } from "react-router-dom";
// MUI
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import { useTheme } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ListIcon from "@mui/icons-material/List";
// Saltymotion
import { gamesQuickAccessSection, reviewersQuickAccessSection, workshopQuickAccessSection } from "./helper";
import { sampleGames, sampleReviewers } from "../../lib/api/saltymotionApi";
import Hidden from "../abstract/Hidden";
import { VISITORS__REVIEWERS__SAMPLE_SIZE } from "../../lib/property";
import { ListItemLink } from "./navLinkItem";
import { shortWorkshopDescriptionPropTypes, userProfilePropTypes } from "../../../typedef/propTypes";
import { APPLICATION_BAR_HEIGHT } from "../../lib/appTheme";
import { makeS3Link, noop, s3LinkCategory } from "../../lib/utility";
import {
  clearQuickAccessWorkshopsNextChunk,
  loadQuickAccessWorkshopsNextChunk,
  trimQuickAccessWorkshops,
} from "../../state/app/action";
import { ApiCallStatus } from "../../lib/api/xhrWrapper";

const WORKSHOP_LOAD_CHUNK_SIZE = 3;
const SIDEBAR_TOP_PADDING = `${APPLICATION_BAR_HEIGHT}px`;

/**
 * Render the nav-bar component
 * @param {function} dispatch
 * @param {boolean} isDrawerOpen
 * @param {function} onDrawerClose
 * @param {UserProfile} userProfile
 * @param {ShortWorkshopDescription[]} quickAccessWorkshops
 * @param {boolean} hasMoreQuickAccessWorkshops
 * @param {string} quickAccessWorkshopsLoadChunkStatus
 * @return {JSX.Element}
 * @constructor
 */
function NavigationBar({
  dispatch,
  isDrawerOpen,
  onDrawerClose,
  userProfile,
  quickAccessWorkshops,
  hasMoreQuickAccessWorkshops,
  quickAccessWorkshopsLoadChunkStatus,
}) {
  const theme = useTheme();
  const history = useHistory();
  const isLessWorkshopItemsDisplayed = quickAccessWorkshops.length > WORKSHOP_LOAD_CHUNK_SIZE;

  const findIsReview = React.useCallback((workshop) => workshop.uploader.ID === userProfile.ID, [userProfile.ID]);
  // eslint-disable-next-line max-len
  const lastOffset = React.useMemo(
    () => Math.min(...quickAccessWorkshops.map((workshop) => new Date(workshop.creationTimestamp).valueOf() / 1000)),
    [quickAccessWorkshops],
  );

  /**
   * On app mount load the first chunk of workshop items
   */
  React.useEffect(() => {
    dispatch(loadQuickAccessWorkshopsNextChunk({ userID: userProfile.ID, limit: WORKSHOP_LOAD_CHUNK_SIZE }));
    return () => dispatch(clearQuickAccessWorkshopsNextChunk());
  }, [dispatch, userProfile.ID]);

  const onLoadMore = () =>
    dispatch(
      loadQuickAccessWorkshopsNextChunk({
        userID: userProfile.ID,
        offset: lastOffset,
        limit: WORKSHOP_LOAD_CHUNK_SIZE,
      }),
    );

  const onShowLess = () => dispatch(trimQuickAccessWorkshops({ count: WORKSHOP_LOAD_CHUNK_SIZE }));

  return (
    <>
      <Hidden lgUp>
        {/* Non permanent drawer for mobile */}
        <Drawer
          open={isDrawerOpen}
          onClose={onDrawerClose}
          sx={{
            flexShrink: 0,
            width: "calc(100% / 2)",
            "& .MuiDrawer-paper": { width: "calc(100% / 2)", boxSizing: "border-box", paddingTop: SIDEBAR_TOP_PADDING },
          }}
        >
          <List component="nav" onClick={onDrawerClose}>
            <List dense style={{ width: "100%", paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
              <ListItem style={{ alignItems: "flex-end" }} divider onClick={() => history.push("/")}>
                <ListItemAvatar>
                  <Avatar
                    imgProps={{ crossOrigin: "anonymous" }}
                    src={makeS3Link(s3LinkCategory.staticPicture, "saltymotionLogo_darker.png")}
                  />
                </ListItemAvatar>
                <ListItemText
                  primaryTypographyProps={{ variant: "h6", color: "textPrimary", noWrap: true }}
                  primary="Home"
                />
              </ListItem>
            </List>
            <ListItemLink primary="Create a Workshop" to="/workshop/create" />
            <ListItemLink primary="See all Workshops" to="/workshop" />
            <ListItemLink primary="Browse Games" to="/browse/game" />
            {gamesQuickAccessSection(userProfile.favoriteGames)}
            <ListItemLink primary="Browse Reviewers" to="/browse/reviewer" />
            {reviewersQuickAccessSection(userProfile.favoriteReviewers)}
          </List>
        </Drawer>
      </Hidden>
      <Hidden mdDown>
        {/* Permanent drawer for desktop */}
        <Drawer
          variant="permanent"
          sx={{
            flexShrink: 0,
            width: "calc(100% / 6)",
            "& .MuiDrawer-paper": { width: "calc(100% / 6)", boxSizing: "border-box", paddingTop: SIDEBAR_TOP_PADDING },
          }}
        >
          <List component="nav" style={{ overflowY: "scroll" }}>
            <List dense>
              <ListItemText
                primary="Workshops"
                primaryTypographyProps={{ fontWeight: "bold" }}
                sx={{ paddingLeft: theme.spacing(2) }}
              />
              <ListItemLink primary="Create" icon={<AddCircleOutlineIcon />} to="/workshop/create" />
              <ListItemLink primary="See all" icon={<ListIcon />} to="/workshop" />
            </List>
            <Divider />
            <List dense>
              <ListItemText
                primary="Quick access"
                primaryTypographyProps={{ fontWeight: "bold" }}
                sx={{ paddingLeft: theme.spacing(2) }}
              />
              {workshopQuickAccessSection({ workshops: quickAccessWorkshops, flagReview: findIsReview })}
              {quickAccessWorkshopsLoadChunkStatus === ApiCallStatus.IN_PROGRESS && (
                <>
                  <ListItem
                    button
                    disableGutters
                    style={{
                      // background: 'rgb(32, 32, 32)',
                      paddingBottom: theme.spacing(1),
                      paddingTop: theme.spacing(1),
                    }}
                  >
                    <ListItemText
                      secondaryTypographyProps={{ component: "span" }}
                      secondary={
                        <Grid container spacing={1} justifyContent="center">
                          <Grid item flexGrow={0}>
                            <Typography variant="caption" component="span">
                              Loading
                            </Typography>
                          </Grid>
                        </Grid>
                      }
                    />
                  </ListItem>
                  <LinearProgress variant="indeterminate" />
                </>
              )}
              {(hasMoreQuickAccessWorkshops || isLessWorkshopItemsDisplayed) && (
                <Grid
                  container
                  columns={2}
                  style={{
                    paddingBottom: theme.spacing(1),
                    paddingTop: theme.spacing(1),
                    paddingLeft: theme.spacing(2),
                  }}
                >
                  <Grid item xs={1} style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
                    {hasMoreQuickAccessWorkshops ? (
                      <Link component="button" variant="subtitle2" onClick={onLoadMore}>
                        Show more
                      </Link>
                    ) : null}
                  </Grid>
                  <Grid item xs={1} style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
                    {isLessWorkshopItemsDisplayed ? (
                      <Link component="button" variant="subtitle2" onClick={onShowLess}>
                        Show less
                      </Link>
                    ) : null}
                  </Grid>
                </Grid>
              )}
            </List>
            <Divider />
            <List dense>
              <ListItemLink primary="Browse Games" to="/browse/game" isBold />
              {gamesQuickAccessSection(userProfile.favoriteGames)}
            </List>
            <Divider />
            <List dense>
              <ListItemLink primary="Browse Reviewers" to="/browse/reviewer" isBold />
              {reviewersQuickAccessSection(userProfile.favoriteReviewers)}
            </List>
          </List>
          <Grid container spacing={1} style={{ padding: theme.spacing(2) }} justify="flex-start">
            <Grid item>
              <Link component={NavLink} variant="caption" color="textSecondary" to="/about/use">
                Terms of use
              </Link>
            </Grid>
            <Grid item>
              <Link component={NavLink} variant="caption" color="textSecondary" to="/about/privacy">
                Privacy policy
              </Link>
            </Grid>
            <Grid item>
              <Link component={NavLink} variant="caption" color="textSecondary" to="/about/us">
                About us
              </Link>
            </Grid>
          </Grid>
        </Drawer>
      </Hidden>
    </>
  );
}

NavigationBar.propTypes = {
  userProfile: userProfilePropTypes.isRequired,
  quickAccessWorkshops: PropTypes.arrayOf(shortWorkshopDescriptionPropTypes).isRequired,
  quickAccessWorkshopsLoadChunkStatus: PropTypes.string,
  hasMoreQuickAccessWorkshops: PropTypes.bool,
  isDrawerOpen: PropTypes.bool,
  onDrawerClose: PropTypes.func,
  dispatch: PropTypes.func.isRequired,
};

NavigationBar.defaultProps = {
  quickAccessWorkshopsLoadChunkStatus: undefined,
  hasMoreQuickAccessWorkshops: false,
  isDrawerOpen: false,
  onDrawerClose: noop,
};

const mapStateToProps = (state) => ({
  userProfile: state.userProfile,
  quickAccessWorkshops: state.application.quickAccessWorkshops,
  quickAccessWorkshopsLoadChunkStatus: state.application.quickAccessWorkshopsLoadChunkStatus,
  hasMoreQuickAccessWorkshops: state.application.hasMoreQuickAccessWorkshops,
});

export default connect(mapStateToProps)(NavigationBar);

/**
 * Render the visitor view for sidebar
 * @param {boolean} isDrawerOpen
 * @param {function} onDrawerClose
 * @return {JSX.Element}
 * @constructor
 */
function VisitorNavigationBar({ isDrawerOpen, onDrawerClose }) {
  const theme = useTheme();
  const [gamesSample, setGamesSample] = React.useState([]);
  const [reviewersSample, setReviewersSample] = React.useState([]);
  const history = useHistory();

  React.useEffect(() => {
    const [gamesPromise, gamesXHR] = sampleGames({ count: VISITORS__REVIEWERS__SAMPLE_SIZE });
    const [reviewersPromise, reviewersXHR] = sampleReviewers({ count: VISITORS__REVIEWERS__SAMPLE_SIZE });
    Promise.allSettled([gamesPromise, reviewersPromise])
      .then(([games, reviewers]) => {
        if (games.status === "fulfilled") {
          setGamesSample(games.value);
        }
        if (reviewers.status === "fulfilled") {
          setReviewersSample(reviewers.value);
        }
      })
      .catch(() => {
        console.error("Error while fetching samples");
      });
    return () => {
      gamesXHR.abort();
      reviewersXHR.abort();
    };
  }, []);

  return (
    <>
      <Hidden lgUp>
        <Drawer
          open={isDrawerOpen}
          onClose={onDrawerClose}
          sx={{
            flexShrink: 0,
            width: "calc(100% / 2)",
            "& .MuiDrawer-paper": { width: "calc(100% / 2)", boxSizing: "border-box", paddingTop: SIDEBAR_TOP_PADDING },
          }}
        >
          <List component="nav" onClick={onDrawerClose}>
            <List dense style={{ width: "100%", paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
              <ListItem style={{ alignItems: "flex-end" }} divider onClick={() => history.push("/")}>
                <ListItemAvatar>
                  <Avatar
                    imgProps={{ crossOrigin: "anonymous" }}
                    src={makeS3Link(s3LinkCategory.staticPicture, "saltymotionLogo_darker.png")}
                  />
                </ListItemAvatar>
                <ListItemText
                  primaryTypographyProps={{ variant: "h6", color: "textPrimary", noWrap: true }}
                  primary="Saltymotion"
                />
              </ListItem>
            </List>
            <ListItemLink primary="Browse Games" to="/browse/game" />
            {gamesQuickAccessSection(gamesSample)}
            <ListItemLink primary="Browse Reviewers" to="/browse/reviewer" />
            {reviewersQuickAccessSection(reviewersSample)}
          </List>
        </Drawer>
      </Hidden>
      <Hidden mdDown>
        <Drawer
          variant="permanent"
          sx={{
            flexShrink: 0,
            width: "calc(100% / 6)",
            "& .MuiDrawer-paper": { width: "calc(100% / 6)", boxSizing: "border-box", paddingTop: SIDEBAR_TOP_PADDING },
          }}
        >
          <List component="nav" style={{ overflowY: "scroll" }}>
            <List dense>
              <ListItemText
                primaryTypographyProps={{
                  color: "textPrimary",
                  style: { paddingLeft: theme.spacing(2), fontWeight: "bold" },
                }}
                primary="Workshops"
              />
              <Grid container spacing={1} sx={{ paddingLeft: theme.spacing(4) }}>
                <Grid item>
                  <Link component={RouterLink} to="/login" variant="subtitle2">
                    Log in
                  </Link>
                </Grid>
                <Grid item>
                  <Typography variant="subtitle2" display="inline-flex">
                    to have your latest
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="subtitle2" display="inline-flex">
                    workshops available here
                  </Typography>
                </Grid>
              </Grid>
            </List>
            <Divider />
            <List dense>
              <ListItemLink primary="Browse Games" to="/browse/game" isBold />
              {gamesQuickAccessSection(gamesSample)}
            </List>
            <Divider />
            <List dense>
              <ListItemLink primary="Browse Reviewers" to="/browse/reviewer" isBold />
              {reviewersQuickAccessSection(reviewersSample)}
            </List>
          </List>
          <Grid container spacing={1} style={{ padding: theme.spacing(2) }} justify="flex-start">
            <Grid item>
              <Link component={NavLink} variant="caption" color="textSecondary" to="/about/use">
                Terms of use
              </Link>
            </Grid>
            <Grid item>
              <Link component={NavLink} variant="caption" color="textSecondary" to="/about/privacy">
                Privacy policy
              </Link>
            </Grid>
            <Grid item>
              <Link component={NavLink} variant="caption" color="textSecondary" to="/about/us">
                About us
              </Link>
            </Grid>
          </Grid>
        </Drawer>
      </Hidden>
    </>
  );
}

VisitorNavigationBar.propTypes = {
  isDrawerOpen: PropTypes.bool,
  onDrawerClose: PropTypes.func,
};

VisitorNavigationBar.defaultProps = {
  isDrawerOpen: false,
  onDrawerClose: noop,
};

const connectedVisitorNavigationBar = connect()(VisitorNavigationBar);
export { connectedVisitorNavigationBar as VisitorNavigationBar };
