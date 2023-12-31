// React
import React from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
// MUI
import SearchIcon from "@mui/icons-material/Search";
import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { alpha, useTheme } from "@mui/material/styles";
import InputAdornment from "@mui/material/InputAdornment";
import useMediaQuery from "@mui/material/useMediaQuery";
// Misc
import _ from "underscore";
// Saltymotion
import { getTags, queryGamesFromHint, searchReviewer } from "../../lib/api/saltymotionApi";
import { AUTO_COMPLETION_THRESHOLD, RECOMMENDATION_LOAD_CHUNK_SIZE } from "../../lib/property";
import { setErrorMessage } from "../../state/app/action";

/**
 * Autocomplete bar for search
 * @param {function} dispatch
 * @return {JSX.Element}
 */
function AutocompleteSearchBar({ dispatch }) {
  const history = useHistory();
  const [isSearchLoading, setIsSearchLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);
  const theme = useTheme();
  const isUnderMd = useMediaQuery(theme.breakpoints.down("md"));

  /**
   * Handle input change on the autocomplete search bar
   * @param {string} value
   */
  const onSearchBarInputChange = (value) => {
    if (value.length >= AUTO_COMPLETION_THRESHOLD) {
      setIsSearchLoading(true);
      const [getGamesPromise] = queryGamesFromHint({ hint: value, offset: 0, limit: RECOMMENDATION_LOAD_CHUNK_SIZE });
      const [getTagsPromise] = getTags({ hint: value, offset: 0, limit: RECOMMENDATION_LOAD_CHUNK_SIZE });
      // eslint-disable-next-line max-len
      const [searchReviewerPromise] = searchReviewer({
        hint: value,
        isShort: true,
        offset: 0,
        limit: RECOMMENDATION_LOAD_CHUNK_SIZE,
      });
      Promise.allSettled([searchReviewerPromise, getGamesPromise, getTagsPromise])
        .then(([reviewers, games, tags]) => {
          const combinedSearchResults = [
            // eslint-disable-next-line max-len
            ...(reviewers.status === "fulfilled"
              ? reviewers.value.map((reviewer) => _.extend({ category: "reviewer" }, reviewer))
              : []),
            ...(games.status === "fulfilled" ? games.value.map((game) => _.extend({ category: "game" }, game)) : []),
            ...(tags.status === "fulfilled" ? tags.value.map((tag) => _.extend({ category: "tag" }, tag)) : []),
          ];
          setOptions(combinedSearchResults);
        })
        .catch((err) => {
          dispatch(setErrorMessage("Error while loading search results"));
          console.error(err);
        })
        .finally(() => {
          setIsSearchLoading(false);
        });
    }
    setInputValue(value);
  };

  /**
   * Handle selection from autocomplete search bar
   * @param {{name: string, ID: number, category: string}} value
   * @param {string} reason
   */
  const onSearchBarChange = (value, reason) => {
    if (reason === "selectOption") {
      history.push(`/${value.category.toLowerCase()}/${value.ID}`);
    }
  };

  return (
    <Autocomplete
      loading={isSearchLoading}
      sx={{ [`& .${autocompleteClasses.inputRoot}`]: { paddingTop: "8px", borderRadius: "8px" } }}
      style={
        isUnderMd
          ? { flexGrow: 1, marginRight: theme.spacing(1) }
          : { flexGrow: 1, maxWidth: "20vw", marginRight: theme.spacing(1) }
      }
      onChange={(evt, value, reason) => onSearchBarChange(value, reason)}
      onInputChange={(evt, value) => onSearchBarInputChange(value)}
      options={options}
      getOptionLabel={(option) => option.name}
      noOptionsText={inputValue < AUTO_COMPLETION_THRESHOLD ? "Type a bit more..." : "No results..."}
      freeSolo={false}
      inputValue={inputValue}
      isOptionEqualToValue={(option, value) => option.ID === value.ID}
      groupBy={(option) => option.category}
      renderInput={(params) => (
        <TextField
          fullWidth
          variant="filled"
          label="Search"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <InputAdornment position="end">{isSearchLoading ? <CircularProgress /> : <SearchIcon />}</InputAdornment>
            ),
          }}
          style={{
            backgroundColor: alpha(theme.palette.background.default, 0.15),
            "&:hover": {
              backgroundColor: alpha(theme.palette.background.default, 0.25),
            },
          }}
          {...params}
        />
      )}
    />
  );
}

AutocompleteSearchBar.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(AutocompleteSearchBar);
