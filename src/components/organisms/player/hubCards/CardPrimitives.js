import { Flex, Text, Box, Image } from "@chakra-ui/react";
import { PANEL_BG, teamOf } from "./cardPresentation";

export const Panel = ({ children, ...rest }) => (
  <Flex
    direction="column"
    h="100%"
    minW={0}
    p={4}
    gap={2.5}
    bg={PANEL_BG}
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="lg"
    overflow="hidden"
    {...rest}
  >
    {children}
  </Flex>
);

export const Kicker = ({ children, color = "text.muted", ...rest }) => (
  <Text fontSize="9px" fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.13em" lineClamp={1} {...rest}>
    {children}
  </Text>
);

export const CardHead = ({ icon: Icon, label, accent = "#A855F7", right }) => (
  <Flex align="center" justify="space-between" gap={2} flexShrink={0}>
    <Flex align="center" gap={1.5} minW={0}>
      {Icon && <Icon size={12} color={accent} style={{ flexShrink: 0 }} />}
      <Kicker color={accent}>{label}</Kicker>
    </Flex>
    {right}
  </Flex>
);

export const Num = ({ children, size = "clamp(1.4rem, 2.2vw, 1.9rem)", color = "white", ...rest }) => (
  <Text
    fontSize={size}
    fontWeight="900"
    fontStyle="italic"
    color={color}
    lineHeight={0.85}
    letterSpacing="-0.04em"
    whiteSpace="nowrap"
    fontVariantNumeric="tabular-nums"
    {...rest}
  >
    {children}
  </Text>
);

export const Portrait = ({ src, size, ring = "whiteAlpha.200", alt = "" }) => (
  <Box w={size} h={size} flexShrink={0} borderRadius="md" overflow="hidden" bg="blackAlpha.500" border="1px solid" borderColor={ring}>
    {src ? <Image src={src} alt={alt} w="100%" h="100%" objectFit="cover" objectPosition="top center" /> : null}
  </Box>
);

export const PersonRow = ({ player, rank, metric, metricLabel, accent, onOpen, size = "30px" }) => {
  const team = teamOf(player?.school_id);
  return (
    <Flex
      align="center"
      gap={2}
      minW={0}
      cursor="pointer"
      onClick={() => onOpen(player)}
      borderRadius="md"
      px={1.5}
      py={1}
      _hover={{ bg: "whiteAlpha.100" }}
      style={{ transition: "background 0.15s" }}
    >
      {Number.isFinite(rank) && (
        <Text fontSize="9px" fontWeight="900" color="whiteAlpha.500" w="10px" flexShrink={0} fontVariantNumeric="tabular-nums">
          {rank}
        </Text>
      )}
      <Portrait src={player?.image_url} size={size} ring={`${accent}66`} alt={player?.full_name} />
      <Box minW={0} flex={1}>
        <Text fontSize="11px" fontWeight="900" color="white" lineClamp={1}>
          {player?.full_name}
        </Text>
        <Flex align="center" gap={1}>
          {team?.logo && <Image src={team.logo} alt="" w="9px" h="9px" objectFit="contain" flexShrink={0} />}
          <Kicker fontSize="8px">{player?.position ?? player?.position_group} · {team?.shortName ?? player?.school_name}</Kicker>
        </Flex>
      </Box>
      {metric != null && (
        <Box textAlign="right" flexShrink={0}>
          <Text fontSize="12px" fontWeight="900" fontStyle="italic" color={accent} lineHeight={1} fontVariantNumeric="tabular-nums">
            {metric}
          </Text>
          {metricLabel && <Kicker fontSize="7px" mt={0.5}>{metricLabel}</Kicker>}
        </Box>
      )}
    </Flex>
  );
};
