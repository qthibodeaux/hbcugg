import { useCallback, useState } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { PRINT_SHADE, shadeVsLeague as pageShadeVsLeague } from "../../../utils/productionPresentation";
import { teamAccent, teamLogo, teamShort } from "./exportData";
import { getColorScheme } from "../../../theme/colorScheme";
import { ExportWordmark } from "../../molecules/export/ExportWordmark";

// ═══════════════════════════════════════════════════════════════════════════════
// POSTER CHROME — the shared frame every export image sits in
// ═══════════════════════════════════════════════════════════════════════════════
// Fixed 68.75rem, the light / night ground (palette.css variables, so it follows
// the site switch), our banner treatment on top (logos bleeding off the
// corners as watermarks, team names in the display face, records, the FINAL pill
// with the margin and date in the middle). Sections carry the house eyebrow. The
// posters are their own tree — nothing here is responsive, and nothing here is
// reused by the live page.

export const POSTER_W = 1100;
// The 16:9 frame (YouTube slides): 1920 x 1080.
export const WIDE_W = 1920;
export const WIDE_H = 1080;
export const POSTER_BG = "var(--gg-bg-primary)";
export const CARD_BG = "var(--gg-bg-secondary)";
export const HAIRLINE = "var(--gg-poster-line)";
export const CARD_SHADOW = "var(--gg-poster-shadow)";

const DISPLAY = "'Inter', system-ui, sans-serif";

// `w` / `h` for the odd fixed frame (the 16:9 drive chart is 1920 x 1080); every other poster is
// 1100 wide and as tall as its content.
export const Poster = ({ children, innerRef, w = POSTER_W, h, ...props }) => (
  <Box ref={innerRef} data-gg-poster="" w={`${(w) / 16}rem`} h={h ? `${(h) / 16}rem` : undefined} {...props} bg={POSTER_BG} color="var(--gg-ink)" fontFamily={DISPLAY} p="1.75rem" position="relative" overflow="hidden" flexShrink={0}>
    {children}
  </Box>
);

// 16:9 body: fills the space under the header and, when a long game runs taller than the
// frame, scales the content down (from the top left, laid out wider to match) so nothing is cut
// and the columns still run edge to edge. Measured with a
// ResizeObserver on a callback ref; the layout height ignores the scale, so it settles at once.
export const FitBody = ({ children, ...props }) => {
  const [scale, setScale] = useState(1);
  const ref = useCallback((inner) => {
    if (!inner) return undefined;
    const measure = () => {
      const room = inner.parentElement?.clientHeight ?? 0;
      const need = inner.offsetHeight;
      const next = room > 0 && need > room ? room / need : 1;
      setScale((s) => (Math.abs(s - next) > 0.005 ? next : s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    if (inner.parentElement) ro.observe(inner.parentElement);
    return () => ro.disconnect();
  }, []);
  return (
    <Box flex="1" minH={0} position="relative" overflow="hidden" {...props}>
      {/* Laid out wider by the same factor it shrinks, so the scaled content still reaches both edges. */}
      <Box ref={ref} style={{ width: `${100 / scale}%`, minHeight: "100%", display: "flex", flexDirection: "column", transform: scale < 1 ? `scale(${scale})` : undefined, transformOrigin: "top left" }}>
        {children}
      </Box>
    </Box>
  );
};

/** Title band — the poster's name, tracked caps, with the accent rule under it. */
export const PosterTitle = ({ kicker, title, accent }) => (
  <Box mb="1rem">
    {kicker && (
      <Text fontSize="0.75rem" fontWeight="900" color="rgba(var(--gg-fg), calc(0.45 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.28em" mb="0.375rem">
        {kicker}
      </Text>
    )}
    <Text fontSize="2.625rem" fontWeight="950" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.02em" lineHeight={1}>
      {title}
    </Text>
    <Box mt="0.75rem" h="0.1875rem" w="5.5rem" bg={accent} borderRadius="full" />
  </Box>
);

// `slide`: the 16:9 banner, a little shorter and with bigger small print (records), read on a TV.
const Side = ({ team, align, winner, slide = false }) => {
  const isRight = align === "right";
  const accent = teamAccent(team.id);
  return (
    <Flex align="center" gap="1rem" direction={isRight ? "row-reverse" : "row"} flex="1" minW={0} position="relative" zIndex={1}>
      <Image src={teamLogo(team.id)} alt="" w={slide ? "4.75rem" : "5.25rem"} h={slide ? "4.75rem" : "5.25rem"} objectFit="contain" flexShrink={0} />
      <Box textAlign={isRight ? "right" : "left"} minW={0}>
        <Text fontSize={slide ? "2.125rem" : "1.875rem"} fontWeight="950" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={1} whiteSpace="nowrap" color={winner ? "var(--gg-ink)" : "rgba(var(--gg-fg), calc(0.75 + var(--gg-faint-boost, 0)))"}>
          {team.name}
        </Text>
        <Text fontSize={slide ? "1.3125rem" : "1.25rem"} fontWeight="900" textTransform="uppercase" letterSpacing="0.02em" lineHeight={1.1} color="rgba(var(--gg-fg), calc(0.55 + var(--gg-faint-boost, 0)))" mt="0.125rem">
          {team.mascot}
        </Text>
        <Flex gap="0.375rem" mt={slide ? "0.25rem" : "0.375rem"} justify={isRight ? "flex-end" : "flex-start"} align="baseline">
          <Text fontSize={slide ? "1.0625rem" : "0.8125rem"} fontWeight="900" color="var(--gg-ink)">{team.confRecord ?? "—"} {team.conference ? String(team.conference).toUpperCase() : ""}</Text>
          <Text fontSize={slide ? "1.0625rem" : "0.8125rem"} fontWeight="800" color="rgba(var(--gg-fg), calc(0.4 + var(--gg-faint-boost, 0)))">({team.record ?? "—"})</Text>
        </Flex>
      </Box>
      <Text fontSize={slide ? "4.75rem" : "4rem"} fontWeight="950" fontStyle="italic" lineHeight={1} color={winner ? "var(--gg-ink)" : "rgba(var(--gg-fg), calc(0.45 + var(--gg-faint-boost, 0)))"} ml={isRight ? 0 : "auto"} mr={isRight ? "auto" : 0} flexShrink={0}>
        {team.score ?? "—"}
      </Text>
      <Box position="absolute" top="-2.5rem" bottom="-2.5rem" w="0.25rem" bg={accent} {...(isRight ? { right: "-1.75rem" } : { left: "-1.75rem" })} />
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

/** The scoreboard strip, after the game page banner. On the 16:9 slides it is the only header:
 *  `label` puts HBCUGG and the slide's name ("Offensive Breakdown") at the top of the middle. */
export const PosterBanner = ({ header, label }) => {
  const { away, home, winnerId, margin, date, weekLabel, status, isOT } = header;
  const winnerShort = winnerId ? teamShort(winnerId) : null;
  // `date` is ISO on the file ("2026-09-12"); the metadata fallback is already "09/12/2026".
  const parsed = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00`) : null;
  const dateLabel = parsed ? parsed.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : date ?? null;
  return (
    <Box position="relative" bg={CARD_BG} boxShadow="var(--gg-poster-shadow)" borderRadius="1rem" px="1.75rem" py={label ? "0.75rem" : "1.375rem"} mb="0.625rem" overflow="hidden" border="0.0625rem solid" borderColor={HAIRLINE}>
      {/* Watermarks — the marks bleeding off both corners, same as the banner standard. */}
      <Image src={teamLogo(away.id)} alt="" position="absolute" left="-2.375rem" bottom="-3.75rem" w="15rem" h="15rem" objectFit="contain" opacity={0.12} pointerEvents="none" />
      <Image src={teamLogo(home.id)} alt="" position="absolute" right="-2.375rem" bottom="-3.75rem" w="15rem" h="15rem" objectFit="contain" opacity={0.12} pointerEvents="none" />

      <Flex align="center" gap="1.5rem">
        <Side team={away} align="left" winner={winnerId === away.id} slide={!!label} />

        <Flex direction="column" align="center" flexShrink={0} px={label ? "1.75rem" : "1.125rem"} borderX="0.0625rem solid" borderColor={HAIRLINE} minW={label ? "18.75rem" : "10.625rem"} position="relative" zIndex={1}>
          {label ? (
            // The slide's middle, four short lines: HBCUGG, the slide's name, the result (pill and
            // margin on one line), the week and date.
            <>
              <ExportWordmark ink="var(--gg-ink)" size="2.375rem" />
              <Text fontSize="1.125rem" fontWeight="950" textTransform="uppercase" letterSpacing="0.2em" mt="0.25rem" whiteSpace="nowrap"
                color="rgba(var(--gg-fg), calc(0.75 + var(--gg-faint-boost, 0)))">
                {label}
              </Text>
              <Flex align="center" gap="0.625rem" mt="0.5rem">
                <Box px="0.625rem" py="0.125rem" bg={winnerId ? teamAccent(winnerId) : "rgba(var(--gg-fg), calc(0.15 + var(--gg-line-boost, 0)))"} borderRadius="0.25rem">
                  <Text fontSize="0.875rem" fontWeight="950" textTransform="uppercase" letterSpacing="0.16em" color={winnerId ? inkOnFill(teamAccent(winnerId)) : "var(--gg-ink)"}>
                    {status === "final" ? `Final${isOT ? " / OT" : ""}` : String(status ?? "").toUpperCase()}
                  </Text>
                </Box>
                <Text fontSize="1.1875rem" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em" whiteSpace="nowrap">
                  {winnerShort && margin != null ? `${winnerShort} by ${margin}` : "—"}
                </Text>
              </Flex>
              <Text fontSize="0.9375rem" fontWeight="800" color="rgba(var(--gg-fg), calc(0.5 + var(--gg-faint-boost, 0)))" letterSpacing="0.12em" mt="0.375rem" whiteSpace="nowrap">
                {[weekLabel, dateLabel].filter(Boolean).join(" · ")}
              </Text>
            </>
          ) : (
          <>
          <Box px="0.75rem" py="0.1875rem" bg={winnerId ? teamAccent(winnerId) : "rgba(var(--gg-fg), calc(0.15 + var(--gg-line-boost, 0)))"} borderRadius="0.25rem">
            <Text fontSize="0.6875rem" fontWeight="950" textTransform="uppercase" letterSpacing="0.18em" color={winnerId ? inkOnFill(teamAccent(winnerId)) : "var(--gg-ink)"}>
              {status === "final" ? `Final${isOT ? " / OT" : ""}` : String(status ?? "").toUpperCase()}
            </Text>
          </Box>
          <Text fontSize="0.9375rem" fontWeight="950" textTransform="uppercase" letterSpacing="0.06em" mt="0.5rem" whiteSpace="nowrap">
            {winnerShort && margin != null ? `${winnerShort} by ${margin}` : "—"}
          </Text>
          <Text fontSize="0.6875rem" fontWeight="800" color="rgba(var(--gg-fg), calc(0.4 + var(--gg-faint-boost, 0)))" letterSpacing="0.16em" mt="0.25rem" whiteSpace="nowrap">
            {[weekLabel, dateLabel].filter(Boolean).join(" · ")}
          </Text>
          </>
          )}
        </Flex>

        <Side team={home} align="right" winner={winnerId === home.id} slide={!!label} />
      </Flex>
    </Box>
  );
};

/** Section eyebrow — the house standard, scaled for print. */
export const PosterSection = ({ title, accent, right, children, mb = "0.875rem", subtle = false }) => (
  <Box mb={mb}>
    <Flex align="center" justify="space-between" pb={subtle ? "0.375rem" : "0.5rem"} mb={subtle ? "0.375rem" : "0.625rem"} borderBottom="0.0625rem solid" borderColor={subtle ? "rgba(var(--gg-fg), calc(0.06 + var(--gg-line-boost, 0)))" : HAIRLINE}>
      <Flex align="center" gap={subtle ? "0.5rem" : "0.625rem"}>
        <Box w={subtle ? "0.375rem" : "0.5rem"} h={subtle ? "0.375rem" : "0.5rem"} bg={accent} borderRadius="full" />
        <Text fontSize={subtle ? "0.875rem" : "0.9375rem"} fontWeight="950" textTransform="uppercase" letterSpacing={subtle ? "0.16em" : "0.2em"} color={subtle ? "rgba(var(--gg-fg), calc(0.56 + var(--gg-faint-boost, 0)))" : "rgba(var(--gg-fg), calc(0.7 + var(--gg-faint-boost, 0)))"}>
          {title}
        </Text>
      </Flex>
      {right}
    </Flex>
    {children}
  </Box>
);

/** Column head text for the poster tables. */
export const Head = ({ children, align = "right", sub, big = false }) => (
  <Box textAlign={align} minW={0}>
    <Text fontSize={big ? "0.875rem" : "0.75rem"} fontWeight="900" color="rgba(var(--gg-fg), calc(0.45 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.1}>
      {children}
    </Text>
    {sub && <Text fontSize="0.5625rem" fontWeight="700" color="rgba(var(--gg-fg), calc(0.28 + var(--gg-faint-boost, 0)))" lineHeight={1.2}>{sub}</Text>}
  </Box>
);

/** A comparative cell — the red/green tint against the league, text stays white. */
export const Shaded = ({ value, shade, align = "right", mono = true, size = "1rem" }) => (
  <Flex justify={align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start"} minW={0}>
    <Box bg={shade ?? "transparent"} borderRadius="0.25rem" px={shade ? "0.625rem" : 0} py={shade ? "0.125rem" : 0} minW={shade ? "4rem" : undefined} textAlign="center">
      <Text fontSize={size} fontWeight="900" fontFamily={mono ? "mono" : undefined} lineHeight={1.2} whiteSpace="nowrap">
        {value}
      </Text>
    </Box>
  </Flex>
);

/** Red/green tint against a league entry, deeper by distance across the league's spread. */
// The game page's league shading, at print strength — one function, two surfaces.
// Light posters need a deeper fill to register on white.
const LIGHT_PRINT_SHADE = { base: 0.3, gain: 0.55 };
export const shadeVsLeague = (value, league, opts = {}) => pageShadeVsLeague(value, league, { ...opts, strength: getColorScheme() === "light" ? LIGHT_PRINT_SHADE : PRINT_SHADE });
