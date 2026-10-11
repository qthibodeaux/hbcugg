import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { Share2 } from "lucide-react";
import teamsData from "../../../../data/teams.json";

// ─────────────────────────────────────────────────────────────────────────────
// GAME BANNER — MOBILE. The desktop scoreboard laid out for a phone:
//   away logo | away abbr | away score | home score | home abbr | home logo
// then the five sections as one flush row, then the ticker. Edge to edge, no
// radius. Same props as GameBannerScoreboardA. Lab copy: organisms/test/GameBannerMobileA.js.
// ─────────────────────────────────────────────────────────────────────────────

const TEAM_META = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});
const getTeam = (id) => TEAM_META[id] ?? null;
const getLabel = (id) => getTeam(id)?.bannerShort ?? getTeam(id)?.shortName ?? String(id ?? "").toUpperCase();
const getLogo = (id) => `/assets/${String(id ?? "").replace(/25$/, "")}.svg`;
const getColor = (id, fallback) => getTeam(id)?.colors?.primary ?? fallback;

// The five sections — names match the desktop banner's tabs (GamePage maps
// them); `short` is what fits a fifth of a phone.
export const SECTIONS = [
  { tab: "Summary", short: "Summary" },
  { tab: "Player Stats", short: "Players" },
  { tab: "Team Stats", short: "Team" },
  { tab: "Drives", short: "Drives" },
  { tab: "Play By Play", short: "PBP" },
];

const TICKER_CSS = `@keyframes gameBannerMobileTicker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`;

const Side = ({ id, score, won, record, flip }) => (
  <Flex align="center" gap="1.6cqw" minW={0} direction={flip ? "row-reverse" : "row"} px="2cqw">
    <Image src={getLogo(id)} alt="" w="10cqw" h="10cqw" objectFit="contain" flexShrink={0} />
    <Box minW={0} textAlign={flip ? "right" : "left"}>
      <Text fontSize="5.2cqw" fontWeight="black" color="white" textTransform="uppercase" lineHeight={1} letterSpacing="-0.01em" lineClamp={1}>
        {getLabel(id)}
      </Text>
      <Text fontSize="2.9cqw" fontWeight="bold" color="whiteAlpha.600" textTransform="uppercase" lineHeight={1.2} mt="0.2rem" lineClamp={1}>
        {record}
      </Text>
    </Box>
    <Text
      fontSize="9.6cqw"
      fontWeight="950"
      fontStyle="italic"
      color={won ? "white" : "whiteAlpha.500"}
      lineHeight={1}
      letterSpacing="-0.03em"
      fontVariantNumeric="tabular-nums"
      flexShrink={0}
      {...(flip ? { mr: "auto" } : { ml: "auto" })}
    >
      {score}
    </Text>
  </Flex>
);

export const GameBannerMobile = ({ game, activeTab = "Summary", onTabChange }) => {
  const meta = game?.metadata ?? {};
  const away = game?.away_team ?? {};
  const home = game?.home_team ?? {};
  const awayId = away.team_id ?? away.id ?? meta.away_team?.id ?? "away";
  const homeId = home.team_id ?? home.id ?? meta.home_team?.id ?? "home";
  const awayScore = Number(away.score ?? meta.away_team?.score ?? 0);
  const homeScore = Number(home.score ?? meta.home_team?.score ?? 0);
  const awayColor = getColor(awayId, "#4B0082");
  const homeColor = getColor(homeId, "#002147");
  const record = (b) => (b?.conference_record ? `${b.conference_record}${b.conference ? ` ${String(b.conference).toUpperCase()}` : ""}` : b?.record ?? "");
  const status = String(game?.status ?? "final").toUpperCase();
  const ticker = (Array.isArray(game?.ticker) ? game.ticker : []).filter((r) => r?.label && r?.text).map((r) => [String(r.label).toUpperCase(), String(r.text)]);
  const loop = [...ticker, ...ticker];
  const exportTo = `/game/${game?.game_path_id ?? game?.game_id ?? ""}/export`;

  return (
    <Box position="relative" overflow="hidden" w="full" bg="#08080A" containerType="inline-size">
      <style>{TICKER_CSS}</style>
      <Box position="absolute" inset={0} bg={`linear-gradient(90deg, ${awayColor}55 0%, #08080A 40%, #08080A 60%, ${homeColor}55 100%)`} />
      <Image src={getLogo(awayId)} alt="" position="absolute" left="-12%" top="-30%" h="9rem" opacity={0.14} filter="grayscale(1) brightness(1.8)" pointerEvents="none" />
      <Image src={getLogo(homeId)} alt="" position="absolute" right="-12%" top="-30%" h="9rem" opacity={0.14} filter="grayscale(1) brightness(1.8)" pointerEvents="none" />

      {/* Scoreboard */}
      <Grid position="relative" templateColumns="minmax(0, 1fr) auto minmax(0, 1fr)" alignItems="center" py="0.9rem">
        <Side id={awayId} score={awayScore} won={awayScore > homeScore} record={record(away)} />
        <Flex direction="column" align="center" gap="0.25rem" px="0.15rem">
          <Box px="0.4rem" py="0.1rem" bg="brand.500" transform="skewX(-10deg)">
            <Text fontSize="0.6rem" fontWeight="black" color="white" letterSpacing="0.06em" transform="skewX(10deg)">{status}</Text>
          </Box>
          <Box w="1px" h="1.4rem" bg="whiteAlpha.200" />
        </Flex>
        <Side id={homeId} score={homeScore} won={homeScore > awayScore} record={record(home)} flip />
      </Grid>

      {/* Export — icon only on a phone */}
      <Box
        as={Link}
        to={exportTo}
        aria-label="Export game"
        position="absolute"
        top="0.3rem"
        right="0.3rem"
        zIndex={2}
        p="0.3rem"
        color="whiteAlpha.700"
        _hover={{ color: "white" }}
      >
        <Share2 size={13} />
      </Box>

      {/* Sections — all five, one flush row */}
      <Grid position="relative" templateColumns="repeat(5, minmax(0, 1fr))" borderTop="1px solid" borderColor="whiteAlpha.100">
        {SECTIONS.map((s) => {
          const on = s.tab === activeTab;
          return (
            <Box
              key={s.tab}
              as="button"
              type="button"
              onClick={() => onTabChange?.(s.tab)}
              py="0.7rem"
              bg={on ? "whiteAlpha.100" : "rgba(0,0,0,0.35)"}
              borderBottom="2px solid"
              borderColor={on ? "brand.500" : "transparent"}
              borderRight="1px solid"
              borderRightColor="whiteAlpha.100"
              _last={{ borderRight: "none" }}
            >
              <Text fontSize="3cqw" fontWeight="black" color={on ? "white" : "whiteAlpha.600"} textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
                {s.short}
              </Text>
            </Box>
          );
        })}
      </Grid>

      {/* Ticker */}
      <Box position="relative" h="1.5rem" bg="brand.500" overflow="hidden">
        <Flex h="full" align="center" gap="1.5rem" px="0.75rem" w="max-content" style={{ animation: `gameBannerMobileTicker ${Math.max(30, ticker.length * 4)}s linear infinite` }}>
          {loop.map(([label, value], i) => (
            <Flex key={`${label}-${i}`} align="center" gap="0.5rem" flexShrink={0}>
              <Text fontSize="0.68rem" fontWeight="950" color="white" letterSpacing="0.1em" whiteSpace="nowrap">{label}</Text>
              <Text fontSize="0.68rem" fontWeight="bold" fontStyle="italic" color="white" opacity={0.9} textTransform="uppercase" whiteSpace="nowrap">{value}</Text>
              <Box w="1.5px" h="0.7rem" bg="white" opacity={0.45} />
            </Flex>
          ))}
        </Flex>
      </Box>
    </Box>
  );
};
