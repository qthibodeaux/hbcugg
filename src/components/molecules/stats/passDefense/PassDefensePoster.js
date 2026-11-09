import { Box, Flex, Text } from "@chakra-ui/react";
import { ExportWordmark } from "../../export/ExportWordmark";
import { passDefenseConflicts, passDefenseTeam } from "../../../../utils/passDefenseModel";
import { PassDefenseChart } from "./PassDefenseChart";

const TITLES = {
  PD01: ["Pass defense", "Overview"], PD02: ["First down", "Foundations"],
  PD03: ["Behind", "The sticks"], PD04: ["Red zone", "Resistance"],
  PD05: ["Late & close", "Pass defense"], PD06: ["Halftime", "Response"],
  PD07: ["Air yards", "/ YAC"], PD08: ["Depth / direction", "Pass defense"],
  PD09: ["Receiver", "Matchups"], PD10: ["Situational", "Pass defense"],
  PD11: ["Defensive", "Contributors"], PD12: ["Explosive", "Prevention"], PD13: ["Pass defense", "Game by game"],
};

// Match the existing 1400px Deep Dive poster frame and editorial hierarchy.
export const PassDefensePoster = ({ data, selection, view, pal, innerRef }) => {
  const fg = (alpha) => `rgba(${pal.fg},${alpha})`;
  const title = TITLES[view.id];
  const conflicts = view.id === "PD01" && selection.overview === "epa_per_pass" ? passDefenseConflicts(data) : [];
  return (
    <Flex ref={innerRef} direction="column" w="1400px" bg={pal.bg} color={pal.ink} px="56px" pt="36px" pb="44px" gap="18px" overflow="hidden">
      <Flex align="center" justify="space-between">
        <ExportWordmark ink={pal.ink} accent={pal.brand} size="34px" />
        <Text fontSize="18px" fontWeight="900" textTransform="uppercase" letterSpacing="0.08em" color={pal.orange}>2026 · Pass defense · {view.scope === "all" ? "Full game" : "Competitive"}</Text>
      </Flex>
      <Text fontSize="76px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.9} letterSpacing="-0.04em">
        {title[0]} <Box as="span" color={pal.brand}>{title[1]}</Box>
      </Text>
      <Box h="1px" bg={fg(0.12)} />
      <Flex bg={pal.panel} direction="column" px="24px" pt="20px" pb="22px">
        <Flex gap="8px" align="center">
          <Box w="7px" h="7px" bg={pal.brand} borderRadius="full" />
          <Text fontSize="15px" fontWeight="900" textTransform="uppercase" letterSpacing="0.08em" color={fg(0.65)}>{view.title}</Text>
        </Flex>
        {view.blocked ? (
          <Box py="60px"><Text fontSize="24px" fontWeight="900" mb={3}>Waiting on the required measure</Text><Text fontSize="19px">{view.blocked}</Text></Box>
        ) : (
          <Box mt="16px"><PassDefenseChart view={view} data={{ ...data, selectedTeamId: selection.teamId }} pal={pal} /></Box>
        )}
      </Flex>
      {view.notes.map((note) => <Text key={note} fontSize="15px" fontWeight="600" lineHeight={1.5} color={fg(0.7)}>{note}</Text>)}
      {conflicts.length > 0 && <Box borderLeft={`3px solid ${pal.orange}`} pl="12px">
        {conflicts.map((conflict, index) => <Text key={index} fontSize="14px" color={fg(0.7)}>
          {passDefenseTeam(conflict.teamId, data.metadata).short} · {conflict.stat}: {conflict.sources.map((s) => `${s.source.includes("advanced_") ? "advanced" : "season"} ${s.value ?? "unavailable"}`).join(" / ")} · unresolved.
        </Text>)}
      </Box>}
      <Flex justify="space-between" gap="20px" pt="12px" borderTop={`1px solid ${fg(0.12)}`}>
        <Text fontSize="12px" color={fg(0.55)}>{view.source} · Final parsed games between covered teams</Text>
        <Text fontSize="12px" color={fg(0.55)}>{data.index?.game_count ?? "—"} games · Published {data.index?.generated_at?.slice(0, 10) ?? "date unavailable"}</Text>
      </Flex>
    </Flex>
  );
};
