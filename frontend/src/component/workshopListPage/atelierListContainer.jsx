// React
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
// MUI
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
// Misc
import InfiniteScroll from "react-infinite-scroller";
// Saltymotion
import {
  atelierListStateReducer as viewReduce,
  buildInitialState as buildInitialViewState,
  loadChunk,
  pushChunk,
  setFilterStatus,
  switchItemType,
} from "./state";
import AtelierCard from "../widget/atelierCard";
import { AtelierStatus } from "../../lib/atelierStatus";
import { setErrorMessage } from "../../state/app/action";

const TAB_INDEX = {
  ATELIER: 0,
  REVIEW: 1,
};

/**
 * Render the  atelier (or review) list page
 * @param {function} dispatch
 * @param {UserProfile} userProfile
 * @return {JSX.Element}
 * @constructor
 */
function AtelierListContainer({ userProfile, dispatch: appDispatch }) {
  const theme = useTheme();
  const [tabIdx, setTabIdx] = React.useState(TAB_INDEX.ATELIER);
  const [viewState, viewDispatch] = React.useReducer(viewReduce, buildInitialViewState(true));
  const { ID } = userProfile;

  const onLoadChunk = React.useCallback(
    (err, result) => {
      if (err) {
        console.error("onLoadChunk", err);
        appDispatch(setErrorMessage("Error while loading next chunk of items"));
        viewDispatch(pushChunk([]));
      } else {
        viewDispatch(pushChunk(result.value));
      }
    },
    [appDispatch, viewDispatch],
  );

  React.useEffect(() => {
    viewDispatch(loadChunk(ID, viewState.isAtelier, viewState.statusFilter, 0, onLoadChunk));
    // TODO how do you clean up that dispatch ?
  }, [viewState.statusFilter, onLoadChunk, viewDispatch, ID, viewState.isAtelier]);

  /**
   * Handle User filtering on status
   * @param {number} newStatusFilter
   */
  const onStatusFilterChange = (newStatusFilter) => {
    viewDispatch(setFilterStatus(newStatusFilter));
  };

  /**
   * Return either a skeleton placeholder or a page of atelier depending on selected tab and page
   * @param {object[]} ateliers
   * @return {JSX.Element}
   */
  const buildItemSection = (ateliers) => {
    const isEmpty = ateliers.length === 0;
    if (isEmpty) {
      return (
        <Grid item xs={12}>
          <Typography variant="h6">There were no item founds... how about creating a workshop first?</Typography>
        </Grid>
      );
    }
    return (
      <Grid item container xs={12} spacing={1}>
        {ateliers.map((atelier) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={atelier.ID} style={{ marginBottom: theme.spacing(4) }}>
            <AtelierCard atelier={atelier} isStatusDisplayed={Number.isNaN(viewState.statusFilter)} />
          </Grid>
        ))}
      </Grid>
    );
  };

  /**
   * Dispatch load chunk on scroll end
   */
  const onScrollEnd = () => {
    const offset = viewState.ateliers.length;
    viewDispatch(loadChunk(ID, viewState.isAtelier, viewState.statusFilter, offset, onLoadChunk));
  };

  /**
   * Handle tab switch between atelier and reviews
   * @type {function(*, *=): void}
   */
  const onTabChange = React.useCallback((evt, val) => {
    setTabIdx(val);
    viewDispatch(switchItemType(val === TAB_INDEX.ATELIER));
  }, []);

  return (
    <Grid container spacing={1}>
      <Backdrop open={viewState.isLoadingChunk} style={{ zIndex: 99999 }} transitionDuration={{ exit: 1000 }}>
        <CircularProgress color="secondary" />
      </Backdrop>
      <Grid item xs={12} style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h2" style={{ fontWeight: "bold" }} component="h1">
          Workshops
        </Typography>
        <Grid container>
          <Typography variant="subtitle2" color="textSecondary" display="inline">
            You will find here every workshops created or reviewed by you
          </Typography>
        </Grid>
        <Divider />
      </Grid>
      <Grid container style={{ marginBottom: theme.spacing(2) }}>
        <Grid item style={{ flexGrow: 1 }}>
          <Tabs value={tabIdx} onChange={onTabChange}>
            <Tab label="Created by you" value={TAB_INDEX.ATELIER} />
            <Tab label="Reviewed by you" value={TAB_INDEX.REVIEW} />
          </Tabs>
        </Grid>
        <Grid item style={{ flexBasis: 200 }}>
          <FormControl variant="filled" fullWidth>
            <Select
              variant="filled"
              disabled={viewState.isLoadingChunk}
              value={viewState.statusFilter.toString()}
              onChange={(evt) => onStatusFilterChange(evt.target.value)}
            >
              <MenuItem disabled>Filter by status</MenuItem>
              <MenuItem value={Number.NaN.toString()}>All</MenuItem>
              <MenuItem value={AtelierStatus.InAuction.toString()}>In auction</MenuItem>
              <MenuItem value={AtelierStatus.InProgress.toString()}>In progress</MenuItem>
              <MenuItem value={AtelierStatus.Complete.toString()}>Complete</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Box sx={{ display: { sm: "block", xs: "none" } }}>
        <Grid item sm={8} lg={10} />
      </Box>
      <InfiniteScroll
        pageStart={0}
        initialLoad={false}
        loadMore={onScrollEnd}
        hasMore={viewState.hasMoreItems}
        style={{ width: "100%", padding: "4px" }}
      >
        {!viewState.isLoadingChunk && buildItemSection(viewState.ateliers)}
      </InfiniteScroll>
    </Grid>
  );
}

AtelierListContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  userProfile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  userProfile: state.userProfile,
});

export default connect(mapStateToProps)(AtelierListContainer);
