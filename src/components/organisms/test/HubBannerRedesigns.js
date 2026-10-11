import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ChevronDown, ChevronLeft, ChevronRight, Filter } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// HUB BANNER REDESIGNS — Games Hub / Week Central / Schools rebuilt against the
// new standard proven out on Player Analytics: title -> subtitle -> controls,
// controls ALWAYS stacked below (never right-aligned), controls live in a real
// opaque strip (not translucent pills floating on the gradient), ghost word
// watermark contained to the title area so it can't bleed into the strip.
// Lab-only — the live pages are untouched.
// ═══════════════════════════════════════════════════════════════

const STRIP_BG = "#170b0b";
const PILL_BG = "#2a1418";
const OUTER_PX = "clamp(1rem, 2vw, 1.5rem)";

// ── Shared shell ─────────────────────────────────────────────────────────────

const BannerShell = ({ children }) => (
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

const GhostWord = ({ text, size = "clamp(6rem, 18vw, 13rem)" }) => (
  <Text
    position="absolute"
    left="1.25rem"
    bottom="-0.5rem"
    fontSize={size}
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

// Title area: contained (overflow:hidden clips the ghost word), vertically centered,
// self-padded so it doesn't depend on the outer shell for spacing.
const TitleArea = ({ eyebrow, title, subtitle, ghostText, ghostSize }) => (
  <Box flex="1" minH={0} position="relative" overflow="hidden" display="flex" flexDirection="column" justifyContent="center" px={OUTER_PX}>
    <GhostWord text={ghostText} size={ghostSize} />
    <Box position="relative" zIndex={1}>
      {eyebrow && (
        <Text fontSize="0.65rem" fontWeight="black" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.18em" mb="0.2rem">
          {eyebrow}
        </Text>
      )}
      <Text fontSize="clamp(1.6rem, 3.2vw, 2.6rem)" fontWeight="black" fontStyle="italic" color="white" lineHeight={0.95} letterSpacing="-0.01em">
        {title}
      </Text>
      {subtitle && (
        <Text fontSize="0.75rem" color="whiteAlpha.700" fontWeight="medium" mt="0.4rem">
          {subtitle}
        </Text>
      )}
    </Box>
  </Box>
);

// Opaque control strip — real structural part of the card, full width, flush.
const ControlStrip = ({ children }) => (
  <Flex
    flexShrink={0}
    w="full"
    gap="0.6rem"
    bg={STRIP_BG}
    borderTop="2px solid"
    borderColor="whiteAlpha.200"
    px={OUTER_PX}
    py="0.75rem"
    align="center"
    flexWrap="wrap"
    position="relative"
    zIndex={2}
  >
    {children}
  </Flex>
);

// Real functional dropdown (portal-based — see Player Analytics banner for why).
const Dropdown = ({ label, options }) => {
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
        {label && (
          <Text fontSize="0.6rem" fontWeight="black" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.08em" flexShrink={0}>
            {label}
          </Text>
        )}
        <Text fontSize="0.7rem" fontWeight="black" color="white" whiteSpace="nowrap">
          {selected}
        </Text>
        <ChevronDown size={12} color="rgba(255,255,255,0.5)" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
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

// Segmented pill group — for Schools' Conference filter (a small fixed set of
// mutually-exclusive choices reads better as segmented buttons than a dropdown).
const SegmentedPills = ({ options }) => {
  const [active, setActive] = useState(options[0]);
  return (
    <Flex bg={PILL_BG} border="1px solid" borderColor="whiteAlpha.200" borderRadius="md" p="0.2rem" gap="0.2rem">
      {options.map((opt) => (
        <Box
          key={opt}
          as="button"
          onClick={() => setActive(opt)}
          px="0.65rem"
          py="0.3rem"
          borderRadius="sm"
          bg={active === opt ? "whiteAlpha.300" : "transparent"}
          cursor="pointer"
          _hover={{ bg: active === opt ? "whiteAlpha.300" : "whiteAlpha.100" }}
        >
          <Text fontSize="0.7rem" fontWeight="black" color={active === opt ? "white" : "whiteAlpha.600"}>
            {opt}
          </Text>
        </Box>
      ))}
    </Flex>
  );
};

const IconButton = ({ children, ...props }) => (
  <Flex
    as="button"
    align="center"
    justify="center"
    w="2rem"
    h="2rem"
    bg={PILL_BG}
    border="1px solid"
    borderColor="whiteAlpha.200"
    borderRadius="md"
    cursor="pointer"
    _hover={{ borderColor: "whiteAlpha.400" }}
    flexShrink={0}
    {...props}
  >
    {children}
  </Flex>
);

// ── 1. Games Hub ──────────────────────────────────────────────────────────────
export const GamesHubBannerRedo = () => (
  <BannerShell>
    <TitleArea
      eyebrow={null}
      title="GAMES HUB"
      ghostText="GAMES"
      ghostSize="clamp(6rem, 16vw, 12rem)"
    />
    <ControlStrip>
      <Dropdown label="Season" options={["2025"]} />
      <Dropdown label="Week" options={["All Weeks", "Week 1", "Week 2", "Week 3"]} />
      <Dropdown label="Team" options={["All Teams", "PVAMU", "JSU", "AAMU"]} />
    </ControlStrip>
  </BannerShell>
);

// ── 2. Week Central ───────────────────────────────────────────────────────────
export const WeekCentralBannerRedo = () => (
  <BannerShell>
    <TitleArea
      eyebrow="Game Center"
      title="WEEK CENTRAL"
      subtitle="2025 · Week 0 · 4 visible games · 1 HBCU matchup"
      ghostText="WEEK"
      ghostSize="clamp(6rem, 16vw, 12rem)"
    />
    <ControlStrip>
      <Dropdown label="Season" options={["2025"]} />
      <IconButton>
        <ChevronLeft size={14} color="white" />
      </IconButton>
      <Dropdown label="Week" options={["W0", "W1", "W2"]} />
      <IconButton>
        <ChevronRight size={14} color="white" />
      </IconButton>
      <Box
        as="button"
        px="0.9rem"
        py="0.45rem"
        bg="#E53E3E"
        borderRadius="md"
        cursor="pointer"
        _hover={{ bg: "#c53030" }}
      >
        <Text fontSize="0.7rem" fontWeight="black" color="white" letterSpacing="0.05em">
          GO
        </Text>
      </Box>
      <Flex
        as="button"
        align="center"
        gap="0.4rem"
        px="0.75rem"
        py="0.4rem"
        bg={PILL_BG}
        border="1px solid"
        borderColor="#E53E3E"
        borderRadius="md"
        cursor="pointer"
        ml="auto"
      >
        <Filter size={12} color="#E53E3E" />
        <Text fontSize="0.65rem" fontWeight="black" color="white" letterSpacing="0.05em">
          NON-CONF ON
        </Text>
      </Flex>
    </ControlStrip>
  </BannerShell>
);

// ── 3. Schools ─────────────────────────────────────────────────────────────────
export const SchoolsBannerRedo = () => (
  <BannerShell>
    <TitleArea
      eyebrow={null}
      title="SCHOOLS"
      subtitle="The 18 programs · 18 HBCU programs"
      ghostText="SCHOOLS"
      ghostSize="clamp(6rem, 16vw, 12rem)"
    />
    <ControlStrip>
      <Text fontSize="0.6rem" fontWeight="black" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.08em" mr="0.2rem">
        Conference
      </Text>
      <SegmentedPills options={["All", "SWAC", "MEAC"]} />
    </ControlStrip>
  </BannerShell>
);
