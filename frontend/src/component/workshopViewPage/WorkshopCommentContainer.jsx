// React
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
// MUI
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import MuiAccordion from "@mui/material/Accordion";
import ExpandMoreIcon from "@mui/icons-material//ExpandMore";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
// Saltymotion
import { DEFAULT_LOAD_CHUNK_SIZE } from "../../lib/property";
import { deleteAtelierMessage, getAtelierMessage, postAtelierMessage } from "../../lib/api/saltymotionApi";
import WorkshopCommentCard from "../widget/workshopCommentCard";
import { makeS3Link, s3LinkCategory } from "../../lib/utility";
import Hidden from "../abstract/Hidden";
import { setErrorMessage } from "../../state/app/action";

const loadingWheelStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  marginTop: -12,
  marginLeft: -12,
};

/**
 * Atelier comment component
 * @param {number} atelierID
 * @param {string} userID
 * @param {string} userNickname
 * @param {boolean} isVisitor
 * @param {function} dispatch
 * @param {boolean} isHidden
 * @return {JSX.Element}
 * @constructor
 */
const CommentTab = ({ atelierID, userID, userNickname, isVisitor, dispatch, isHidden }) => {
  const theme = useTheme();
  const [isLoadingAtelierCommentChunk, setIsLoadingAtelierCommentChunk] = React.useState(false);
  const [isPostingComment, setIsPostingComment] = React.useState(false);
  const [comments, setComments] = React.useState([]);
  const [commentDraft, setCommentDraft] = React.useState("");
  const [isCommentExpanded, setIsCommentExpanded] = React.useState(false);

  const commentInputRef = React.useRef();

  React.useEffect(() => {
    if (isHidden || commentInputRef == null || commentInputRef.current == null) {
      return;
    }
    commentInputRef.current.focus();
  }, [isHidden, commentInputRef]);

  /**
   * Handle submission of atelier comment
   */
  const onPost = () => {
    if (commentDraft.length === 0 || isLoadingAtelierCommentChunk) {
      return;
    }
    const [postMessagePromise] = postAtelierMessage(atelierID, commentDraft);
    postMessagePromise
      .then((value) => {
        const newComment = {
          ID: value.ID,
          userID,
          userNickname,
          content: value.content,
          timestamp: value.timestamp,
        };
        setCommentDraft("");
        setComments([newComment, ...comments]);
      })
      .catch((error) => {
        console.error(error);
        dispatch(setErrorMessage("Error while posting comment"));
      })
      .finally(() => {
        setIsPostingComment(false);
      });
    setIsPostingComment(true);
  };

  /**
   * Load a chunk of atelier comments
   */
  React.useEffect(() => {
    const [getMessagePromise, xhr] = getAtelierMessage(atelierID, 0, DEFAULT_LOAD_CHUNK_SIZE);
    getMessagePromise
      .then((response) => {
        const { value } = response;
        setComments((currentComments) => [...currentComments, ...value]);
      })
      .catch((error) => {
        console.error(error);
        dispatch(setErrorMessage("Error while loading atelier comments"));
      })
      .finally(() => {
        setIsLoadingAtelierCommentChunk(false);
      });
    setIsLoadingAtelierCommentChunk(true);
    return () => xhr.abort();
  }, [dispatch, atelierID]);

  /**
   * Delete an atelier comment
   * @callback
   * @param {number} msgID
   */
  const onDeleteComment = (msgID) => {
    const [deleteCommentPromise] = deleteAtelierMessage(atelierID, msgID);
    deleteCommentPromise
      .then(() => {
        setComments((currentComments) => {
          const newComments = currentComments;
          const idx = newComments.findIndex((elem) => elem.ID === msgID);
          if (idx !== -1) {
            newComments.splice(idx, 1);
            return [...newComments];
          }
          console.error("Could not find the deleted msg in our collection");
          return currentComments;
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <Hidden mdUp>
        {/* ========= Cellphone view ========= */}
        <MuiAccordion
          square
          expanded={isCommentExpanded}
          onChange={(event, expanded) => setIsCommentExpanded(expanded)}
        >
          <MuiAccordionSummary aria-controls="panel1d-content" id="panel1d-header" expandIcon={<ExpandMoreIcon />}>
            Comments
          </MuiAccordionSummary>
          <MuiAccordionDetails style={{ display: "block" }}>
            <Grid
              container
              justify="flex-start"
              alignItems="flex-start"
              spacing={1}
              style={{ marginBottom: theme.spacing(2) }}
            >
              <Grid item xs={2} sm={1}>
                <Avatar style={{ backgroundColor: "white" }} src={makeS3Link(s3LinkCategory.profilePicture, userID)} />
              </Grid>
              <Grid item xs={10} sm={11}>
                <TextField
                  fullWidth
                  placeholder="Write a comment"
                  multiline
                  ref={commentInputRef}
                  variant="standard"
                  value={commentDraft}
                  onChange={(evt) => setCommentDraft(evt.target.value)}
                />
              </Grid>
              {commentDraft !== "" && (
                <Grid className="action_list" style={{ textAlign: "end" }} item xs={12}>
                  <Button variant="contained" color="primary" size="small" disabled={isPostingComment} onClick={onPost}>
                    {!isPostingComment ? "Post" : "Post in progress..."}
                    {isPostingComment && <CircularProgress size={24} style={loadingWheelStyle} color="primary" />}
                  </Button>
                  <Button variant="contained" color="secondary" size="small" onClick={() => setCommentDraft("")}>
                    Cancel
                  </Button>
                </Grid>
              )}
            </Grid>
            {comments.map((comment) => (
              <WorkshopCommentCard
                isSelf={userID === comment.userID}
                onDelete={onDeleteComment}
                key={comment.ID}
                {...comment}
              />
            ))}
          </MuiAccordionDetails>
        </MuiAccordion>
      </Hidden>
      <Hidden mdDown>
        {/* ========= Desktop view =========  */}
        <>
          {!isVisitor && (
            <Grid container justify="flex-start" alignItems="flex-start" spacing={1} style={{ marginBottom: 8 }}>
              <Grid item xs={2} sm={1}>
                <Avatar style={{ backgroundColor: "white" }} src={makeS3Link(s3LinkCategory.profilePicture, userID)} />
              </Grid>
              <Grid item xs={10} sm={11}>
                {/* FIXME This tab is hidden at first so the placeholder has a computed height of 0 px... */}
                <TextField
                  fullWidth
                  placeholder="Write a comment"
                  multiline
                  ref={commentInputRef}
                  variant="standard"
                  value={commentDraft}
                  onChange={(evt) => setCommentDraft(evt.target.value)}
                />
              </Grid>
              {commentDraft !== "" && (
                <Grid className="action_list" style={{ textAlign: "end" }} item xs={12}>
                  <Button variant="contained" color="primary" size="small" disabled={isPostingComment} onClick={onPost}>
                    {!isPostingComment ? "Post" : "Post in progress..."}
                    {isPostingComment && <CircularProgress size={24} style={loadingWheelStyle} color="primary" />}
                  </Button>
                  <Button variant="contained" color="secondary" size="small" onClick={() => setCommentDraft("")}>
                    Cancel
                  </Button>
                </Grid>
              )}
            </Grid>
          )}
          {comments.map((comment) => (
            <WorkshopCommentCard
              isSelf={userID === comment.userID}
              onDelete={onDeleteComment}
              key={comment.ID}
              {...comment}
            />
          ))}
        </>
      </Hidden>
    </>
  );
};

CommentTab.propTypes = {
  atelierID: PropTypes.number.isRequired,
  userID: PropTypes.string,
  userNickname: PropTypes.string,
  isHidden: PropTypes.bool,
  isVisitor: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

CommentTab.defaultProps = {
  isHidden: false,
};

const mapStateToProps = (state) => ({
  isVisitor: state.application.isVisitor,
});

const WorkshopCommentContainer = connect(mapStateToProps)(CommentTab);
export { WorkshopCommentContainer as default };
