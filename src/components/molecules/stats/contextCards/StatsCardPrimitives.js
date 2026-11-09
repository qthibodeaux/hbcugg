import { Image, Text, Box, Flex } from "@chakra-ui/react";
import { teamLogo } from "../../../game/export/exportData";

// Identical lab/live Stats Hub shell, colors, formatting and type/logo primitives.

export const GOOD = "#22C55E";

export const BAD = "#F59E0B";

export const ACCENT = "#A855F7";

export const DIM = "rgba(255,255,255,0.5)";

export const FAINT = "rgba(255,255,255,0.1)";

export const sign = (v, d = 3) => (Number.isFinite(v) ? `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(d)}` : "—");

export const pct = (v, d = 1) => (Number.isFinite(v) ? `${(v * 100).toFixed(d)}%` : "—");

export const Logo = ({ id, size, ...rest }) => <Image src={teamLogo(id)} alt="" w={`${size}cqmin`} h={`${size}cqmin`} objectFit="contain" flexShrink={0} {...rest} />;

export const Big = ({ children, size = 16, color = "white", ...rest }) => (
  <Text fontSize={`${size}cqmin`} fontWeight="black" fontStyle="italic" color={color} lineHeight={0.88} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" lineClamp={1} {...rest}>
    {children}
  </Text>
);

export const Small = ({ children, color = DIM, size = 3.4, ...rest }) => (
  <Text fontSize={`${size}cqmin`} fontWeight="black" color={color} textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.15} lineClamp={1} {...rest}>
    {children}
  </Text>
);

export const Shell = ({ c, accent = ACCENT, mark, scale = 1, children }) => (
  <Box position="relative" w="full" h="full" bg="#141416" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden" style={{ containerType: "size" }}>
    {mark ? <Logo id={mark} size={62 * scale} position="absolute" right="-10cqmin" top="-10cqmin" opacity={0.07} pointerEvents="none" /> : null}
    <Flex position="relative" direction="column" h="full" p={`${5 * scale}cqmin`} gap={`${2.4 * scale}cqmin`}>
      <Flex align="center" gap={`${2 * scale}cqmin`}>
        <Box w={`${1.6 * scale}cqmin`} h={`${1.6 * scale}cqmin`} borderRadius="full" bg={accent} flexShrink={0} />
        <Text fontSize={`${4 * scale}cqmin`} fontWeight="black" color={DIM} textTransform="uppercase" letterSpacing="0.14em" lineClamp={1}>{c.title}</Text>
      </Flex>
      <Text fontSize={`${6.2 * scale}cqmin`} fontWeight="black" color="white" lineHeight={1.05} letterSpacing="-0.01em" lineClamp={2}>{c.headline}</Text>
      <Flex direction="column" flex={1} minH={0}>{children}</Flex>
      {c.why ? <Text fontSize={`${3.6 * scale}cqmin`} fontWeight="bold" color="rgba(255,255,255,0.6)" lineHeight={1.3} lineClamp={2}>{c.why}</Text> : null}
    </Flex>
  </Box>
);
