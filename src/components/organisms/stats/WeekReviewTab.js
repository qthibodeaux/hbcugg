import { useState, useRef } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { ExportCardButton } from "./ExportCardButton";
import { WeekControl } from "./weekReview/WeekControl";
import { WeekChart } from "./weekReview/WeekChart";

// ─── Tab ─────────────────────────────────────────────────────────────────────

const WeekReviewTab = ({ review }) => {
  const [picked, setPicked] = useState(null);
  const cardRef = useRef(null);
  const week = picked ?? review.defaultWeek;
  const wk = review.weeks.find((w) => w.week === week) ?? review.weeks.find((w) => w.played);

  if (!wk) {
    return (
      <Box bg="bg.secondary" border="1px solid" borderColor="line" borderRadius="lg" p={4}>
        <Text fontSize="sm" color="text.muted">No weeks in this season yet.</Text>
      </Box>
    );
  }

  return (
    <Flex direction="column" gap={4}>
      {/* Own header rather than the shared Section: the title is the card's
          whole point here, so it carries the weight instead of an accent tick. */}
      <Box ref={cardRef} bg="bg.secondary" border="1px solid" borderColor="line" borderRadius="lg" p={{ base: 4, lg: 5 }}>
        <Flex align="baseline" justify="space-between" gap={4} wrap="wrap" mb={4}>
          <Text
            fontSize={{ base: "1.35rem", lg: "1.9rem" }}
            fontWeight="900"
            fontStyle="italic"
            color="var(--gg-ink)"
            textTransform="uppercase"
            letterSpacing="-0.02em"
            lineHeight={1}
          >
            Did We Really Get Beat That Bad?
          </Text>
          <Text w="100%" order={1} fontSize={{ base: "0.95rem", lg: "1.2rem" }} fontWeight="900" color="text.primary" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={1} mt={-2}>
            Net Success Rates in {wk.label}
          </Text>
          <Flex align="center" gap={3}>
            <ExportCardButton target={cardRef} filename={`did-we-really-get-beat-that-bad-${review.season ?? "season"}-week-${wk.week}.png`} />
          </Flex>
        </Flex>

        <Box mb={4} data-export-skip="true">
          <WeekControl weeks={review.weeks} value={wk.week} onChange={setPicked} />
        </Box>

        <WeekChart games={wk.games} />
      </Box>

    </Flex>
  );
};

export default WeekReviewTab;
