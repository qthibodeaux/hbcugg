import { useState, useMemo } from "react";
import { DEFAULT_SEASON, fetcher, dedupeGames, getGameWeek, getMatchup } from "./weekExperiment/experimentModel";
import { useQuery } from "@tanstack/react-query";
import PageShell from "../../components/layouts/PageShell";
import { Flex, Spinner } from "@chakra-ui/react";
import { WeekBoardBanner } from "./weekExperiment/WeekBoardBanner";
import { WeeklySlateBoard } from "./weekExperiment/WeeklySlateBoard";
import { ResultsHeadlineStrip, UpcomingPreviewStrip } from "./weekExperiment/WeeklyStrips";
import { MetricPoster } from "./weekExperiment/ExperimentPrimitives";
import { TopBillingCard, ConferenceRibbon, HelmetWall } from "./weekExperiment/FeaturedGamePanels";

const WeekCentralExperimentPage = () => {
  const [season, setSeason] = useState(DEFAULT_SEASON);
  const [activeWeek, setActiveWeek] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["week-central-experiment", season],
    queryFn: () => fetcher(`/data/1-game center/schedules/by_year/${season}.json`),
    staleTime: Infinity,
    retry: false,
  });

  const { weeks, selectedWeek, slate, completed, upcoming, topBilling, closeGame, avgMargin, activeTeams } = useMemo(() => {
    const games = dedupeGames(data?.games ?? []);
    const weeks = [...new Set(games.map(getGameWeek).filter(Boolean))].sort((a, b) => a - b);
    const defaultWeek = weeks.includes(11) ? 11 : weeks[Math.max(0, weeks.length - 1)];
    const selectedWeek = activeWeek && weeks.includes(activeWeek) ? activeWeek : defaultWeek;
    const slate = games.filter((game) => getGameWeek(game) === selectedWeek).map(getMatchup);
    const completed = slate.filter((game) => game.isFinal);
    const upcoming = slate.filter((game) => !game.isFinal);
    const topBilling = [...completed].sort((a, b) => (b.totalPoints ?? -1) - (a.totalPoints ?? -1))[0] ?? slate[0] ?? null;
    const closeGame = [...completed].sort((a, b) => (a.margin ?? 999) - (b.margin ?? 999))[0] ?? null;
    const margins = completed.map((game) => game.margin).filter((value) => value != null);
    const avgMargin = margins.length ? (margins.reduce((sum, value) => sum + value, 0) / margins.length).toFixed(1) : "--";
    const activeTeams = new Set();
    slate.forEach((game) => {
      if (game.away?.logo) activeTeams.add(game.away.label);
      if (game.home?.logo) activeTeams.add(game.home.label);
    });

    return { weeks, selectedWeek, slate, completed, upcoming, topBilling, closeGame, avgMargin, activeTeams: activeTeams.size };
  }, [data, activeWeek]);

  if (isLoading) {
    return (
      <PageShell>
        <PageShell.Slot cols={4}>
          <Flex h="100%" align="center" justify="center">
            <Spinner color="brand.500" size="lg" />
          </Flex>
        </PageShell.Slot>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <WeekBoardBanner season={season} setSeason={setSeason} week={selectedWeek} setWeek={setActiveWeek} weeks={weeks} slate={slate} />
      </PageShell.Slot>

      <PageShell.Slot cols={4} rows={3}>
        <WeeklySlateBoard slate={slate} />
      </PageShell.Slot>

      <PageShell.Slot cols={2}>
        <ResultsHeadlineStrip completed={completed} />
      </PageShell.Slot>
      <PageShell.Slot cols={2}>
        <UpcomingPreviewStrip upcoming={upcoming} />
      </PageShell.Slot>

      <PageShell.Slot cols={1}>
        <MetricPoster label="Games This Week" value={slate.length} detail={`${completed.length} final, ${upcoming.length} upcoming in the selected week.`} />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <MetricPoster label="Teams Active" value={activeTeams} detail="Unique HBCU programs represented in this weekly slate." accent="#4A90D9" />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <MetricPoster label="Average Margin" value={avgMargin} detail="Calculated only from completed games in the selected week." accent="#F4811F" />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <MetricPoster label="Closest File" value={closeGame?.margin ?? "--"} detail={closeGame ? `${closeGame.away.label} at ${closeGame.home.label}` : "No completed games in this slate."} accent="#A89968" />
      </PageShell.Slot>

      <PageShell.Slot cols={2} rows={2}>
        <TopBillingCard matchup={topBilling} />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <ConferenceRibbon slate={slate} />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <HelmetWall slate={slate} />
      </PageShell.Slot>
    </PageShell>
  );
};

export default WeekCentralExperimentPage;
