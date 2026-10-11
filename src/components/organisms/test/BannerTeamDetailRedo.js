import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import teamsData from "../../../data/teams.json";

// ═══════════════════════════════════════════════════════════════
// TEAM DETAIL BANNER — REDO
// Same identity treatment as BannerTeamDetail.js (mascot logo bleed, mascot-name
// ghost watermark, italic title, subline) — not reinvented. Only the controls
// changed: the old right-side vertical Season/Go/Toggle column + hairline divider
// is replaced with the same bottom opaque control strip used everywhere else now,
// and the native <select> is replaced with a real themed dropdown.
// Lab-only — BannerTeamDetail.js / the live team page are untouched.
// ═══════════════════════════════════════════════════════════════

const TEAM = teamsData.teams.find((t) => t.id === "alabama-am") ?? teamsData.teams[0];
const SEASONS = ["2025", "2024", "2023", "2022", "2021"];

const STRIP_BG = "#170b0b";
const PILL_BG = "#2a1418";
const OUTER_PX = "clamp(1rem, 2vw, 1.5rem)";

// Same portal-based dropdown used across the other redos, for consistency.
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
        <Text fontSize="0.6rem" fontWeight="black" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.08em" flexShrink={0}>
          {label}
        </Text>
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

export const BannerTeamDetailRedo = () => {
  const primary = TEAM.colors?.primary ?? "#E53E3E";
  const gradient = `linear-gradient(110deg, ${primary} 0%, ${primary}88 25%, #120808 58%, ${STRIP_BG} 100%)`;
  const division = TEAM.division ? `${TEAM.conference} ${TEAM.division}` : TEAM.conference;
  const subLine = `${TEAM.mascot} · ${division} · — - —`;

  return (
    <Box position="relative" overflow="hidden" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100" h="full" bg={gradient} display="flex" flexDirection="column">
      {/* Content region — identity + mascot bleed, unchanged from the original */}
      <Box flex="1" minH={0} position="relative" overflow="hidden">
        <Box position="absolute" right="-40px" top="50%" style={{ transform: "translateY(-50%)" }} pointerEvents="none">
          <Image src={TEAM.logo} w="220px" h="220px" objectFit="contain" style={{ opacity: 0.25, filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.6))" }} />
        </Box>

        <Text
          position="absolute"
          bottom="-0.9rem"
          left="0"
          fontWeight="black"
          fontStyle="italic"
          color="white"
          opacity={0.05}
          textTransform="uppercase"
          lineHeight={1}
          letterSpacing="-0.05em"
          pointerEvents="none"
          userSelect="none"
          whiteSpace="nowrap"
          style={{ fontSize: "clamp(60px, 12vw, 130px)" }}
        >
          {TEAM.mascot.toUpperCase()}
        </Text>

        <Flex h="full" align="center" pl={OUTER_PX} pr={4} minW={0} position="relative" zIndex={1}>
          <Box minW={0}>
            <Text
              fontWeight="black"
              fontStyle="italic"
              color="white"
              textTransform="uppercase"
              lineHeight={0.85}
              letterSpacing="-0.04em"
              whiteSpace="nowrap"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 4rem)" }}
            >
              {TEAM.shortName ?? TEAM.name}
            </Text>
            <Flex align="center" gap={3} mt={2}>
              <Box h="1px" w="20px" bg="rgba(255,255,255,0.3)" flexShrink={0} />
              <Text fontWeight="black" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.14em" whiteSpace="nowrap" style={{ fontSize: "clamp(10px, 1.1vw, 12px)" }}>
                {subLine}
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Box>

      {/* Controls — moved here from the old right-side vertical panel, real dropdown
          instead of a native <select>, opaque full-width strip instead of floating
          on the gradient. */}
      <Flex flexShrink={0} w="full" gap="0.6rem" bg={STRIP_BG} borderTop="2px solid" borderColor="whiteAlpha.200" px={OUTER_PX} py="0.75rem" align="center" position="relative" zIndex={2}>
        <Dropdown label="Season" options={SEASONS} />
        <Box as="button" px="0.9rem" py="0.45rem" bg={primary} borderRadius="md" cursor="pointer" _hover={{ filter: "brightness(1.1)" }}>
          <Text fontSize="0.7rem" fontWeight="black" color="white" letterSpacing="0.05em">
            GO
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};
