import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Flex, Spinner, Text } from "@chakra-ui/react";
import PageShell from "../../components/layouts/PageShell";
import CountingStatsBanner from "../../components/organisms/stats/CountingStatsBanner";
import { CountingTabGrid } from "../../components/molecules/stats/CountingTabRow";
import { CountingTable } from "../../components/organisms/stats/CountingTable";
import { PenaltyMatrix } from "../../components/organisms/stats/PenaltyMatrix";
import { SectionEyebrow } from "../../components/atoms/SectionEyebrow";
import { useCountingTeamStats, useCountingSeason, useCountingPenalties } from "../../hooks/useSWACData";
import { useCountingIndex } from "../../hooks/useCountingStats";
import { TEAM_STATS_TABS, TEAM_STATS_TAB_IDS, TEAM_STATS_TABLES, DEFAULT_TEAM_STATS_TAB } from "./countingStatsTabs";

// ─────────────────────────────────────────────────────────────────────────────
// TEAM STATS — /stats/team
//
// The conference sites' team counting-stat tables (Sidearm), in house
// styling: ten tabs as a 4x1 slot under the banner (a 5 x 2 grid that now
// fills exactly), and under that Offense then Defense at full width —
// stacked, not side by side, so a 12-column table never has to scroll. Tabs
// with more than one table (Returns, Kicking, Conversions) run those tables
// in sequence inside each side.
//
// Penalties is the one tab that is not a Sidearm table: it is the whole
// discipline picture as a single foul x team matrix. See PenaltyMatrix.
//
// Data is the backend's stats/counting/team_{season}.json and
// penalties_{season}.json (Counting Stats Fetch Contract), League games only.
// Nothing here is computed from game files.
// ─────────────────────────────────────────────────────────────────────────────


const SourceTag = ({ gamesThrough }) =>
  gamesThrough?.label ? (
    <Text fontSize="clamp(0.55rem, 0.65vw, 0.7rem)" fontWeight="black" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.16em">
      Through {gamesThrough.label}
    </Text>
  ) : null;

const TeamCountingStatsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TEAM_STATS_TAB_IDS.includes(searchParams.get("tab")) ? searchParams.get("tab") : DEFAULT_TEAM_STATS_TAB;
  // Opens on the backend's current season; the banner can pick any other.
  const [pickedSeason, setSeason] = useState(null);
  const season = useCountingSeason(pickedSeason);
  const countingSeasons = useCountingIndex().seasons;
  const [conference, setConference] = useState("all");
  const data = useCountingTeamStats(season);
  const penalties = useCountingPenalties(season);

  const rows = useMemo(
    () => (conference === "all" ? data.teams : data.teams.filter((t) => t.conference === conference)),
    [data.teams, conference],
  );
  const tables = TEAM_STATS_TABLES[tab] ?? [];

  // Columns come off the same conference-filtered rows the tables use, so the
  // banner's conference control narrows the matrix too.
  const penaltyTeams = useMemo(
    () => rows.map((t) => ({ id: t.team_id, short: t.short, name: t.name, logo: `/assets/${t.team_id}.svg` })),
    [rows],
  );

  const body = data.isLoading ? (
    <Flex justify="center" py={16}><Spinner color="brand.500" size="lg" /></Flex>
  ) : tab === "penalties" ? (
    <PenaltyMatrix teams={penaltyTeams} file={penalties.file} />
  ) : (
    <Flex direction="column" gap={6}>
      {["offense", "defense"].map((side) => (
        <Flex key={side} direction="column" gap={3} minW={0}>
          <SectionEyebrow mb={0} rightContent={<SourceTag gamesThrough={data.gamesThrough} />}>
            {side === "offense" ? "Offense" : "Defense"}
          </SectionEyebrow>
          {tables.map((table) => (
            <CountingTable key={`${side}-${table.id}`} table={table} rows={rows} blockRoot={side} kind="team" />
          ))}
        </Flex>
      ))}
    </Flex>
  );

  return (
    <PageShell listContent={body}>
      <PageShell.Slot cols={4}>
        <CountingStatsBanner
          title="Team Stats"
          ghost="TOTALS"
          season={season}
          setSeason={setSeason}
          seasons={countingSeasons}
          conference={conference}
          setConference={setConference}
        />
      </PageShell.Slot>

      <PageShell.Slot cols={4}>
        <CountingTabGrid tabs={TEAM_STATS_TABS} value={tab} onChange={(id) => setSearchParams({ tab: id })} />
      </PageShell.Slot>
    </PageShell>
  );
};

export default TeamCountingStatsPage;
