import { useState } from "react";
import { Box } from "@chakra-ui/react";
import PageShell from "../../components/layouts/PageShell";
import { ConferenceSlateMatrixA, ConferenceSlateMobile } from "../../components/molecules/game/ConferenceSlateMatrix";
import { GAME_CENTER_DEFAULT_SEASON } from "../../components/molecules/game/SeasonSelector";
import { BannerSchedule } from "../../components/organisms/test/BannerSchedule";
import { useFootballCurrentContext } from "../../hooks/useFootballCurrentContext";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";

const ConferenceSlatePage = () => {
  // Open on the live season, not a hardcoded year. The selector sets an override;
  // until it does, current context decides which slate the page lands on.
  const { currentSeason } = useFootballCurrentContext();
  const [seasonOverride, setSeason] = useState(null);
  const season = seasonOverride ?? currentSeason ?? GAME_CENTER_DEFAULT_SEASON;
  const { isMobile } = useLayoutDensity();

  if (isMobile) {
    return (
      <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
        <BannerSchedule season={season} setSeason={setSeason} />
        <ConferenceSlateMobile season={season} />
      </Box>
    );
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <BannerSchedule season={season} setSeason={setSeason} />
      </PageShell.Slot>

      <PageShell.Slot cols={4} rows={4}>
        <ConferenceSlateMatrixA season={season} />
      </PageShell.Slot>
    </PageShell>
  );
};

export default ConferenceSlatePage;
