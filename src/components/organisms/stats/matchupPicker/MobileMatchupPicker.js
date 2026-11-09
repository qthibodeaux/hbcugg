import { LEAGUE_ID, TeamTile } from "./MatchupTiles";
import { Flex, Image, Text, Grid, Box } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { BottomSheet } from "../../BottomSheet";

const LEAGUE_FACE = { id: LEAGUE_ID, name: "League Average", short: "LEAGUE", logo: null, primary: "#A855F7" };

const FaceHalf = ({ team, side, onClick }) => {
  const color = team?.primary && team.primary !== "#000000" ? team.primary : "#3F3F46";
  const right = side === "b";
  return (
    <Flex as="button" type="button" onClick={onClick} flex={1} minW={0} h="100%" align="center" gap="0.55rem" px="0.7rem"
      direction={right ? "row-reverse" : "row"}
      bg={`linear-gradient(${right ? 250 : 110}deg, ${color}cc 0%, ${color}33 70%, transparent 100%)`}>
      {team?.logo ? (
        <Image src={team.logo} alt="" w="2.6rem" h="2.6rem" objectFit="contain" flexShrink={0} filter="drop-shadow(0 2px 6px rgba(0,0,0,0.6))" />
      ) : (
        <Flex w="2.6rem" h="2.6rem" flexShrink={0} align="center" justify="center" bg="blackAlpha.400">
          <Text fontSize="0.6rem" fontWeight="black" color="white">AVG</Text>
        </Flex>
      )}
      <Flex direction="column" align={right ? "flex-end" : "flex-start"} minW={0}>
        <Text fontSize="1.15rem" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={1} letterSpacing="-0.02em" lineClamp={1}>
          {team?.short ?? "—"}
        </Text>
        <ChevronDown size="0.95rem" color="rgba(255,255,255,0.8)" strokeWidth={3} />
      </Flex>
    </Flex>
  );
};

export const MobileMatchupPicker = ({ teams, teamA, teamB, pick }) => {
  const [slot, setSlot] = useState(null);
  const faceOf = (id) => (id === LEAGUE_ID ? LEAGUE_FACE : teams.find((t) => t.id === id) ?? null);
  const value = slot === "a" ? teamA : teamB;
  const other = slot === "a" ? teamB : teamA;
  const choose = (id) => { pick(slot)(id); setSlot(null); };
  return (
    <>
      <Flex h="4.5rem" align="stretch" bg="#141416" borderTop="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100">
        <FaceHalf team={faceOf(teamA)} side="a" onClick={() => setSlot("a")} />
        <Flex align="center" justify="center" px="0.5rem" flexShrink={0}>
          <Text fontSize="1.4rem" fontWeight="black" fontStyle="italic" color="whiteAlpha.500" letterSpacing="-0.04em">VS</Text>
        </Flex>
        <FaceHalf team={faceOf(teamB)} side="b" onClick={() => setSlot("b")} />
      </Flex>

      <BottomSheet isOpen={slot != null} onClose={() => setSlot(null)} title={slot === "a" ? "Team A" : "Team B"}>
        <Grid templateColumns="repeat(6, minmax(0, 1fr))" gap="1px" bg="whiteAlpha.100">
          {teams.map((t) => (
            <TeamTile key={t.id} team={t} active={t.id === value} disabled={t.id === other} onClick={() => choose(t.id)} />
          ))}
        </Grid>
        <Box as="button" type="button" w="100%" py="0.9rem" bg={value === LEAGUE_ID ? "brand.500" : "whiteAlpha.100"} onClick={() => choose(LEAGUE_ID)}>
          <Text fontSize="0.75rem" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" color={value === LEAGUE_ID ? "white" : "whiteAlpha.700"}>
            League Average · 18
          </Text>
        </Box>
      </BottomSheet>
    </>
  );
};
