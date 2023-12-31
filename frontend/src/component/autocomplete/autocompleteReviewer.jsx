// React
import React from "react";
import PropTypes from "prop-types";
// Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";

/**
 * Render the autocomplete reviewer filter bar
 * @param {object} props
 * @return {JSX.Element}
 * @constructor
 */
export default function AutocompleteReviewer(props) {
  return (
    <Autocomplete
      loading={props.isLoading}
      disabled={props.disabled}
      style={{ marginBottom: "1rem" }}
      onChange={(event, value) => props.onReviewerAutocompleteSelect(value)}
      onInputChange={(evt, value, reason) => props.onReviewerInputChange(value, reason)}
      options={props.reviewersOption}
      isOptionEqualToValue={(opt) => props.selectedReviewers.findIndex((val) => val.ID === opt.ID) !== -1}
      getOptionLabel={(option) => option.name}
      noOptionsText={props.isWaitingOnMoreCharacter ? "Type some more..." : "No results..."}
      inputValue={props.inputValue}
      value={null}
      renderInput={(params) => (
        <TextField
          variant="standard"
          label="Add a candidate reviewer"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {props.isLoading && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          {...params}
        />
      )}
    />
  );
}

AutocompleteReviewer.propTypes = {
  selectedReviewers: PropTypes.array,
  disabled: PropTypes.bool.isRequired,
  reviewersOption: PropTypes.array.isRequired,
  inputValue: PropTypes.string.isRequired,
  onReviewerAutocompleteSelect: PropTypes.func.isRequired,
  onReviewerInputChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isWaitingOnMoreCharacter: PropTypes.bool.isRequired,
};
