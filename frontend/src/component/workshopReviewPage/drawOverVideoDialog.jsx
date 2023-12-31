// React
import React from "react";
import PropTypes from "prop-types";
// MUI
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import GestureIcon from "@mui/icons-material//Gesture";
import CloseIcon from "@mui/icons-material//Close";
import DeleteIcon from "@mui/icons-material//Delete";
import DialogTitle from "@mui/material/DialogTitle";
import HelpIcon from "@mui/icons-material//Help";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Tooltip from "@mui/material/Tooltip";
import PaletteIcon from "@mui/icons-material//Palette";
import Slider from "@mui/material/Slider";
import Popover from "@mui/material/Popover";
// Misc
import CanvasDraw from "react-canvas-draw";
import { SwatchesPicker } from "react-color";

/**
 * Dialog for user to draw on top of still picture
 * @param {object} props
 * @return {JSX.Element}
 * @constructor
 */
const DrawOverVideoDialog = (props) => {
  const [brushColor, setBrushColor] = React.useState("#fff");
  const [brushSize, setBrushSize] = React.useState(10);
  const [isPickingColor, setIsPickingColor] = React.useState(false);
  const [colorAnchorEl, setColorAnchorEl] = React.useState(null);
  const [isFreehandDrawing, setIsFreehandDrawing] = React.useState(false);
  const [isHelperOpen, setIsHelperOpen] = React.useState(false);
  const drawCanvasRef = React.createRef();

  /**
   * @callback
   * On user start freehand drawing, pass back a ref to the drawing canvas to the parent container
   */
  const onStartFreehandDrawing = () => {
    if (isFreehandDrawing) {
      return;
    }
    props.onStartFreehandDrawing(drawCanvasRef.current.canvas);
    setIsFreehandDrawing(true);
  };

  /**
   * @callback
   * On user clearing freehand strokes
   */
  const clearFreehandStrokes = () => {
    if (!isFreehandDrawing) {
      return;
    }
    drawCanvasRef.current.clear();
    props.onClearFreehandStroke();
  };

  /**
   * @callback
   * set state on dialog close
   */
  const onDialogClose = () => {
    setIsFreehandDrawing(false);
    props.onClose();
  };

  const isFrameUnderXL = () => props.frameWidth < 1920;

  const helperText =
    "This is a still frame from the match, you can draw on it to highlight some particular points." +
    "Using tool on the left side, draw and then clear if you need. " +
    "But keep in mind, everything drawn here will appear on the final video !" +
    "When you're done just close this window...";
  return (
    <Dialog
      open={props.isOpen}
      maxWidth={isFrameUnderXL() ? "xl" : false}
      fullWidth={!isFrameUnderXL()}
      disableBackdropClick
      onClose={onDialogClose}
    >
      <DialogTitle>
        <Grid container spacing={1} style={{ alignItems: "center" }}>
          <Grid item style={{ flexGrow: 1 }}>
            <Typography variant="h6" component="span" color="textPrimary">
              Art studio of Saltymotion
            </Typography>
          </Grid>
          <Grid item>
            <ClickAwayListener onClickAway={() => setIsHelperOpen(false)}>
              <Tooltip
                title={helperText}
                open={isHelperOpen}
                disableFocusListener
                disableHoverListener
                disableTouchListener
              >
                <IconButton aria-label="Help" onClick={() => setIsHelperOpen(true)}>
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            </ClickAwayListener>
            <IconButton aria-label="close" onClick={onDialogClose}>
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container spacing={1}>
          <Grid item container xs={1} spacing={1} direction="column">
            <Grid item style={{ display: "inline-flex", justifyContent: "center" }}>
              <Tooltip title="Freehand draw">
                <IconButton
                  color={isFreehandDrawing ? "primary" : "default"}
                  aria-label="Freehand draw"
                  onClick={onStartFreehandDrawing}
                >
                  <GestureIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item style={{ display: "inline-flex", justifyContent: "center" }}>
              <Tooltip title="Clear">
                <IconButton aria-label="clear" color="default" onClick={clearFreehandStrokes}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item style={{ display: "inline-flex", justifyContent: "center", flexBasis: "200px" }}>
              <Tooltip title="Brush size">
                <Slider
                  orientation="vertical"
                  defaultValue={10}
                  value={brushSize}
                  valueLabelDisplay="auto"
                  onChange={(evt, val) => setBrushSize(val)}
                  onChangeCommitted={(evt, val) => setBrushSize(val)}
                  min={1}
                  marks
                  max={20}
                />
              </Tooltip>
            </Grid>
            <Grid item style={{ display: "inline-flex", justifyContent: "center" }}>
              <Tooltip title="Brush color">
                <IconButton
                  onClick={(evt) => {
                    setColorAnchorEl(evt.currentTarget);
                    setIsPickingColor(true);
                  }}
                >
                  <PaletteIcon />
                </IconButton>
              </Tooltip>
              <Popover
                open={isPickingColor}
                anchorEl={colorAnchorEl}
                onClose={() => {
                  setIsPickingColor(false);
                  setColorAnchorEl(null);
                }}
              >
                <SwatchesPicker
                  color={brushColor}
                  onChange={(color) => setBrushColor(color.hex)}
                  onChangeComplete={(color) => setBrushColor(color.hex)}
                />
              </Popover>
            </Grid>
          </Grid>
          <Grid item xs={11} style={{ display: "inline-flex", justifyContent: "center", backgroundColor: "#1d232a" }}>
            <CanvasDraw
              ref={drawCanvasRef}
              brushRadius={brushSize}
              brushColor={brushColor}
              hideGrid
              catenaryColor={brushColor}
              lazyRadius={0}
              disabled={!isFreehandDrawing}
              imgSrc={props.frameURL}
              canvasWidth={props.frameWidth}
              canvasHeight={props.frameHeight}
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

DrawOverVideoDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  frameWidth: PropTypes.number.isRequired,
  frameHeight: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onClearFreehandStroke: PropTypes.func.isRequired,
  frameURL: PropTypes.string.isRequired,
  onStartFreehandDrawing: PropTypes.func.isRequired,
};

export default DrawOverVideoDialog;
