import { nameColWidth, scoreColWidth, scoreOf } from "./recapModel";
import { Flex, Text, Box, Grid } from "@chakra-ui/react";
import { POSTER_W, BG, INK, BRAND, GOLD, PANEL } from "./recapPresentation";
import { posterVars } from "../../../molecules/export/posterPalette";
import { Kick, SectionHead } from "./RecapPrimitives";
import { MarginBoard } from "./MarginBoard";
import { Performer, NextRow } from "./PerformerRows";
import { Tile, RecordBook, RacePanel } from "./EventRecordPanels";

export const WeekRecapPoster = ({ recap, games = [], innerRef, scheme = "night", teamStyle = true }) => {
  const rows = recap.games ?? [];
  const items = recap.items ?? [];
  const set = items.find((it) => it.kind === "performance_set");
  // One list, largest PAR first: the top three, then ranks 4 to 10.
  const ranked = [...(set?.data?.players ?? []), ...(set?.data?.next ?? [])].filter((p) => Number.isFinite(p.par)).sort((a, b) => b.par - a.par);
  const performers = ranked.slice(0, 3);
  const next = ranked.slice(3, 10);
  const leader = [...performers, ...next].filter((p) => Number.isFinite(scoreOf(p))).sort((a, b) => scoreOf(b) - scoreOf(a))[0];
  const productionMax = Math.max(0, leader ? scoreOf(leader) : 0);
  const nameW = nameColWidth(performers);
  const scoreW = scoreColWidth(performers);
  const gamesById = Object.fromEntries(games.map((gm) => [gm.game_path_id, gm]));
  // The bottom row: the record book beside the title race.
  const BOTTOM = new Set(["performance_set", "record_book", "race"]);
  const tiles = items.filter((it) => !BOTTOM.has(it.kind)).slice(0, 12);
  const records = items.filter((it) => it.kind === "record_book").slice(0, 3);
  const race = items.find((it) => it.kind === "race") ?? null;
  return (
    <Flex ref={innerRef} direction="column" w={`${POSTER_W}px`} bg={BG} color={INK} style={posterVars(scheme)} px="56px" pt="36px" pb="28px" gap="18px" overflow="hidden">
      <Flex align="flex-end" justify="space-between" gap="24px">
        <Text fontSize="78px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.88} letterSpacing="-0.04em" whiteSpace="nowrap">
          How Saturday <Box as="span" color={BRAND}>Was Won</Box>
        </Text>
        <Kick size={18} color={GOLD} textAlign="right" pb="6px">{recap.week_label} · {recap.date_label} · SWAC + MEAC</Kick>
      </Flex>

      <MarginBoard rows={rows} gamesById={gamesById} />

      {performers.length > 0 && (
        <Box>
          <Flex justify="space-between" align="baseline">
            <SectionHead>Top performers</SectionHead>
            <Kick size={12}>Bar max: {leader?.last_name ?? "—"} · {productionMax.toFixed(1)}</Kick>
          </Flex>
          <Grid templateColumns="minmax(0,0.8fr) minmax(0,1.2fr)" gap="14px" alignItems="stretch">
            <Flex direction="column" gap="10px" h="full">
              {performers.map((p) => <Performer key={p.person_id ?? p.last_name} p={p} games={games} max={productionMax} nameW={nameW} scoreW={scoreW} />)}
            </Flex>
            {next.length > 0 && (
              <Box bg={PANEL} py="4px">
                {next.map((p, i) => <NextRow key={p.person_id ?? `${p.last_name}-${i}`} p={p} rank={i + 4} first={i === 0} max={productionMax} games={games} />)}
              </Box>
            )}
          </Grid>
        </Box>
      )}

      {tiles.length > 0 && (
        <Grid templateColumns="repeat(3, minmax(0,1fr))" gap={0} autoRows="minmax(96px, auto)">
          {tiles.map((it) => <Tile key={it.id} it={it} games={rows} scheme={scheme} teamStyle={teamStyle} />)}
        </Grid>
      )}

      {/* 1 x 2: the record book beside the title race. */}
      {(records.length > 0 || race) && (
        <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" gap="14px" alignItems="stretch">
          {records.length > 0 ? <RecordBook items={records} /> : <Box />}
          {race ? <RacePanel it={race} games={rows} /> : <Box />}
        </Grid>
      )}
    </Flex>
  );
};
