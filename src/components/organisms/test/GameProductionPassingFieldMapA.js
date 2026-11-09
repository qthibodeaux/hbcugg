import { TEAMS } from "./passingFieldMap/fixtures";
import { useState } from "react";
import { Flex, Text, Box } from "@chakra-ui/react";
import { PassingStatsTable, PageArrow, PlayerTable } from "./passingFieldMap/PassingTables";
import { PlayerSpotlight } from "./passingFieldMap/FieldMapSpotlight";
import { DefenseIdentityCompact } from "./passingFieldMap/DefenseIdentityCompact";

// ─── SINGLE TEAM PANEL ───
const TeamPassingPanel = ({ teamKey }) => {
  const data = TEAMS[teamKey];
  const [activePlayer, setActivePlayer] = useState({ ...data.passers[0], _type: "passer" });

  return (
    <Flex direction="column" w="full" h="full" minH={0}>
      {/* ─── HEADER: Team + Passing Stats Table ─── */}
      <Flex direction="column"
        bg={`linear-gradient(90deg, ${data.meta.colors.primary}44 0%, transparent 70%)`}
        borderBottom="1px solid whiteAlpha.100"
        px={2}
        py="6px"
        gap="4px"
        flexShrink={0}
      >
        {/* Section title — no redundant stat line */}
        <Flex align="center" gap={2}>
          <Flex w="28px" h="28px" borderRadius="sm" bg={data.meta.colors.primary} align="center" justify="center" flexShrink={0} border="1px solid whiteAlpha.200">
            <Text fontSize="10px" fontWeight="800" color={data.meta.colors.secondary}>{data.meta.shortName}</Text>
          </Flex>
          <Text fontSize="clamp(14px, 1.2vw, 18px)" fontWeight="800" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">
            {data.meta.shortName} Passing
          </Text>
        </Flex>

        {/* Passing stats table */}
        <PassingStatsTable team={data.passing} standard={data.downSplit.standard} passing={data.downSplit.passing} />
      </Flex>

      {/* ─── MIDDLE: Player Tables (55%) + Spotlight (45%) ─── */}
      <Flex flex={1} minH={0} overflow="hidden">
        {/* LEFT: Vertical pagination + Player tables */}
        <Box w="55%" borderRight="1px solid whiteAlpha.100" display="flex" flexDirection="row">
          {/* Vertical pagination column — arrows stretch full height */}
          <Flex direction="column" align="center" gap="4px" px="4px" py="4px" borderRight="1px solid whiteAlpha.100" flexShrink={0}>
            <PageArrow direction="prev" disabled />
            <PageArrow direction="next" disabled />
          </Flex>
          {/* Tables */}
          <Box flex={1} p="6px" overflow="hidden">
            <PlayerTable
              players={data.passers}
              activeKey={activePlayer._type === "passer" ? activePlayer.key : null}
              onSelect={setActivePlayer}
              type="passer"
            />
            <Box mt="4px">
              <PlayerTable
                players={data.receivers}
                activeKey={activePlayer._type === "receiver" ? activePlayer.key : null}
                onSelect={setActivePlayer}
                type="receiver"
              />
            </Box>
          </Box>
        </Box>

        {/* RIGHT: Spotlight — no scroll */}
        <Box w="45%" p="8px" overflow="hidden">
          <PlayerSpotlight
            player={activePlayer}
            type={activePlayer._type}
            teamColor={data.meta.colors.primary}
          />
        </Box>
      </Flex>

      {/* ─── FOOTER: Defense ─── */}
      <Box px={2} py="6px" borderTop="1px solid whiteAlpha.100" flexShrink={0}>
        <DefenseIdentityCompact defense={data.oppDefense} />
      </Box>
    </Flex>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — 2×2 side-by-side
// ═══════════════════════════════════════════════════════════════
export const GameProductionPassingFieldMapA = () => {
  return (
    <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid whiteAlpha.100">
      <Box flex={1} borderRight="1px solid whiteAlpha.100">
        <TeamPassingPanel teamKey="pvamu" />
      </Box>
      <Box flex={1}>
        <TeamPassingPanel teamKey="jsu" />
      </Box>
    </Flex>
  );
};
