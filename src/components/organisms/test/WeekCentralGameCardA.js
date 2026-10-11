/**
 * COMPONENT LAB — Week Central Game Card (Variant A)
 *
 * Slot:    Slot2x1
 * Date:    2026-04-13
 * Purpose: Standard 2x1 matchup card for Week Central game grid.
 *          Shows FINAL and UPCOMING states. Uses real team colors + logos.
 */

import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

// ─── MOCK DATA (extracted from real teams.json + schedule data) ────────────
const MOCK_FINAL = {
  parsed_game_stem: "W15pvamujsu",
  has_parsed_game: true,
  result: "W",
  home_away: "home",
  team_id: "swacjsu",
  opponent_id: "swacpvamu",
  opponent_name: "PVAMU",
  score_team: 27,
  score_opp: 23,
  date: "2025-12-06",
  conf_game: true,
  home: {
    id: "swacjsu",
    shortName: "JSU",
    primary: "#002147",
    secondary: "#FFFFFF",
    logo: "/assets/swacjsu.svg",
  },
  away: {
    id: "swacpvamu",
    shortName: "PVAMU",
    primary: "#4B0082",
    secondary: "#F5A623",
    logo: "/assets/swacpvamu.svg",
  },
};

const MOCK_UPCOMING = {
  parsed_game_stem: null,
  has_parsed_game: false,
  result: null,
  home_away: "away",
  team_id: "swacfamu",
  opponent_id: "swacaamu",
  opponent_name: "AAMU",
  score_team: null,
  score_opp: null,
  date: "2025-11-01",
  conf_game: true,
  home: {
    id: "swacaamu",
    shortName: "AAMU",
    primary: "#4B0082",
    secondary: "#FFD700",
    logo: "/assets/swacaamu.svg",
  },
  away: {
    id: "swacfamu",
    shortName: "FAMU",
    primary: "#006633",
    secondary: "#FF6600",
    logo: "/assets/swacfamu.svg",
  },
};

// ─── SUB-COMPONENT ─────────────────────────────────────────────────────────
const TeamSide = ({ team, score, label, isHome }) => (
  <Flex direction="column" align="center" gap={2} flex={1}>
    <Box w="40px" h="40px" display="flex" alignItems="center" justifyContent="center">
      <Image
        src={team?.logo}
        w="36px"
        h="36px"
        objectFit="contain"
        onError={(e) => { e.target.style.display = "none"; }}
      />
    </Box>
    <Text fontSize="2xl" fontWeight="black" color="white" lineHeight={1}>
      {score ?? "—"}
    </Text>
    <Text fontSize="9px" fontWeight="black" color="white"
      textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
      {team?.shortName ?? label}
    </Text>
    <Text fontSize="8px" color="text.muted">{isHome ? "HOME" : "AWAY"}</Text>
  </Flex>
);

// ─── CARD ──────────────────────────────────────────────────────────────────
const GameCard2x1 = ({ game }) => {
  const isComplete = !!game.result;
  const isCorpus = game.has_parsed_game && game.parsed_game_stem;

  const homeTeam = game.home;
  const awayTeam = game.away;
  const homeScore = game.home_away === "home" ? game.score_team : game.score_opp;
  const awayScore = game.home_away === "away" ? game.score_team : game.score_opp;

  const fmtDate = (d) => {
    if (!d) return "TBD";
    const dt = new Date(d);
    return isNaN(dt) ? String(d) : dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Simulate MVP/stat line for demo; always reserve space
  const mvpLine = isComplete ? (game.mvp ?? "MVP: QB 312 total yds") : "";

  return (
    <Box
      border="2px solid"
      borderColor={isComplete ? "whiteAlpha.200" : "whiteAlpha.100"}
      borderRadius="xl"
      bg="#23232A"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      h="100%"
      boxShadow="0 2px 8px 0 #00000033"
      transition="box-shadow 0.18s, border-color 0.18s"
      _hover={{ borderColor: "brand.500", boxShadow: "0 4px 16px 0 #E53E3E33" }}
    >
      {/* Status bar */}
      <Flex px={3} py={1.5} justify="space-between" align="center"
        borderBottom="1px solid" borderColor="whiteAlpha.100"
        bg={isComplete ? "transparent" : "rgba(229,62,62,0.06)"}>
        <Text fontSize="9px" fontWeight="black"
          color={isComplete ? "text.muted" : "brand.400"}
          textTransform="uppercase" letterSpacing="0.12em">
          {isComplete ? "FINAL" : "UPCOMING"}
        </Text>
        <Flex align="center" gap={2}>
          {game.conf_game && (
            <Box px={2} py={0.5} bg="whiteAlpha.100" borderRadius="sm">
              <Text fontSize="8px" fontWeight="black" color="text.muted">CONF</Text>
            </Box>
          )}
          <Text fontSize="9px" color="text.muted">{fmtDate(game.date)}</Text>
        </Flex>
      </Flex>

      {/* Scores */}
      <Flex px={3} py={4} align="center" gap={1} flex={1}>
        <TeamSide team={awayTeam} score={isComplete ? awayScore : null}
          label={game.opponent_name} isHome={false} />
        <Box px={1} textAlign="center">
          <Text fontSize="8px" color="text.muted" fontWeight="black">AT</Text>
        </Box>
        <TeamSide team={homeTeam} score={isComplete ? homeScore : null}
          label={game.team_id} isHome />
      </Flex>

      {/* MVP/Stat line — always reserve space */}
      <Box minH="22px" px={3} pb={1} pt={0} display="flex" alignItems="center">
        <Text fontSize="10px" color="text.muted" fontWeight="medium" lineClamp={1}>
          {mvpLine || "\u00A0"}
        </Text>
      </Box>

      {/* Footer CTA */}
      <Box px={3} py={1.5} borderTop="1px solid" borderColor="whiteAlpha.100">
        {isCorpus ? (
          <Box as={Link} to={`/game/${game.parsed_game_stem}`}
            display="block" textAlign="center" py={1} px={3} borderRadius="md"
            bg="whiteAlpha.100" fontSize="9px" fontWeight="black" color="text.secondary"
            textTransform="uppercase" letterSpacing="0.1em"
            _hover={{ bg: "whiteAlpha.200", color: "white" }}>
            View Game Recap →
          </Box>
        ) : (
          <Text fontSize="9px" color="text.muted" textAlign="center" py={1}>
            {isComplete ? "No game file" : "Preview coming soon"}
          </Text>
        )}
      </Box>
    </Box>
  );
};

// ─── LAB EXPORT ────────────────────────────────────────────────────────────
// Named export only — no default export from test files
export const WeekCentralGameCardA = () => (
  <Flex gap={2} align="stretch">
    <Box flex={1} minH="200px">
      <Text fontSize="9px" color="text.muted" fontWeight="black"
        textTransform="uppercase" letterSpacing="0.1em" mb={2}>
        State: Final
      </Text>
      <GameCard2x1 game={MOCK_FINAL} />
    </Box>
    <Box flex={1} minH="200px">
      <Text fontSize="9px" color="text.muted" fontWeight="black"
        textTransform="uppercase" letterSpacing="0.1em" mb={2}>
        State: Upcoming
      </Text>
      <GameCard2x1 game={MOCK_UPCOMING} />
    </Box>
  </Flex>
);
