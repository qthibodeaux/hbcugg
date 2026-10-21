import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { PRINT_SHADE, shadeVsLeague as pageShadeVsLeague } from "../page/boxscore/ProductionPrimitives";
import { teamAccent, teamLogo, teamShort } from "./exportData";

// ═══════════════════════════════════════════════════════════════════════════════
// POSTER CHROME — the shared frame every export image sits in
// ═══════════════════════════════════════════════════════════════════════════════
// Fixed 1100px, dark ground, our banner treatment on top (logos bleeding off the
// corners as watermarks, team names in the display face, records, the FINAL pill
// with the margin and date in the middle). Sections carry the house eyebrow. The
// posters are their own tree — nothing here is responsive, and nothing here is
// reused by the live page.

export const POSTER_W = 1100;
export const POSTER_BG = "#0B0B0D";
export const CARD_BG = "#141416";
export const HAIRLINE = "rgba(255,255,255,0.08)";

const DISPLAY = "'Inter', system-ui, sans-serif";

export const Poster = ({ children, innerRef }) => (
  <Box ref={innerRef} w={`${POSTER_W}px`} bg={POSTER_BG} color="white" fontFamily={DISPLAY} p="28px" position="relative" overflow="hidden" flexShrink={0}>
    {children}
  </Box>
);

/** Title band — the poster's name, tracked caps, with the accent rule under it. */
export const PosterTitle = ({ kicker, title, accent }) => (
  <Box mb="16px">
    {kicker && (
      <Text fontSize="12px" fontWeight="900" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.28em" mb="6px">
        {kicker}
      </Text>
    )}
    <Text fontSize="42px" fontWeight="950" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.02em" lineHeight={1}>
      {title}
    </Text>
    <Box mt="12px" h="3px" w="88px" bg={accent} borderRadius="full" />
  </Box>
);

const Side = ({ team, align, winner }) => {
  const isRight = align === "right";
  const accent = teamAccent(team.id);
  return (
    <Flex align="center" gap="16px" direction={isRight ? "row-reverse" : "row"} flex="1" minW={0} position="relative" zIndex={1}>
      <Image src={teamLogo(team.id)} alt="" w="84px" h="84px" objectFit="contain" flexShrink={0} />
      <Box textAlign={isRight ? "right" : "left"} minW={0}>
        <Text fontSize="30px" fontWeight="950" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={1} whiteSpace="nowrap" color={winner ? "white" : "rgba(255,255,255,0.75)"}>
          {team.name}
        </Text>
        <Text fontSize="20px" fontWeight="900" textTransform="uppercase" letterSpacing="0.02em" lineHeight={1.1} color="rgba(255,255,255,0.55)" mt="2px">
          {team.mascot}
        </Text>
        <Flex gap="6px" mt="6px" justify={isRight ? "flex-end" : "flex-start"} align="baseline">
          <Text fontSize="13px" fontWeight="900" color="white">{team.confRecord ?? "—"} {team.conference ? String(team.conference).toUpperCase() : ""}</Text>
          <Text fontSize="13px" fontWeight="800" color="rgba(255,255,255,0.4)">({team.record ?? "—"})</Text>
        </Flex>
      </Box>
      <Text fontSize="64px" fontWeight="950" fontStyle="italic" lineHeight={1} color={winner ? "white" : "rgba(255,255,255,0.45)"} ml={isRight ? 0 : "auto"} mr={isRight ? "auto" : 0} flexShrink={0}>
        {team.score ?? "—"}
      </Text>
      <Box position="absolute" top="-40px" bottom="-40px" w="4px" bg={accent} {...(isRight ? { right: "-28px" } : { left: "-28px" })} />
    </Flex>
  );
};

// Text on a team-colour fill: dark on a light fill (JSU's white, Southern's
// light blue), white otherwise — so the pill's label never vanishes.
const inkOnFill = (hex) => {
  const raw = String(hex ?? "").replace("#", "");
  if (raw.length !== 6) return "white";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(raw.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.6 ? "#0B0B0D" : "white";
};

/** The scoreboard strip, after the game page banner. */
export const PosterBanner = ({ header }) => {
  const { away, home, winnerId, margin, date, weekLabel, status, isOT } = header;
  const winnerShort = winnerId ? teamShort(winnerId) : null;
  // `date` is ISO on the file ("2026-09-12"); the metadata fallback is already "09/12/2026".
  const parsed = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00`) : null;
  const dateLabel = parsed ? parsed.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : date ?? null;
  return (
    <Box position="relative" bg={CARD_BG} borderRadius="16px" px="28px" py="22px" mb="18px" overflow="hidden" border="1px solid" borderColor={HAIRLINE}>
      {/* Watermarks — the marks bleeding off both corners, same as the banner standard. */}
      <Image src={teamLogo(away.id)} alt="" position="absolute" left="-38px" bottom="-60px" w="240px" h="240px" objectFit="contain" opacity={0.12} pointerEvents="none" />
      <Image src={teamLogo(home.id)} alt="" position="absolute" right="-38px" bottom="-60px" w="240px" h="240px" objectFit="contain" opacity={0.12} pointerEvents="none" />

      <Flex align="center" gap="24px">
        <Side team={away} align="left" winner={winnerId === away.id} />

        <Flex direction="column" align="center" flexShrink={0} px="18px" borderX="1px solid" borderColor={HAIRLINE} minW="170px" position="relative" zIndex={1}>
          <Box px="12px" py="3px" bg={winnerId ? teamAccent(winnerId) : "rgba(255,255,255,0.15)"} borderRadius="4px">
            <Text fontSize="11px" fontWeight="950" textTransform="uppercase" letterSpacing="0.18em" color={winnerId ? inkOnFill(teamAccent(winnerId)) : "white"}>
              {status === "final" ? `Final${isOT ? " / OT" : ""}` : String(status ?? "").toUpperCase()}
            </Text>
          </Box>
          <Text fontSize="15px" fontWeight="950" textTransform="uppercase" letterSpacing="0.06em" mt="8px" whiteSpace="nowrap">
            {winnerShort && margin != null ? `${winnerShort} by ${margin}` : "—"}
          </Text>
          <Text fontSize="11px" fontWeight="800" color="rgba(255,255,255,0.4)" letterSpacing="0.16em" mt="4px" whiteSpace="nowrap">
            {[weekLabel, dateLabel].filter(Boolean).join(" · ")}
          </Text>
        </Flex>

        <Side team={home} align="right" winner={winnerId === home.id} />
      </Flex>
    </Box>
  );
};

/** Section eyebrow — the house standard, scaled for print. */
export const PosterSection = ({ title, accent, right, children, mb = "14px" }) => (
  <Box mb={mb}>
    <Flex align="center" justify="space-between" pb="8px" mb="10px" borderBottom="1px solid" borderColor={HAIRLINE}>
      <Flex align="center" gap="10px">
        <Box w="8px" h="8px" bg={accent} borderRadius="full" />
        <Text fontSize="15px" fontWeight="950" textTransform="uppercase" letterSpacing="0.2em" color="rgba(255,255,255,0.7)">
          {title}
        </Text>
      </Flex>
      {right}
    </Flex>
    {children}
  </Box>
);

/** Column head text for the poster tables. */
export const Head = ({ children, align = "right", sub }) => (
  <Box textAlign={align} minW={0}>
    <Text fontSize="12px" fontWeight="900" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.1}>
      {children}
    </Text>
    {sub && <Text fontSize="9px" fontWeight="700" color="rgba(255,255,255,0.28)" lineHeight={1.2}>{sub}</Text>}
  </Box>
);

/** A comparative cell — the red/green tint against the league, text stays white. */
export const Shaded = ({ value, shade, align = "right", mono = true, size = "16px" }) => (
  <Flex justify={align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start"} minW={0}>
    <Box bg={shade ?? "transparent"} borderRadius="4px" px={shade ? "10px" : 0} py={shade ? "2px" : 0} minW={shade ? "64px" : undefined} textAlign="center">
      <Text fontSize={size} fontWeight="900" fontFamily={mono ? "mono" : undefined} lineHeight={1.2} whiteSpace="nowrap">
        {value}
      </Text>
    </Box>
  </Flex>
);

/** Red/green tint against a league entry, deeper by distance across the league's spread. */
// The game page's league shading, at print strength — one function, two surfaces.
export const shadeVsLeague = (value, league, opts = {}) => pageShadeVsLeague(value, league, { ...opts, strength: PRINT_SHADE });
