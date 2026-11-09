import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { TeamCell, PlayerCell, formatCell } from "./countingTable/CountingCells";
import { Box, Flex, Text } from "@chakra-ui/react";
import { SectionEyebrow } from "../../atoms/SectionEyebrow";
import { StatTable } from "../../molecules/stats/StatTable";

const getPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

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
