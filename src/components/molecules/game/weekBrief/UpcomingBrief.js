import { Flex, Box, Text, Image, Grid } from "@chakra-ui/react";
import { SectionLabel, Panel, StatusPill } from "./BriefPrimitives";
import { buildTeams, displayText, formatKickoff, getRecord } from "./briefModel";
import { CalendarDays, MapPin, Trophy, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ScheduleInfoRow = ({ icon, label, value }) => (
  <Flex align="center" gap={3} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
    <Flex align="center" justify="center" w="30px" h="30px" borderRadius="md" bg="rgba(255,255,255,0.10)" color="white">
      {icon}
    </Flex>
    <Box minW={0}>
      <SectionLabel color="rgba(255,255,255,0.56)">{label}</SectionLabel>
      <Text mt={1} fontSize="sm" color="white" fontWeight="black" lineClamp={1}>
        {value}
      </Text>
    </Box>
  </Flex>
);

const UpcomingTeamBlock = ({ team, record, align = "left" }) => (
  <Flex direction="column" align={align === "right" ? "end" : "start"} minW={0}>
    <Box
      w={{ base: "52px", xl: "74px" }}
      h={{ base: "52px", xl: "74px" }}
      borderRadius="md"
      bg="rgba(0,0,0,0.22)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
    >
      {team.logo ? (
        <Image src={team.logo} alt={team.shortName} w="80%" h="80%" objectFit="contain" />
      ) : (
        <Text fontSize="9px" color="text.muted" fontWeight="black">
          {team.shortName}
        </Text>
      )}
    </Box>
    <Text mt={3} fontSize={{ base: "2xl", xl: "4xl" }} color="white" fontWeight="black" lineHeight={0.9} textAlign={align}>
      {team.shortName}
    </Text>
    <Text mt={1} fontSize="10px" color="rgba(255,255,255,0.62)" fontWeight="black" textTransform="uppercase" textAlign={align} lineClamp={1}>
      {record}
    </Text>
  </Flex>
);

export const UpcomingBrief = ({ selectedGame, selectedColor, selectedAccent }) => {
  const { away, home } = buildTeams(selectedGame, null);
  const raw = selectedGame?.rawGame ?? {};
  const dateLabel = selectedGame?.dateLabel ?? displayText(raw.date);
  const kickoffLabel = formatKickoff(raw.kickoff);
  const venue = displayText(raw.stadium_name ?? raw.stadium ?? selectedGame?.venue, "Venue TBD");
  const city = displayText(raw.venue_city ?? raw.site ?? raw.venue, "Site TBD");
  const gameType = selectedGame?.tag ?? (raw.conference_game ? "Conference" : "Game");
  const awayRecord = getRecord(raw, "away");
  const homeRecord = getRecord(raw, "home");

  /*
   * Future weekly-intelligence layer:
   * once the advanced system is ready, add a one-line matchup context and
   * 2-3 watch points here from real computed data only.
   */
  const scheduleFacts = [
    { label: "Kickoff", value: `${dateLabel} | ${kickoffLabel}`, icon: <CalendarDays size={15} /> },
    { label: "Venue", value: venue, icon: <MapPin size={15} /> },
    { label: "Site", value: city, icon: <MapPin size={15} /> },
    { label: "Game Type", value: gameType, icon: <Trophy size={15} /> },
  ];

  return (
    <Panel selectedColor={selectedColor}>
      <Flex h="100%" direction="column" bg={`linear-gradient(160deg, ${selectedColor} 0%, #151518 48%, #0B0B0D 100%)`}>
        <Box h="118px" position="relative" overflow="hidden">
          <Box position="absolute" inset={0} bg={`linear-gradient(120deg, ${away.color} 0%, #111113 46%, ${home.color} 100%)`} />
          <Box position="absolute" inset={0} bg="rgba(0,0,0,0.28)" />
          <Flex position="absolute" left={4} right={4} bottom={3} align="end" justify="space-between">
            <Box>
              <SectionLabel color="whiteAlpha.700">Schedule Brief</SectionLabel>
              <Text mt={2} fontSize="xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
                Upcoming Matchup
              </Text>
            </Box>
            <StatusPill>{gameType}</StatusPill>
          </Flex>
        </Box>

        <Flex direction="column" flex="1" minH={0} px={{ base: 3, xl: 4 }} py={{ base: 3, xl: 4 }} overflow="auto">
          <Grid
            templateColumns="minmax(0, 1fr) 42px minmax(0, 1fr)"
            alignItems="center"
            gap={3}
            pb={5}
            borderBottom="1px solid"
            borderColor={`${selectedAccent}55`}
          >
            <UpcomingTeamBlock team={away} record={awayRecord} />
            <Flex direction="column" align="center" gap={2}>
              <Text fontSize="9px" color="rgba(255,255,255,0.56)" fontWeight="black">
                AT
              </Text>
              <Box w="1px" h="42px" bg={`${selectedAccent}88`} />
            </Flex>
            <UpcomingTeamBlock team={home} record={homeRecord} align="right" />
          </Grid>

          <Box mt={2}>
            {scheduleFacts.map((fact) => (
              <ScheduleInfoRow key={fact.label} icon={fact.icon} label={fact.label} value={fact.value} />
            ))}
          </Box>

          <Box mt={4} p={4} borderRadius="md" border="1px solid" borderColor="whiteAlpha.100" bg="rgba(255,255,255,0.06)">
            <SectionLabel color={selectedAccent}>Pregame Status</SectionLabel>
            <Grid mt={3} templateColumns="1fr 1fr" gap={3}>
              <Box>
                <Text fontSize="2xl" color="white" fontWeight="black" lineHeight={1}>Upcoming</Text>
                <Text mt={1} fontSize="9px" color="rgba(255,255,255,0.56)" fontWeight="black" textTransform="uppercase">
                  Game status
                </Text>
              </Box>
              <Box textAlign="right">
                <Text fontSize="2xl" color="white" fontWeight="black" lineHeight={1}>{raw.has_game_page ? "Ready" : "Pending"}</Text>
                <Text mt={1} fontSize="9px" color="rgba(255,255,255,0.56)" fontWeight="black" textTransform="uppercase">
                  Game center
                </Text>
              </Box>
            </Grid>
          </Box>

          {/* The way in: the game page once it exists, else the preview (every
              game between two of the 18 has one, filed under its game_id). One
              bar, edge to edge across the panel, right under the pregame status. */}
          {(() => {
            const to = selectedGame?.route ?? (raw.is_covered_matchup && raw.game_id ? `/game/preview/${raw.game_id}` : null);
            if (!to) return null;
            return (
              <Box mt={4} flexShrink={0}>
                <Flex
                  as={Link}
                  to={to}
                  mx={{ base: -3, xl: -4 }}
                  h="3rem"
                  align="center"
                  justify="center"
                  gap="0.5rem"
                  bg="white"
                  color="black"
                  textDecoration="none"
                  _hover={{ bg: selectedAccent, color: "black", textDecoration: "none" }}
                  transition="background 0.15s"
                >
                  <Text fontSize="0.9rem" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
                    {selectedGame?.route ? "Go to game" : "Go to preview"}
                  </Text>
                  <ArrowRight size={18} strokeWidth={3} />
                </Flex>
              </Box>
            );
          })()}
        </Flex>
      </Flex>
    </Panel>
  );
};
