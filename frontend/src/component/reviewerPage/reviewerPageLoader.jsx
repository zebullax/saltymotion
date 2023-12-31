// React
import React from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
// Saltymotion
import ReviewerPageContainer from "./reviewerPageContainer";
import userHook from "../../lib/hooks/user";
import LoadingScreen from "../placeholder/loadingScreen";

/**
 * Load initial data required to render the initial reviewer page container
 * @constructor
 * @return {JSX.Element}
 */
function ReviewerPageLoader() {
  const { ID } = useParams();
  const [reviewer, isLoadingReviewer] = userHook.useProfileLoader({ ID });
  return isLoadingReviewer ? (
    <LoadingScreen loadingText="Loading reviewer profile" isOpen={isLoadingReviewer} />
  ) : (
    <ReviewerPageContainer reviewer={reviewer} isLoading={isLoadingReviewer} />
  );
}

export default connect()(ReviewerPageLoader);
