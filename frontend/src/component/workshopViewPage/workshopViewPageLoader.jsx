// React/Redux
import React from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
// Saltymotion
import { AtelierStatus } from "../../lib/atelierStatus";
import LoadingScreen from "../placeholder/loadingScreen";
import ViewAtelierPageContainer, { ViewAtelierVisitorPageContainer } from "./workshopViewPageContainer";
// import ReviewAtelierPageContainer from '../workshopReviewPage/reviewAtelierPageContainer';
import { userProfilePropTypes } from "../../../typedef/propTypes";
import WorkshopHook from "../../lib/hooks/workshop";
import WorkshopReviewPage from "../workshopReviewPage/workshopReviewPage";

/**
 * Utility to flag whether a workshop is a review belonging to the user
 * @param {AtelierDescription} workshop
 * @param {UserProfile} userProfile
 * @return {boolean}
 */
function isReview(workshop, userProfile) {
  return workshop.currentStatus.ID === AtelierStatus.InProgress && workshop.reviewer.ID === userProfile.ID;
}

/**
 * Load atelier from api then create the component
 * @param {UserProfile} [userProfile]
 * @param {boolean} isVisitor
 * @return {JSX.Element}
 * @constructor
 */
function WorkshopViewPageLoader({ userProfile, isVisitor }) {
  const { ID } = useParams();
  const [workshop, isWorkshopLoading] = WorkshopHook.useLoader({ ID });
  const [isVisitorView, setIsVisitorView] = React.useState(false);
  const [isWorkshopView, setIsWorkshopView] = React.useState(false);
  const [isReviewView, setIsReviewView] = React.useState(false);

  React.useEffect(() => {
    if (!isVisitor && !isWorkshopLoading && workshop !== undefined) {
      setIsWorkshopView(!isReview(workshop, userProfile));
    }
  }, [isVisitor, isWorkshopLoading, workshop, userProfile]);

  React.useEffect(() => {
    if (isVisitor && !isWorkshopLoading && workshop !== undefined) {
      setIsVisitorView(true);
    }
  }, [isVisitor, isWorkshopLoading, workshop]);

  React.useEffect(() => {
    if (!isVisitor && !isWorkshopLoading && workshop !== undefined) {
      setIsReviewView(isReview(workshop, userProfile));
    }
  }, [isVisitor, isWorkshopLoading, workshop, userProfile]);

  return (
    <>
      <LoadingScreen isOpen={isWorkshopLoading || workshop === undefined} />
      {isVisitorView && <ViewAtelierVisitorPageContainer atelier={workshop} />}
      {isWorkshopView && <ViewAtelierPageContainer atelier={workshop} />}
      {isReviewView && <WorkshopReviewPage atelier={workshop} />}
    </>
  );
}

WorkshopViewPageLoader.propTypes = {
  userProfile: userProfilePropTypes,
  isVisitor: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  userProfile: state.userProfile,
  isVisitor: state.application.isVisitor,
});

export default connect(mapStateToProps)(WorkshopViewPageLoader);
