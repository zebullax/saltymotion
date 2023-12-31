// React
import React from "react";
import PropTypes from "prop-types";
// MUI
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const AutocompleteTimezone = (props) => {
  return (
    <Autocomplete
      options={props.availableTimezones}
      value={props.value}
      onChange={props.onChange}
      disableClearable
      renderInput={(params) => <TextField {...params} {...props.inputProps} placeholder={"Timezone"} />}
    />
  );
};

AutocompleteTimezone.propTypes = {
  availableTimezones: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.string.isRequired,
  defaultTimezone: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  inputProps: PropTypes.object,
};

export default AutocompleteTimezone;
