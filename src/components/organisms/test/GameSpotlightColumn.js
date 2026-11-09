import { useState, useRef } from "react";
import useMountEffect from "../../../hooks/useMountEffect";
import { TICK_FADE, TICK_HOLD } from "./gameSpotlight/spotlightPresentation";

export const useGameSpotlight = (games) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  // `games` swaps from MOCK_SEASON_GAMES (mounted before a real profile
  // document loads) to the real, usually-shorter array once it arrives.
  // useMountEffect only runs once, so the modulo below must read the
  // current array via a ref rather than close over the length games had
  // at mount — otherwise it keeps cycling against the old length forever.
  const gamesRef = useRef(games);
  gamesRef.current = games;

  useMountEffect(() => {
    if (!gamesRef.current.length) return undefined;
    let current = 0;
    let fadeTimer;
    let holdTimer;

    const cycle = () => {
      setVisible(true);
      holdTimer = setTimeout(() => {
        setVisible(false);
        fadeTimer = setTimeout(() => {
          const len = gamesRef.current.length || 1;
          current = (current + 1) % len;
          setIndex(current);
          cycle();
        }, TICK_FADE);
      }, TICK_HOLD);
    };

    cycle();
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
    };
  });

  return { index, setIndex, visible };
};

export { MOCK_SEASON_GAMES } from "./gameSpotlight/spotlightPresentation";

export { GameReadout } from "./gameSpotlight/GameReadout";

export { SeasonBarChart } from "./gameSpotlight/SeasonBarChart";
