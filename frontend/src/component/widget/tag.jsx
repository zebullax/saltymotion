// React
import React from "react";
import PropTypes from "prop-types";
// MUI
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { noop } from "../../lib/utility";

const Tag = (props) => (
  <Chip
    avatar={<Avatar>#</Avatar>}
    color="primary"
    label={props.name}
    onClick={typeof props.onClick === "function" ? props.onClick : noop}
    {...props}
  />
);

Tag.propTypes = {
  onClick: PropTypes.func,
  name: PropTypes.string.isRequired,
};

export default Tag;
