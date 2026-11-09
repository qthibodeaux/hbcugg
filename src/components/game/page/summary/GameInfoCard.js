import { useLayoutDensity, LAYOUT_DENSITY } from "../../../../hooks/useLayoutDensity";
import { GameInfoPassport } from "./GameInfoPassport";

// Existing mobile/summary presentation extracted without behavior changes.

export const GameInfoCard = ({ meta, awayId, homeId }) => {
  const { density } = useLayoutDensity();
  const cardVariant = density === LAYOUT_DENSITY.STANDARD ? "standard" : "compact";

  return (
    <GameInfoPassport meta={meta} homeId={homeId} variant={cardVariant} />
  );
};
