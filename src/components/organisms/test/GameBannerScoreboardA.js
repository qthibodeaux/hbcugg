import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";
import { useLayoutDensity, LAYOUT_DENSITY } from "../../../hooks/useLayoutDensity";

// ═══════════════════════════════════════════════════════════════
// TEAM LOOKUP
// ═══════════════════════════════════════════════════════════════

const TEAM_META = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

const getTeam = (id) => TEAM_META[id] ?? null;
const getTeamLabel = (id) => getTeam(id)?.shortName ?? id?.toUpperCase() ?? "—";
const getTeamName = (id) => getTeam(id)?.name ?? "";
const getTeamLogo = (id) => `/assets/${id?.replace(/25$/, "")}.svg`;
const getTeamColor = (id, fallback = "#E53E3E") => getTeam(id)?.colors?.primary ?? fallback;

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const MOCK_GAME = {
  metadata: {
    game_id: "PVAMUJSU06122025",
    home_team: "swacjsu25",
    away_team: "swacpvamu25",
    away_points: 23,
    home_points: 21,
    date: "12/06/2025",
    site: "Jackson, Mississippi (Veterans Memorial Stadium)",
    attendance: 32187,
    kickoff_time: "01:11 PM",
  },
};

// ═══════════════════════════════════════════════════════════════
// HELPERS & STATS NORMALIZERS
// ═══════════════════════════════════════════════════════════════

// The ticker comes off the game file: `ticker[]` of { kind, label, text } — matchup,
// both records, five leaders per team, attendance, kickoff, venue, week — composed by
// the backend. `leader` rows carry a `player_key` too, unused here. Nothing is built
// from individual_stats any more.
const buildTickerItems = (game) => {
  const rows = Array.isArray(game?.ticker) ? game.ticker : [];
  return rows
    .filter((row) => row && row.label && row.text)
    .map((row) => [String(row.label).toUpperCase(), String(row.text)]);
};

const TickerSegment = ({ label, value, dividerColor, textColor }) => (
  <Flex align="center" gap={{ base: 2, lg: 3 }} flexShrink={0}>
    <Text
      fontSize={{ base: "8.5px", md: "9px" }}
      fontWeight="950"
      color={textColor}
      textTransform="uppercase"
      letterSpacing="0.12em"
      whiteSpace="nowrap"
    >
      {label}
    </Text>
    <Text
      fontSize={{ base: "8.5px", md: "9px" }}
      fontWeight="bold"
      color={textColor}
      opacity={0.88}
      textTransform="uppercase"
      whiteSpace="nowrap"
      fontStyle="italic"
    >
      {value}
    </Text>
    <Box w="1.5px" h="10px" bg={dividerColor} opacity={0.45} borderRadius="full" />
  </Flex>
);


export const GameBannerScoreboardA = ({ game = MOCK_GAME, activeTab = "Summary", onTabChange }) => {
  const { density } = useLayoutDensity();
  const isCompact = density === LAYOUT_DENSITY.COMPACT || density === LAYOUT_DENSITY.MOBILE;

  const meta = game?.metadata ?? {};
  const awayTeam = game?.away_team ?? meta.away_team ?? {};
  const homeTeam = game?.home_team ?? meta.home_team ?? {};
  const awayId =
    awayTeam.team_id ??
    awayTeam.id ??
    (typeof meta.away_team === "string" ? meta.away_team : meta.away_team?.id ?? meta.away_team?.team_id ?? "away");
  const homeId =
    homeTeam.team_id ??
    homeTeam.id ??
    (typeof meta.home_team === "string" ? meta.home_team : meta.home_team?.id ?? meta.home_team?.team_id ?? "home");

  const awayScore =
    Number(awayTeam.score ?? awayTeam.points ?? game?.final_score?.away ?? meta.away_points ?? meta.away_score ?? 0);
  const homeScore =
    Number(homeTeam.score ?? homeTeam.points ?? game?.final_score?.home ?? meta.home_points ?? meta.home_score ?? 0);

  const awayColor = getTeamColor(awayId, "#4B0082");
  const homeColor = getTeamColor(homeId, "#002147");
  const winner = game?.winner_team_id ?? (awayScore > homeScore ? awayId : homeScore > awayScore ? homeId : null);
  const margin = Math.abs(awayScore - homeScore);

  const tabs = ["Summary", "Player Stats", "Team Stats", "Drives", "Play By Play"];
  const venue = game?.venue ?? null;
  const event = game?.event ?? null;
  const eventText = event?.name
    ? [event.name, venue?.neutral_site ? "Neutral site" : null].filter(Boolean).join(" · ")
    : venue?.neutral_site ? "Neutral site" : null;
  const venueRows = [
    { key: "sponsor", text: venue?.sponsor ?? null },
    { key: "stadium", text: venue?.stadium ?? meta.site ?? null },
    { key: "city", text: venue?.stadium ? venue?.city ?? null : null },
    { key: "event", text: eventText },
  ].filter((row) => row.text);
  const tickerItems = buildTickerItems(game);
  const tickerLoop = [...tickerItems, ...tickerItems];

  // Records come off the team blocks on the game file (`record`, `conference_record`,
  // `conference`), as they stand once this game is in the books. Dash when absent.
  const teamBlockFor = (teamId) => {
    const want = String(teamId ?? "").replace(/25$/, "");
    const blocks = [game?.away_team, game?.home_team];
    return blocks.find((b) => String(b?.team_id ?? b?.id ?? "").replace(/25$/, "") === want) ?? null;
  };
  const getRecordConf = (teamId) => {
    const b = teamBlockFor(teamId);
    if (!b?.conference_record) return "—";
    return b.conference ? `${b.conference_record} ${String(b.conference).toUpperCase()}` : b.conference_record;
  };
  const getRecordOverall = (teamId) => teamBlockFor(teamId)?.record ?? "—";

  const getMascotLocal = (teamId) => {
    return getTeam(teamId)?.mascot ?? "";
  };

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      w="full"
      h="100%"
      bg="#08080A"
    >
      <style>{`
        @keyframes gameBannerTickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Background gradient */}
      <Box 
        position="absolute" 
        inset={0} 
        bg={`linear-gradient(90deg, ${awayColor}44 0%, #08080A 34%, #08080A 66%, ${homeColor}44 100%)`} 
      />

      {/* Watermarked Logos — Opacity increased to 0.16 for beautiful visibility */}
      <Box position="absolute" left="-5%" top="50%" transform="translateY(-50%)" opacity={0.16} pointerEvents="none">
        <Image src={getTeamLogo(awayId)} h="300px" objectFit="contain" filter="grayscale(1) brightness(1.8)" />
      </Box>
      <Box position="absolute" right="-5%" top="50%" transform="translateY(-50%)" opacity={0.16} pointerEvents="none">
        <Image src={getTeamLogo(homeId)} h="300px" objectFit="contain" filter="grayscale(1) brightness(1.8)" />
      </Box>

      {/* Main content */}
      <Flex h="100%" position="relative" zIndex={1} direction="column">
        {/* Scoreboard row */}
        <Grid 
          flex={1} 
          templateColumns="1fr auto 1fr"
          alignItems="stretch" 
          minH={0}
        >
          {/* Away team */}
          <Flex 
            align="center" 
            gap={isCompact ? 4.5 : 8} 
            minW={0} 
            pl={{ base: 2, lg: 6 }} 
            py={2}
          >
            {/* Logo */}
            <Image 
              src={getTeamLogo(awayId)} 
              alt="" 
              h={isCompact ? "clamp(48px, 6.5vw, 62px)" : "clamp(80px, 9vw, 110px)"} 
              objectFit="contain" 
              flexShrink={0} 
            />

            {/* Team Identity Stack */}
            <Box minW={0}>
              {isCompact ? (
                <>
                  <Text 
                    fontSize="clamp(20px, 2.5vw, 28px)" 
                    fontWeight="black" 
                    color="text.primary"
                    textTransform="uppercase"
                    lineHeight={1.05}
                    lineClamp={1}
                  >
                    {getTeamLabel(awayId)}
                  </Text>
                  <Text 
                    fontSize="clamp(12px, 1.4vw, 14px)" 
                    fontWeight="bold" 
                    color="whiteAlpha.600"
                    lineClamp={1}
                  >
                    {getRecordConf(awayId)}
                  </Text>
                </>
              ) : (
                // 3-Row Stacked layout next to the logo for widescreen
                <>
                  <Text 
                    fontSize="clamp(20px, 2.2vw, 32px)" 
                    fontWeight="black" 
                    color="text.primary" 
                    textTransform="uppercase"
                    letterSpacing="0.04em"
                    lineHeight={1.05}
                    lineClamp={1}
                  >
                    {getTeamName(awayId)}
                  </Text>
                  <Text 
                    fontSize="clamp(16px, 1.8vw, 24px)" 
                    fontWeight="black" 
                    color="whiteAlpha.800" 
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                    lineHeight={1.15}
                    mt="3px"
                    lineClamp={1}
                  >
                    {getMascotLocal(awayId)}
                  </Text>
                  <Flex align="center" gap={1.5} mt="4px">
                    <Text 
                      fontSize="clamp(13px, 1.3vw, 16px)" 
                      fontWeight="950" 
                      color="white"
                      lineClamp={1}
                    >
                      {getRecordConf(awayId)}
                    </Text>
                    <Text fontSize="11px" color="whiteAlpha.400" fontWeight="normal">*</Text>
                    <Text 
                      fontSize="clamp(13px, 1.3vw, 16px)" 
                      fontWeight="medium" 
                      color="whiteAlpha.600"
                      lineClamp={1}
                    >
                      ({getRecordOverall(awayId)})
                    </Text>
                  </Flex>
                </>
              )}
            </Box>

            {/* Score */}
            <Text 
              fontWeight="950" 
              fontSize={isCompact ? "1.8rem" : "clamp(2.5rem, 5vw, 3.8rem)"}
              fontStyle="italic"
              ml="auto"
              pr={isCompact ? 2 : 4}
              color={awayScore > homeScore ? "white" : "whiteAlpha.600"}
              flexShrink={0}
            >
              {awayScore}
            </Text>
          </Flex>

          {/* Center Info with Vertical Divider */}
          <Flex direction="column" align="center" justify="center" px={{ base: 2, lg: 6 }} gap={2} flexShrink={0} position="relative">
            <Box position="absolute" left={0} h="40%" w="1px" bg="whiteAlpha.100" />
            <Box position="absolute" right={0} h="40%" w="1px" bg="whiteAlpha.100" />

            <Box px={4} py={1} bg="brand.500" transform="skewX(-10deg)">
              <Text 
                textStyle="pill" 
                color="white" 
                fontSize="10px"
                transform="skewX(10deg)"
                fontWeight="black"
                letterSpacing="0.04em"
              >
                FINAL
              </Text>
            </Box>
            <Text 
              textStyle="cardTitle" 
              color="white" 
              fontSize={isCompact ? "xs" : "sm"}
              whiteSpace="nowrap"
              fontWeight="black"
              textTransform="uppercase"
            >
              {winner ? `${getTeamLabel(winner)} BY ${margin}` : "TIED"}
            </Text>
            {!isCompact && (
              <Text textStyle="editorial" color="whiteAlpha.600" textAlign="center" maxW="150px" fontSize="10px" fontWeight="700">
                {meta.date}
              </Text>
            )}
            {/* Venue stack — one line each, off the game file's `venue` /
                `event` blocks (see the fetch contract Envelope): sponsor,
                stadium, city, then the event line. A line whose field is
                null is omitted, never dashed. The metadata `site` string is
                the older file's only venue field and stands in as the
                stadium line when `venue` is absent. */}
            {!isCompact && venueRows.length > 0 && (
              <Flex direction="column" align="center" gap={0} mt={-1} maxW="180px">
                {venueRows.map((row) => (
                  <Text
                    key={row.key}
                    textStyle="editorial"
                    color={row.key === "event" ? "brand.400" : "whiteAlpha.500"}
                    textAlign="center"
                    fontSize="9px"
                    fontWeight={row.key === "stadium" || row.key === "event" ? "900" : "700"}
                    textTransform={row.key === "event" ? "uppercase" : "none"}
                    letterSpacing={row.key === "event" ? "0.08em" : "normal"}
                    lineHeight={1.3}
                    lineClamp={row.key === "event" ? 2 : 1}
                  >
                    {row.text}
                  </Text>
                ))}
              </Flex>
            )}
          </Flex>

          {/* Home team */}
          <Flex 
            align="center" 
            gap={isCompact ? 4.5 : 8} 
            direction="row-reverse" 
            minW={0} 
            pr={{ base: 2, lg: 6 }} 
            py={2}
          >
            {/* Logo */}
            <Image 
              src={getTeamLogo(homeId)} 
              alt="" 
              h={isCompact ? "clamp(48px, 6.5vw, 62px)" : "clamp(80px, 9vw, 110px)"} 
              objectFit="contain" 
              flexShrink={0} 
            />

            {/* Team Identity Stack */}
            <Box minW={0} textAlign="right">
              {isCompact ? (
                <>
                  <Text 
                    fontSize="clamp(20px, 2.5vw, 28px)" 
                    fontWeight="black" 
                    color="text.primary"
                    textTransform="uppercase"
                    lineHeight={1.05}
                    lineClamp={1}
                  >
                    {getTeamLabel(homeId)}
                  </Text>
                  <Text 
                    fontSize="clamp(12px, 1.4vw, 14px)" 
                    fontWeight="bold" 
                    color="whiteAlpha.600"
                    lineClamp={1}
                  >
                    {getRecordConf(homeId)}
                  </Text>
                </>
              ) : (
                // 3-Row Stacked layout next to the logo for widescreen
                <>
                  <Text 
                    fontSize="clamp(20px, 2.2vw, 32px)" 
                    fontWeight="black" 
                    color="text.primary" 
                    textTransform="uppercase"
                    letterSpacing="0.04em"
                    lineHeight={1.05}
                    lineClamp={1}
                  >
                    {getTeamName(homeId)}
                  </Text>
                  <Text 
                    fontSize="clamp(16px, 1.8vw, 24px)" 
                    fontWeight="black" 
                    color="whiteAlpha.800" 
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                    lineHeight={1.15}
                    mt="3px"
                    lineClamp={1}
                  >
                    {getMascotLocal(homeId)}
                  </Text>
                  <Flex align="center" gap={1.5} mt="4px" justify="flex-end">
                    <Text 
                      fontSize="clamp(13px, 1.3vw, 16px)" 
                      fontWeight="950" 
                      color="white"
                      lineClamp={1}
                    >
                      {getRecordConf(homeId)}
                    </Text>
                    <Text fontSize="11px" color="whiteAlpha.400" fontWeight="normal">*</Text>
                    <Text 
                      fontSize="clamp(13px, 1.3vw, 16px)" 
                      fontWeight="medium" 
                      color="whiteAlpha.600"
                      lineClamp={1}
                    >
                      ({getRecordOverall(homeId)})
                    </Text>
                  </Flex>
                </>
              )}
            </Box>

            {/* Score */}
            <Text 
              fontWeight="950" 
              fontSize={isCompact ? "1.8rem" : "clamp(2.5rem, 5vw, 3.8rem)"}
              fontStyle="italic"
              mr="auto"
              pl={isCompact ? 2 : 4}
              color={homeScore > awayScore ? "white" : "whiteAlpha.600"}
              flexShrink={0}
            >
              {homeScore}
            </Text>
          </Flex>
        </Grid>

        {/* Tab bar */}
        <Flex 
          justify="space-between" 
          align="center" 
          gap={3} 
          px={{ base: 4, lg: 10 }} 
          pb={2} 
          pt={1} 
          borderTop="1px solid" 
          borderColor="whiteAlpha.100" 
          wrap="wrap" 
          flexShrink={0}
        >
          <Flex gap={2} wrap="wrap">
            {tabs.map((tab) => (
              <Box
                key={tab}
                as="button"
                type="button"
                px={{ base: 3, lg: 4 }}
                py={2}
                minW={isCompact ? "60px" : "80px"}
                border="1px solid"
                borderColor={tab === activeTab ? "brand.500" : "whiteAlpha.100"}
                bg={tab === activeTab ? "rgba(229,62,62,0.18)" : "whiteAlpha.50"}
                cursor="pointer"
                onClick={() => onTabChange?.(tab)}
              >
                <Text textStyle="pill" color={tab === activeTab ? "white" : "text.muted"}>{tab}</Text>
              </Box>
            ))}
          </Flex>
          <Text textStyle="editorial" color="whiteAlpha.600">
            Attendance {meta.attendance?.toLocaleString?.() ?? "-"} | Kick {meta.kickoff_time ?? "-"}
          </Text>
        </Flex>

        {/* Editorial News Ticker Bar */}
        <Box 
          h="20px" 
          bg="brand.500" 
          overflow="hidden" 
          borderTop="1px solid" 
          borderColor="whiteAlpha.200" 
          flexShrink={0}
        >
          <Flex
            h="full"
            align="center"
            gap={8}
            px={4}
            w="max-content"
            style={{ animation: "gameBannerTickerScroll 36s linear infinite" }}
          >
            {tickerLoop.map(([label, value], index) => (
              <TickerSegment
                key={`${label}-${index}`}
                label={label}
                value={value}
                dividerColor="#FFFFFF"
                textColor="#FFFFFF"
              />
            ))}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};
