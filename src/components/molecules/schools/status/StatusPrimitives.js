import { LOGO_SIZES } from "./statusModel";
import { Flex, Image, Text, Box } from "@chakra-ui/react";

export const TeamLogoTile = ({ team, label = "TBD", size = "md" }) => {
  const dim = LOGO_SIZES[size] || LOGO_SIZES.md;
  return (
    <Flex
      w={dim}
      h={dim}
      align="center"
      justify="center"
      bg={team?.colors?.primary || "whiteAlpha.100"}
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="6px"
      overflow="hidden"
      flexShrink={0}
    >
      {team?.logo ? (
        <Image src={team.logo} alt="" maxW="85%" maxH="85%" objectFit="contain" />
      ) : (
        <Text fontSize="10px" fontWeight="black" color="text.primary">
          {String(label).slice(0, 3).toUpperCase()}
        </Text>
      )}
    </Flex>
  );
};

export const SectionLabel = ({ label, color = "brand.500", textColor = "text.muted" }) => (
  <Flex align="center" gap={2} minW={0}>
    <Box w="7px" h="7px" borderRadius="full" bg={color} flexShrink={0} />
    <Text
      fontSize={{ base: "12px", lg: "15px" }}
      fontWeight="black"
      color={textColor}
      textTransform="uppercase"
      letterSpacing="0.12em"
      lineClamp={1}
    >
      {label}
    </Text>
  </Flex>
);
