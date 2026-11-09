import { Box, Text, Flex, Grid, Image } from "@chakra-ui/react";
import { glossaryFor, ordinal } from "../../../../pages/analytics/metricGlossary";
import { rankTone } from "./phasePresentation";
import { Kicker } from "../analyticsTabs/AnalyticsPrimitives";

const Tip = ({ text, children }) => {
  if (!text) return children;
  return (
    <Box position="relative" display="inline-block" maxW="100%" _hover={{ "& > .tip": { opacity: 1, visibility: "visible" } }}>
      {children}
      <Box
        className="tip" position="absolute" bottom="calc(100% + 6px)" left={0} zIndex={30}
        w="15rem" maxW="70vw" p={2.5} borderRadius="md" bg="#09090B" border="1px solid" borderColor="whiteAlpha.200"
        boxShadow="0 12px 32px rgba(0,0,0,0.55)" opacity={0} visibility="hidden" pointerEvents="none"
        transition="opacity 0.12s ease"
      >
        <Text fontSize="10px" color="whiteAlpha.800" lineHeight={1.55}>{text}</Text>
      </Box>
    </Box>
  );
};

const Cell = ({ cell, total, tips, big }) => {
  const def = glossaryFor(cell.label);
  const tone = rankTone(cell.rank, total);
  return (
    <Box minW={0}>
      <Flex align="baseline" justify="space-between" gap={1} minW={0}>
        <Tip text={tips ? def?.text : null}>
          <Kicker
            color="whiteAlpha.400"
            borderBottom={tips && def ? "1px dotted" : undefined}
            borderColor="whiteAlpha.300"
          >
            {cell.label}
          </Kicker>
        </Tip>
        {Number.isFinite(cell.rank) && (
          <Text fontSize="8px" fontWeight="900" color={tone} flexShrink={0} fontVariantNumeric="tabular-nums">
            {ordinal(cell.rank)}
          </Text>
        )}
      </Flex>
      {big ? (
        <Text
          fontSize="clamp(0.95rem, 1.7vw, 1.45rem)" fontWeight="900" fontStyle="italic" color="white"
          lineHeight={0.95} letterSpacing="-0.03em" mt={1} fontVariantNumeric="tabular-nums" lineClamp={1}
        >
          {cell.value}
        </Text>
      ) : (
        <Text fontSize="13px" fontWeight="900" color="white" mt={1} fontVariantNumeric="tabular-nums" lineClamp={1}>
          {cell.value}
        </Text>
      )}
      {cell.note && <Text fontSize="8px" fontWeight="700" color="whiteAlpha.400" mt={0.5} lineClamp={2}>{cell.note}</Text>}
    </Box>
  );
};

export const HeadCard = ({ label, tone, cells, total, tips }) => (
  <Box flex="1" minW={0} bg="rgba(255,255,255,0.04)" borderRadius="md" p={3} borderTop="2px solid" borderTopColor={tone}>
    <Kicker color={tone}>{label}</Kicker>
    <Grid templateColumns={{ base: "repeat(2, minmax(0,1fr))", md: "repeat(5, minmax(0,1fr))" }} gap={3} mt={2.5}>
      {cells.map((c) => <Cell key={c.label} cell={c} total={total} tips={tips} big />)}
    </Grid>
  </Box>
);

const LeaderPortrait = ({ leader }) => (
  <Box
    key={leader.id} position="relative" w={{ base: "3.5rem", lg: "4rem" }} h={{ base: "3.5rem", lg: "4rem" }} borderRadius="md" overflow="hidden"
    border="1px solid" borderColor="whiteAlpha.300" bg="rgba(255,255,255,0.05)" flexShrink={0}
    title={leader.title || leader.name}
  >
    {leader.photo ? (
      <Image src={leader.photo} alt="" w="100%" h="100%" objectFit="cover" objectPosition="top center" />
    ) : (
      <Flex align="center" justify="center" h="100%">
        <Text fontSize={{ base: "0.7rem", lg: "0.8rem" }} fontWeight="900" color="whiteAlpha.600">{leader.initials}</Text>
      </Flex>
    )}
    <Box position="absolute" left={0} right={0} bottom={0} px={1.5} py={1} bg="linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.86) 100%)">
      <Text fontSize={{ base: "0.55rem", lg: "0.6rem" }} fontWeight="900" color="white" lineHeight={1} lineClamp={1} textTransform="uppercase" letterSpacing="0.04em">
        {leader.surname}
      </Text>
    </Box>
  </Box>
);

export const PassingHeadCard = ({ label, tone, cells, total, tips, leaders }) => (
  <Box flex="1" minW={0} bg="rgba(255,255,255,0.04)" borderRadius="md" p={3} borderTop="2px solid" borderTopColor={tone}>
    <Flex direction={{ base: "column", lg: "row" }} align={{ base: "stretch", lg: "flex-start" }} justify="space-between" gap={4}>
      <Box flex="1" minW={0}>
        <Grid templateColumns="repeat(3, minmax(0,1fr))" gap={3} mt={3}>
          <Flex align="flex-start" minH="100%">
            <Kicker color={tone}>{label}</Kicker>
          </Flex>
          {cells.map((c) => <Cell key={c.label} cell={c} total={total} tips={tips} big />)}
        </Grid>
      </Box>
      <Flex gap={2} flexShrink={0} justify={{ base: "flex-start", lg: "flex-end" }} align="flex-start">
        {(leaders ?? []).slice(0, 3).map((leader) => <LeaderPortrait key={leader.id} leader={leader} />)}
      </Flex>
    </Flex>
  </Box>
);

export const FullGrid = ({ label, tone, cells, total, tips }) => (
  <Box flex="1" minW={0}>
    <Flex align="center" gap={2} mb={2}>
      <Box w="8px" h="8px" borderRadius="sm" bg={tone} flexShrink={0} />
      <Kicker color="whiteAlpha.700">{label}</Kicker>
      <Box flex="1" h="1px" bg="whiteAlpha.100" />
    </Flex>
    <Grid templateColumns="repeat(auto-fit, minmax(6.4rem, 1fr))" gap={3} gapY={4}>
      {cells.map((c) => <Cell key={c.label} cell={c} total={total} tips={tips} />)}
    </Grid>
  </Box>
);

const SideToggle = ({ value, onChange, options }) => (
  <Flex gap={2}>
    {options.map(([id, label]) => (
      <Box
        key={id} as="button" onClick={() => onChange(id)} px={3} py={1.5} borderRadius="md"
        fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em"
        bg={value === id ? "brand.500" : "whiteAlpha.100"} color={value === id ? "white" : "whiteAlpha.600"}
        _hover={{ bg: value === id ? "brand.500" : "whiteAlpha.200" }}
      >
        {label}
      </Box>
    ))}
  </Flex>
);

export const MapHead = ({ title, side, onSide, options = [["offense", "Offense"], ["defense", "Allowed"]] }) => (
  <Flex align="center" justify="space-between" gap={3} mt={5} mb={2} wrap="wrap">
    <Kicker color="whiteAlpha.700">{title}</Kicker>
    <SideToggle value={side} onChange={onSide} options={options} />
  </Flex>
);

export const TargetFace = ({ player }) => (
  <Flex direction="column" minW={0} align="stretch" justify="flex-start" gap={0.5} title={`${player.name} · ${player.position ?? ""} · ${player.targets} targets`}>
    <Box
      position="relative" w="100%" minW={0} flexShrink={0} borderRadius="sm" overflow="hidden" aspectRatio="1 / 1"
      bg="rgba(0,0,0,0.4)" border="1px solid" borderColor="whiteAlpha.300"
    >
      {player.photo ? (
        <Image src={player.photo} alt="" w="100%" h="100%" objectFit="cover" objectPosition="top center" />
      ) : (
        <Flex align="center" justify="center" h="100%">
          <Text fontSize={{ base: "0.7rem", lg: "0.8rem" }} fontWeight="900" color="whiteAlpha.600">{player.initials}</Text>
        </Flex>
      )}
      <Flex position="absolute" left={0} right={0} bottom={0} justify="center" py={0.6} bg="linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 100%)">
        <Text fontSize="0.72rem" fontWeight="900" color="white" lineHeight={0.95} textAlign="center" fontVariantNumeric="tabular-nums">
          {player.badge ?? player.targets}
        </Text>
      </Flex>
    </Box>
    <Text fontSize="0.42rem" fontWeight="900" color="white" lineHeight={1} lineClamp={1} textAlign="center" textTransform="uppercase" letterSpacing="0.02em" title={player.name}>
      {player.surname}
    </Text>
  </Flex>
);

export const PassingSectionShell = ({ children }) => (
  <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={4}>
    {children}
  </Box>
);
