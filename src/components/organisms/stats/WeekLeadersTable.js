import { useNavigate } from "react-router-dom";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { StatTable } from "../../molecules/stats/StatTable";
import { SectionEyebrow } from "../../atoms/SectionEyebrow";
import teamsData from "../../../data/teams.json";

// ─────────────────────────────────────────────────────────────────────────────
// WEEK LEADERS TABLE — the Player Stats page's "Week" view: one category's top 10
// for one week, as the backend ranks it (stats/leaders/{season}/week_{n}.json,
// Player Leaders Fetch Contract). Same table language as the season tables:
// rank · player · the game · the category's own columns. Ranks and order are
// the file's; nothing is sorted or summed here.
// ─────────────────────────────────────────────────────────────────────────────

const TEAM_BY_V5 = Object.fromEntries(teamsData.teams.map((t) => [t.exportId.replace(/25$/, ""), t]));

const n = (v) => (v == null ? "—" : Number.isInteger(v) ? String(v) : Number(v).toFixed(1));

// Per category: the columns after rank / player / game. `value` is the row's headline number.
const COLUMNS = {
  passing: [["C/ATT", (r) => `${n(r.completions)}/${n(r.attempts)}`], ["YDS", (r) => n(r.value)], ["TD", (r) => n(r.touchdowns)], ["INT", (r) => n(r.interceptions)]],
  rushing: [["ATT", (r) => n(r.carries)], ["YDS", (r) => n(r.value)], ["TD", (r) => n(r.touchdowns)], ["LONG", (r) => n(r.long)]],
  receiving: [["REC", (r) => n(r.receptions)], ["YDS", (r) => n(r.value)], ["TD", (r) => n(r.touchdowns)], ["LONG", (r) => n(r.long)]],
  tackles: [["SOLO", (r) => n(r.solo)], ["AST", (r) => n(r.assisted)], ["TFL", (r) => n(r.tfl)], ["TOT", (r) => n(r.value)]],
  sacks: [["SACKS", (r) => n(r.value)], ["YDS", (r) => n(r.sack_yards)], ["TFL", (r) => n(r.tfl)], ["HRY", (r) => n(r.qb_hurries)], ["FF", (r) => n(r.forced_fumbles)]],
  interceptions: [["INT", (r) => n(r.value)], ["RET YDS", (r) => n(r.return_yards)], ["TD", (r) => n(r.touchdowns)], ["PBU", (r) => n(r.pass_breakups)]],
  // Boards added 2026-10-25 (Player Leaders Weekly Categories Backend Request).
  scoring: [["TD", (r) => n(r.touchdowns)], ["FG", (r) => n(r.field_goals)], ["PAT", (r) => n(r.pats)], ["2XP", (r) => n(r.two_point)], ["PTS", (r) => n(r.value)]],
  punt_returns: [["NO", (r) => n(r.returns)], ["YDS", (r) => n(r.value)], ["TD", (r) => n(r.touchdowns)], ["LONG", (r) => n(r.long)]],
  kick_returns: [["NO", (r) => n(r.returns)], ["YDS", (r) => n(r.value)], ["TD", (r) => n(r.touchdowns)], ["LONG", (r) => n(r.long)]],
  total_offense: [["RUSH", (r) => n(r.rush_yards)], ["PASS", (r) => n(r.pass_yards)], ["PLAYS", (r) => n(r.plays)], ["TOTAL", (r) => n(r.value)]],
  all_purpose: [["RUSH", (r) => n(r.rush_yards)], ["RCV", (r) => n(r.receiving_yards)], ["PR", (r) => n(r.punt_return_yards)], ["KR", (r) => n(r.kick_return_yards)], ["YDS", (r) => n(r.value)]],
  punting: [["NO", (r) => n(r.punts)], ["YDS", (r) => n(r.yards)], ["AVG", (r) => n(r.value)], ["LONG", (r) => n(r.long)], ["I20", (r) => n(r.inside_20)], ["TB", (r) => n(r.touchbacks)]],
  field_goals: [["FGM", (r) => n(r.made ?? r.value)], ["FGA", (r) => n(r.attempts)], ["LONG", (r) => n(r.long)]],
  tfl: [["TFL", (r) => n(r.value)], ["YDS", (r) => n(r.tfl_yards)], ["SACKS", (r) => n(r.sacks)]],
  fumbles: [["FF", (r) => n(r.value)], ["FR", (r) => n(r.recoveries)], ["FR YDS", (r) => n(r.recovery_yards)], ["TD", (r) => n(r.touchdowns)]],
  pass_defense: [["BRUP", (r) => n(r.pass_breakups)], ["INT", (r) => n(r.interceptions)], ["PD", (r) => n(r.value)], ["QBH", (r) => n(r.qb_hurries)], ["BLK", (r) => n(r.blocks)]],
};

const shortOf = (id) => TEAM_BY_V5[id]?.shortName ?? String(id ?? "").toUpperCase();

const PlayerCell = ({ row, navigate }) => {
  const team = TEAM_BY_V5[row.team_id];
  return (
    <Flex as="button" type="button" align="center" gap={2} minW={0} textAlign="left" color="text.primary" onClick={() => navigate(`/player/${row.person_id}`)} _hover={{ color: "brand.400" }}>
      {team?.logo && <Image src={team.logo} alt="" w="16px" h="16px" objectFit="contain" flexShrink={0} />}
      <Text fontSize="11px" fontWeight="800" color="inherit" lineClamp={1}>
        {row.display_name}
        <Text as="span" fontWeight="600" color="text.muted"> ({shortOf(row.team_id)}{row.position ? ` · ${row.position}` : ""}{row.class_year ? ` · ${row.class_year}` : ""})</Text>
      </Text>
    </Flex>
  );
};

// "vs. BCU  W 55-17": the game the number came from.
const GameCell = ({ row }) => (
  <Text fontSize="11px" fontWeight="700" color="text.secondary" lineClamp={1}>
    {row.home_away === "away" ? "at" : "vs."} {shortOf(row.opponent_team_id)}{" "}
    <Text as="span" fontWeight="900" color={row.result === "W" ? "#48BB78" : "#ED8936"}>{row.result} {row.score}</Text>
  </Text>
);

export const WeekLeadersTable = ({ category, rows, weekLabel, dateLabel, loading = false, missing = false }) => {
  const navigate = useNavigate();
  const cols = COLUMNS[category?.id] ?? [];
  const columns = [
    { key: "rank", label: "", w: "2rem", align: "right", sortable: false },
    { key: "name", label: "Player", w: "minmax(13rem, 2.2fr)", align: "left", sortable: false },
    { key: "game", label: "Game", w: "minmax(9rem, 1.4fr)", align: "left", sortable: false },
    ...cols.map(([label]) => ({ key: label, label, w: "minmax(3.2rem, 1fr)", sortable: false })),
  ];
  const tableRows = (rows ?? []).map((r) => ({
    id: `${r.person_id}-${r.game_path_id}`,
    cells: {
      rank: { text: String(r.rank), tone: "muted" },
      name: { node: <PlayerCell row={r} navigate={navigate} /> },
      game: { node: <GameCell row={r} /> },
      ...Object.fromEntries(cols.map(([label, get]) => [label, { text: get(r), tone: "default" }])),
    },
  }));

  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflow="hidden">
      <Box px={4} pt={3}>
        <SectionEyebrow mb={0} rightContent={<Text fontSize="clamp(0.55rem, 0.65vw, 0.7rem)" fontWeight="black" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.16em">{category?.note ?? dateLabel}</Text>}>
          {category?.label ?? "Leaders"} · {weekLabel}
        </SectionEyebrow>
      </Box>
      {tableRows.length ? (
        <StatTable columns={columns} rows={tableRows} />
      ) : (
        <Text px={4} py={6} fontSize="sm" color="text.muted" fontStyle="italic">
          {loading ? "Loading…" : missing ? "No weekly leaders file for this week." : "No leaders in this view."}
        </Text>
      )}
    </Box>
  );
};

export default WeekLeadersTable;
