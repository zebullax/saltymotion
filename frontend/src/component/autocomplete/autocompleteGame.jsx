// React
import React from "react";
import PropTypes from "prop-types";
// Saltymotion
// MUI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import { makeS3Link, s3LinkCategory } from "../../lib/utility";

/**
 * Render the games input filter bar
 * @param {object} props
 * @return {JSX.Element}
 * @constructor
 */
export default function AutocompleteGame(props) {
  const theme = useTheme();

  return (
    <Autocomplete
      options={props.availableGames}
      value={props.selectedGames}
      loading={props.isLoading}
      disabled={props.isDisabled}
      multiple={props.isMultiple ?? false}
      isOptionEqualToValue={(option, value) => option.ID === value.ID}
      getOptionLabel={(option) => option.name}
      onChange={(event, value) => props.onGameSelect(value)}
      renderOption={(liProps, value) => (
        <li {...liProps}>
          {props.isGameAvatarVisible && (
            <Avatar
              variant="rounded"
              alt={value.name}
              style={{ marginRight: theme.spacing(1) }}
              src={makeS3Link(s3LinkCategory.gameCover, value.ID)}
            />
          )}
          {value.name}
        </li>
      )}
      renderTags={(value, getTagProps) =>
        props.isTagHidden
          ? ""
          : value.map((option, index) => (
              <Chip label={option.name} key={index} {...getTagProps({ index })} color="primary" />
            ))
      }
      disableClearable={props.isTagHidden && props.isMultiple}
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

AutocompleteGame.propTypes = {
  inputProps: PropTypes.object,
  availableGames: PropTypes.arrayOf(
    PropTypes.shape({
      ID: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  selectedGames: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        ID: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }),
    ),
    PropTypes.shape({
      ID: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ]),
  onGameSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isMultiple: PropTypes.bool,
  isGameAvatarVisible: PropTypes.bool,
  isTagHidden: PropTypes.bool,
  isLoading: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isPadded: PropTypes.bool,
};

AutocompleteGame.defaultProps = {
  isGameAvatarVisible: true,
  isTagHidden: false,
  isMultiple: false,
  isLoading: false,
  isDisabled: false,
  isPadded: true,
};
