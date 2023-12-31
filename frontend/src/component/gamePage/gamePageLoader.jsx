// React/Redux
import React from "react";
import { useParams } from "react-router-dom";
// Saltymotion
import GameHook from "../../lib/hooks/game";
import GamePageContainer from "./gamePageContainer";
import LoadingScreen from "../placeholder/loadingScreen";
import { getGameReviewers, getGameStatistics, getGameTags } from "../../lib/api/saltymotionApi";
import { REVIEWER_SAMPLE_COUNT } from "../../lib/property";

/**
 * Loading component for game page
 * @return {JSX.Element}
 */
export default function GamePageLoader() {
  const { ID } = useParams();
  const [game, isLoadingGame] = GameHook.useLoader({ ID });
  const [reviewers, setReviewers] = React.useState([]);
  const [gameStatistics, setGameStatistics] = React.useState({ ID: undefined, nbWorkshops: 0, nbReviewers: 0 });
  const [tags, setTags] = React.useState(undefined);
  React.useEffect(() => {
    if (isLoadingGame) return;
    const [getTagsPromise] = getGameTags({ gameID: game.ID, limit: 10 });
    const [getStatisticsPromise] = getGameStatistics({ gameID: game.ID });
    const [getReviewersPromise] = getGameReviewers({ gameID: game.ID, limit: REVIEWER_SAMPLE_COUNT });
    Promise.allSettled([getStatisticsPromise, getTagsPromise, getReviewersPromise]).then(
      ([statResult, tagResult, reviewerResult]) => {
        setGameStatistics(
          statResult.status === "fulfilled" ? statResult.value : { ID: undefined, nbWorkshops: 0, nbReviewers: 0 },
        );
        setTags(tagResult.status === "fulfilled" ? tagResult.value : []);
        setReviewers(
          reviewerResult.status === "fulfilled" ? reviewerResult.value.map(({ ID, profile, stats }) => profile) : [],
        );
      },
    );
  }, [isLoadingGame, game?.ID]);

  return isLoadingGame || tags === undefined ? (
    <LoadingScreen isOpen />
  ) : (
    <GamePageContainer game={game} tags={tags} statistics={gameStatistics} reviewers={reviewers} />
  );
}
