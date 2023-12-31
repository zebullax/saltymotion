// React
import React from "react";
import PropTypes from "prop-types";
// Mui
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
// Saltymotion
import Tag from "../widget/tag";
import { tagPropTypes } from "../../../typedef/propTypes";

/**
 * Render the tags input filter bar
 * @param {object} props
 * @return {JSX.Element}
 * @constructor
 */
export default function AutocompleteTag(props) {
  return (
    <Autocomplete
      data-testid="autocompleteTagTestID"
      multiple
      openOnFocus
      options={props.availableTags}
      loading={props.isLoading}
      disabled={props.isDisabled}
      value={props.selectedTags}
      limitTags={props.maxTags}
      isOptionEqualToValue={(option, value) => option.ID === value.ID}
      getOptionLabel={(option) => option.name}
      onChange={(event, value) => props.onTagSelect(value)}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Tag name={option.name} key={option.ID} {...getTagProps({ index })} size="small" color="primary" />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="filled"
          placeholder={props.placeholder}
          aria-placeholder={props.placeholder}
          fullWidth
        />
      )}
    />
  );
}

AutocompleteTag.propTypes = {
  availableTags: PropTypes.arrayOf(tagPropTypes).isRequired,
  selectedTags: PropTypes.arrayOf(tagPropTypes).isRequired,
  onTagSelect: PropTypes.func.isRequired,
  maxTags: PropTypes.number,
  placeholder: PropTypes.string,
  isLoading: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isPadded: PropTypes.bool,
};

AutocompleteTag.defaultProps = {
  maxTags: -1,
  isLoading: false,
  isDisabled: false,
  isPadded: true,
};
