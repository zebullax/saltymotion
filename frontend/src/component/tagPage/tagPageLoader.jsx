// React
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
// Saltymotion
import { getTag, searchAtelier, searchReviewer } from "../../lib/api/saltymotionApi";
import LoadingScreen from "../placeholder/loadingScreen";
import { MAX_SHOWCASE_ATELIER_PER_PAGE } from "../../lib/property";
import { AtelierStatus } from "../../lib/atelierStatus";
import TagPageContainer from "./tagPageContainer";
import { setErrorMessage } from "../../state/app/action";

/**
 * Load required data then render Tag page
 * @param {function} dispatch
 * @return {JSX.Element}
 */
function TagPageLoader({ dispatch }) {
  const [tag, setTag] = React.useState(undefined);
  const [reviewers, setReviewers] = React.useState(undefined);
  const [ateliers, setAteliers] = React.useState(undefined);
  const [isLoading, setIsLoading] = React.useState(true);
  const { ID } = useParams();

  React.useEffect(() => {
    if (ID === undefined) {
      return null;
    }
    const [tagPromise, tagXHR] = getTag(ID);
    const [reviewersPromise, reviewersXHR] = searchReviewer({ tagsID: [ID] });
    const [ateliersPromise, ateliersXHR] = searchAtelier({
      tagsID: [ID],
      offset: 0,
      limit: MAX_SHOWCASE_ATELIER_PER_PAGE,
      atelierStatus: AtelierStatus.Complete,
    });
    const combinedPromise = Promise.all([tagPromise, ateliersPromise, reviewersPromise]);
    let isActive = true;
    combinedPromise
      .then(([tagItems, atelierItems, reviewerItems]) => {
        if (isActive) {
          setTag(tagItems);
          setReviewers(reviewerItems);
          setAteliers(atelierItems.value);
        }
      })
      .catch((e) => {
        console.error(e);
        if (isActive) {
          dispatch(setErrorMessage("Error while loading tag details"));
        }
      })
      .finally(() => setIsLoading(false));
    return () => {
      isActive = false;
      tagXHR.abort();
      reviewersXHR.abort();
      ateliersXHR.abort();
    };
  }, [dispatch, ID]);

  return isLoading ? (
    <LoadingScreen isOpen={isLoading} />
  ) : (
    <TagPageContainer ateliers={ateliers} reviewers={reviewers} tag={tag} />
  );
}

TagPageLoader.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(TagPageLoader);
