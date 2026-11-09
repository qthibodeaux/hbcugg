import { Grid, Flex, Text } from "@chakra-ui/react";

// Week selection with published played/empty availability and responsive wrapping.

export const WeekControl = ({ weeks, value, onChange }) => (
  <Grid gap={1} w="100%" templateColumns={{ base: "repeat(8, minmax(0, 1fr))", lg: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
    {weeks.map((w) => {
      const active = w.week === value;
      return (
        <Flex
          key={w.week}
          as="button"
          type="button"
          disabled={!w.played}
          title={w.played ? `${w.label} · ${w.charted_count ?? w.final_count} charted` : `${w.label} · not played`}
          onClick={() => w.played && onChange(w.week)}
          minW={0}
          h="2.6rem"
          align="center"
          justify="center"
          borderRadius="md"
          bg={active ? "brand.500" : "line"}
          opacity={w.played ? 1 : 0.28}
          cursor={w.played ? "pointer" : "not-allowed"}
          _hover={w.played && !active ? { bg: "line.strong" } : {}}
          style={{ transition: "background 0.12s" }}
        >
          <Text fontSize="0.95rem" fontWeight="900" color={active ? "white" : "text.secondary"} fontVariantNumeric="tabular-nums">
            {w.week}
          </Text>
        </Flex>
      );
    })}
  </Grid>
);
