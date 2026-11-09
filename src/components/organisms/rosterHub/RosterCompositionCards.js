import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { CLASS_COLORS } from "../../../utils/rosterHubConfig";
import { Flex, Box, Text, Grid } from "@chakra-ui/react";
import { DonutChart, PctBox, DeltaTag } from "./RosterHubPrimitives";

// Extracted from the live roster hub. Existing calculations and layouts preserved.

export const ClassPie = ({ data, experience, wide = false }) => {
  const { isMobile } = useLayoutDensity();
  const classes = (data?.class_distribution ?? []).filter((c) => c.class !== "Unknown");
  const segments = classes.map((c) => ({ pct: c.pct, color: CLASS_COLORS[c.class] ?? "#718096" }));
  const upper = experience?.upperclass_pct ?? 0;
  const vet = experience?.veteran_pct ?? 0;

  // Wide — this version only ever runs where a full-width slot is
  // available (League mode). Desktop: donut, legend, and the Upper/Vets
  // pills all in one row. Mobile: still full-width, but not wide enough
  // for all three side by side — donut + legend pair up in a row instead
  // (there's plenty of room for that pairing), pills drop to their own
  // full-width row below rather than wrapping awkwardly.
  if (wide && isMobile) {
    return (
      <Flex direction="column" gap={3}>
        <Flex align="center" gap="1.25rem">
          <DonutChart segments={segments} size="6.5rem" thickness="1.15rem" />
          <Flex direction="column" gap={1.5} flex={1} minW={0}>
            {classes.map((c) => (
              <Flex key={c.class} align="center" justify="space-between" gap={2}>
                <Flex align="center" gap={2}>
                  <Box boxSize="0.7rem" borderRadius="sm" bg={CLASS_COLORS[c.class] ?? "#718096"} flexShrink={0} />
                  <Text fontSize="sm" fontWeight="black" color="white">{c.class}</Text>
                </Flex>
                <Text fontSize="sm" fontWeight="black" color="text.muted">{c.pct}%</Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
        <Grid templateColumns="repeat(2, 1fr)" gap={2} pt={2} borderTop="1px solid" borderColor="whiteAlpha.100">
          <PctBox label="Upperclass (Jr+Sr+Gr)" pct={upper.toFixed(0)} color="#2c7a7b" />
          <PctBox label="Veterans (Sr+Gr)" pct={vet.toFixed(0)} color="#276749" />
        </Grid>
      </Flex>
    );
  }

  if (wide) {
    return (
      <Flex align="center" gap="2rem" wrap="wrap" py={2}>
        <DonutChart segments={segments} size="9rem" thickness="1.6rem" />
        <Flex direction="column" gap={2} flex="1 1 16rem" minW="14rem">
          {classes.map((c) => (
            <Flex key={c.class} align="center" justify="space-between" gap={3}>
              <Flex align="center" gap={2.5}>
                <Box boxSize="0.85rem" borderRadius="sm" bg={CLASS_COLORS[c.class] ?? "#718096"} flexShrink={0} />
                <Text fontSize="md" fontWeight="black" color="white">{c.class}</Text>
              </Flex>
              <Text fontSize="md" fontWeight="black" color="text.muted">{c.pct}%</Text>
            </Flex>
          ))}
        </Flex>
        <Box w="1px" alignSelf="stretch" bg="whiteAlpha.100" />
        <Flex gap={3} flex="1 1 18rem" minW="14rem">
          <Box flex={1}>
            <PctBox label="Upperclass (Jr+Sr+Gr)" pct={upper.toFixed(0)} color="#2c7a7b" />
          </Box>
          <Box flex={1}>
            <PctBox label="Veterans (Sr+Gr)" pct={vet.toFixed(0)} color="#276749" />
          </Box>
        </Flex>
      </Flex>
    );
  }

  const legend = (
    <Flex direction="column" gap={1} minW={0} w="100%">
      {classes.map((c) => (
        <Flex key={c.class} align="center" justify="space-between" gap={2} minW={0}>
          <Flex align="center" gap={2} minW={0}>
            <Box boxSize="0.6rem" borderRadius="sm" bg={CLASS_COLORS[c.class] ?? "#718096"} flexShrink={0} />
            <Text fontSize="xs" fontWeight="black" color="white" lineClamp={1}>{c.class}</Text>
          </Flex>
          <Text fontSize="xs" fontWeight="black" color="text.muted" flexShrink={0} whiteSpace="nowrap">
            {c.pct}%
          </Text>
        </Flex>
      ))}
    </Flex>
  );

  return (
    <Flex direction="column" h={isMobile ? "auto" : "100%"} justify="center" gap={3}>
      <Flex direction="column" align="center" gap={2}>
        {isMobile ? (
          <DonutChart segments={segments} size="4rem" hollow={false} />
        ) : (
          <DonutChart segments={segments} size="clamp(4.5rem, 9vw, 6rem)" thickness="clamp(0.9rem, 1.8vw, 1.2rem)" />
        )}
        {legend}
      </Flex>
      <Grid templateColumns={isMobile ? "1fr" : "repeat(2, 1fr)"} gap={2} pt={2} borderTop="1px solid" borderColor="whiteAlpha.100">
        <PctBox label="Upperclass (Jr+Sr+Gr)" pct={upper.toFixed(0)} color="#2c7a7b" />
        <PctBox label="Veterans (Sr+Gr)" pct={vet.toFixed(0)} color="#276749" />
      </Grid>
    </Flex>
  );
};

export const CompositionExperienceCard = ({ mod, conferenceAvg, conferenceLabel, accent, isMobile = false }) => {
  const classes = (mod?.composition?.class_distribution ?? []).filter((c) => c.class !== "Unknown");
  const segments = classes.map((c) => ({ pct: c.pct, color: CLASS_COLORS[c.class] ?? "#718096" }));
  const avgClassByName = Object.fromEntries(
    (conferenceAvg?.composition?.class_distribution ?? []).map((c) => [c.class, c.pct]),
  );

  const upper = mod?.experience?.upperclass_pct ?? 0;
  const vet = mod?.experience?.veteran_pct ?? 0;
  const avgUpper = conferenceAvg?.experience?.upperclass_pct ?? 0;
  const avgVet = conferenceAvg?.experience?.veteran_pct ?? 0;

  return (
    <Box h={isMobile ? "auto" : "100%"} bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius={isMobile ? 0 : "lg"} overflow="hidden" display="flex" flexDirection="column">
      <Flex align="center" gap="0.5rem" px={{ base: 3, lg: 4 }} pt={{ base: 3, lg: 4 }} pb={2} borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Box w="0.1875rem" h="1.1rem" bg={accent} borderRadius="full" flexShrink={0} />
        <Text fontSize="lg" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.02em">
          Composition &amp; Experience
        </Text>
      </Flex>

      <Flex direction="column" flex={isMobile ? "unset" : 1} minH={isMobile ? "auto" : 0} p={{ base: 3, lg: 4 }} gap="1.25rem" align="center" overflowY={isMobile ? "visible" : "auto"}>
        <DonutChart segments={segments} size="9rem" thickness="1.75rem" />

        <Flex direction="column" gap="0.4rem" w="full">
          {classes.map((c) => (
            <Flex key={c.class} align="center" justify="space-between" gap="0.75rem" py="0.3rem" borderBottom="1px solid" borderColor="whiteAlpha.100">
              <Flex align="center" gap="0.6rem" flexShrink={0}>
                <Box boxSize="1rem" borderRadius="sm" bg={CLASS_COLORS[c.class] ?? "#718096"} flexShrink={0} />
                <Text fontSize="lg" fontWeight="black" color="white">{c.class}</Text>
              </Flex>
              <Text fontSize="lg" fontWeight="black" color="text.muted" flexShrink={0}>{c.pct}%</Text>
              <DeltaTag value={c.pct} avgValue={avgClassByName[c.class] ?? 0} avgLabel={conferenceLabel} />
            </Flex>
          ))}
        </Flex>

        <Flex direction="column" gap="0.4rem" w="full">
          <Flex justify="space-between" align="center" gap="0.75rem" py="0.3rem" borderBottom="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="md" fontWeight="bold" color="text.muted">Upperclass (Jr+Sr+Gr)</Text>
            <Flex align="center" gap="0.75rem" flexShrink={0}>
              <Text fontSize="2xl" fontWeight="black" color="white">{upper.toFixed(0)}%</Text>
              <DeltaTag value={upper} avgValue={avgUpper} avgLabel={conferenceLabel} />
            </Flex>
          </Flex>
          <Flex justify="space-between" align="center" gap="0.75rem" py="0.3rem">
            <Text fontSize="md" fontWeight="bold" color="text.muted">Veterans (Sr+Gr)</Text>
            <Flex align="center" gap="0.75rem" flexShrink={0}>
              <Text fontSize="2xl" fontWeight="black" color="white">{vet.toFixed(0)}%</Text>
              <DeltaTag value={vet} avgValue={avgVet} avgLabel={conferenceLabel} />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
