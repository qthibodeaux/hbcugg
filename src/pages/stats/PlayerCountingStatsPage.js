import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Flex, Grid, Spinner, Text } from "@chakra-ui/react";
import PageShell from "../../components/layouts/PageShell";
import CountingStatsBanner from "../../components/organisms/stats/CountingStatsBanner";
import { CountingTabGrid } from "../../components/molecules/stats/CountingTabRow";
import { CountingTable } from "../../components/organisms/stats/CountingTable";
import { LeaderboardsPanel } from "../../components/organisms/stats/LeaderboardsPanel";
import { WeekLeadersTable } from "../../components/organisms/stats/WeekLeadersTable";
import { useLeadersFile, useLeadersIndex } from "../../hooks/usePlayerLeaders";
import { useCountingPlayerStats, useCountingSeason } from "../../hooks/useSWACData";
import { useCountingIndex } from "../../hooks/useCountingStats";
import {
  PLAYER_STATS_SIDES, PLAYER_STATS_TABS, PLAYER_STATS_TABLES, DEFAULT_PLAYER_STATS_TAB, WEEK_CATEGORIES_BY_TAB, playerTabIds,
} from "./countingStatsTabs";

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER STATS — /stats/player
//
// The conference sites' individual leader tables (Sidearm): an Offense /
// Defense side switch in the banner strip, the side's tabs as a 4x1 slot
// under the banner (4 x 2 grid — offense fills it, defense's spare row is
// the season / source tile), and one table per tab — top 25, ranked on the
// tab's default sort, sortable. Tabs with two tables (Returns = PR | KR,
// Overall = Total Offense | All Purpose, TFL · Sacks, Turnovers) render them
// side by side, 50/50.
//
// `side` and `tab` are URL state. Data is useCountingPlayerStats — the
// labelled mock until GET /api/stats/player/{season} ships.
//
// Season | Week: the banner's Week view swaps the table for that week's top 10 in
// the tab you are on (the backend's stats/leaders files); tabs without a weekly
// board keep the season table and say so.
//
// Leaders: the banner's third view. The tab grid gives way to LeaderboardsPanel: Per Game | Week,
// the section, and the poster itself with its Export (the backend's stats/leaderboards).
// ─────────────────────────────────────────────────────────────────────────────

const LIMIT = 25;

const SourceTag = ({ source, gamesThrough }) => (
  <Text fontSize="clamp(0.55rem, 0.65vw, 0.7rem)" fontWeight="black" color={source === "mock" ? "#F6AD55" : "whiteAlpha.500"} textTransform="uppercase" letterSpacing="0.16em">
    {source === "mock" ? "Mock data" : gamesThrough?.label ? `Through ${gamesThrough.label}` : ""}
  </Text>
);

const PlayerCountingStatsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sideParam = searchParams.get("side");
  const side = PLAYER_STATS_SIDES.some((s) => s.id === sideParam) ? sideParam : "offense";
  const tabIds = playerTabIds(side);
  const tab = tabIds.includes(searchParams.get("tab")) ? searchParams.get("tab") : DEFAULT_PLAYER_STATS_TAB[side];
  // Opens on the backend's current season; the banner can pick any other.
  const [pickedSeason, setSeason] = useState(null);
  const season = useCountingSeason(pickedSeason);
  const countingSeasons = useCountingIndex().seasons;
  const [conference, setConference] = useState("all");
  const data = useCountingPlayerStats(season);

  // Season | Week. The weeks a season has come from the leaders index; the picker
  // opens on the latest one (the current week for the live season).
  const [view, setView] = useState("season");
  const [pickedWeek, setPickedWeek] = useState(null);
  const { index: leadersIndex } = useLeadersIndex();
  const weeks = leadersIndex?.seasons?.find((x) => x.season === Number(season))?.weeks ?? [];
  const defaultWeek = Number(season) === leadersIndex?.current?.season ? leadersIndex.current.week : weeks[weeks.length - 1] ?? null;
  const week = weeks.includes(pickedWeek) ? pickedWeek : defaultWeek;
  const weekMode = view === "week" && weeks.length > 0;
  const weekData = useLeadersFile(season, week, weekMode && week != null);

  const setSide = (next) => setSearchParams({ side: next, tab: DEFAULT_PLAYER_STATS_TAB[next] });
  const setTab = (next) => setSearchParams({ side, tab: next });

  const rows = useMemo(() => {
    if (conference === "all") return data.players;
    const prefix = conference.toLowerCase();
    return data.players.filter((p) => p.team_id?.startsWith(prefix));
  }, [data.players, conference]);

  const tables = PLAYER_STATS_TABLES[tab] ?? [];

  // This tab's weekly boards, the ones the file carries, with the conference
  // filter applied. None (the file doesn't have them yet): the season table stays.
  const weekBoards = useMemo(
    () => (WEEK_CATEGORIES_BY_TAB[tab] ?? [])
      .map((id) => weekData.file?.categories?.find((c) => c.id === id))
      .filter(Boolean)
      .map((cat) => ({ cat, rows: conference === "all" ? cat.rows : cat.rows.filter((r) => r.team_id?.startsWith(conference.toLowerCase())) })),
    [weekData.file, tab, conference],
  );
  const showWeek = weekMode && (weekData.isLoading || weekBoards.length > 0);

  const body = view === "leaders" ? (
    <LeaderboardsPanel kind="player" side={side} season={season} conference={conference} />
  ) : showWeek ? (
    <Grid templateColumns={{ base: "1fr", lg: weekBoards.length > 1 ? "repeat(2, minmax(0, 1fr))" : "1fr" }} gap={4} alignItems="start">
      {weekBoards.length === 0 && <WeekLeadersTable category={null} rows={[]} weekLabel={`Week ${week}`} dateLabel="" loading />}
      {weekBoards.map(({ cat, rows: boardRows }) => (
        <WeekLeadersTable key={cat.id} category={cat} rows={boardRows} weekLabel={weekData.file?.week_label ?? `Week ${week}`} dateLabel={weekData.file?.date_label ?? ""} />
      ))}
    </Grid>  ) : data.isLoading ? (
    <Flex justify="center" py={16}><Spinner color="brand.500" size="lg" /></Flex>
  ) : (
    <Flex direction="column" gap={4}>
      {weekMode && (
        <Text fontSize="sm" color="text.muted" fontStyle="italic">
          No weekly board for this tab in {weekData.file?.week_label ?? `Week ${week}`} yet. This tab shows the season.
        </Text>
      )}
      <Grid templateColumns={{ base: "1fr", lg: tables.length > 1 ? "repeat(2, minmax(0, 1fr))" : "1fr" }} gap={4} alignItems="start">
        {tables.map((table) => (
          <CountingTable
            key={table.id}
            table={table.title ? table : { ...table, title: PLAYER_STATS_TABS[side].find((t) => t.id === tab)?.label ?? tab }}
            rows={rows}
            kind="player"
            limit={LIMIT}
            eyebrowRight={<SourceTag source={data.source} gamesThrough={data.gamesThrough} />}
          />
        ))}
      </Grid>
    </Flex>
  );

  // Fills whatever the side's tab count leaves open in the 4 x 2 grid —
  // defense has four tabs, so this spans its second row.
  const contextTile = (
    <Flex gridColumn="1 / -1" direction="row" align="center" justify="center" gap="3cqmin" minW={0} minH={0} px="2cqmin" borderRadius="md" border="1px dashed" borderColor="whiteAlpha.200">
      <Text fontSize="5.5cqmin" fontWeight="black" fontStyle="italic" color="white" lineHeight={1} fontVariantNumeric="tabular-nums">{season}</Text>
      <Text fontSize="2.6cqmin" fontWeight="black" color={data.source === "mock" ? "#F6AD55" : "rgba(255,255,255,0.5)"} textTransform="uppercase" letterSpacing="0.16em" lineClamp={1}>
        {data.source === "mock" ? "Mock data" : data.gamesThrough?.label ? `Through ${data.gamesThrough.label}` : "Season"}
      </Text>
    </Flex>
  );
  const sideTabs = PLAYER_STATS_TABS[side];

  return (
    <PageShell listContent={body}>
      <PageShell.Slot cols={4}>
        <Box position="relative" w="full" h="full">
          <CountingStatsBanner
            title="Player Stats"
            ghost="LEADERS"
            season={season}
            setSeason={setSeason}
            seasons={countingSeasons}
            conference={conference}
            setConference={setConference}
            side={side}
            setSide={setSide}
            sides={PLAYER_STATS_SIDES.map((s) => ({ value: s.id, label: s.label }))}
            views={{ options: [{ value: "season", label: "Season" }, ...(weeks.length > 0 ? [{ value: "week", label: "Week" }] : []), { value: "leaders", label: "Leaders" }], value: view, onChange: setView }}
            weekPicker={week != null ? { value: week, onChange: setPickedWeek, weeks } : null}
          />
        </Box>
      </PageShell.Slot>

      {view !== "leaders" && (
        <PageShell.Slot cols={4}>
          <CountingTabGrid tabs={sideTabs} value={tab} onChange={setTab} columns={4} rows={2} trailing={sideTabs.length < 8 ? contextTile : null} />
        </PageShell.Slot>
      )}
    </PageShell>
  );
};

export default PlayerCountingStatsPage;
