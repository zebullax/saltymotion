// React/Redux
import React from "react";
// Saltymotion
import { getTag, getTags } from "../api/saltymotionApi";

const TagHook = {
  /**
   * Custom hook
   * Load a tag description if an ID is specified, otherwise load all tags
   * @param {number} [ID]
   * @return {(Tag|boolean)[]}
   */
  useLoader({ ID }) {
    const [tag, setTag] = React.useState(undefined);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      let isActive = true;
      const [tagPromise, tagXHR] = ID === undefined ? getTags({}) : getTag(ID);
      tagPromise
        .then((result) => {
          if (isActive) {
            setTag(result);
          }
        })
        .catch(() => {
          if (isActive) {
            setTag(undefined);
          }
        })
        .finally(() => {
          if (isActive) {
            setIsLoading(false);
          }
        });

      return () => {
        isActive = false;
        tagXHR.abort();
      };
    }, [ID]);
    return [tag, isLoading];
  },
};

export default TagHook;
