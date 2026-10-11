import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";

// ═══════════════════════════════════════════════════════════════
// BANNER CONTROLS — shared production primitives for the banner standard
// locked in AgentDesignBible.md §2b (2026-07-29) and worked out in the
// Component Lab (#1503–#1508, src/components/organisms/test/).
//
// Controls always stack below the title block, live in a real opaque strip,
// and are genuinely interactive (no native <select>, no decorative pills).
// See the design doc: src/components/organisms/test/4-1md/Banner System Design Doc.md
// ═══════════════════════════════════════════════════════════════

export const BANNER_STRIP_BG = "#0B0B0D";
export const BANNER_PILL_BG = "#1C1C1F";
export const BANNER_OUTER_PX = "clamp(1rem, 2vw, 1.5rem)";

/** Ghost word — must be rendered inside a `position:relative; overflow:hidden` box
 *  sized to just the title region, so it can't bleed into the control strip below.
 *  See design doc §"contained ghost word" for the stacking-context reasoning. */
export const BannerGhostWord = ({ text, size = "clamp(6rem, 18vw, 13rem)", left = "1.25rem", bottom = "-0.5rem" }) => (
  <Text
    position="absolute"
    left={left}
    bottom={bottom}
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

/** Opaque control strip — a real structural flex child, not an inset pill.
 *  position:relative + zIndex:2 as a safety net against ghost-word bleed. */
export const BannerControlStrip = ({
  children,
  justify = "start",
  bg = BANNER_STRIP_BG,
  borderTop = "2px solid",
  borderColor = "whiteAlpha.200",
  py = "0.75rem",
}) => (
  <Flex
    flexShrink={0}
    w="full"
    gap="0.6rem"
    bg={bg}
    borderTop={borderTop}
    borderColor={borderColor}
    px={BANNER_OUTER_PX}
    py={py}
    align="center"
    justify={justify}
    flexWrap="wrap"
    position="relative"
    zIndex={2}
  >
    {children}
  </Flex>
);

/** Real functional dropdown — a themed custom listbox, not a native <select>
 *  (unstyleable cross-browser) and not decorative label+value text.
 *
 *  Controlled OR uncontrolled: pass `value`+`onChange` for real state (production),
 *  omit them for internal-only state (quick demos). Panel renders via a portal to
 *  document.body, positioned from the trigger's measured getBoundingClientRect() —
 *  banner cards use overflow:hidden for their rounded corners, which would silently
 *  clip an un-portaled panel. Position is measured synchronously in the click
 *  handler, not via useEffect (see AGENTS.md's useEffect ban). Outside-click-to-close
 *  uses a full-screen invisible backdrop, not a document event listener. */
export const BannerDropdown = ({ label, options, value, onChange, minW, disabled, disabledHint }) => {
  const { isMobile } = useLayoutDensity();
  const triggerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState(options[0]?.value ?? options[0]);
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalSelected;
  const selectedOption = options.find((o) => (typeof o === "object" ? o.value === selectedValue : o === selectedValue));
  const selectedLabel = typeof selectedOption === "object" ? selectedOption.label : selectedOption ?? selectedValue;

  const [panelRect, setPanelRect] = useState(null);

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPanelRect({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
    setIsOpen((o) => !o);
  };

  const selectOption = (opt) => {
    const v = typeof opt === "object" ? opt.value : opt;
    if (isControlled) onChange?.(v);
    else setInternalSelected(v);
    setIsOpen(false);
  };

  return (
    <Box position="relative">
      <Flex
        ref={triggerRef}
        as="button"
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        title={disabled ? disabledHint : undefined}
        align="center"
        gap="0.5rem"
        pl="0.75rem"
        pr="0.6rem"
        py="0.4rem"
        minW={minW}
        bg={BANNER_PILL_BG}
        border="1px solid"
        borderColor={isOpen ? "whiteAlpha.400" : "whiteAlpha.200"}
        borderRadius={isMobile ? "0" : "md"}
        opacity={disabled ? 0.4 : 1}
        cursor={disabled ? "not-allowed" : "pointer"}
        _hover={disabled ? {} : { borderColor: "whiteAlpha.400" }}
        transition="border-color 0.15s"
      >
        {label && (
          <Text fontSize="0.6rem" fontWeight="black" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.08em" flexShrink={0}>
            {label}
          </Text>
        )}
        <Text fontSize="0.7rem" fontWeight="black" color="white" whiteSpace="nowrap">
          {selectedLabel}
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
              bg="#1C1C1F"
              border="1px solid"
              borderColor="whiteAlpha.200"
              borderRadius={isMobile ? "0" : "md"}
              overflow="hidden"
              boxShadow="0 0.5rem 1.5rem rgba(0,0,0,0.5)"
              maxH="16rem"
              overflowY="auto"
            >
              {options.map((opt) => {
                const v = typeof opt === "object" ? opt.value : opt;
                const l = typeof opt === "object" ? opt.label : opt;
                const optDisabled = typeof opt === "object" && opt.disabled;
                const hint = typeof opt === "object" ? opt.hint : null;
                const isSelected = v === selectedValue;
                return (
                  <Box
                    key={v}
                    as="button"
                    type="button"
                    disabled={optDisabled}
                    title={optDisabled ? hint ?? undefined : undefined}
                    onClick={() => !optDisabled && selectOption(opt)}
                    w="full"
                    textAlign="left"
                    px="0.75rem"
                    py="0.5rem"
                    bg={isSelected ? "whiteAlpha.100" : "transparent"}
                    opacity={optDisabled ? 0.35 : 1}
                    cursor={optDisabled ? "not-allowed" : "pointer"}
                    _hover={optDisabled ? {} : { bg: "whiteAlpha.200" }}
                    whiteSpace="nowrap"
                  >
                    <Flex align="baseline" justify="space-between" gap="1rem">
                      <Text fontSize="0.7rem" fontWeight={isSelected ? "black" : "bold"} color={isSelected ? "white" : "whiteAlpha.700"}>
                        {l}
                      </Text>
                      {hint && (
                        <Text fontSize="0.6rem" fontWeight="bold" color="whiteAlpha.400" whiteSpace="nowrap">
                          {hint}
                        </Text>
                      )}
                    </Flex>
                  </Box>
                );
              })}
            </Box>
          </>,
          document.body,
        )}
    </Box>
  );
};

/** Small icon-only button (prev/next arrows etc.) matching the strip's pill language. */
export const BannerIconButton = ({ children, ariaLabel, disabled, ...props }) => {
  const { isMobile } = useLayoutDensity();
  return (
    <Flex
      as="button"
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      align="center"
      justify="center"
      w="1.75rem"
      h="1.75rem"
      bg={BANNER_PILL_BG}
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius={isMobile ? "0" : "md"}
      cursor={disabled ? "not-allowed" : "pointer"}
      opacity={disabled ? 0.4 : 1}
      _hover={disabled ? {} : { borderColor: "whiteAlpha.400" }}
      flexShrink={0}
      {...props}
    >
      {children}
    </Flex>
  );
};

/** Solid accent action button (GO, etc.) */
export const BannerActionButton = ({ children, primary = "#A855F7", disabled, ...props }) => {
  const { isMobile } = useLayoutDensity();
  return (
    <Box
      as="button"
      type="button"
      disabled={disabled}
      px="0.9rem"
      py="0.45rem"
      bg={disabled ? "whiteAlpha.100" : primary}
      borderRadius={isMobile ? "0" : "md"}
      cursor={disabled ? "not-allowed" : "pointer"}
      _hover={disabled ? {} : { filter: "brightness(1.1)" }}
      {...props}
    >
      <Text fontSize="0.7rem" fontWeight="black" color={disabled ? "whiteAlpha.500" : "white"} letterSpacing="0.05em">
        {children}
      </Text>
    </Box>
  );
};

/** Toggle pill (e.g. "Non-Conf On/Off") */
export const BannerTogglePill = ({ active, onClick, children, icon }) => {
  const { isMobile } = useLayoutDensity();
  return (
    <Flex
      as="button"
      type="button"
      onClick={onClick}
      align="center"
      gap="0.4rem"
      px="0.75rem"
      py="0.4rem"
      bg={active ? "rgba(168,85,247,0.16)" : BANNER_PILL_BG}
      border="1px solid"
      borderColor={active ? "#A855F7" : "whiteAlpha.200"}
      borderRadius={isMobile ? "0" : "md"}
      cursor="pointer"
      _hover={{ borderColor: active ? "#A855F7" : "whiteAlpha.400" }}
    >
      {icon}
      <Text fontSize="0.65rem" fontWeight="black" color="white" letterSpacing="0.05em" whiteSpace="nowrap">
        {children}
      </Text>
    </Flex>
  );
};

/** Segmented pill group — for a small fixed set of mutually-exclusive choices
 *  (e.g. a conference filter) where a dropdown would be overkill. */
export const BannerSegmentedPills = ({ options, value, onChange }) => {
  const { isMobile } = useLayoutDensity();
  return (
    <Flex bg={BANNER_PILL_BG} border="1px solid" borderColor="whiteAlpha.200" borderRadius={isMobile ? "0" : "md"} p="0.2rem" gap="0.2rem">
      {options.map((opt) => {
        const v = typeof opt === "object" ? opt.value : opt;
        const l = typeof opt === "object" ? opt.label : opt;
        const isActive = v === value;
        return (
          <Box
            key={v}
            as="button"
            type="button"
            onClick={() => onChange(v)}
            px="0.65rem"
            py="0.3rem"
            borderRadius={isMobile ? "0" : "sm"}
            bg={isActive ? "whiteAlpha.300" : "transparent"}
            cursor="pointer"
            _hover={{ bg: isActive ? "whiteAlpha.300" : "whiteAlpha.100" }}
          >
            <Text fontSize="0.7rem" fontWeight="black" color={isActive ? "white" : "whiteAlpha.600"}>
              {l}
            </Text>
          </Box>
        );
      })}
    </Flex>
  );
};

/** The title-area box: contained (overflow:hidden clips the ghost word) and
 *  vertically centered. Self-padded so it doesn't depend on the outer banner
 *  shell for spacing. */
export const BannerTitleArea = ({ children }) => (
  <Box flex="1" minH={0} position="relative" overflow="hidden" display="flex" flexDirection="column" justifyContent="center" px={BANNER_OUTER_PX} py="0.75rem">
    {children}
  </Box>
);
