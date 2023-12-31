// React/Redux
import React from "react";
// Saltymotion
import GameHook from "../../lib/hooks/game";
import TagHook from "../../lib/hooks/tag";
import CreateWorkshopPageContainer from "./createWorkshopPageContainer";
import LoadingScreen from "../placeholder/loadingScreen";

/**
 * Load data used to render initial view for `create workshop` page
 * @constructor
 */
export default function CreateWorkshopPageLoader() {
  const [games, isLoadingGames] = GameHook.useLoader({});
  const [tags, isLoadingTags] = TagHook.useLoader({});

  return isLoadingGames || isLoadingTags ? (
    <LoadingScreen isOpen />
  ) : (
    <CreateWorkshopPageContainer games={games} tags={tags} />
  );
}
