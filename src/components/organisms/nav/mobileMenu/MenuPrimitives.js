import { Box, Image, Text, Flex } from "@chakra-ui/react";
import { INFO, colorOf, BRAND } from "./menuPresentation";
import LiveTile from "../../../molecules/home/LiveTile";

const Plate = ({ bg = "#141416", children }) => (
  <Box position="absolute" inset="calc(-1 * var(--hl-pad, 3cqmin))" bg={bg} overflow="hidden">
    {children}
  </Box>
);

export const Bleed = ({ src, size = 150, right = -18, opacity = 1 }) =>
  src ? (
    <Image src={src} alt="" position="absolute" right={`${right}cqmin`} top="50%" transform="translateY(-50%)" h={`${size}cqmin`} w={`${size}cqmin`} objectFit="contain" opacity={opacity} pointerEvents="none" />
  ) : null;

export const Kicker = ({ children }) => (
  <Text position="absolute" top="5cqmin" right="5cqmin" bg="rgba(0,0,0,0.72)" px="3cqmin" py="2cqmin" fontSize="11cqmin" fontWeight="black" color={INFO} textTransform="uppercase" letterSpacing="0.12em" lineHeight={1} lineClamp={1} maxW="60%">
    {children}
  </Text>
);

export const Big = ({ children, size = 44, top, right = "5cqmin", bottom, color = INFO }) => (
  <Text position="absolute" top={top} right={right} bottom={bottom} fontSize={`${size}cqmin`} fontWeight="black" fontStyle="italic" color={color} lineHeight={0.88} letterSpacing="-0.04em" textShadow="0 2px 14px rgba(0,0,0,0.55)" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
    {children}
  </Text>
);

export const Face = ({ bg, children }) => (
  <Box position="relative" h="100%">
    <Plate bg={bg}>{children}</Plate>
  </Box>
);

export const TeamFace = ({ team, kicker, children, logoOpacity = 1 }) => (
  <Face bg={colorOf(team)}>
    <Bleed src={team?.logo} opacity={logoOpacity} />
    <Kicker>{kicker}</Kicker>
    {children}
  </Face>
);

export const MatchupFace = ({ game, kicker }) => {
  const decided = game.status === "final";
  const away = game.away ?? {};
  const home = game.home ?? {};
  return (
    <Face bg={home.primary ?? "#27272A"}>
      <Box position="absolute" inset={0} bg={away.primary ?? "#3F3F46"} style={{ clipPath: "polygon(0 0, 62% 0, 46% 100%, 0 100%)" }} />
      {away.logo ? <Image src={away.logo} alt="" position="absolute" left="30%" top="50%" transform="translate(-50%, -50%)" h="110cqmin" w="110cqmin" objectFit="contain" opacity={0.9} /> : null}
      {home.logo ? <Image src={home.logo} alt="" position="absolute" right="-14cqmin" top="50%" transform="translateY(-50%)" h="130cqmin" w="130cqmin" objectFit="contain" /> : null}
      <Kicker>{kicker}</Kicker>
      {decided ? (
        <Big size={40} bottom="8cqmin">{game.awayScore}–{game.homeScore}</Big>
      ) : (
        <Big size={30} bottom="10cqmin">{away.label ?? away.shortName} · {home.label ?? home.shortName}</Big>
      )}
    </Face>
  );
};

export const IdentityFace = ({ words }) => (
  <Face bg="#141416">
    <Flex position="absolute" top="6cqmin" right="5cqmin" direction="column" align="flex-end">
      {words.map((w) => (
        <Text key={w} fontSize="20cqmin" fontWeight="black" fontStyle="italic" color={INFO} textTransform="uppercase" lineHeight={0.92} letterSpacing="-0.02em">{w}</Text>
      ))}
    </Flex>
  </Face>
);

export const Band = ({ title, href, faces, hrefs, crumb, here, onNavigate, rotateMs }) => (
  <Box position="relative">
    {crumb ? <Box position="absolute" left={0} top={0} bottom={0} w="5px" bg={BRAND} zIndex={3} pointerEvents="none" /> : null}
    <Box position="relative" h="clamp(5.8rem, 12.6vh, 7.2rem)" display="grid" gridTemplateColumns="minmax(0, 1fr)" gridTemplateRows="minmax(0, 1fr)">
      <LiveTile href={href} hrefs={hrefs} faces={faces} rotateMs={rotateMs} transition="random" variant="mobile" accent={BRAND} onClick={onNavigate} />
      <Flex position="absolute" left={4} bottom={3} right="30%" direction="column" align="flex-start" gap={1} pointerEvents="none" zIndex={2}>
        <Text fontSize="clamp(1.6rem, 8vw, 2.2rem)" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.9} letterSpacing="-0.03em" textShadow="0 2px 14px rgba(0,0,0,0.85)">
          {title}
        </Text>
        {crumb ? (
          <Text fontSize="clamp(1rem, 5vw, 1.35rem)" fontWeight="black" fontStyle="italic" color={BRAND} textTransform="uppercase" lineHeight={0.95} letterSpacing="-0.02em" textShadow="0 2px 10px rgba(0,0,0,0.9)" lineClamp={1}>
            {crumb}
          </Text>
        ) : null}
      </Flex>
    </Box>
    {here}
  </Box>
);

export const Snapshot = ({ logos = [], label, line, big, bigColor = "white" }) => (
  <Flex bg="#1A1A1D" px={4} py={3} align="center" gap={3} minH="4.2rem">
    {logos.filter(Boolean).length ? (
      <Flex gap={1.5} flexShrink={0}>
        {logos.filter(Boolean).map((src, i) => <Image key={`${src}-${i}`} src={src} alt="" w="2.4rem" h="2.4rem" objectFit="contain" />)}
      </Flex>
    ) : null}
    <Box flex={1} minW={0}>
      {label ? <Text fontSize="1.1rem" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={1} letterSpacing="-0.01em" lineClamp={1}>{label}</Text> : null}
      {line ? <Text fontSize="0.78rem" fontWeight="black" color={INFO} textTransform="uppercase" letterSpacing="0.08em" mt={1} lineClamp={1}>{line}</Text> : null}
    </Box>
    {big != null && big !== "" ? (
      <Text fontSize="2.2rem" fontWeight="black" fontStyle="italic" color={bigColor} lineHeight={0.9} letterSpacing="-0.04em" flexShrink={0} fontVariantNumeric="tabular-nums">{big}</Text>
    ) : null}
  </Flex>
);

export const SectionLabel = ({ children }) => (
  <Text px={4} pt={5} pb={2.5} fontSize="0.9rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.24em" textAlign="center">
    {children}
  </Text>
);
