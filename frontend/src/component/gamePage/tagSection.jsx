// React/Redux
import React from "react";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
// MUI
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
// Saltymotion
import Tag from "../widget/tag";
import { tagPropTypes } from "../../../typedef/propTypes";

/**
 * Render list of tags
 * @param {Tag[]} tags
 * @return {JSX.Element}
 */
function TagSection({ tags }) {
  const theme = useTheme();
  const history = useHistory();
  const isUpSM = useMediaQuery(theme.breakpoints.up("sm"));
  const isUpLG = useMediaQuery(theme.breakpoints.up("lg"));
  // eslint-disable-next-line no-nested-ternary
  const maxTagsCount = isUpLG ? 8 : isUpSM ? 6 : 3;
  const build = (items) =>
    [...Array(Math.min(items.length, maxTagsCount)).keys()].map((idx) => (
      <Tag
        key={items[idx].ID}
        size="small"
        name={items[idx].name}
        color="primary"
        onClick={() => history.push(`/tag/${items[idx].ID}`)}
      />
    ));
  return <>{tags.length > 0 && build(tags)}</>;
}

TagSection.propTypes = {
  tags: PropTypes.arrayOf(tagPropTypes).isRequired,
};

export default TagSection;
