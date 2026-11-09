import { normalizeTeamId, buildRows } from "./gameTeamStatsPacket/packetModel";
import { Box, Flex, Text, Grid } from "@chakra-ui/react";
import { Database } from "lucide-react";
import { TableShell, DataQuality } from "./gameTeamStatsPacket/PacketTables";
import PageShell from "../../layouts/PageShell";
import { SharedGameBanner } from "./gameTeamStatsPacket/PacketBanner";

export const GameTeamStatsPacketContent = ({ game }) => {
  const meta = game.metadata ?? {};
  const teams = [normalizeTeamId(meta.away_team), normalizeTeamId(meta.home_team)].filter(Boolean);
  const rows = buildRows(game);
  const sections = [
    ["Overview", "GOP coverage benchmark: overall production, success, explosiveness, turnovers.", rows.overview],
    ["Expected Points / Production", "EPA streams and WPA scaffolding from the current advanced payload.", rows.production],
    ["Rushing", "Line yards, opportunity, stuff, power, and modeled rushing efficiency.", rows.rushing],
    ["Situational", "Down-and-distance, third/fourth down, early/late down, two-minute splits.", rows.situational],
    ["Drives / Finishing", "Drive quality, field position, scoring, explosive and negative drive rates.", [...rows.drives, ...rows.finishing]],
    ["Defensive", "Stops, havoc, explosives allowed, red-zone defense, pressure/disruption signals.", rows.defense],
    ["Turnovers", "Actual, expected, forced, and turnover luck context.", rows.turnovers],
    ["Special Teams", "Special teams play count, distance, hidden yards, and swing-yard ledger fields.", rows.specialTeams],
    ["Penalties", "Accepted, leverage, hidden yardage, drive kill/extend, and penalty model values.", rows.penalties],
    ["Coaching / Tendencies", "Run-pass shape by down, obvious-situation execution, red-zone tendency, adjustment.", rows.coaching],
  ];

  return (
    <Box bg="bg.primary" pb={10}>
      <Box maxW="1400px" mx="auto">
        <Flex align="center" gap={2} mb={4}>
          <Database size={16} color="#E53E3E" />
          <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase">Full Team Stat Dump</Text>
        </Flex>
        <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={4}>
          {sections.map(([title, subtitle, sectionRows]) => (
            <TableShell key={title} title={title} subtitle={subtitle} rows={sectionRows} teams={teams} />
          ))}
        </Grid>
        <Box mt={4}>
          <DataQuality game={game} />
        </Box>
      </Box>
    </Box>
  );
};

export const GameTeamStatsPacketLab = ({ game }) => (
  <PageShell listContent={<GameTeamStatsPacketContent game={game} />}>
    <PageShell.Slot cols={4}>
      <SharedGameBanner game={game} active="Team Stats" />
    </PageShell.Slot>
  </PageShell>
);
