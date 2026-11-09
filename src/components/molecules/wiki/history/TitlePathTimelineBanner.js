import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { useState, useRef } from "react";
import { TITLE_PATH_BUCKETS } from "../../../../data/wiki_data";
import useMountEffect from "../../../../hooks/useMountEffect";
import { randomTimelineDwell, TITLE_PATH_SEGMENTS, eventTimelinePosition } from "./historyModel";
import { MobileTitlePathTimelineBanner } from "./TimelineEventDial";
import { Box, Grid } from "@chakra-ui/react";
import { TITLE_PATH_TIMELINE_CSS, TimelinePeriodCard } from "./TimelinePeriodCard";

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
