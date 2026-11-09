import { useRef } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

const DIAL_ITEM_PX = 44;

export const DIAL_VIEW_PX = 224;

const DIAL_PAD_PX = (DIAL_VIEW_PX - DIAL_ITEM_PX) / 2;

export const StateDial = ({ states, activeIndex, onSelect }) => {
  const scrollRef = useRef(null);
  const isProgrammatic = useRef(false);

  const goTo = (index) => {
    isProgrammatic.current = true;
    onSelect(index);
    scrollRef.current?.scrollTo({ top: index * DIAL_ITEM_PX, behavior: "smooth" });
    window.setTimeout(() => {
      isProgrammatic.current = false;
    }, 450);
  };

  const handleScroll = () => {
    if (isProgrammatic.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.max(0, Math.min(states.length - 1, Math.round(el.scrollTop / DIAL_ITEM_PX)));
    if (index !== activeIndex) onSelect(index);
  };

  return (
    <Box position="relative" h={`${DIAL_VIEW_PX}px`} w="2.75rem" flexShrink={0} overflow="hidden">
      <style>{`.wiki-state-dial::-webkit-scrollbar { display: none; }`}</style>
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        className="wiki-state-dial"
        h="full"
        overflowY="scroll"
        style={{ scrollSnapType: "y mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <Box h={`${DIAL_PAD_PX}px`} />
        {states.map((state, index) => {
          const distance = Math.abs(index - activeIndex);
          const isActive = index === activeIndex;
          return (
            <Flex
              key={state.abbr}
              as="button"
              type="button"
              onClick={() => goTo(index)}
              h={`${DIAL_ITEM_PX}px`}
              w="full"
              align="center"
              justify="center"
              style={{ scrollSnapAlign: "center" }}
            >
              <Text
                fontSize={isActive ? "0.9rem" : "0.65rem"}
                fontWeight="black"
                color={isActive ? state.conf.colors.secondary : "whiteAlpha.500"}
                opacity={isActive ? 1 : Math.max(0.3, 1 - distance * 0.3)}
                transition="all 0.2s ease"
              >
                {state.abbr}
              </Text>
            </Flex>
          );
        })}
        <Box h={`${DIAL_PAD_PX}px`} />
      </Box>

      <Box position="absolute" top={0} left={0} right={0} h="2.25rem" bg="linear-gradient(to bottom, #0B0B0D, transparent)" pointerEvents="none" />
      <Box position="absolute" bottom={0} left={0} right={0} h="2.25rem" bg="linear-gradient(to top, #0B0B0D, transparent)" pointerEvents="none" />
      <Box position="absolute" left={0} top="50%" transform="translateY(-50%)" w="3px" h={`${DIAL_ITEM_PX}px`} bg={states[activeIndex].conf.colors.secondary} pointerEvents="none" />
    </Box>
  );
};
