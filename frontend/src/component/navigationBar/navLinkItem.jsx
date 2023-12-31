// React
import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
// MUI
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useTheme } from "@mui/material/styles";
import Icon from "@mui/material/Icon";
// Misc
import moment from "moment";

/**
 * Create a list item nav-link with a icon
 * @param {JSX.Element} icon
 * @param {string} primary
 * @param {string} to
 * @param {boolean} isInset
 * @param {boolean} isBold
 * @param {object} additionalStyle
 * @return {JSX.Element}
 * @constructor
 */
export function ListItemLink({ icon, primary, to, isInset, isBold = false, additionalStyle = {} }) {
  const theme = useTheme();
  const renderLink = React.useMemo(
    // eslint-disable-next-line react/display-name
    () =>
      React.forwardRef((itemProps, ref) => (
        <NavLink
          exact
          to={to}
          activeStyle={{
            backgroundColor: "#80808040",
            borderLeft: "5px #2b90d9 solid",
            color: "white",
          }}
          ref={ref}
          {...itemProps}
        />
      )),
    [to],
  );

  return (
    <li>
      <ListItem
        button
        component={renderLink}
        style={isInset ? { paddingLeft: theme.spacing(4), ...additionalStyle } : { ...additionalStyle }}
      >
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText
          primaryTypographyProps={isBold ? { style: { fontWeight: "bold" }, noWrap: true } : { noWrap: true }}
          primary={primary}
        />
      </ListItem>
    </li>
  );
}

ListItemLink.propTypes = {
  icon: PropTypes.element,
  primary: PropTypes.string.isRequired,
  secondary: PropTypes.string,
  to: PropTypes.string.isRequired,
  additionalStyle: PropTypes.object,
  isInset: PropTypes.bool,
  isBold: PropTypes.bool,
};

ListItemLink.defaultProps = {
  isInset: false,
  isBold: false,
};

/**
 * Create a list item nav-link dedicated to workshop
 * @param {boolean} isReview
 * @param {string} title
 * @param {Date} creationTimestamp
 * @param {string} to
 * @param {string} gameName
 * @return {JSX.Element}
 * @constructor
 */
export function WorkshopListItemLink({ isReview, title, creationTimestamp, gameName, to }) {
  const theme = useTheme();
  const renderLink = React.useMemo(
    // eslint-disable-next-line react/display-name
    () =>
      React.forwardRef((itemProps, ref) => (
        <NavLink
          to={to}
          activeStyle={{
            backgroundColor: "#80808040",
            borderLeft: "5px #2b90d9 solid",
            color: "white",
          }}
          ref={ref}
          {...itemProps}
        />
      )),
    [to],
  );

  const secondaryText = `${moment(creationTimestamp).fromNow()} · ${gameName}`;
  const iconClass = isReview ? "fas fa-long-arrow-alt-down" : "fas fa-long-arrow-alt-up";
  return (
    <li>
      <ListItem button disableGutters component={renderLink}>
        <ListItemIcon style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(1), minWidth: 0 }}>
          <Icon className={iconClass} color={isReview ? "secondary" : "primary"} />
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{ noWrap: true }}
          primary={title}
          secondaryTypographyProps={{ noWrap: true, variant: "caption" }}
          secondary={secondaryText}
        />
      </ListItem>
    </li>
  );
}

WorkshopListItemLink.propTypes = {
  isReview: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  gameName: PropTypes.string.isRequired,
  creationTimestamp: PropTypes.string.isRequired,
};
