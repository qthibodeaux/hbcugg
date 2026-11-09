import { Image, Flex, Text } from "@chakra-ui/react";
import { logo, compactLabel, fmtDate } from "./slateModel";

export const Logo = ({ team, size = "26px" }) => (
  <Image src={logo(team)} alt={compactLabel(team)} w={size} h={size} objectFit="contain" />
);

export const CompactGameContent = ({ awayTeam, homeTeam, game, winner, isComplete }) => (
  <>
    <Flex align="center" gap={1.5}>
      <Logo team={awayTeam} size="18px" />
      <Text fontSize="8px" color="text.muted" fontWeight="black">@</Text>
      <Logo team={homeTeam} size="18px" />
    </Flex>
    <Text fontSize="9px" color={winner ? "white" : "text.secondary"} fontWeight="black" textTransform="uppercase" lineClamp={1}>
      {isComplete ? `${game.awayScore}-${game.homeScore}` : fmtDate(game.date)}
    </Text>
  </>
);
