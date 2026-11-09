import { useGameCenterHubData } from "../../hooks/useGameCenterHubData";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { GameCenterMobile, LabButton, OffSeasonMessage } from "../../components/molecules/game/hub/GameCenterHubViews";
import PageShell from "../../components/layouts/PageShell";
import { IS_DEMO } from "../../config/demo";
import { Flex, Spinner, Box } from "@chakra-ui/react";
import { BannerGameCenter } from "../../components/organisms/test/BannerGameCenter";
import { WeekRecapExport } from "../../components/game/recap/WeekRecapExport";
import { GameCenterFeaturedGameCard } from "../../components/molecules/game/GameCenterFeaturedGameCard";
import { GameCenterResultsRail } from "../../components/molecules/game/GameCenterResultsRail";
import { TopThreeStandingsCard } from "../../components/molecules/game/GameCenterLabCards";
import { renderContextCard } from "../../components/molecules/game/GameCenterContextCard";

const GameCenterPage = () => {
  const {
    season,
    isLoading,
    featuredGames,
    scheduleRailCards,
    standings,
    contextCards,
    isEmpty,
  } = useGameCenterHubData();
  const { isMobile } = useLayoutDensity();

  if (isMobile) {
    return (
      <GameCenterMobile
        season={season}
        isLoading={isLoading}
        isEmpty={isEmpty}
        featuredGames={featuredGames}
        scheduleRailCards={scheduleRailCards}
        standings={standings}
        contextCards={contextCards}
      />
    );
  }

  return (
    <PageShell>
      {!IS_DEMO && <LabButton />}
      {isLoading ? (
        <PageShell.Slot cols={4}>
          <Flex justify="center" align="center" h="full">
            <Spinner color="brand.500" size="lg" />
          </Flex>
        </PageShell.Slot>
      ) : (<>
        {/* ── Row 1: Banner ── the hub is a live document; no season control. */}
        <PageShell.Slot cols={4}>
          <Box position="relative" h="full">
            <BannerGameCenter />
            <WeekRecapExport />
          </Box>
        </PageShell.Slot>

        {isEmpty ? (
          <PageShell.Slot cols={4}>
            <OffSeasonMessage season={season} />
          </PageShell.Slot>
        ) : standings ? (<>
          {/* ── Row 2: Featured game cards ── */}
          {featuredGames.map((game, index) => (
            <PageShell.Slot key={`game-${index + 1}`} cols={1}>
              <GameCenterFeaturedGameCard game={game} />
            </PageShell.Slot>
          ))}

          {/* ── Rows 3-5, col 1: Vertical schedule rail ── */}
          <PageShell.Slot cols={1} rows={3}>
            <GameCenterResultsRail cards={scheduleRailCards} />
          </PageShell.Slot>

          {/* ── Row 3, cols 2-4: Standings ── */}
          <PageShell.Slot cols={1}>
            <TopThreeStandingsCard title="SWAC West" rows={standings.swacWest.rows} metric={standings.swacWest.metric} defendingChampion={standings.swacWest.defendingChampion} conferencePlayBegins={standings.swacWest.conferencePlayBegins} />
          </PageShell.Slot>
          <PageShell.Slot cols={1}>
            <TopThreeStandingsCard title="SWAC East" rows={standings.swacEast.rows} metric={standings.swacEast.metric} defendingChampion={standings.swacEast.defendingChampion} conferencePlayBegins={standings.swacEast.conferencePlayBegins} />
          </PageShell.Slot>
          <PageShell.Slot cols={1}>
            <TopThreeStandingsCard title="MEAC" rows={standings.meac.rows} metric={standings.meac.metric} defendingChampion={standings.meac.defendingChampion} conferencePlayBegins={standings.meac.conferencePlayBegins} />
          </PageShell.Slot>

          {/* ── Rows 4-5, cols 2-4: Context cards ── backend-ranked, rendered
              in arrival order (Hub Design Doc §4). Slot budget is one
              double-wide then four single; fewer than five cards and the
              trailing slots collapse. */}
          {contextCards.map((card, index) => {
            const rendered = renderContextCard(card);
            if (!rendered) return null;
            return (
              <PageShell.Slot key={card.id} cols={index === 0 ? 2 : 1}>
                {rendered}
              </PageShell.Slot>
            );
          })}
        </>) : null}
      </>)}
    </PageShell>
  );
};

export default GameCenterPage;
