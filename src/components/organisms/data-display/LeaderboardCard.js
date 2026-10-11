import { Box, Text } from "@chakra-ui/react";
import { SectionEyebrow } from "../../atoms/SectionEyebrow";
import LeaderRow from "../../atoms/data-display/LeaderRow";


const LeaderboardCard = ({ position, players = [] }) => (
  <Box
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="xl"
    p={5}
  >
    <SectionEyebrow
      rightContent={
        <Text fontSize="clamp(0.55rem, 0.65vw, 0.7rem)" fontWeight="black" color="rgba(255,255,255,0.3)" textTransform="uppercase" letterSpacing="0.16em">
          PAR Leaders
        </Text>
      }
    >
      {position}
    </SectionEyebrow>
    {players.map((player, index) => (
      <LeaderRow key={player.player_key ?? index} rank={index + 1} player={player} />
    ))}
  </Box>
);

export default LeaderboardCard;
