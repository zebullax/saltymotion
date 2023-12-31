// React
import React from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
// MUI
import AccountCircle from "@mui/icons-material//AccountCircle";
import NotificationsIcon from "@mui/icons-material//Notifications";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Badge from "@mui/material/Badge";
import ExitToAppIcon from "@mui/icons-material//ExitToApp";
import Tooltip from "@mui/material/Tooltip";
import ListIcon from "@mui/icons-material//List";
import ListItemIcon from "@mui/material/ListItemIcon";
import MenuIcon from "@mui/icons-material//Menu";
import { useTheme } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Avatar from "@mui/material/Avatar";
import useMediaQuery from "@mui/material/useMediaQuery";
// Saltymotion
import Hidden from "../abstract/Hidden";
import { makeS3Link, noop, s3LinkCategory } from "../../lib/utility";
import AutocompleteSearchBar from "../autocomplete/autocompleteSearchBar";
import { DEFAULT_LOAD_NOTIFICATION_SIZE } from "../../lib/property";
import NotificationItem, {
  NotificationAdditionalLoader,
  NotificationItemPlaceholder,
  NotificationItemSkeleton,
} from "../widget/notification";
import { userProfilePropTypes } from "../../../typedef/propTypes";
import { toggleDarkMode } from "../../state/app/action";
import { logout } from "../../state/userProfile/action";
import { ApiCallStatus } from "../../lib/api/xhrWrapper";
import { loadNotification, updateUnreadNotification } from "../../state/notification/action";

/**
 * Render application bar
 * @param {Object} userProfile
 * @param {function} dispatch
 * @param {function} onOpenSideBar
 * @param {boolean} [isLoadingNotifications]
 * @param {boolean} [hasUnreadNotification]
 * @param {boolean} [hasMoreNotifications]
 * @param {Object[]} [notifications]
 * @return {JSX.Element}
 * @constructor
 */
function ApplicationBar({
  userProfile,
  dispatch,
  onOpenSideBar,
  isLoadingNotifications,
  hasUnreadNotification,
  hasMoreNotifications,
  notifications,
}) {
  const theme = useTheme();
  const history = useHistory();
  const isDarkMode = theme.palette.mode === "dark";
  const [accountMenuAnchorEl, setAccountMenuAnchorEl] = React.useState(null);
  const [notificationMenuAnchorEl, setNotificationMenuAnchorEl] = React.useState(null);

  /**
   * Toggle visibility on notification icon
   * Load initial chunk of notifications on first time entering
   * On next activation: If we have unread notifications, we ll load an additional slice
   *   otherwise we ll display what we have
   * @param {Event} event
   */
  const onNotificationMenuClick = (event) => {
    setNotificationMenuAnchorEl(event.currentTarget);
    if (isLoadingNotifications) {
      return;
    }
    const bypassNotificationLoad = !hasUnreadNotification && notifications.length !== 0;
    if (bypassNotificationLoad) {
      return;
    }
    // Load initial chunk of notifications either:
    // - because we have unread notifications
    // - because or current notifications is empty, which may mean we never loaded anything (or just empty)
    dispatch(updateUnreadNotification({ hasUnreadNotification: false }));
    dispatch(
      loadNotification({
        limit: DEFAULT_LOAD_NOTIFICATION_SIZE,
        userID: userProfile.ID,
      }),
    );
  };

  const onLoadAdditionalNotifications = () =>
    dispatch(
      loadNotification({
        startFrom: notifications[notifications.length - 1].timestamp, // Must be sorted
        limit: DEFAULT_LOAD_NOTIFICATION_SIZE,
        userID: userProfile.ID,
      }),
    );

  const accountMenuID = "applicationBarAccountMenuID";
  const notificationMenuID = "applicationBarNotificationMenuID";

  const renderNotificationMenu = (items, isLoading) => {
    const header = (
      <MenuItem component="div" key={0} style={{ borderBottom: "1px white solid" }} disabled>
        <ListItemIcon>
          <ListIcon />
        </ListItemIcon>
        <Typography color="textPrimary" variant="subtitle1">
          Notifications
        </Typography>
      </MenuItem>
    );
    if (isLoading && items.length === 0) {
      return [header, <NotificationItemSkeleton key={1} />];
    }
    if (items.length === 0) {
      return [header, <NotificationItemPlaceholder key={1} />];
    }
    const footer = hasMoreNotifications && (
      <NotificationAdditionalLoader
        key={items.length + 1}
        onClick={onLoadAdditionalNotifications}
        isLoading={isLoading}
      />
    );
    return [header, items.map((notification) => <NotificationItem key={notification.ID} {...notification} />), footer];
  };

  const onNotificationMenuClose = () => {
    setNotificationMenuAnchorEl(null);
  };

  return (
    <>
      <AppBar position="fixed" elevation={1} color="default" sx={{ zIndex: (appTheme) => appTheme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Hidden lgUp>
            <Grid item style={{ flexGrow: 1 }}>
              <IconButton edge="start" aria-label="open drawer" onClick={() => onOpenSideBar(true)}>
                <MenuIcon />
              </IconButton>
            </Grid>
          </Hidden>
          <Hidden mdDown>
            <Grid
              onClick={() => history.push("/")}
              item
              style={{ height: 40, flexGrow: 0, marginRight: theme.spacing(1) }}
            >
              <img
                crossOrigin="anonymous"
                src={makeS3Link(
                  s3LinkCategory.staticPicture,
                  isDarkMode ? "transparentLogo.png" : "saltyLogoDarkBackground.png",
                )}
                alt="logo"
                style={{ height: "100%" }}
              />
            </Grid>
            <Grid item style={{ flexGrow: 1 }}>
              <Typography
                onClick={() => history.push("/")}
                style={{ fontWeight: "bold", flexGrow: 1, cursor: "pointer" }}
                variant="h5"
                noWrap
              >
                Saltymotion
              </Typography>
            </Grid>
          </Hidden>
          <Grid item style={{ flexGrow: 1 }}>
            <AutocompleteSearchBar />
          </Grid>
          <Tooltip title="Toggle dark mode">
            <IconButton color="inherit" onClick={() => dispatch(toggleDarkMode(isDarkMode))}>
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Show notifications">
            <IconButton
              data-testid="notificationMenuButtonTestID"
              aria-label="show new notifications"
              onClick={onNotificationMenuClick}
              color="inherit"
            >
              <Badge variant="dot" invisible={!hasUnreadNotification} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="My account">
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={accountMenuID}
              aria-haspopup="true"
              onClick={(evt) => setAccountMenuAnchorEl(evt.currentTarget)}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>
          <Menu
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            anchorEl={notificationMenuAnchorEl}
            id={notificationMenuID}
            open={notificationMenuAnchorEl !== null}
            onClose={onNotificationMenuClose}
            variant="menu"
            PaperProps={{ style: { maxHeight: 500, width: 400 } }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {renderNotificationMenu(notifications, isLoadingNotifications)}
          </Menu>
          <Menu
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            anchorEl={accountMenuAnchorEl}
            keepMounted
            TransitionComponent={Collapse}
            id={accountMenuID}
            open={accountMenuAnchorEl !== null}
            onClose={() => setAccountMenuAnchorEl(null)}
            onClick={() => setAccountMenuAnchorEl(null)}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem disabled divider>
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <Avatar src={makeS3Link(s3LinkCategory.profilePicture, userProfile.ID)} />
                </Grid>
                <Grid item>
                  <Typography variant="subtitle2" noWrap>
                    {userProfile.nickname}
                  </Typography>
                </Grid>
              </Grid>
            </MenuItem>
            <MenuItem onClick={() => history.push("/profile/general")}>Your profile</MenuItem>
            <MenuItem
              onClick={() => {
                dispatch(logout());
                document.location.assign("/");
              }}
            >
              Sign out
            </MenuItem>
            <Hidden lgUp>
              <MenuItem onClick={() => history.push("/about")}>About us</MenuItem>
            </Hidden>
          </Menu>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Hack to set a height on position fixed appBar */}
    </>
  );
}

ApplicationBar.propTypes = {
  userProfile: userProfilePropTypes.isRequired,
  dispatch: PropTypes.func.isRequired,
  onOpenSideBar: PropTypes.func,
  isLoadingNotifications: PropTypes.bool,
  hasUnreadNotification: PropTypes.bool,
  hasMoreNotifications: PropTypes.bool,
  notifications: PropTypes.array,
};

ApplicationBar.defaultProps = {
  onOpenSideBar: noop,
  isLoadingNotifications: false,
  hasUnreadNotification: false,
  hasMoreNotifications: false,
  notifications: [],
};

const mapStateToProps = (state) => ({
  userProfile: state.userProfile,
  isLoadingNotifications: state.notification.loadingStatus === ApiCallStatus.IN_PROGRESS,
  hasUnreadNotification: state.notification.hasUnreadNotification,
  hasMoreNotifications: state.notification.hasMore,
  notifications: state.notification.data,
});

export default connect(mapStateToProps)(ApplicationBar);

/**
 * Render the visitor component for application bar
 * @param {function} dispatch
 * @param {function} onOpenSideBar
 * @return {JSX.Element}
 * @constructor
 */
function VisitorApplicationBar({ dispatch, onOpenSideBar }) {
  const theme = useTheme();
  const history = useHistory();
  const isMobile = useMediaQuery(theme.breakpoints.only("xs"));
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <>
      <AppBar position="fixed" elevation={1}>
        <Toolbar>
          <Hidden lgUp>
            <Grid item style={{ flexGrow: +!isMobile }}>
              <IconButton edge="start" aria-label="open drawer" onClick={() => onOpenSideBar(true)}>
                <MenuIcon />
              </IconButton>
            </Grid>
          </Hidden>
          <Hidden mdDown>
            <Grid
              item
              style={{ height: 40, flexGrow: 0, marginRight: theme.spacing(1) }}
              onClick={() => history.push("/")}
            >
              <img
                crossOrigin="anonymous"
                src={makeS3Link(
                  s3LinkCategory.staticPicture,
                  isDarkMode ? "transparentLogo.png" : "saltyLogoDarkBackground.png",
                )}
                alt="logo"
                style={{ height: "100%" }}
              />
            </Grid>
            <Grid item style={{ flexGrow: 1 }}>
              <Typography
                onClick={() => history.push("/")}
                style={{ fontWeight: "bold", flexGrow: 1, cursor: "pointer" }}
                variant="h5"
                noWrap
              >
                Saltymotion
              </Typography>
            </Grid>
          </Hidden>
          <Grid item style={{ flexGrow: 1 }}>
            <AutocompleteSearchBar />
          </Grid>{" "}
          <Tooltip title="Toggle dark mode">
            <IconButton color="inherit" onClick={() => dispatch(toggleDarkMode(isDarkMode))}>
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <IconButton
            aria-label="Log in"
            style={{ marginLeft: theme.spacing(1) }}
            color="inherit"
            onClick={() => history.push("/login")}
          >
            <ExitToAppIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Hack to set a height on position fixed appBar */}
    </>
  );
}

VisitorApplicationBar.propTypes = {
  dispatch: PropTypes.func.isRequired,
  onOpenSideBar: PropTypes.func,
};

VisitorApplicationBar.defaultProps = {
  onOpenSideBar: noop,
};

const connectedVisitorApplicationBar = connect()(VisitorApplicationBar);
export { connectedVisitorApplicationBar as VisitorApplicationBar };
