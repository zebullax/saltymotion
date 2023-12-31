// React
import React from "react";
import PropTypes from "prop-types";
// Saltymotion
// MUI
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { countryToFlag } from "../../lib/countryCode";

const AutocompleteCountry = (props) => (
  <Autocomplete
    options={props.availableCountryCodes}
    getOptionLabel={(option) => option.name}
    isOptionEqualToValue={(option, value) => option.cCode.toUpperCase() === value.cCode.toUpperCase()}
    renderOption={(props, option) => (
      <li {...props}>
        <span style={{ marginRight: 10, fontSize: 18 }}>{countryToFlag(option.cCode)}</span>
        {option.name}
      </li>
    )}
    disableClearable
    value={props.value}
    onChange={props.onChange}
    renderInput={(params) => <TextField {...params} {...props.inputProps} placeholder="Country" />}
  />
);

const countryShape = PropTypes.shape({
  cCode: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
});

AutocompleteCountry.propTypes = {
  availableCountryCodes: PropTypes.arrayOf(countryShape).isRequired,
  value: countryShape.isRequired,
  onChange: PropTypes.func.isRequired,
  inputProps: PropTypes.object,
};

export default AutocompleteCountry;
