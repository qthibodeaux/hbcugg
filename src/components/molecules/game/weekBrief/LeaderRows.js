import { Box, Flex, Text, Grid } from "@chakra-ui/react";
import { HeadshotOrInitials } from "../WeekCentralBriefBlocks";
import { getLastName } from "./briefModel";

const PlayerAvatar = ({ name, src, srcs, color }) => (
  <Box
    w={{ base: "32px", xl: "54px" }}
    h={{ base: "32px", xl: "54px" }}
    borderRadius="md"
    overflow="hidden"
    border="1px solid"
    borderColor={`${color}88`}
    bg="whiteAlpha.100"
    flexShrink={0}
  >
    <HeadshotOrInitials name={name} src={src} srcs={srcs} />
  </Box>
);

const LeaderSide = ({ player, align = "left", color = "brand.400" }) => {
  if (!player) {
    return (
      <Flex align="center" justify={align === "right" ? "end" : "start"} gap={2} minW={0}>
        <Text fontSize="sm" color="text.muted" fontWeight="black">No data</Text>
      </Flex>
    );
  }

  return (
    <Flex align="center" justify={align === "right" ? "end" : "start"} gap={1} minW={0}>
      {align === "left" && <PlayerAvatar name={player.name} srcs={player.images} color={color} />}
      <Box textAlign={align} minW={0}>
        <Text fontSize={{ base: "md", xl: "2xl" }} color={color} fontWeight="black" lineHeight={1}>{player.statValue}</Text>
        <Text fontSize={{ base: "10px", xl: "14px" }} color="white" fontWeight="black" lineClamp={1}>
          <Box as="span" display={{ base: "inline", "xl": "none" }}>{getLastName(player.name)}</Box>
          <Box as="span" display={{ base: "none", "xl": "inline" }}>{player.name}</Box>
        </Text>
        <Text fontSize={{ base: "8px", xl: "11px" }} color="rgba(255,255,255,0.68)" fontWeight="black" lineClamp={1}>{player.detail}</Text>
      </Box>
      {align === "right" && <PlayerAvatar name={player.name} srcs={player.images} color={color} />}
    </Flex>
  );
};

const compactCategory = (label) => label.replace(" Yards", "\nYards").replace(" Leader", "\nLeader");

export const LeaderRow = ({ item, awayColor, homeColor }) => (
  <Grid
    templateColumns={{ base: "minmax(0, 1fr) 42px minmax(0, 1fr)", xl: "minmax(0, 1fr) 96px minmax(0, 1fr)" }}
    alignItems="center"
    py={{ base: "8px", xl: "18px" }}
    borderBottom="1px solid"
    borderColor="whiteAlpha.100"
    gap={{ base: "3px", xl: 4 }}
  >
    <LeaderSide player={item.away} color={awayColor} />
    <Text fontSize={{ base: "7px", xl: "10px" }} color="rgba(255,255,255,0.58)" fontWeight="black" textTransform="uppercase" letterSpacing={{ base: "0.05em", xl: "0.12em" }} textAlign="center" whiteSpace="pre-line" lineHeight={1.08}>
      {compactCategory(item.label)}
    </Text>
    <LeaderSide player={item.home} align="right" color={homeColor} />
  </Grid>
);

const PlayerAvatarMobile = ({ name, src, color }) => (
  <Box
    w="2.4rem"
    h="2.4rem"
    borderRadius="0"
    overflow="hidden"
    border="1px solid"
    borderColor={`${color}88`}
    bg="whiteAlpha.100"
    flexShrink={0}
  >
    <HeadshotOrInitials name={name} src={src} fontSize="xs" />
  </Box>
);

export const LeaderRowMobile = ({ item, awayColor, homeColor }) => (
  <Box py="0.6rem" px="0.75rem" borderBottom="1px solid" borderColor="whiteAlpha.100">
    <Grid templateColumns="minmax(0, 1fr) 3.75rem minmax(0, 1fr)" alignItems="center" gap="0.5rem">
      <Box>
        {item.away && <PlayerAvatarMobile name={item.away.name} src={item.away.image} color={awayColor} />}
      </Box>
      <Text fontSize="0.65rem" color="rgba(255,255,255,0.7)" fontWeight="black" textTransform="uppercase" textAlign="center" lineHeight={1.15}>
        {item.label}
      </Text>
      <Flex justify="flex-end">
        {item.home && <PlayerAvatarMobile name={item.home.name} src={item.home.image} color={homeColor} />}
      </Flex>
    </Grid>

    <Grid templateColumns="minmax(0, 1fr) minmax(0, 1fr)" gap="0.5rem" mt="0.4rem">
      <Text fontSize="0.7rem" color="white" fontWeight="black" lineClamp={1}>
        {item.away ? `${getLastName(item.away.name)}${item.away.position ? ` | ${item.away.position}` : ""}` : "No data"}
      </Text>
      <Text fontSize="0.7rem" color="white" fontWeight="black" lineClamp={1} textAlign="right">
        {item.home ? `${getLastName(item.home.name)}${item.home.position ? ` | ${item.home.position}` : ""}` : "No data"}
      </Text>

      <Text fontSize="1.1rem" color={awayColor} fontWeight="black" lineHeight={1}>
        {item.away?.statValue ?? "—"}
      </Text>
      <Text fontSize="1.1rem" color={homeColor} fontWeight="black" lineHeight={1} textAlign="right">
        {item.home?.statValue ?? "—"}
      </Text>

      <Text fontSize="0.6rem" color="rgba(255,255,255,0.68)" fontWeight="black" lineClamp={1}>
        {item.away?.detail}
      </Text>
      <Text fontSize="0.6rem" color="rgba(255,255,255,0.68)" fontWeight="black" lineClamp={1} textAlign="right">
        {item.home?.detail}
      </Text>
    </Grid>
  </Box>
);
