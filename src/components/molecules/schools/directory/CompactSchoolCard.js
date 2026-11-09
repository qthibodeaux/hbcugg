import { compactLabel, routeFor } from "./directoryModel";
import { Box, Image, Text } from "@chakra-ui/react";

export const CompactSchoolCard = ({ team, navigate, target }) => {
  const primaryColor = team.colors?.primary || "#888888";
  const label = compactLabel(team);

  return (
    <Box
      as="button"
      onClick={() => navigate(routeFor(team, target))}
      h="full"
      w="full"
      minW={0}
      minH={0}
      borderRadius="7px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderBottom="2px solid"
      borderBottomColor={primaryColor}
      bg={`linear-gradient(135deg, ${primaryColor}22 0%, rgba(11,11,13,0.96) 58%)`}
      position="relative"
      overflow="hidden"
      textAlign="left"
      px={{ base: 1.5, lg: 2 }}
      display="flex"
      alignItems="center"
      gap={{ base: 1.5, lg: 2 }}
      transition="transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease"
      _hover={{ borderColor: primaryColor, transform: "translateY(-1px)", boxShadow: `0 0 12px ${primaryColor}33` }}
    >
      <Image src={team.logo} alt={team.name} boxSize="clamp(18px, 2.2vw, 28px)" objectFit="contain" flexShrink={0} />
      <Box minW={0} flex={1}>
        <Text
          fontSize="clamp(0.48rem, 0.86vw, 0.68rem)"
          color="white"
          fontWeight="black"
          fontStyle="italic"
          textTransform="uppercase"
          lineHeight={0.95}
          lineClamp={1}
          whiteSpace="nowrap"
        >
          {label}
        </Text>
        <Text
          display={{ base: "none", lg: "block" }}
          mt="2px"
          fontSize="7px"
          color="text.muted"
          fontWeight="black"
          textTransform="uppercase"
          letterSpacing="0.12em"
          lineClamp={1}
        >
          {team.conference}
        </Text>
      </Box>
      <Text position="absolute" right="-6px" bottom="-9px" fontSize="38px" color="white" opacity={0.045} fontWeight="black" lineHeight={1}>
        {label}
      </Text>
    </Box>
  );
};
