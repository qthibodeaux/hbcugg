import { useMemo } from "react";
import { buildGameAnalytics } from "../../../../utils/gameAnalytics/gameAnalyticsModel";

export const useGameAnalytics = (game, awayId, homeId) =>
  useMemo(() => buildGameAnalytics(game, awayId, homeId), [game, awayId, homeId]);
