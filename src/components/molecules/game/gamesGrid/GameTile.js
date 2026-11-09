import { useState } from "react";
import { LEAGUE_IDS, ROW_H } from "./gridPresentation";
import { Box, Image, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

// Games Hub team/logo rows, matchup tiles and grid cells.

const TeamLogo = ({ team, size }) => {
  const [broken, setBroken] = useState(false);
  const isLeague = LEAGUE_IDS.has(team?.teamId) || LEAGUE_IDS.has(team?.id);
  return (
    <Box w={size} h={size} flexShrink={0} display="flex" alignItems="center" justifyContent="center">
      {team?.logo && isLeague && !broken ? (
        <Image src={team.logo} alt="" w="full" h="full" objectFit="contain" onError={() => setBroken(true)} />
      ) : (
        // Outside opponents ship a name but no logo. A neutral dot holds the
        // column so names stay aligned down the grid.
        <Box w="0.375rem" h="0.375rem" borderRadius="full" bg="whiteAlpha.300" />
      )}
    </Box>
  );
};

const TeamRow = ({ team, score, isWinner, showScore, mobile = false }) => (
  <Flex align="center" gap={mobile ? 1 : 1.5} minW={0} h={ROW_H.team}>
    <TeamLogo team={team} size={mobile ? "0.8rem" : "0.875rem"} />
    <Text
      flex="1"
      minW={0}
      fontSize={mobile ? "10px" : "11px"}
      fontWeight={isWinner ? "black" : "bold"}
      color={isWinner ? "white" : "text.secondary"}
      textTransform="uppercase"
      letterSpacing="0.03em"
      lineClamp={1}
    >
      {team?.shortName ?? team?.name ?? "TBD"}
    </Text>
    {showScore && (
      <Text
        flexShrink={0}
        fontFamily="mono"
        fontSize="13px"
        fontWeight="black"
        color={isWinner ? "white" : "text.muted"}
      >
        {score ?? "—"}
      </Text>
    )}
  </Flex>
);

const GameTile = ({ game, cardBg, mobile = false, shine = null }) => {
  const { homeTeam = {}, awayTeam = {} } = game;
  const played = Boolean(game.isFinal);
  const winnerIs = (team) => played && game.winnerTeamId && team?.teamId === game.winnerTeamId;
  // fmtTime hands back "TBA" for a missing kickoff; that is noise on a tile this
  // small, so only a real time earns the slot.
  const kickoff = game.kickoffTime && game.kickoffTime !== "TBA" ? game.kickoffTime : null;

  return (
      <Flex
        className={shine ? "game-card gh-shine" : "game-card"}
        style={shine ? { "--gh-shine": shine.color, "--gh-delay": `${shine.delay}ms` } : undefined}
        direction="column"
        flex="1"
        px={mobile ? 1 : 2}
        py={mobile ? 1 : 1.5}
        gap={0.5}
        borderRadius="sm"
        bg={cardBg}
        // A game still to be played wears a dashed edge. The card's ground never
        // changes — the week's colour lives on the cell behind it.
        border="1px"
        borderStyle={played ? "solid" : "dashed"}
        borderColor="whiteAlpha.200"
        transition="border-color 0.15s ease"
      >
        {/* 1 — date, with kickoff riding along on a game not yet played */}
        <Flex align="baseline" justify="space-between" gap={1} h={ROW_H.date} minW={0}>
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
            {game.dateLabel ?? "TBD"}
          </Text>
          {!played && kickoff && (
            <Text fontSize="9px" fontWeight="bold" color="text.muted" letterSpacing="0.04em" flexShrink={0} lineClamp={1}>
              {kickoff}
            </Text>
          )}
        </Flex>

        {/* 2, 3 — away over home */}
        <TeamRow team={awayTeam} score={game.awayScore} isWinner={winnerIs(awayTeam)} showScore={played} mobile={mobile} />
        <TeamRow team={homeTeam} score={game.homeScore} isWinner={winnerIs(homeTeam)} showScore={played} mobile={mobile} />

        {/* 4 — game name. Empty on every game today; the row keeps its height so
            the grid stays regular the day it starts filling in. */}
        <Text h={ROW_H.event} fontSize="9px" fontWeight="black" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
          {game.eventName ?? ""}
        </Text>

        {/* 5 — location, under a hairline separating the matchup from where it
            happened. A Box line, not a Divider (AgentDesignBible). */}
        <Box h="1px" bg="whiteAlpha.100" />
        <Text h={ROW_H.venue} pt={1} fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="0.03em" lineHeight="1.2" lineClamp={2}>
          {game.venue ? String(game.venue).toUpperCase() : "TBD"}
        </Text>
      </Flex>
  );
};

export const GameCell = ({ game, tint, weekLabel, mobile = false, cellRef = undefined, shine = null }) => (
  <Flex
    ref={cellRef}
    style={{ scrollMarginTop: "calc(var(--app-header-height) + 0.75rem)" }}
    as={game.route ? Link : "div"}
    to={game.route ?? undefined}
    direction="column"
    h="full"
    minW={0}
    bg={tint.bg}
    px={mobile ? "2px" : 1}
    pb={mobile ? "2px" : 1}
    textDecoration="none"
    cursor={game.route ? "pointer" : "default"}
    // The whole tinted block is the target, week row included — a tile is small
    // enough that hunting for the exact card edge is work. Games with no page
    // yet (every 2026 row, and 116 of 188 in 2025) simply are not links.
    _hover={game.route ? { "& .game-card": { borderColor: "whiteAlpha.500" } } : undefined}
  >
    <Flex align="center" h={ROW_H.week} px={1} flexShrink={0}>
      {weekLabel && (
        <Text fontSize="9px" fontWeight="black" color={tint.ink} textTransform="uppercase" letterSpacing="0.16em" lineClamp={1}>
          {weekLabel}
        </Text>
      )}
    </Flex>
    <GameTile game={game} cardBg={tint.card} mobile={mobile} shine={shine} />
  </Flex>
);
