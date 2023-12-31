// React
import React from "react";
// Saltymotion
import { getUser, sampleReviewers } from "../api/saltymotionApi";

const ReviewerHook = {
  /**
   * Custom hook
   * Load a reviewer profile
   * @param {string} ID
   * @return {(Reviewer|boolean)[]}
   */
  useProfileLoader({ ID }) {
    const [profile, setProfile] = React.useState(undefined);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
      setIsLoading(true);
      const [reviewerPromise, reviewerXHR] = getUser(ID);
      let isActive = true;
      reviewerPromise
        .then((reviewer) => isActive && setProfile(reviewer))
        .catch(() => isActive && setProfile(undefined))
        .finally(() => setIsLoading(false));
      return () => {
        isActive = false;
        reviewerXHR.abort();
      };
    }, [ID]);
    return [profile, isLoading];
  },

  /**
   * Custom hook
   * Sample reviewer profiles
   * @param {number} count
   * @return {(Reviewer|boolean)[]}
   */
  useProfileSampler({ count }) {
    const [reviewers, setReviewers] = React.useState(undefined);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
      if (count === 0) {
        setReviewers([]);
        setIsLoading(false);
        return null;
      }
      // Actually sample some reviewers
      setIsLoading(true);
      const [reviewersPromise, reviewersXHR] = sampleReviewers({ count });
      let isActive = true;
      reviewersPromise
        .then((results) => isActive && setReviewers(results))
        .catch(() => isActive && setReviewers(undefined))
        .finally(() => setIsLoading(false));
      return () => {
        isActive = false;
        reviewersXHR.abort();
      };
    }, [count]);
    return [reviewers, isLoading];
  },
};

export default ReviewerHook;
