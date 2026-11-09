import { getClassYearNum, getRemainingYears, SQUARE_W } from "./outlookModel";
import { Flex, Box, Text, Image } from "@chakra-ui/react";

export const EligibilityBar = ({ player, teamColors, mobile = false }) => {
  const classYearNum = getClassYearNum(player.class_year);
  const remaining = getRemainingYears(classYearNum);
  const isRedshirt = player.is_redshirt === true || player.is_redshirt === "true";
  const primary = teamColors?.primary || "#E53E3E";

  const squareProps = mobile
    ? { borderRadius: 0, border: "1px solid", borderColor: "whiteAlpha.700" }
    : { borderRadius: "3px" };

  return (
    <Flex align="stretch" gap={mobile ? 0 : 1} h="full" alignSelf="stretch">
      {[0, 1, 2, 3, 4].map((offset) => {
        const isEligible = offset < remaining;
        const isRedshirtYear = isRedshirt && offset === remaining;
        const bg = isEligible ? primary : isRedshirtYear ? "#E53E3E" : "whiteAlpha.100";

        return <Box key={offset} w={SQUARE_W} h="full" bg={bg} flexShrink={0} {...squareProps} />;
      })}
    </Flex>
  );
};

export const SchoolCell = ({ player, team }) => {
  if (player.is_transfer && player.previous_school) {
    return (
      <Text fontSize="10px" fontWeight="bold" color="text.muted" lineClamp={2} textAlign="right" lineHeight={1.2}>
        {player.previous_school}
      </Text>
    );
  }
  if (getClassYearNum(player.class_year) === 1) {
    return (
      <Text fontSize="10px" fontWeight="bold" color="text.muted" lineClamp={1} textAlign="right">
        HS
      </Text>
    );
  }
  if (team?.logo) {
    return <Image src={team.logo} alt="" h="14px" objectFit="contain" />;
  }
  return <Text fontSize="10px" fontWeight="bold" color="text.muted">--</Text>;
};
