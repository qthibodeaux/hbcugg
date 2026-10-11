import React, { useMemo, useState, useRef } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";
import { RIVALRIES, TITLE_PATH_BUCKETS } from "../../../data/wiki_data";
import useMountEffect from "../../../hooks/useMountEffect";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

const TEAMS = teamsData.teams;
const TEAM_BY_ID = Object.fromEntries(TEAMS.map((team) => [team.id, team]));

const getTeamLabel = (team) => team?.bannerShort ?? team?.shortName ?? team?.name ?? "TBD";
const resolveRivalryTeams = (rivalry) => ({
  ...rivalry,
  a: TEAM_BY_ID[rivalry.teamA],
  b: TEAM_BY_ID[rivalry.teamB],
});
const readableTextColor = (hexColor) => {
  const hex = hexColor?.replace("#", "");
  if (!hex || hex.length < 6) return "#FFFFFF";

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.58 ? "#070708" : "#FFFFFF";
};

const RIVALRY_TILE_COUNT = 8;
const MOBILE_RIVALRY_TILE_COUNT = 6;
const RIVALRY_MIN_DWELL_MS = 7000;
const RIVALRY_MAX_DWELL_MS = 25000;

const randomRivalryDwell = () =>
  RIVALRY_MIN_DWELL_MS + Math.floor(Math.random() * (RIVALRY_MAX_DWELL_MS - RIVALRY_MIN_DWELL_MS + 1));

const createInitialRivalryTiles = (count) =>
  Array.from({ length: count }, (_, slot) => ({
    slot,
    rivalryIndex: slot,
    version: 0,
  }));

const RIVALRY_BANNER_CSS = `
  @keyframes rivalryTileIn {
    from { opacity: 0; transform: translateY(8px) scale(0.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

const RivalryLogoPair = ({ a, b }) => (
  <Flex
    align="center"
    justify="center"
    gap={{ base: 0, lg: 0 }}
    minW={0}
    flex={1}
    my={{ base: -2.5, lg: -3.5 }}
    position="relative"
  >
    <Image
      src={a.logo}
      alt={a.name}
      boxSize={{ base: "54px", lg: "78px" }}
      objectFit="contain"
      filter="drop-shadow(0 5px 12px rgba(0,0,0,0.82))"
      flexShrink={0}
      transform="translateX(8px) rotate(-6deg)"
      zIndex={1}
    />
    <Text
      fontSize={{ base: "8px", lg: "10px" }}
      color="whiteAlpha.700"
      fontWeight="black"
      textTransform="uppercase"
      lineHeight={1}
      flexShrink={0}
      zIndex={3}
      textShadow="0 2px 8px rgba(0,0,0,0.9)"
    >
      vs
    </Text>
    <Image
      src={b.logo}
      alt={b.name}
      boxSize={{ base: "54px", lg: "78px" }}
      objectFit="contain"
      filter="drop-shadow(0 5px 12px rgba(0,0,0,0.82))"
      flexShrink={0}
      transform="translateX(-8px) rotate(6deg)"
      zIndex={2}
    />
  </Flex>
);

const RivalryTile = ({ rivalry, tileKey }) => {
  const { a, b } = rivalry;
  const aLabel = getTeamLabel(a);
  const bLabel = getTeamLabel(b);
  const titlePanelBg = a.colors.secondary || a.colors.primary || "#FFFFFF";
  const matchupPanelBg = b.colors.secondary || b.colors.primary || "#FFFFFF";

  return (
    <Box
      key={tileKey}
      minW={0}
      minH={0}
      overflow="hidden"
      borderRadius="7px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(135deg, ${a.colors.primary}42 0%, rgba(10,10,12,0.92) 47%, ${b.colors.primary}42 100%)`}
      position="relative"
      p={{ base: 0, lg: 2 }}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      style={{ animation: "rivalryTileIn 420ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
    >
      <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(0,0,0,0.16), rgba(0,0,0,0.44))" />
      <Text
        display={{ base: "none", lg: "block" }}
        position="relative"
        zIndex={3}
        fontSize="10px"
        color={a.colors.secondary || "brand.400"}
        fontWeight="black"
        textTransform="uppercase"
        letterSpacing="0.1em"
        lineHeight={0.95}
        textAlign="center"
        lineClamp={1}
        minW={0}
        textShadow="0 2px 8px rgba(0,0,0,0.9)"
      >
        {rivalry.name}
      </Text>
      <Flex
        display={{ base: "flex", lg: "none" }}
        position="relative"
        zIndex={3}
        w="100%"
        minH="20px"
        px={1}
        py="2px"
        align="center"
        justify="center"
        bg={titlePanelBg}
      >
        <Text
          color={readableTextColor(titlePanelBg)}
          fontSize="9px"
          fontWeight="900"
          textTransform="uppercase"
          letterSpacing="0"
          lineHeight={0.92}
          textAlign="center"
          whiteSpace="normal"
        >
          {rivalry.name}
        </Text>
      </Flex>

      <Box position="relative" zIndex={2} minW={0} flex={1} display="flex" alignItems="center" justifyContent="center" px={{ base: 1, lg: 0 }}>
        <RivalryLogoPair a={a} b={b} />
      </Box>

      <Text
        display={{ base: "none", lg: "block" }}
        position="relative"
        zIndex={3}
        fontSize="11px"
        color="white"
        fontWeight="black"
        textTransform="uppercase"
        letterSpacing="0.02em"
        lineHeight={1}
        textAlign="center"
        lineClamp={1}
        minW={0}
      >
        {aLabel} vs {bLabel}
      </Text>
      <Flex
        display={{ base: "flex", lg: "none" }}
        position="relative"
        zIndex={3}
        w="100%"
        minH="18px"
        px={1}
        py="2px"
        align="center"
        justify="center"
        bg={matchupPanelBg}
      >
        <Text
          color={readableTextColor(matchupPanelBg)}
          fontSize="10px"
          fontWeight="900"
          textTransform="uppercase"
          letterSpacing="0"
          lineHeight={0.95}
          textAlign="center"
          whiteSpace="normal"
        >
          {aLabel} vs {bLabel}
        </Text>
      </Flex>
    </Box>
  );
};

export const ClassicsAndRivalriesBanner = () => {
  const { isMobile } = useLayoutDensity();
  const tileCount = isMobile ? MOBILE_RIVALRY_TILE_COUNT : RIVALRY_TILE_COUNT;
  const rivalries = useMemo(
    () => RIVALRIES.map(resolveRivalryTeams).filter((rivalry) => rivalry.a && rivalry.b),
    [],
  );
  const [tiles, setTiles] = useState(() => createInitialRivalryTiles(tileCount));
  const timersRef = useRef([]);
  const nextRivalryIndexRef = useRef(tileCount);

  useMountEffect(() => {
    let active = true;

    const pickNextRivalryIndex = (currentTiles, slot) => {
      const visibleIndexes = new Set(currentTiles.map((tile) => tile.rivalryIndex));
      visibleIndexes.delete(currentTiles[slot].rivalryIndex);

      let nextIndex = nextRivalryIndexRef.current % rivalries.length;
      let attempts = 0;

      while (visibleIndexes.has(nextIndex) && attempts < rivalries.length) {
        nextIndex = (nextIndex + 1) % rivalries.length;
        attempts += 1;
      }

      nextRivalryIndexRef.current = (nextIndex + 1) % rivalries.length;
      return nextIndex;
    };

    const scheduleSlot = (slot) => {
      timersRef.current[slot] = setTimeout(() => {
        if (!active) return;

        setTiles((currentTiles) => {
          const nextIndex = pickNextRivalryIndex(currentTiles, slot);
          const updatedTiles = [...currentTiles];

          updatedTiles[slot] = {
            slot,
            rivalryIndex: nextIndex,
            version: currentTiles[slot].version + 1,
          };

          return updatedTiles;
        });

        scheduleSlot(slot);
      }, randomRivalryDwell());
    };

    tiles.forEach((tile) => scheduleSlot(tile.slot));

    return () => {
      active = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  });

  return (
    <Box
      h={isMobile ? "auto" : "full"}
      w="full"
      minW={0}
      overflow="hidden"
      borderRadius="8px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="linear-gradient(90deg, rgba(7,7,8,0.98) 0%, rgba(20,20,22,0.96) 38%, rgba(39,27,9,0.94) 100%)"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        width: "3px",
        bg: "#FFD100",
        opacity: 0.9,
      }}
    >
      <style>{RIVALRY_BANNER_CSS}</style>
      <Flex h={isMobile ? "auto" : "100%"} minW={0} direction={isMobile ? "column" : "row"} gap={{ base: 2, lg: 3 }} p={{ base: 2, lg: 3 }}>
        <Box
          w={isMobile ? "full" : { base: "128px", lg: "220px" }}
          h={isMobile ? "3.5rem" : "auto"}
          flexShrink={0}
          minH={0}
          borderRadius="7px"
          overflow="hidden"
          position="relative"
          bg="linear-gradient(135deg, rgba(255,255,255,0.08), rgba(0,0,0,0.55))"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Image
            src="/pics/stadium_dusk.jpg"
            alt=""
            position="absolute"
            inset={0}
            w="100%"
            h="100%"
            objectFit="cover"
            opacity={0.2}
            filter="grayscale(1) contrast(1.35)"
          />
          <Box position="absolute" inset={0} bg="linear-gradient(90deg, rgba(0,0,0,0.78), rgba(0,0,0,0.35))" />
          <Flex position="relative" zIndex={1} h="100%" direction="column" justifyContent="center" px={{ base: 2, lg: 5 }}>
            {isMobile ? (
              <Text
                color="white"
                fontSize="1.15rem"
                fontWeight="black"
                textTransform="uppercase"
                lineHeight={0.95}
                letterSpacing="-0.02em"
                textAlign="center"
                whiteSpace="nowrap"
              >
                Classics & Rivalries
              </Text>
            ) : (<>
              <Text
                display={{ base: "none", lg: "block" }}
                fontSize="4xl"
                color="white"
                fontWeight="black"
                textTransform="uppercase"
                lineHeight={0.92}
                letterSpacing="-0.04em"
                textAlign="center"
                style={{
                  wordBreak: "normal",
                  overflowWrap: "break-word",
                  whiteSpace: "normal"
                }}
              >
                Classics & Rivalries
              </Text>
              <Flex
                display={{ base: "flex", lg: "none" }}
                direction="column"
                align="center"
                justify="center"
                gap={0}
                minW={0}
              >
                <Text
                  color="white"
                  fontSize="23px"
                  fontWeight="black"
                  textTransform="uppercase"
                  lineHeight={0.86}
                  letterSpacing="0"
                  textAlign="center"
                  whiteSpace="nowrap"
                >
                  Classics
                </Text>
                <Text
                  color="white"
                  fontSize="21px"
                  fontWeight="black"
                  textTransform="uppercase"
                  lineHeight={0.88}
                  letterSpacing="0"
                  textAlign="center"
                  whiteSpace="nowrap"
                >
                  &
                </Text>
                <Text
                  color="white"
                  fontSize="20px"
                  fontWeight="black"
                  textTransform="uppercase"
                  lineHeight={0.86}
                  letterSpacing="0"
                  textAlign="center"
                  whiteSpace="nowrap"
                >
                  Rivalries
                </Text>
              </Flex>
            </>)}
          </Flex>
        </Box>

        <Grid
          flex={isMobile ? undefined : 1}
          h={isMobile ? "21rem" : undefined}
          minW={0}
          minH={0}
          templateColumns={isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))"}
          templateRows={isMobile ? "repeat(3, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))"}
          gap={{ base: 1.5, lg: 2 }}
        >
          {tiles.map((tile) => {
            const rivalry = rivalries[tile.rivalryIndex];
            return (
              <RivalryTile
                key={`${tile.slot}-${tile.version}-${rivalry.name}`}
                tileKey={`${tile.slot}-${tile.version}-${rivalry.name}`}
                rivalry={rivalry}
              />
            );
          })}
        </Grid>
      </Flex>
    </Box>
  );
};

const TIMELINE_MIN_DWELL_MS = 7000;
const TIMELINE_MAX_DWELL_MS = 25000;

const TITLE_PATH_TIMELINE_CSS = `
  @keyframes timelineCardIn {
    from { opacity: 0; transform: translateY(6px) scale(0.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

// The dot for each era used to sit at an even 0/20/40/60/80/100% split by
// array index, ignoring both how far apart the eras actually are in time AND
// which of a bucket's several rotating events is currently showing. The
// timeline spans the earliest to the latest year across every bucket (parsed
// from each "1976-1979"-style range); a dot's position is then computed from
// whichever event its card is *currently* displaying, so e.g. Foundations'
// dot walks between 1920/1970/1971 as its card rotates instead of sitting
// pinned to the bucket's fixed start year — a 1971 event should land right
// around the middle of a 1920-2021 span, not wherever its bucket starts.
const parseRangeYears = (range) => {
  const match = String(range).match(/(\d{4}).*?(\d{4})/);
  return match ? [Number(match[1]), Number(match[2])] : [null, null];
};

const parseFirstYear = (yearLike) => {
  const match = String(yearLike).match(/\d{4}/);
  return match ? Number(match[0]) : null;
};

const TITLE_PATH_YEAR_BOUNDS = TITLE_PATH_BUCKETS.reduce(
  (bounds, bucket) => {
    const [start, end] = parseRangeYears(bucket.range);
    return {
      min: Math.min(bounds.min, start),
      max: Math.max(bounds.max, end),
    };
  },
  { min: Infinity, max: -Infinity },
);

const eventTimelinePosition = (yearLike) => {
  const year = parseFirstYear(yearLike);
  const { min, max } = TITLE_PATH_YEAR_BOUNDS;
  if (year == null || max === min) return 50;
  return ((year - min) / (max - min)) * 100;
};

// The track itself is colored per-era instead of one neutral gradient bar —
// each bucket owns the stretch from its own start year up to the next
// bucket's start year (last one runs to the end), so a glance at the bar
// shows which eras dominate the calendar (Foundations owns half of it) and
// which dot belongs to which stretch. Dots stay dark/neutral with a colored
// ring so they don't just disappear into a same-color segment underneath.
const TITLE_PATH_SEGMENTS = TITLE_PATH_BUCKETS.map((bucket, index) => {
  const [start] = parseRangeYears(bucket.range);
  const left = eventTimelinePosition(String(start));
  const nextBucket = TITLE_PATH_BUCKETS[index + 1];
  const right = nextBucket ? eventTimelinePosition(String(parseRangeYears(nextBucket.range)[0])) : 100;
  return { id: bucket.id, tone: bucket.tone, left, width: right - left };
});

const randomTimelineDwell = () =>
  TIMELINE_MIN_DWELL_MS + Math.floor(Math.random() * (TIMELINE_MAX_DWELL_MS - TIMELINE_MIN_DWELL_MS + 1));

const TimelinePeriodCard = ({ bucket, event }) => {
  const textColor = readableTextColor(bucket.tone);
  const mutedColor = textColor === "#FFFFFF" ? "rgba(255,255,255,0.72)" : "rgba(7,7,8,0.68)";
  const pillBg = textColor === "#FFFFFF" ? "rgba(0,0,0,0.28)" : "rgba(255,255,255,0.55)";
  const pillBorder = textColor === "#FFFFFF" ? "rgba(0,0,0,0.4)" : "rgba(7,7,8,0.25)";

  return (
    <Box
      minW={0}
      h="100%"
      overflow="hidden"
      borderRadius="7px"
      border="1px solid"
      borderColor="rgba(0,0,0,0.35)"
      bg={bucket.tone}
      position="relative"
      p={{ base: 2, lg: 2.5 }}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      style={{ animation: "timelineCardIn 420ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
    >
      <Text
        position="absolute"
        right={{ base: "-6px", lg: "-10px" }}
        bottom={{ base: "-10px", lg: "-16px" }}
        fontSize={{ base: "42px", lg: "62px" }}
        color={textColor}
        opacity={0.1}
        fontWeight="black"
        lineHeight={0.8}
        pointerEvents="none"
      >
        {bucket.range}
      </Text>

      <Flex align="center" justify="space-between" gap={2} position="relative" zIndex={1}>
        <Text
          fontSize={{ base: "7px", lg: "8px" }}
          color={textColor}
          fontWeight="black"
          textTransform="uppercase"
          letterSpacing="0.12em"
          lineClamp={1}
        >
          {bucket.title}
        </Text>
        <Box px={1.5} py={0.5} borderRadius="999px" bg={pillBg} border="1px solid" borderColor={pillBorder} minW={0}>
          <Text fontSize="7px" color={textColor} fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
            {bucket.range}
          </Text>
        </Box>
      </Flex>

      <Box key={`${bucket.id}-${event.year}-${event.label}`} position="relative" zIndex={1} minW={0} style={{ animation: "timelineCardIn 360ms cubic-bezier(0.22, 1, 0.36, 1) both" }}>
        <Text
          fontSize={{ base: "lg", lg: "2xl" }}
          color={textColor}
          fontWeight="black"
          lineHeight={0.82}
          lineClamp={1}
          mb={1}
        >
          {event.year}
        </Text>
        <Text
          fontSize={{ base: "9px", lg: "11px" }}
          color={textColor}
          fontWeight="black"
          textTransform="uppercase"
          lineHeight={0.95}
          lineClamp={1}
          mb={1}
        >
          {event.label}
        </Text>
        <Text
          fontSize={{ base: "7px", lg: "8px" }}
          color={mutedColor}
          fontWeight="bold"
          lineHeight={1.25}
          lineClamp={2}
        >
          {event.detail}
        </Text>
      </Box>

      <Box position="relative" zIndex={1} h="2px" w="54%" bg={textColor} borderRadius="full" opacity={0.6} />
    </Box>
  );
};

// Mobile — a different mechanic entirely, matching the state-dial explorer
// built for the conference footprint map: a vertical scroll-snap dial on the
// left spans every individual event across all 6 eras (not the eras
// themselves), and dragging/tapping it swaps which single event's details
// show in the main area. No auto-rotation, no per-era color-coding — the
// user drives it directly, and the display panel stays plain/neutral like
// the rest of the site instead of theming itself to the era's tone.
const ALL_TIMELINE_EVENTS = TITLE_PATH_BUCKETS.flatMap((bucket) =>
  bucket.events.map((event) => ({ ...event, bucketId: bucket.id, bucketTitle: bucket.title, bucketRange: bucket.range })),
);

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

const MobileTitlePathTimelineBanner = () => {
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

export const TitlePathTimelineBanner = () => {
  const { isMobile } = useLayoutDensity();
  const [indexes, setIndexes] = useState(() =>
    Object.fromEntries(TITLE_PATH_BUCKETS.map((bucket) => [bucket.id, 0])),
  );
  const timersRef = useRef([]);

  useMountEffect(() => {
    const scheduleBucket = (bucket) => {
      const timer = setTimeout(() => {
        setIndexes((prev) => ({
          ...prev,
          [bucket.id]: (prev[bucket.id] + 1) % bucket.events.length,
        }));
        scheduleBucket(bucket);
      }, randomTimelineDwell());

      timersRef.current.push(timer);
    };

    TITLE_PATH_BUCKETS.forEach(scheduleBucket);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  });

  if (isMobile) return <MobileTitlePathTimelineBanner />;

  const topBuckets = [TITLE_PATH_BUCKETS[0], TITLE_PATH_BUCKETS[2], TITLE_PATH_BUCKETS[4]];
  const bottomBuckets = [TITLE_PATH_BUCKETS[1], TITLE_PATH_BUCKETS[3], TITLE_PATH_BUCKETS[5]];

  return (
    <Box
      h="full"
      w="full"
      minW={0}
      overflow="hidden"
      borderRadius="8px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="linear-gradient(90deg, rgba(4,4,5,0.98) 0%, rgba(16,16,18,0.97) 44%, rgba(28,17,7,0.94) 100%)"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        width: "3px",
        bg: "#FFFFFF",
        opacity: 0.9,
      }}
    >
      <style>{TITLE_PATH_TIMELINE_CSS}</style>
      <Box h="100%" minW={0} p={{ base: 2, lg: 3 }} display="flex" flexDirection="column" justifyContent="space-between">
        <Grid
          templateColumns="repeat(3, minmax(0, 1fr))"
          gap={{ base: 1.5, lg: 2 }}
          h="39%"
        >
          {topBuckets.map((bucket) => (
            <TimelinePeriodCard
              key={bucket.id}
              bucket={bucket}
              event={bucket.events[indexes[bucket.id] ?? 0]}
            />
          ))}
        </Grid>

        <Box position="relative" h="12%" display="flex" alignItems="center" px={{ base: 2, lg: 5 }}>
          <Box position="relative" w="100%" h="4px" borderRadius="full" overflow="hidden">
            {TITLE_PATH_SEGMENTS.map((segment) => (
              <Box
                key={`${segment.id}-segment`}
                position="absolute"
                left={`${segment.left}%`}
                width={`${segment.width}%`}
                top={0}
                bottom={0}
                bg={segment.tone}
                opacity={0.85}
              />
            ))}
          </Box>
          {TITLE_PATH_BUCKETS.map((bucket) => {
            const activeEvent = bucket.events[indexes[bucket.id] ?? 0];
            return (
              <Box
                key={`${bucket.id}-dot`}
                position="absolute"
                left={`${eventTimelinePosition(activeEvent.year)}%`}
                top="50%"
                transform="translate(-50%, -50%)"
                transition="left 0.8s cubic-bezier(0.65, 0, 0.35, 1)"
                boxSize={{ base: "9px", lg: "12px" }}
                borderRadius="full"
                bg="#0B0B0D"
                border="2px solid"
                borderColor={bucket.tone}
                boxShadow={`0 0 16px ${bucket.tone}bb`}
              />
            );
          })}
        </Box>

        <Grid
          templateColumns="repeat(3, minmax(0, 1fr))"
          gap={{ base: 1.5, lg: 2 }}
          h="39%"
        >
          {bottomBuckets.map((bucket) => (
            <TimelinePeriodCard
              key={bucket.id}
              bucket={bucket}
              event={bucket.events[indexes[bucket.id] ?? 0]}
            />
          ))}
        </Grid>
      </Box>
    </Box>
  );
};
