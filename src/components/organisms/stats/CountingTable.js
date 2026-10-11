import { useMemo, useState } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { StatTable } from "../../molecules/stats/StatTable";
import { SectionEyebrow } from "../../atoms/SectionEyebrow";
import teamsData from "../../../data/teams.json";

// ─────────────────────────────────────────────────────────────────────────────
// COUNTING TABLE
//
// One Sidearm-style stat table: rank · name · G · the tab's columns. Rank is
// the position under the table's default sort (desc), and re-ranks when the
// reader sorts another column. Used by both /stats/team (rows = teams) and
// /stats/player (rows = players). Column definitions come from
// src/pages/stats/countingStatsTabs.js; this file only formats and sorts.
// ─────────────────────────────────────────────────────────────────────────────

const TEAM_BY_V5 = Object.fromEntries(teamsData.teams.map((t) => [t.exportId.replace(/25$/, ""), t]));

const getPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

const clock = (seconds) => {
  if (!Number.isFinite(seconds)) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const formatCell = (value, col) => {
  if (value == null) return "—";
  if (col.split) return String(value);
  if (col.clock) return clock(value);
  if (col.pct) return (value * 100).toFixed(1);
  if (typeof value === "number") return col.dec != null ? value.toFixed(col.dec) : String(value);
  return String(value);
};

const TeamCell = ({ teamId, navigate }) => {
  const team = TEAM_BY_V5[teamId];
  return (
    <Flex
      as="button"
      type="button"
      align="center"
      gap={2}
      minW={0}
      textAlign="left"
      color="text.primary"
      onClick={() => team && navigate(`/teams/${team.id}`)}
      _hover={{ color: "brand.400" }}
    >
      {team?.logo && <Image src={team.logo} alt="" w="18px" h="18px" objectFit="contain" flexShrink={0} />}
      <Text fontSize="11px" fontWeight="800" color="inherit" textTransform="uppercase" letterSpacing="0.02em" lineClamp={1}>
        {team?.name ?? teamId}
      </Text>
    </Flex>
  );
};

const PlayerCell = ({ row, navigate }) => {
  const team = TEAM_BY_V5[row.team_id];
  return (
    <Flex
      as="button"
      type="button"
      align="center"
      gap={2}
      minW={0}
      textAlign="left"
      color="text.primary"
      onClick={() => navigate(`/player/${row.person_id}`)}
      _hover={{ color: "brand.400" }}
    >
      {team?.logo && <Image src={team.logo} alt="" w="16px" h="16px" objectFit="contain" flexShrink={0} />}
      <Text fontSize="11px" fontWeight="800" color="inherit" lineClamp={1}>
        {row.name}
        <Text as="span" fontWeight="600" color="text.muted"> ({team?.shortName ?? row.team_id})</Text>
      </Text>
    </Flex>
  );
};

/**
 * @param {object} props
 * @param {object} props.table   — { id, title, block, columns, defaultSort, minKey, min } from countingStatsTabs
 * @param {Array}  props.rows    — teams[] or players[]; each row's stats live at row[block] (team: row[side][block])
 * @param {string} [props.blockRoot] — "offense" | "defense" for team rows; omitted for players
 * @param {"team"|"player"} props.kind
 * @param {number} [props.limit] — cap rows (player tables show 25 like the source)
 */
export const CountingTable = ({ table, rows, blockRoot, kind, limit, eyebrowRight }) => {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState(table.defaultSort);
  const [sortDir, setSortDir] = useState("desc");

  const blockPath = blockRoot ? `${blockRoot}.${table.block}` : table.block;

  const prepared = useMemo(() => {
    const list = rows
      .map((row) => ({ row, stats: getPath(row, blockPath) }))
      .filter(({ stats }) => stats && (table.minKey == null || (stats[table.minKey] ?? 0) >= table.min));
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      const av = a.stats[sortKey]; const bv = b.stats[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string" || typeof bv === "string") return String(av).localeCompare(String(bv)) * dir;
      return (av - bv) * dir;
    });
    return limit ? list.slice(0, limit) : list;
  }, [rows, blockPath, sortKey, sortDir, table.minKey, table.min, limit]);

  const onSort = (key) => {
    if (key === "rank" || key === "name") return;
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const columns = [
    { key: "rank", label: "", w: "2rem", align: "right", sortable: false },
    { key: "name", label: kind === "team" ? "Team" : "Player", w: "minmax(11rem, 2.2fr)", align: "left", sortable: false },
    { key: "games", label: "G", w: "2.4rem" },
    ...table.columns.map((c) => ({ ...c, w: c.w ?? "minmax(3.2rem, 1fr)" })),
  ];

  const tableRows = prepared.map(({ row, stats }, i) => ({
    id: kind === "team" ? row.team_id : row.person_id,
    cells: {
      rank: { text: String(i + 1), tone: "muted" },
      name: { node: kind === "team" ? <TeamCell teamId={row.team_id} navigate={navigate} /> : <PlayerCell row={row} navigate={navigate} /> },
      games: { text: String(row.games ?? "—") },
      // Every figure at full weight — the sorted column is marked in the
      // header, not by dimming the other eleven.
      ...Object.fromEntries(table.columns.map((c) => [c.key, { text: formatCell(stats[c.key], c), tone: "default" }])),
    },
  }));

  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflow="hidden">
      {table.title && (
        <Box px={4} pt={3}>
          <SectionEyebrow mb={0} rightContent={eyebrowRight}>{table.title}</SectionEyebrow>
        </Box>
      )}
      {!table.title && eyebrowRight && (
        <Flex px={4} pt={3} justify="flex-end">{eyebrowRight}</Flex>
      )}
      {tableRows.length ? (
        <StatTable columns={columns} rows={tableRows} onSort={onSort} sortKey={sortKey} sortDir={sortDir} />
      ) : (
        <Text px={4} py={6} fontSize="sm" color="text.muted" fontStyle="italic">No rows clear the floor for this table.</Text>
      )}
    </Box>
  );
};

export default CountingTable;
