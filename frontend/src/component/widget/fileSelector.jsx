// React
import React from "react";
import PropTypes from "prop-types";
// MUI
import CloudUploadIcon from "@mui/icons-material//CloudUpload";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import VideoLibraryIcon from "@mui/icons-material/VideoLibraryTwoTone";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";

/**
 * Render the drag and drop file selector used in atelier create
 * @param {object} props
 * @return {JSX.Element}
 * @constructor
 */
export default function FileSelector(props) {
  const fileInputRef = React.useRef();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("xs"));
  const [dragDepth, setDragDepth] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  /**
   * Handle enter drag zone
   * @param {DragEvent} e
   */
  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragDepth((currentDragDepth) => currentDragDepth + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  /**
   * Handle leave drag zone
   * @param {DragEvent} e
   */
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragDepth >= 1) {
      if (dragDepth === 1) {
        setIsDragging(false);
      }
      setDragDepth((currentDragDepth) => currentDragDepth - 1);
    }
  };

  /**
   * Handle drag over
   * @param {DragEvent} e
   */
  const onDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * Handle drop on drag zone
   * @param {DragEvent} e
   */
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      props.onFileSelected(e.dataTransfer.files);
      e.dataTransfer.clearData();
      setDragDepth(0);
    }
  };

  return (
    <Container>
      <Paper
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          border: isDragging ? "2px grey dashed" : "none",
        }}
      >
        <Grid
          style={{ textAlign: "center", padding: theme.spacing(4) }}
          container
          spacing={1}
          onDragLeave={onDragLeave}
          onDragEnter={onDragEnter}
          onDragOver={onDrag}
          onDrop={onDrop}
        >
          <Grid item xs={12}>
            {isXs ? (
              <>
                <input
                  type="file"
                  style={{ display: "none" }}
                  accept="video/mp4"
                  id="file_selector_id"
                  ref={fileInputRef}
                  onChange={() => props.onFileSelected(fileInputRef.current.files)}
                />
                <label htmlFor="file_selector_id">
                  <Button
                    startIcon={<VideoLibraryIcon fontSize="large" />}
                    component="span"
                    color="primary"
                    variant="contained"
                  >
                    {props.selectOnlyHelperText}
                  </Button>
                </label>
              </>
            ) : (
              <CloudUploadIcon fontSize="large" />
            )}
          </Grid>
          {!isXs && (
            <Grid item xs={12}>
              <input
                type="file"
                style={{
                  width: "0.1px",
                  height: "0.1px",
                  opacity: "0",
                  overflow: "hidden",
                  position: "absolute",
                  zIndex: "-1",
                }}
                accept="video/mp4"
                id="file_selector_id"
                ref={fileInputRef}
                onChange={() => props.onFileSelected(fileInputRef.current.files)}
              />
              <Typography variant="subtitle1" htmlFor="file_selector_id" component="label" sx={{ cursor: "pointer" }}>
                {props.helperText}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
}

FileSelector.propTypes = {
  onFileSelected: PropTypes.func.isRequired,
  helperText: PropTypes.string.isRequired,
  selectOnlyHelperText: PropTypes.string.isRequired,
};
