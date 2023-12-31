// React
import React from "react";
// Saltymotion
import { getUser } from "../api/saltymotionApi";

const userHook = {
  /**
   * Custom hook
   * Load a user profile
   * @param {string} ID
   * @return {(UserPublicProfile|boolean)[]}
   */
  useProfileLoader({ ID }) {
    const [profile, setProfile] = React.useState(undefined);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
      setIsLoading(true);
      const [userPromise, userXHR] = getUser(ID);
      let isActive = true;
      userPromise
        .then((user) => isActive && setProfile(user))
        .catch(() => isActive && setProfile(undefined))
        .finally(() => isActive && setIsLoading(false));
      return () => {
        isActive = false;
        userXHR.abort();
      };
    }, [ID]);
    return [profile, isLoading];
  },
};

export default userHook;
