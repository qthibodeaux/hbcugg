import { Flex, Image, Text, Box } from "@chakra-ui/react";
import { getTeamLabel, readableTextColor } from "./historyModel";

export const RIVALRY_BANNER_CSS = `
  @keyframes rivalryTileIn {
    from { opacity: 0; transform: translateY(8px) scale(0.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

const RivalryLogoPair = ({ a, b }) => (
  <Flex
    align="center"
    justify="center"
    gap={{ base: 0, lg: 0 }}
    minW={0}
    flex={1}
    my={{ base: -2.5, lg: -3.5 }}
    position="relative"
  >
    <Image
      src={a.logo}
      alt={a.name}
      boxSize={{ base: "54px", lg: "78px" }}
      objectFit="contain"
      filter="drop-shadow(0 5px 12px rgba(0,0,0,0.82))"
      flexShrink={0}
      transform="translateX(8px) rotate(-6deg)"
      zIndex={1}
    />
    <Text
      fontSize={{ base: "8px", lg: "10px" }}
      color="whiteAlpha.700"
      fontWeight="black"
      textTransform="uppercase"
      lineHeight={1}
      flexShrink={0}
      zIndex={3}
      textShadow="0 2px 8px rgba(0,0,0,0.9)"
    >
      vs
    </Text>
    <Image
      src={b.logo}
      alt={b.name}
      boxSize={{ base: "54px", lg: "78px" }}
      objectFit="contain"
      filter="drop-shadow(0 5px 12px rgba(0,0,0,0.82))"
      flexShrink={0}
      transform="translateX(-8px) rotate(6deg)"
      zIndex={2}
    />
  </Flex>
);

export const RivalryTile = ({ rivalry, tileKey }) => {
  const { a, b } = rivalry;
  const aLabel = getTeamLabel(a);
  const bLabel = getTeamLabel(b);
  const titlePanelBg = a.colors.secondary || a.colors.primary || "#FFFFFF";
  const matchupPanelBg = b.colors.secondary || b.colors.primary || "#FFFFFF";

  return (
    <Box
      key={tileKey}
      minW={0}
      minH={0}
      overflow="hidden"
      borderRadius="7px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(135deg, ${a.colors.primary}42 0%, rgba(10,10,12,0.92) 47%, ${b.colors.primary}42 100%)`}
      position="relative"
      p={{ base: 0, lg: 2 }}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      style={{ animation: "rivalryTileIn 420ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
    >
      <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(0,0,0,0.16), rgba(0,0,0,0.44))" />
      <Text
        display={{ base: "none", lg: "block" }}
        position="relative"
        zIndex={3}
        fontSize="10px"
        color={a.colors.secondary || "brand.400"}
        fontWeight="black"
        textTransform="uppercase"
        letterSpacing="0.1em"
        lineHeight={0.95}
        textAlign="center"
        lineClamp={1}
        minW={0}
        textShadow="0 2px 8px rgba(0,0,0,0.9)"
      >
        {rivalry.name}
      </Text>
      <Flex
        display={{ base: "flex", lg: "none" }}
        position="relative"
        zIndex={3}
        w="100%"
        minH="20px"
        px={1}
        py="2px"
        align="center"
        justify="center"
        bg={titlePanelBg}
      >
        <Text
          color={readableTextColor(titlePanelBg)}
          fontSize="9px"
          fontWeight="900"
          textTransform="uppercase"
          letterSpacing="0"
          lineHeight={0.92}
          textAlign="center"
          whiteSpace="normal"
        >
          {rivalry.name}
        </Text>
      </Flex>

      <Box position="relative" zIndex={2} minW={0} flex={1} display="flex" alignItems="center" justifyContent="center" px={{ base: 1, lg: 0 }}>
        <RivalryLogoPair a={a} b={b} />
      </Box>

      <Text
        display={{ base: "none", lg: "block" }}
        position="relative"
        zIndex={3}
        fontSize="11px"
        color="white"
        fontWeight="black"
        textTransform="uppercase"
        letterSpacing="0.02em"
        lineHeight={1}
        textAlign="center"
        lineClamp={1}
        minW={0}
      >
        {aLabel} vs {bLabel}
      </Text>
      <Flex
        display={{ base: "flex", lg: "none" }}
        position="relative"
        zIndex={3}
        w="100%"
        minH="18px"
        px={1}
        py="2px"
        align="center"
        justify="center"
        bg={matchupPanelBg}
      >
        <Text
          color={readableTextColor(matchupPanelBg)}
          fontSize="10px"
          fontWeight="900"
          textTransform="uppercase"
          letterSpacing="0"
          lineHeight={0.95}
          textAlign="center"
          whiteSpace="normal"
        >
          {aLabel} vs {bLabel}
        </Text>
      </Flex>
    </Box>
  );
};
