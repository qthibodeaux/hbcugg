import { Flex, Text, Box, Grid } from "@chakra-ui/react";
import { Trophy, BarChart3 } from "lucide-react";
import { Fragment } from "react";
import { getTeamColor, getTeamName, cleanName, pct, toRows, fmt } from "./packetPresentation";

// Retained box-score packet player-stat tables and table layout primitives.

const SectionTitle = ({ children }) => (
  <Flex align="center" gap={2} mb={3}>
    <Trophy size={14} color="#E53E3E" />
    <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">{children}</Text>
  </Flex>
);

const TableBlock = ({ title, children }) => (
  <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" p={4}>
    <SectionTitle>{title}</SectionTitle>
    {children}
  </Box>
);

const DataTable = ({ columns, rows }) => (
  <Box overflowX="auto">
    <Grid templateColumns={`minmax(180px, 1.4fr) repeat(${columns.length - 1}, minmax(70px, 0.55fr))`} gap={2} minW="720px" alignItems="center">
      {columns.map((column, index) => (
        <Text key={column.key} fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" textAlign={index === 0 ? "left" : "right"}>{column.label}</Text>
      ))}
      {rows.map((row) => (
        <Fragment key={row.player_id ?? row.name_raw}>
          {columns.map((column, index) => (
            <Text key={`${row.player_id ?? row.name_raw}-${column.key}`} fontSize="11px" color={index === 0 ? "white" : "text.secondary"} fontWeight={index === 0 ? "black" : "bold"} textAlign={index === 0 ? "left" : "right"} lineClamp={1}>
              {column.render ? column.render(row) : row[column.key] ?? "-"}
            </Text>
          ))}
        </Fragment>
      ))}
    </Grid>
  </Box>
);

export const PlayerStatTables = ({ game }) => {
  const meta = game?.metadata ?? {};
  const teamIds = [meta.away_team, meta.home_team].filter(Boolean);
  const stats = game?.individual_stats ?? {};

  return (
    <Box bg="bg.primary" pb={10}>
      <Box maxW="1400px" mx="auto">
        <Flex align="center" gap={2} mb={4}>
          <BarChart3 size={16} color="#E53E3E" />
          <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase">Traditional Player Box</Text>
        </Flex>
        <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={4}>
          {teamIds.map((teamId) => {
            const teamStats = stats[teamId] ?? {};
            return (
              <Box key={teamId}>
                <Flex align="center" gap={3} mb={3}>
                  <Box w="10px" h="10px" bg={getTeamColor(teamId)} />
                  <Text fontSize="lg" color="white" fontWeight="black">{getTeamName(teamId)}</Text>
                </Flex>
                <Flex direction="column" gap={4}>
                  <TableBlock title="Passing">
                    <DataTable
                      columns={[
                        { key: "name", label: "Player", render: (r) => cleanName(r.name_raw) },
                        { key: "completions", label: "C" },
                        { key: "attempts", label: "A" },
                        { key: "pct", label: "Pct", render: (r) => pct(r.completions, r.attempts) },
                        { key: "yards", label: "Yds" },
                        { key: "touchdowns", label: "TD" },
                        { key: "interceptions", label: "INT" },
                      ]}
                      rows={toRows(teamStats.passing).sort((a, b) => (b.yards ?? 0) - (a.yards ?? 0))}
                    />
                  </TableBlock>
                  <TableBlock title="Rushing">
                    <DataTable
                      columns={[
                        { key: "name", label: "Player", render: (r) => cleanName(r.name_raw) },
                        { key: "attempts", label: "Att" },
                        { key: "yards", label: "Yds" },
                        { key: "avg", label: "Avg", render: (r) => fmt((r.yards ?? 0) / Math.max(1, r.attempts ?? 0), 1) },
                        { key: "touchdowns", label: "TD" },
                        { key: "explosive_carries_10", label: "10+" },
                      ]}
                      rows={toRows(teamStats.rushing).sort((a, b) => (b.yards ?? 0) - (a.yards ?? 0))}
                    />
                  </TableBlock>
                  <TableBlock title="Receiving">
                    <DataTable
                      columns={[
                        { key: "name", label: "Player", render: (r) => cleanName(r.name_raw) },
                        { key: "targets", label: "Tgt" },
                        { key: "receptions", label: "Rec" },
                        { key: "yards", label: "Yds" },
                        { key: "avg", label: "Avg", render: (r) => fmt((r.yards ?? 0) / Math.max(1, r.receptions ?? 0), 1) },
                        { key: "touchdowns", label: "TD" },
                      ]}
                      rows={toRows(teamStats.receiving).sort((a, b) => (b.yards ?? 0) - (a.yards ?? 0))}
                    />
                  </TableBlock>
                  <TableBlock title="Defense">
                    <DataTable
                      columns={[
                        { key: "name", label: "Player", render: (r) => cleanName(r.name_raw) },
                        { key: "tackles", label: "Tkl" },
                        { key: "tfl", label: "TFL" },
                        { key: "sacks", label: "Sack" },
                        { key: "qb_hurries", label: "Hur" },
                        { key: "passes_defended", label: "PD" },
                        { key: "forced_fumbles", label: "FF" },
                      ]}
                      rows={toRows(teamStats.defense).sort((a, b) => (b.tackles ?? 0) - (a.tackles ?? 0)).slice(0, 12)}
                    />
                  </TableBlock>
                </Flex>
              </Box>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};
