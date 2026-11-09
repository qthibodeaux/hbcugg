import { LEAGUE_ID, Slot } from "./matchupPicker/MatchupTiles";
import { MobileMatchupPicker } from "./matchupPicker/MobileMatchupPicker";
import { Flex, Text } from "@chakra-ui/react";

export const MatchupPicker = ({ teams, teamA, teamB, setTeamA, setTeamB, colorA, colorB, mobile = false }) => {
  const pick = (slot) => (next) => {
    const [cur, opp] = slot === "a" ? [teamA, teamB] : [teamB, teamA];
    if (next === opp && next !== LEAGUE_ID) {
      // Picking the other slot's team swaps them rather than refusing.
      if (slot === "a") { setTeamA(next); setTeamB(cur); } else { setTeamB(next); setTeamA(cur); }
      return;
    }
    (slot === "a" ? setTeamA : setTeamB)(next);
  };

  if (mobile) return <MobileMatchupPicker teams={teams} teamA={teamA} teamB={teamB} pick={pick} />;

  return (
    <Flex gap={4} direction={{ base: "column", md: "row" }} align="stretch">
      <Slot label="Team A" teams={teams} value={teamA} other={teamB} onChange={pick("a")} accent={colorA} />
      <Flex align="center" justify="center" px={1} flexShrink={0}>
        <Text fontSize="clamp(1rem, 2vw, 1.6rem)" fontWeight="black" fontStyle="italic" color="whiteAlpha.300" textTransform="uppercase" letterSpacing="-0.02em">
          vs
        </Text>
      </Flex>
      <Slot label="Team B" teams={teams} value={teamB} other={teamA} onChange={pick("b")} accent={colorB} />
    </Flex>
  );
};

export default MatchupPicker;

export { LEAGUE_ID, TeamTile } from "./matchupPicker/MatchupTiles";
