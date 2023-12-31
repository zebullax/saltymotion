// React/Redux
import React from "react";
// Saltymotion
import { getAtelier } from "../api/saltymotionApi";

const WorkshopHook = {
  /**
   * Custom hook to load the workshop description
   * @param {number} ID - Atelier ID
   * @return {[AtelierDescription, boolean]}
   */
  useLoader({ ID }) {
    const [workshop, setWorkshop] = React.useState(undefined);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
      if (ID === undefined) {
        return null;
      }
      const [getAtelierPromise, getAtelierXHR] = getAtelier(ID);
      let isActive = true;
      getAtelierPromise
        .then((atelier) => isActive && setWorkshop(atelier))
        .catch(() => isActive && setWorkshop(undefined))
        .finally(() => isActive && setIsLoading(false));
      return () => {
        getAtelierXHR.abort();
        isActive = false;
      };
    }, [ID]);
    return [workshop, isLoading];
  },
};

export default WorkshopHook;
