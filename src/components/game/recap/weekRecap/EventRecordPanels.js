import { Flex, Image, Text, Box, Grid } from "@chakra-ui/react";
import { fg, INK, short, TILE_INK, BRAND, PANEL, LINE, GOLD, HILITE, DIM, UP, DOWN, tileTeamId, tileTeamInk } from "./recapPresentation";
import { teamLogo } from "../../export/exportData";
import { Kick } from "./RecapPrimitives";
import { raceLine } from "./recapModel";

const EventBody = ({ it }) => (
  <Flex gap="8px" mt="8px" wrap="wrap">
    {(it.data?.events ?? []).map((e) => (
      <Flex key={`${e.team_id}-${e.game_path_id}`} align="center" gap="6px" px="8px" py="4px" bg={fg(0.06)}>
        <Image src={teamLogo(e.team_id)} alt="" w="22px" h="22px" objectFit="contain" />
        <Text fontSize="14px" fontWeight="900" color={INK} textTransform="uppercase">{short(e.team_id)}</Text>
      </Flex>
    ))}
  </Flex>
);

const CrowdBody = ({ it }) => (
  <Box mt="8px">
    {(it.data?.games ?? []).slice(0, 3).map((g) => (
      <Flex key={g.game_path_id} align="center" gap="8px" h="22px">
        <Image src={teamLogo(g.home_team_id)} alt="" w="20px" h="20px" objectFit="contain" flexShrink={0} />
        <Text flex={1} minW={0} fontSize="13px" fontWeight="700" color={fg(0.75)} lineClamp={1}>{short(g.home_team_id)} · {g.venue_name}</Text>
        <Text fontSize="15px" fontWeight="900" color={INK} fontVariantNumeric="tabular-nums">{Number(g.attendance).toLocaleString()}</Text>
      </Flex>
    ))}
  </Box>
);

// "Won It Anyway": the backend rounds the success rate gap to a whole number ("6"); the tile
// prints the game's own net success edge to one decimal instead ("-5.6%"), from the same file.
const statDisplay = (it, games) => {
  // Only the success rate tile ("out-played and won"); other game results (a series streak, a
  // margin) keep the backend's number.
  if (it.kind !== "game_result" || it.data?.note !== "out-played and won") return it.stat?.display;
  const edge = games.find((g) => g.game_path_id === it.data?.game_path_id)?.net_success_edge;
  if (typeof edge !== "number" || !Number.isFinite(edge)) return it.stat?.display;
  const pts = edge * 100;
  return `${pts > 0 ? "+" : pts < 0 ? "-" : ""}${Math.abs(pts).toFixed(1)}%`;
};

export const Tile = ({ it, games = [], scheme = "night", teamStyle = true }) => {
  const teamId = tileTeamId(it, games);
  const ink = teamStyle ? tileTeamInk(teamId, scheme) : TILE_INK[it.category] ?? BRAND;
  const body = it.kind === "event_set" ? <EventBody it={it} /> : it.kind === "crowd" ? <CrowdBody it={it} /> : null;
  return (
    <Grid position="relative" isolation="isolate" overflow="hidden" templateColumns="150px minmax(0,1fr)" columnGap="16px" alignItems="center" bg={PANEL} borderLeft={`5px solid ${ink}`} boxShadow={`inset -1px -1px 0 ${LINE}`} px="18px" py="10px" minW={0}>
      {teamStyle && teamId && <Image src={teamLogo(teamId)} alt="" aria-hidden="true" position="absolute" left="2%" top="5%" w="38%" h="90%" objectFit="contain" opacity={0.12} pointerEvents="none" zIndex={-1} />}
      <Text position="relative" fontSize={String(statDisplay(it, games) ?? "").length > 5 ? "40px" : "56px"} fontWeight="950" fontStyle="italic" color={ink} lineHeight={0.9} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" textAlign="center" whiteSpace="nowrap">
        {statDisplay(it, games)}
      </Text>
      <Box minW={0}>
        <Text fontSize="17px" fontWeight="900" color={INK} lineHeight={1.2}>{it.title}</Text>
        {/* The crowd tile keeps its sentence above the list; the event tile's logos stand in for it. */}
        {(!body || it.kind === "crowd") && <Text mt="4px" fontSize="15px" fontWeight="600" color={fg(0.7)} lineHeight={1.3}>{it.headline}</Text>}
        {body}
      </Box>
    </Grid>
  );
};

export const RecordBook = ({ items }) => (
  <Flex direction="column" bg={PANEL} px="20px" py="16px" minW={0}>
    <Kick size={13} color={fg(0.65)}>The record book</Kick>
    {items.map((it, i) => {
      const cur = (it.data?.rows ?? []).find((r) => r.is_current);
      return (
        <Grid key={it.id} flex={1} templateColumns="minmax(max-content, 27%) minmax(0,1fr)" columnGap="14px" alignItems="center" py="10px" mt={i ? 0 : "6px"} borderTop={i ? "1px solid" : "none"} borderColor={LINE}>
          <Text whiteSpace="nowrap" fontSize="44px" fontWeight="950" fontStyle="italic" color={GOLD} lineHeight={0.9} fontVariantNumeric="tabular-nums" textAlign="center">{it.stat?.display}</Text>
          <Box minW={0}>
            <Text fontSize="16px" fontWeight="900" color={INK} lineHeight={1.2} lineClamp={2}>{it.data?.fact ?? it.stat?.label}</Text>
            {cur?.who && <Kick size={11} mt="4px">{cur.who}</Kick>}
          </Box>
        </Grid>
      );
    })}
  </Flex>
);

export const RacePanel = ({ it, games = [] }) => (
  <Box bg={PANEL} px="20px" py="16px" minW={0}>
    <Kick size={13} color={fg(0.65)}>{it.data?.group_label ?? it.title} race</Kick>
    <Flex align="center" gap="14px" mt="8px">
      <Text fontSize="44px" fontWeight="950" fontStyle="italic" color={INK} lineHeight={0.9} fontVariantNumeric="tabular-nums">{it.stat?.display}</Text>
      <Text fontSize="16px" fontWeight="800" color={fg(0.85)} lineHeight={1.25} lineClamp={2}>{raceLine(it, games)}</Text>
    </Flex>
    <Box mt="10px">
      {(it.data?.rows ?? []).slice(0, 5).map((r) => {
        const moved = r.prev_rank != null ? r.prev_rank - r.rank : 0;
        const lead = r.rank === 1;
        return (
          <Flex key={r.team_id} align="center" gap="10px" px="10px" h="29px" bg={lead ? HILITE : "transparent"} borderRadius="4px">
            <Text w="18px" fontSize="15px" fontWeight="900" color={lead ? "#0B0B0D" : DIM}>{r.rank}</Text>
            <Image src={teamLogo(r.team_id)} alt="" w="20px" h="20px" objectFit="contain" />
            <Text flex={1} minW={0} fontSize="15px" fontWeight="900" color={lead ? "#0B0B0D" : INK} textTransform="uppercase" lineClamp={1}>{short(r.team_id)}</Text>
            <Text w="34px" fontSize="13px" fontWeight="900" color={lead ? "#0B0B0D" : moved > 0 ? UP : moved < 0 ? DOWN : DIM} textAlign="right">{moved > 0 ? `▲${moved}` : moved < 0 ? `▼${-moved}` : "–"}</Text>
            <Text w="48px" fontSize="14px" fontWeight="800" color={lead ? "#0B0B0D" : fg(0.7)} textAlign="right" fontVariantNumeric="tabular-nums">{r.conference_record}</Text>
            <Text w="54px" fontSize="15px" fontWeight="950" color={lead ? "#0B0B0D" : INK} textAlign="right" fontVariantNumeric="tabular-nums">{r.first_place_chance != null ? `${Math.round(r.first_place_chance * 100)}%` : "—"}</Text>
          </Flex>
        );
      })}
    </Box>
  </Box>
);
