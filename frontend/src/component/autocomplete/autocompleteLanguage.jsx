// React
import React from "react";
import PropTypes from "prop-types";
// MUI
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const AutocompleteLanguage = (props) => (
  <Autocomplete
    multiple
    options={props.availableLanguages}
    getOptionLabel={(option) => option.name}
    isOptionEqualToValue={(option, value) => option.isoCode === value.isoCode}
    onChange={(event, value) => props.onChange(value)}
    renderTags={(value, getTagProps) =>
      value.map((option, index) => (
        <Chip
          label={option.name}
          size={props.isSmallChip ? "small" : "medium"}
          key={index}
          {...getTagProps({ index })}
          color="primary"
        />
      ))
    }
    value={props.selectedLanguages}
    renderInput={(params) => (
      <TextField {...params} placeholder="Languages" {...props.inputProps} fullWidth={props.isFullWidth} />
    )}
  />
);

const languageShape = PropTypes.shape({
  isoCode: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
});

AutocompleteLanguage.propTypes = {
  selectedLanguages: PropTypes.arrayOf(languageShape).isRequired,
  isFullWidth: PropTypes.bool.isRequired,
  isSmallChip: PropTypes.bool,
  availableLanguages: PropTypes.arrayOf(languageShape).isRequired,
  onChange: PropTypes.func.isRequired,
  inputProps: PropTypes.object,
};

AutocompleteLanguage.defaultProps = {
  isSmallChip: false,
};

export default AutocompleteLanguage;
