import { useState, useRef, useMemo } from "react";
import { CHARTS, DATA } from "./ddModel";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ExportCardButton } from "../stats/ExportCardButton";
import { Chart, Poster } from "./DownDistanceViews";

export const DownDistanceCharts = () => {
  const [id, setId] = useState(CHARTS[0].id);
  const [hover, setHover] = useState(null);
  const posterRef = useRef(null);
  const item = useMemo(() => CHARTS.find((c) => c.id === id) ?? CHARTS[0], [id]);

  return (
    <Box>
      <Flex gap={2} wrap="wrap" mb={5}>
        {CHARTS.map((c) => {
          const on = c.id === item.id;
          return (
            <Flex key={c.id} as="button" type="button" onClick={() => { setHover(null); setId(c.id); }}
              px={3.5} h="2.2rem" align="center" borderRadius="md" border="1px solid"
              borderColor={on ? "brand.500" : "line.strong"} bg={on ? "line" : "transparent"} _hover={{ bg: "line" }}>
              <Text fontSize="sm" fontWeight={on ? "900" : "700"} color={on ? "text.primary" : "text.secondary"} whiteSpace="nowrap">{c.chip}</Text>
            </Flex>
          );
        })}
      </Flex>

      <Flex align="flex-end" justify="space-between" gap={3} mb={4} wrap="wrap">
        <Text fontSize="clamp(1.6rem, 3.2vw, 2.6rem)" fontWeight="900" fontStyle="italic" color="var(--gg-ink)" textTransform="uppercase" letterSpacing="-0.03em" lineHeight={0.95}>
          {item.title}
        </Text>
        <ExportCardButton target={posterRef} filename={() => `swac-down-distance-${item.id}-${DATA.season}-w${DATA.through_week}.png`.replace(/_/g, "-")} />
      </Flex>

      <Box bg="bg.secondary" border="1px solid" borderColor="line" borderRadius="lg" p={4} h={item.kind === "scatter" ? "auto" : "640px"}>
        <Chart item={item} hover={hover} setHover={setHover} />
      </Box>

      {/* Export source: off screen, fixed size. */}
      <Box position="fixed" left="-20000px" top={0} aria-hidden="true" pointerEvents="none">
        <Poster item={item} posterRef={posterRef} />
      </Box>
    </Box>
  );
};
