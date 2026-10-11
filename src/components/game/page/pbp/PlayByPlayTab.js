import { Box } from "@chakra-ui/react";
import { useMemo } from "react";
import { PlayByPlayPanel } from "../../../molecules/game/PlayByPlayPanel";
import { getTeamLabel, getTeamLogoSrc } from "../utils/teamHelpers";
import { normalizePlays } from "../utils/normalizePlays";

export const PlayByPlayTab = ({ game, awayId, homeId, awayShort, homeShort, drives, mobile = false }) => {
  // The panel expects the nested play schema; the export is flat. See
  // normalizePlays for the mapping.
  const plays = useMemo(() => normalizePlays(game?.play_by_play), [game]);

  return (
    <Box w="full">
      <PlayByPlayPanel
        plays={plays}
        drives={drives}
        awayId={awayId}
        homeId={homeId}
        awayShort={awayShort}
        homeShort={homeShort}
        teamShortFn={getTeamLabel}
        teamLogoFn={getTeamLogoSrc}
        mobile={mobile}
        productionScores={game?.production_scores ?? null}
      />
    </Box>
  );
};
