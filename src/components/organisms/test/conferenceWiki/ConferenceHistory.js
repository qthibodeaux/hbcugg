import { Card } from "../../../molecules/wiki/ConferenceWikiCard";
import { Box, Flex, Text, Image, Grid, SimpleGrid } from "@chakra-ui/react";
import { Eyebrow, Title } from "./WikiPrimitives";
import { History, Map } from "lucide-react";
import { getTeamLabel, resolveRivalryTeams, TITLE_PATH_BUCKETS, SHARED_TIMELINE } from "./ConferenceWikiData";
import { useMemo, useState, useRef } from "react";
import { RIVALRIES } from "../../../../data/wiki_data";
import useMountEffect from "../../../../hooks/useMountEffect";

// Existing implementation extracted along responsibility boundaries.

export const TimelinePanel = ({ conf }) => (
  <Card accent={conf.colors.primary}>
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow color={conf.colors.secondary}>{conf.name}</Eyebrow>
          <Title size="lg">Foundation Timeline</Title>
        </Box>
        <History size={24} color={conf.colors.secondary} />
      </Flex>
      <Flex direction="column" gap={3} flex={1}>
        {conf.timeline.map(([year, event]) => (
          <Flex key={year} gap={4} align="center">
            <Box w="45px" textAlign="right">
              <Text fontSize="10px" fontWeight="black" color="whiteAlpha.400">{year}</Text>
            </Box>
            <Box flex={1} bg="rgba(255,255,255,0.04)" p={2} borderRadius="4px" borderLeft="2px solid" borderColor={conf.colors.primary}>
              <Text fontSize="9px" color="text.secondary" fontWeight="bold">{event}</Text>
            </Box>
          </Flex>
        ))}
      </Flex>
    </Box>
  </Card>
);

const RIVALRY_TILE_COUNT = 8;

const RIVALRY_ROTATION_MS = 8000;

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
      p={{ base: 1.5, lg: 2 }}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      style={{ animation: "rivalryTileIn 420ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
    >
      <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(0,0,0,0.16), rgba(0,0,0,0.44))" />
      <Text
        position="relative"
        zIndex={3}
        fontSize={{ base: "8px", lg: "10px" }}
        color={a.colors.secondary || "brand.400"}
        fontWeight="black"
        textTransform="uppercase"
        letterSpacing={{ base: "0.06em", lg: "0.1em" }}
        lineHeight={0.95}
        textAlign="center"
        lineClamp={1}
        minW={0}
        textShadow="0 2px 8px rgba(0,0,0,0.9)"
      >
        {rivalry.name}
      </Text>

      <Box position="relative" zIndex={2} minW={0} flex={1} display="flex" alignItems="center" justifyContent="center">
        <RivalryLogoPair a={a} b={b} />
      </Box>

      <Text
        position="relative"
        zIndex={3}
        fontSize={{ base: "9px", lg: "11px" }}
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
    </Box>
  );
};

export const ClassicsAndRivalriesBanner = () => {
  const rivalries = useMemo(
    () => RIVALRIES.map(resolveRivalryTeams).filter((rivalry) => rivalry.a && rivalry.b),
    [],
  );
  const [rotation, setRotation] = useState(() => ({
    visibleIndexes: Array.from(
      { length: Math.min(RIVALRY_TILE_COUNT, rivalries.length) },
      (_, index) => index,
    ),
    slot: 0,
    nextIndex: RIVALRY_TILE_COUNT,
  }));

  useMountEffect(() => {
    if (rivalries.length <= RIVALRY_TILE_COUNT) return undefined;

    const interval = setInterval(() => {
      setRotation((prev) => {
        const visibleIndexes = [...prev.visibleIndexes];
        visibleIndexes[prev.slot] = prev.nextIndex % rivalries.length;

        return {
          visibleIndexes,
          slot: (prev.slot + 1) % visibleIndexes.length,
          nextIndex: (prev.nextIndex + 1) % rivalries.length,
        };
      });
    }, RIVALRY_ROTATION_MS);

    return () => clearInterval(interval);
  });

  return (
    <Card
      accent="#FFD100"
      bg="linear-gradient(90deg, rgba(7,7,8,0.98) 0%, rgba(20,20,22,0.96) 38%, rgba(39,27,9,0.94) 100%)"
    >
      <style>{RIVALRY_BANNER_CSS}</style>
      <Flex h="100%" minW={0} gap={{ base: 2, lg: 3 }} p={{ base: 2, lg: 3 }}>
        <Box
          w={{ base: "128px", lg: "220px" }}
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
          <Flex position="relative" zIndex={1} h="100%" direction="column" justify="center" px={{ base: 3, lg: 5 }}>
            <Text
              fontSize={{ base: "2xl", lg: "4xl" }}
              color="white"
              fontWeight="black"
              textTransform="uppercase"
              lineHeight={0.82}
              lineClamp={3}
            >
              Classics
              <br />&
              <br />Rivalries
            </Text>
            <Text
              mt={{ base: 2, lg: 3 }}
              fontSize={{ base: "7px", lg: "8px" }}
              color="#FFD100"
              fontWeight="black"
              textTransform="uppercase"
              letterSpacing="0.14em"
              lineClamp={1}
            >
              Rotating HBCU slate
            </Text>
          </Flex>
        </Box>

        <Grid
          flex={1}
          minW={0}
          minH={0}
          templateColumns="repeat(4, minmax(0, 1fr))"
          templateRows="repeat(2, minmax(0, 1fr))"
          gap={{ base: 1.5, lg: 2 }}
        >
          {rotation.visibleIndexes.map((rivalryIndex, slotIndex) => {
            const rivalry = rivalries[rivalryIndex];
            if (!rivalry) return null;
            return (
              <RivalryTile
                key={`${rivalry.name}-${slotIndex}-${rivalryIndex}`}
                tileKey={`${rivalry.name}-${slotIndex}-${rivalryIndex}`}
                rivalry={rivalry}
              />
            );
          })}
        </Grid>
      </Flex>
    </Card>
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

const randomTimelineDwell = () =>
  TIMELINE_MIN_DWELL_MS + Math.floor(Math.random() * (TIMELINE_MAX_DWELL_MS - TIMELINE_MIN_DWELL_MS + 1));

const TimelinePeriodCard = ({ bucket, event }) => (
  <Box
    minW={0}
    h="100%"
    overflow="hidden"
    borderRadius="7px"
    border="1px solid"
    borderColor={`${bucket.tone}66`}
    bg={`linear-gradient(145deg, ${bucket.tone}24, rgba(8,8,10,0.96) 58%)`}
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
      color="white"
      opacity={0.055}
      fontWeight="black"
      lineHeight={0.8}
      pointerEvents="none"
    >
      {bucket.range}
    </Text>

    <Flex align="center" justify="space-between" gap={2} position="relative" zIndex={1}>
      <Text
        fontSize={{ base: "7px", lg: "8px" }}
        color={bucket.tone}
        fontWeight="black"
        textTransform="uppercase"
        letterSpacing="0.12em"
        lineClamp={1}
      >
        {bucket.title}
      </Text>
      <Box px={1.5} py={0.5} borderRadius="999px" bg={`${bucket.tone}1f`} border="1px solid" borderColor={`${bucket.tone}55`} minW={0}>
        <Text fontSize="7px" color="text.secondary" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
          {bucket.range}
        </Text>
      </Box>
    </Flex>

    <Box key={`${bucket.id}-${event.year}-${event.label}`} position="relative" zIndex={1} minW={0} style={{ animation: "timelineCardIn 360ms cubic-bezier(0.22, 1, 0.36, 1) both" }}>
      <Text
        fontSize={{ base: "lg", lg: "2xl" }}
        color="white"
        fontWeight="black"
        lineHeight={0.82}
        lineClamp={1}
        mb={1}
      >
        {event.year}
      </Text>
      <Text
        fontSize={{ base: "9px", lg: "11px" }}
        color="white"
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
        color="text.secondary"
        fontWeight="bold"
        lineHeight={1.25}
        lineClamp={2}
      >
        {event.detail}
      </Text>
    </Box>

    <Box position="relative" zIndex={1} h="2px" w="54%" bg={bucket.tone} borderRadius="full" opacity={0.75} />
  </Box>
);

export const TitlePathTimelineBanner = () => {
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

  const topBuckets = [TITLE_PATH_BUCKETS[0], TITLE_PATH_BUCKETS[2], TITLE_PATH_BUCKETS[4]];
  const bottomBuckets = [TITLE_PATH_BUCKETS[1], TITLE_PATH_BUCKETS[3], TITLE_PATH_BUCKETS[5]];

  return (
    <Card
      accent="#FFFFFF"
      bg="linear-gradient(90deg, rgba(4,4,5,0.98) 0%, rgba(16,16,18,0.97) 44%, rgba(28,17,7,0.94) 100%)"
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
          <Box h="3px" w="100%" bg="linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.72), rgba(255,255,255,0.08))" borderRadius="full" />
          {TITLE_PATH_BUCKETS.map((bucket, index) => (
            <Box
              key={`${bucket.id}-dot`}
              position="absolute"
              left={`${(index / (TITLE_PATH_BUCKETS.length - 1)) * 100}%`}
              top="50%"
              transform="translate(-50%, -50%)"
              boxSize={{ base: "9px", lg: "12px" }}
              borderRadius="full"
              bg={bucket.tone}
              border="2px solid"
              borderColor="#0B0B0D"
              boxShadow={`0 0 16px ${bucket.tone}66`}
            />
          ))}
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
    </Card>
  );
};

export const RivalryPanel = () => (
  <Card accent="#A855F7">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow>Defining Matchups</Eyebrow>
          <Title size="lg">Classics & Rivalries</Title>
        </Box>
        <Map size={24} color="#A855F7" />
      </Flex>
      <SimpleGrid columns={2} gap={3} flex={1}>
        {RIVALRIES.slice(0, 6).map(resolveRivalryTeams).map((rivalry) => (
          <Box key={rivalry.name} border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" p={3} bg="rgba(255,255,255,0.02)">
            <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase">{rivalry.name}</Text>
            <Text fontSize="xs" color="white" fontWeight="black" mb={1}>
              {rivalry.a?.name} vs {rivalry.b?.name}
            </Text>
            <Text fontSize="8px" color="text.muted" fontWeight="bold" lineHeight={1.3}>{rivalry.desc}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  </Card>
);

export const SharedTimelinePanel = () => (
  <Card accent="#FFFFFF" bg="rgba(20,20,22,0.99)">
    <Box p={4} h="100%">
      <Flex align="center" gap={3} mb={4}>
        <History size={20} color="white" />
        <Box>
          <Eyebrow color="white">Shared HBCU History</Eyebrow>
          <Title size="md">The Unified Timeline</Title>
        </Box>
      </Flex>
      <Flex direction="column" gap={3}>
        {SHARED_TIMELINE.map(([year, text]) => (
          <Flex key={year} gap={4} align="center">
            <Box w="60px" textAlign="right">
              <Text fontSize="xs" fontWeight="black" color="whiteAlpha.400">{year}</Text>
            </Box>
            <Box flex={1} bg="whiteAlpha.50" p={2} borderRadius="4px" borderLeft="2px solid white">
              <Text fontSize="10px" color="text.secondary" fontWeight="bold">{text}</Text>
            </Box>
          </Flex>
        ))}
      </Flex>
    </Box>
  </Card>
);
