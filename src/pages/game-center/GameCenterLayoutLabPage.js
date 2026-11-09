import { useQuery } from "@tanstack/react-query";
import { LAB_SEASON, SIDEBAR_TABS, DASHGRAPH_DEFS } from "./layoutLab/layoutLabConfig";
import { useMemo } from "react";
import { buildLayoutLabModel } from "./layoutLab/layoutLabModel";
import { PageShellDesktop, SidebarTabs } from "../../components/layouts/dashboard";
import { Box, Text } from "@chakra-ui/react";
import { DesktopBoard4x, Slot4x1, Banner4x1, Slot1x1, Slot1x3 } from "../../components/molecules/layouts";
import GameCardStyleLab from "../../components/molecules/game/GameCardStyleLab";
import { ScheduleRailList } from "./layoutLab/ScheduleRail";
import { TopThreeStandingsCard, ScheduleHeadlineCard, UpcomingStretchCard, TeamFormCard, RecordSplitCard } from "../../components/molecules/game/GameCenterLabCards";

const fetcher = async (path) => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
};

const GameCenterLayoutLabPage = () => {
  const { data } = useQuery({
    queryKey: ["game-center-layout-lab", LAB_SEASON],
    queryFn: () => fetcher(`/data/1-game center/schedules/by_year/${LAB_SEASON}.json`),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const games = useMemo(() => data?.games ?? [], [data?.games]);

  const { featuredGames, scheduleRailCards, quickCards } = useMemo(() => buildLayoutLabModel(games), [games]);

  return (
    <PageShellDesktop
      sidebar={<SidebarTabs sectionLabel="Game Center" tabs={SIDEBAR_TABS} />}
      contentMaxW="1200px"
    >
      <Box mb={4}>
        <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.12em">
          Visual Map
        </Text>
        <Text fontSize="sm" color="text.secondary" mt={1}>
          Approved direction: 4 completed-result cards up top, 1x3 schedule rail on the left, and the remaining hub modules to the right.
        </Text>
      </Box>

      <DesktopBoard4x autoRows="minmax(200px, auto)" gap={5}>
        <Slot4x1>
          <Banner4x1
            kicker="Game Center Lab"
            headline="Game Center Tactical Board"
            description="Desktop reference layout using the current accepted card language: recent finals, a stacked 1x3 schedule rail, and remaining intelligence modules."
            meta="Banner is fixed 4x1"
          />
        </Slot4x1>

        {Array.from({ length: 4 }).map((_, index) => {
          const game = featuredGames[index] ?? null;
          return (
            <Slot1x1 key={`game-${index + 1}`}>
              {game ? <GameCardStyleLab card={game} variant="broadcast" /> : null}
            </Slot1x1>
          );
        })}

        <Slot1x3>
          <ScheduleRailList cards={scheduleRailCards} />
        </Slot1x3>

        {DASHGRAPH_DEFS.map((card) => (
          <Slot1x1 key={card.id}>
            {card.id === "swac-west-top3" ? (
              <TopThreeStandingsCard title={card.title} rows={quickCards.swacWestTop3} />
            ) : card.id === "swac-east-top3" ? (
              <TopThreeStandingsCard title={card.title} rows={quickCards.swacEastTop3} />
            ) : card.id === "meac-top3" ? (
              <TopThreeStandingsCard title={card.title} rows={quickCards.meacTop3} />
            ) : card.id === "game-of-week" ? (
              <ScheduleHeadlineCard title={card.title} game={quickCards.gameOfWeek} footer="92.4 Glory Excitement Rating" />
            ) : card.id === "look-ahead" ? (
              <ScheduleHeadlineCard title={card.title} game={quickCards.lookAhead} footer="Glory Ranked 2 vs 5" />
            ) : card.id === "upcoming-stretch" ? (
              <UpcomingStretchCard team={quickCards.upcomingStretch.team} games={quickCards.upcomingStretch.games} summary={quickCards.upcomingStretch.summary} />
            ) : card.id === "team-form" ? (
              <TeamFormCard team={quickCards.teamForm.team} results={quickCards.teamForm.results} />
            ) : card.id === "home-heroes" ? (
              <RecordSplitCard title={card.title} team={quickCards.homeHeroes.team} record={quickCards.homeHeroes.record} detail={quickCards.homeHeroes.detail} />
            ) : (
              <RecordSplitCard title={card.title} team={quickCards.roadWorld.team} record={quickCards.roadWorld.record} detail={quickCards.roadWorld.detail} />
            )}
          </Slot1x1>
        ))}
      </DesktopBoard4x>
    </PageShellDesktop>
  );
};

export default GameCenterLayoutLabPage;
