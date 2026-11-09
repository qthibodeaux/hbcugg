import { Box, Text, Image, Flex } from "@chakra-ui/react";

export const CompactTeamLabel = ({ label, active, align }) => (
  <Box minW={0} overflow="hidden" textAlign={align}>
    <Text
      color={active ? "white" : "rgba(255,255,255,0.84)"}
      fontWeight="black"
      fontSize={{ base: "16px", lg: "18px" }}
      lineHeight="1"
      textTransform="uppercase"
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
      letterSpacing="0.02em"
      style={{ textShadow: "0 2px 8px rgba(0,0,0,0.82)" }}
    >
      {label}
    </Text>
  </Box>
);

export const TeamText = ({
  align,
  name,
  record,
  active,
  maxW,
  fontSize,
  compact = false,
}) => (
  <Box minW={0} maxW={maxW} textAlign={align} overflow="hidden">
    <Text
      color={active ? "white" : "rgba(255,255,255,0.82)"}
      fontWeight="extrabold"
      fontSize={fontSize}
      lineHeight={compact ? "0.92" : "1"}
      textShadow="0 2px 8px #000b"
      lineClamp={2}
      whiteSpace="normal"
      overflow="hidden"
      textOverflow="ellipsis"
    >
      {name}
    </Text>
    <Text
      color="rgba(255,255,255,0.56)"
      fontSize={compact ? "10px" : "xs"}
      fontWeight="black"
      letterSpacing="0.12em"
      textTransform="uppercase"
      mt={compact ? 2 : 2}
      lineClamp={1}
    >
      {record}
    </Text>
  </Box>
);

export function Logo({ team, size, pad = "6px" }) {
  return team.logo ? (
    <Image
      src={team.logo}
      alt={team.shortName}
      w={size}
      h={size}
      objectFit="contain"
      borderRadius="lg"
      bg="rgba(255,255,255,0.10)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      p={pad}
      flexShrink={0}
    />
  ) : (
    <Flex
      w={size}
      h={size}
      align="center"
      justify="center"
      borderRadius="lg"
      bg="whiteAlpha.200"
      border="1px solid"
      borderColor="whiteAlpha.200"
      flexShrink={0}
    >
      <Text fontSize="lg" color="whiteAlpha.700" fontWeight="black">
        {String(team.shortName ?? team.name ?? "TBD").slice(0, 3)}
      </Text>
    </Flex>
  );
}

export const WatermarkLogo = ({ team, side, selected, compact = false }) => {
  if (!team.logo) return null;

  return (
    <Image
      src={team.logo}
      alt={team.shortName}
      position="absolute"
      left={side === "left" ? (compact ? "-30px" : "-24px") : "auto"}
      right={side === "right" ? (compact ? "-30px" : "-24px") : "auto"}
      top={side === "left" ? (compact ? "-32px" : "-16px") : "auto"}
      bottom={side === "right" ? (compact ? "-32px" : "-16px") : "auto"}
      w={compact ? "118px" : "120px"}
      h={compact ? "118px" : "120px"}
      opacity={selected ? 0.075 : 0.04}
      zIndex={1}
      pointerEvents="none"
      style={{ filter: "blur(1px)" }}
    />
  );
};
