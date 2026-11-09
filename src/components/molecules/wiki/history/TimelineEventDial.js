import { useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { parseFirstYear, ALL_TIMELINE_EVENTS } from "./historyModel";

const EVENT_DIAL_ITEM_PX = 44;

const EVENT_DIAL_VIEW_PX = 260;

const EVENT_DIAL_PAD_PX = (EVENT_DIAL_VIEW_PX - EVENT_DIAL_ITEM_PX) / 2;

const EventDial = ({ events, activeIndex, onSelect }) => {
  const scrollRef = useRef(null);
  const isProgrammatic = useRef(false);

  const goTo = (index) => {
    isProgrammatic.current = true;
    onSelect(index);
    scrollRef.current?.scrollTo({ top: index * EVENT_DIAL_ITEM_PX, behavior: "smooth" });
    window.setTimeout(() => {
      isProgrammatic.current = false;
    }, 450);
  };

  const handleScroll = () => {
    if (isProgrammatic.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.max(0, Math.min(events.length - 1, Math.round(el.scrollTop / EVENT_DIAL_ITEM_PX)));
    if (index !== activeIndex) onSelect(index);
  };

  return (
    <Box position="relative" h={`${EVENT_DIAL_VIEW_PX}px`} w="3.25rem" flexShrink={0} overflow="hidden">
      <style>{`.wiki-timeline-dial::-webkit-scrollbar { display: none; }`}</style>
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        className="wiki-timeline-dial"
        h="full"
        overflowY="scroll"
        style={{ scrollSnapType: "y mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <Box h={`${EVENT_DIAL_PAD_PX}px`} />
        {events.map((event, index) => {
          const distance = Math.abs(index - activeIndex);
          const isActive = index === activeIndex;
          return (
            <Flex
              key={`${event.bucketId}-${event.year}-${event.label}`}
              as="button"
              type="button"
              onClick={() => goTo(index)}
              h={`${EVENT_DIAL_ITEM_PX}px`}
              w="full"
              align="center"
              justify="center"
              style={{ scrollSnapAlign: "center" }}
            >
              <Text
                fontSize={isActive ? "0.8rem" : "0.6rem"}
                fontWeight="black"
                color={isActive ? "white" : "whiteAlpha.500"}
                opacity={isActive ? 1 : Math.max(0.3, 1 - distance * 0.28)}
                transition="all 0.2s ease"
              >
                {parseFirstYear(event.year) ?? event.year}
              </Text>
            </Flex>
          );
        })}
        <Box h={`${EVENT_DIAL_PAD_PX}px`} />
      </Box>

      <Box position="absolute" top={0} left={0} right={0} h="2.25rem" bg="linear-gradient(to bottom, #0B0B0D, transparent)" pointerEvents="none" />
      <Box position="absolute" bottom={0} left={0} right={0} h="2.25rem" bg="linear-gradient(to top, #0B0B0D, transparent)" pointerEvents="none" />
      <Box position="absolute" left={0} top="50%" transform="translateY(-50%)" w="3px" h={`${EVENT_DIAL_ITEM_PX}px`} bg="whiteAlpha.700" pointerEvents="none" />
    </Box>
  );
};

export const MobileTitlePathTimelineBanner = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeEvent = ALL_TIMELINE_EVENTS[activeIndex];

  return (
    <Box overflow="hidden" border="1px solid" borderColor="whiteAlpha.100" bg="bg.secondary" position="relative" borderLeft="3px solid" borderLeftColor="whiteAlpha.300">
      <Flex gap="0.6rem" p="0.75rem">
        <EventDial events={ALL_TIMELINE_EVENTS} activeIndex={activeIndex} onSelect={setActiveIndex} />

        <Box flex="1" minW={0} h={`${EVENT_DIAL_VIEW_PX}px`} display="flex" flexDirection="column" justifyContent="center" px="0.4rem">
          <Text fontSize="0.6rem" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.1em" mb="0.5rem" lineClamp={1}>
            {activeEvent.bucketTitle} · {activeEvent.bucketRange}
          </Text>
          <Text fontSize="2.5rem" color="white" fontWeight="black" lineHeight={0.85} mb="0.5rem" lineClamp={1}>
            {activeEvent.year}
          </Text>
          <Text fontSize="1rem" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1.15} mb="0.6rem">
            {activeEvent.label}
          </Text>
          <Text fontSize="0.8rem" color="text.secondary" fontWeight="bold" lineHeight={1.4}>
            {activeEvent.detail}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};
