import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// PLAYER ANALYTICS BANNER — CONTROL STRIP CONCEPTS
// New banner standard: eyebrow -> title -> subtitle -> controls, controls
// always stacked BELOW (never right-aligned). Strip = one solid color.
// Controls = a DIFFERENT solid color sitting on top of it, so each
// control reads as a distinct clickable thing rather than blending in.
//
// Neither variant relies on outer-container padding — TitleArea and the strip
// each carry their own horizontal padding (px), so both stay aligned with
// each other regardless of which outer wrapper (Hero vs HeroFlushContainer)
// is used, and there's no double-padding when nesting them.
// ═══════════════════════════════════════════════════════════════

const CONTROLS = [
  { label: "Season", options: ["2025"] },
  { label: "Division", options: ["All Divisions", "SWAC West", "SWAC East", "MEAC"] },
  { label: "Position Pool", options: ["All Positions", "QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K / P"] },
];

// Strip = a warm near-black with a red undertone (not true #000) so it reads as a
// continuation/shadow of the hero gradient instead of an unrelated block bolted on.
// Pills = a lighter warm gray so they actually contrast against the strip — the old
// pill color (#141416) was barely lighter than the old strip (#000000).
const STRIP_BG = "#170b0b";
const PILL_BG = "#2a1418";
const OUTER_PX = "clamp(1rem, 2vw, 1.5rem)";

// Custom dropdown — native <select> menus can't be styled cross-browser (that's the ugly
// gray list a native select falls back to), so this is a real from-scratch listbox.
// The panel is rendered via a portal into document.body instead of as a normal
// absolutely-positioned child, because its ancestors (the banner card) use
// overflow:hidden for the rounded-corner gradient clipping — an absolute child would
// get clipped right along with everything else. Portaling escapes that entirely.
// Position is measured synchronously in the click handler (no useEffect needed).
// The full-screen invisible backdrop closes it on outside-click.
const ControlPill = ({ label, options }) => {
  const triggerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(options[0]);
  const [panelRect, setPanelRect] = useState(null);

  const toggleOpen = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPanelRect({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
    setIsOpen((o) => !o);
  };

  return (
    <Box position="relative">
      <Flex
        ref={triggerRef}
        as="button"
        onClick={toggleOpen}
        align="center"
        gap="0.5rem"
        pl="0.75rem"
        pr="0.6rem"
        py="0.4rem"
        bg={PILL_BG}
        border="1px solid"
        borderColor={isOpen ? "whiteAlpha.400" : "whiteAlpha.200"}
        borderRadius="md"
        cursor="pointer"
        _hover={{ borderColor: "whiteAlpha.400" }}
        transition="border-color 0.15s"
      >
        <Text fontSize="0.6rem" fontWeight="black" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.08em" flexShrink={0}>
          {label}
        </Text>
        <Text fontSize="0.7rem" fontWeight="black" color="white" whiteSpace="nowrap">
          {selected}
        </Text>
        <ChevronDown
          size={12}
          color="rgba(255,255,255,0.5)"
          style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
        />
      </Flex>

      {isOpen && panelRect &&
        createPortal(
          <>
            <Box position="fixed" inset={0} zIndex={2000} onClick={() => setIsOpen(false)} />
            <Box
              position="fixed"
              top={`${panelRect.top}px`}
              left={`${panelRect.left}px`}
              minW={`${panelRect.width}px`}
              zIndex={2001}
              bg="#1c0e0e"
              border="1px solid"
              borderColor="whiteAlpha.200"
              borderRadius="md"
              overflow="hidden"
              boxShadow="0 0.5rem 1.5rem rgba(0,0,0,0.5)"
            >
              {options.map((opt) => (
                <Box
                  key={opt}
                  as="button"
                  onClick={() => {
                    setSelected(opt);
                    setIsOpen(false);
                  }}
                  w="full"
                  textAlign="left"
                  px="0.75rem"
                  py="0.5rem"
                  bg={opt === selected ? "whiteAlpha.100" : "transparent"}
                  cursor="pointer"
                  _hover={{ bg: "whiteAlpha.200" }}
                  whiteSpace="nowrap"
                >
                  <Text fontSize="0.7rem" fontWeight={opt === selected ? "black" : "bold"} color={opt === selected ? "white" : "whiteAlpha.700"}>
                    {opt}
                  </Text>
                </Box>
              ))}
            </Box>
          </>,
          document.body,
        )}
    </Box>
  );
};

// "ANALYTICS" as an oversized low-opacity background watermark, matching the site's
// established GhostWord pattern (e.g. Games Hub's "GAMES" behind its title) — replacing
// the small eyebrow caps label. Positioned relative to TitleArea (its containing box),
// which clips via overflow:hidden — the ghost word is physically contained to the title
// region and cannot bleed into the control strip below, no matter its size/offset.
const GhostWord = ({ text }) => (
  <Text
    position="absolute"
    left="1.25rem"
    bottom="-0.5rem"
    fontSize="clamp(6rem, 18vw, 13rem)"
    fontWeight="black"
    fontStyle="italic"
    color="whiteAlpha.100"
    lineHeight={0.8}
    letterSpacing="-0.02em"
    whiteSpace="nowrap"
    pointerEvents="none"
    userSelect="none"
    zIndex={0}
  >
    {text}
  </Text>
);

const TitleBlock = () => (
  <Box position="relative" zIndex={1}>
    <Text fontSize="clamp(1.6rem, 3.2vw, 2.6rem)" fontWeight="black" fontStyle="italic" color="white" lineHeight={0.95} letterSpacing="-0.01em">
      PLAYER ANALYTICS
    </Text>
  </Box>
);

// The title's own bounded, clipped, vertically-centered region — self-contained
// padding (OUTER_PX) so it doesn't depend on whichever outer wrapper is used.
const TitleArea = () => (
  <Box flex="1" minH={0} position="relative" overflow="hidden" display="flex" flexDirection="column" justifyContent="center" px={OUTER_PX}>
    <GhostWord text="ANALYTICS" />
    <TitleBlock />
  </Box>
);

const ControlStrip = ({ variant }) => (
  <Flex
    gap="0.6rem"
    bg={STRIP_BG}
    w={variant === "narrow" ? "fit-content" : "full"}
    mx={variant === "narrow" ? OUTER_PX : 0}
    mb={variant === "narrow" ? OUTER_PX : 0}
    px={variant === "narrow" ? "0.75rem" : OUTER_PX}
    py="0.75rem"
    borderRadius={variant === "narrow" ? "md" : "none"}
    borderTop={variant === "edge" ? "2px solid" : "none"}
    borderColor="whiteAlpha.200"
    flexWrap="wrap"
    position="relative"
    zIndex={2}
    flexShrink={0}
  >
    {CONTROLS.map((c) => (
      <ControlPill key={c.label} {...c} />
    ))}
  </Flex>
);

// ── C. Narrow strip — fit-content, tight under the title (kept — this is the winner) ─
const Hero = ({ children }) => (
  <Box
    w="full"
    h="full"
    bg={`linear-gradient(115deg, #E53E3E 0%, #7a1414 38%, ${STRIP_BG} 82%)`}
    borderRadius="xl"
    overflow="hidden"
    position="relative"
    display="flex"
    flexDirection="column"
    pt={OUTER_PX}
  >
    {children}
  </Box>
);

export const PlayerAnalyticsBannerNarrowStrip = () => (
  <Hero>
    <TitleArea />
    <ControlStrip variant="narrow" />
  </Hero>
);

// ── D. Edge-to-edge strip — a real structural part of the card, not an inset ─
// pill floating over padding. The strip is a genuine flex child spanning the
// full card width with zero margin/padding around IT — only its own content
// (the pills) gets internal breathing room. Bottom corners inherit the card's
// rounding automatically via overflow:hidden on the outer card, no manual radius
// or negative-margin trick needed.
// Gradient's final stop now matches STRIP_BG exactly (was #0a0a0c, a different color
// from the strip) so the hero fades INTO the strip instead of hard-cutting into an
// unrelated flat color. The diagonal angle means the left edge is still reddish right
// up to the seam, so a thin accent border marks it as a deliberate transition rather
// than a collision.
const HeroFlushContainer = ({ children }) => (
  <Box
    w="full"
    h="full"
    bg={`linear-gradient(115deg, #E53E3E 0%, #7a1414 38%, ${STRIP_BG} 82%)`}
    borderRadius="xl"
    overflow="hidden"
    position="relative"
    display="flex"
    flexDirection="column"
  >
    {children}
  </Box>
);

export const PlayerAnalyticsBannerEdgeToEdgeStrip = () => (
  <HeroFlushContainer>
    <TitleArea />
    <ControlStrip variant="edge" />
  </HeroFlushContainer>
);
