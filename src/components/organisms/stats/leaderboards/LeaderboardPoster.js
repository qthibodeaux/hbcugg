import { useState } from "react";
import { Box, Flex, Text, Grid } from "@chakra-ui/react";
import { widthOf, POSTER_PAD, COL_GAP, MAX_ROWS } from "./leaderboardPresentation";
import { ExportWordmark } from "../../../molecules/export/ExportWordmark";
import { Photo, Row } from "./LeaderboardRows";
import { BOARD_LABELS } from "../../../../pages/stats/leaderboardSections";

// Full-size standard leaderboard poster composition and column widths.

export const LeaderboardPoster = ({ pal, kind, section, boards, mode, week, tag, season, playersById, teamsById, rankOf, byConference, innerRef }) => {
  const fg = (a) => `rgba(${pal.fg}, ${a})`;
  const [found, setFound] = useState(false);
  const isPlayer = kind === "player";
  const columns = boards.length;
  return (
    <Box ref={innerRef} w={`${widthOf(columns)}px`} bg={pal.bg} color={pal.ink} px={`${POSTER_PAD}px`} pt="32px" pb="40px">
      <Flex align="center" justify="space-between" mb="18px">
        <ExportWordmark ink={pal.ink} accent={pal.brand} size="34px" />
        <Text fontSize="18px" fontWeight="900" color={pal.orange} textTransform="uppercase" letterSpacing="0.08em">{season} · The 18</Text>
      </Flex>
      <Text fontSize={columns > 2 ? "54px" : "46px"} fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.95} letterSpacing="-0.03em">
        {section.title} <Box as="span" color={pal.brand}>— {tag}</Box>
      </Text>
      <Grid templateColumns={`repeat(${Math.max(columns, 2)}, minmax(0,1fr))`} gap={`${COL_GAP}px`} mt="28px">
        {boards.map((b) => {
          const top = b.rows[0] ? rankOf(b.rows[0]) : null;
          const leaders = b.rows.filter((r) => rankOf(r) === top);
          return (
            <Box key={b.id} minW={0}>
              {isPlayer && section.photos && <Photo key={leaders.map((l) => l.person_id).join()} pal={pal} leaders={leaders} mode={mode} week={week} show={found} onFound={() => setFound(true)} />}
              <Text fontSize="26px" fontWeight="950" textTransform="uppercase" letterSpacing="0.01em" borderBottom={`4px solid ${pal.brand}`} display="inline-block" lineHeight={1.1} mb="14px" whiteSpace="nowrap">{BOARD_LABELS[b.id] ?? b.label}</Text>
              <Flex direction="column" gap="8px">
                {b.rows.slice(0, MAX_ROWS).map((r) => (
                  <Row key={`${r.person_id ?? r.team_id}-${r.game_path_id ?? "s"}`} pal={pal} board={b} r={r} rank={rankOf(r)} kind={kind} mode={mode} player={playersById?.[r.person_id]} team={teamsById?.[r.team_id]} winner={rankOf(r) === top} byConference={byConference} />
                ))}
                {b.rows.length === 0 && <Text fontSize="16px" fontWeight="800" color={fg(0.5)} py="20px">—</Text>}
              </Flex>
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
};
