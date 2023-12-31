// React/Redux
import React from "react";
// Misc
import { identity } from "underscore";
// Saltymotion
import { getGame, getGames, sampleGames } from "../api/saltymotionApi";

const GameHook = {
  /**
   * Custom hook
   * Load a game description if an ID is specified, otherwise load all games
   * @param {number} [ID]
   * @param {function} [normalizer]
   * @return {(Game|boolean)[]}
   */
  useLoader({ ID, normalizer = identity }) {
    const [game, setGame] = React.useState(undefined);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      let isActive = true;
      const [gamePromise, gameXHR] = ID === undefined ? getGames({}) : getGame({ gameID: ID });
      gamePromise
        .then((result) => {
          if (isActive) {
            setGame(normalizer(result));
          }
        })
        .catch((err) => {
          console.error(err);
          if (isActive) {
            setGame(undefined);
          }
        })
        .finally(() => {
          if (isActive) {
            setIsLoading(false);
          }
        });

      return () => {
        isActive = false;
        gameXHR.abort();
      };
    }, [ID, normalizer]);
    return [game, isLoading];
  },

  /**
   * Custom hook
   * Sample games
   * @param {number} count
   * @param {function} [normalizer]
   * @return {(Game[]|boolean)[]}
   */
  useSampler({ count, normalizer = identity }) {
    const [games, setGames] = React.useState(undefined);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
      if (count === 0) {
        setGames([]);
        setIsLoading(false);
        return null;
      }
      let isActive = true;
      // Actually sample some items...
      setIsLoading(true);
      const [gamesPromise, gamesXHR] = sampleGames({ count });
      gamesPromise
        .then((results) => {
          if (isActive) {
            setGames(results.map((result) => normalizer(result)));
          }
        })
        .catch((err) => {
          console.error(err);
          if (isActive) {
            setGames(undefined);
          }
        })
        .finally(() => {
          if (isActive) {
            setIsLoading(false);
          }
        });
      return () => {
        gamesXHR.abort();
        isActive = false;
      };
    }, [count, normalizer]);
    return [games, isLoading];
  },
};

export default GameHook;
