import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";

const heatFill = (n, rowMax, rowTotal, rgb) => {
  if (!n) return "transparent";
  const t = rowMax > 0 ? n / rowMax : 0;
  const mute = Math.min(1, 0.38 + rowTotal / 140);
  return `rgba(${rgb},${((0.1 + t * 0.62) * mute).toFixed(3)})`;
};

export const PenaltyHeatGrid = ({ columns, rows, totals, heatRgb }) => {
  const template = `minmax(9.5rem, 1.2fr) 2.6rem repeat(${columns.length}, minmax(2.2rem, 1fr))`;

  return (
    <Box overflowX="auto" px={4} pb={3}>
      <Grid templateColumns={template} minW="52rem">
        {/* Header: logo over that team's season flag count */}
        <Box position="sticky" left={0} zIndex={2} bg="bg.secondary" pb={2} display="flex" alignItems="flex-end" borderBottom="2px solid" borderColor="line.strong">
          <Text fontSize="9px" fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.13em">Foul</Text>
        </Box>
        <Flex direction="column" align="center" justify="flex-end" pb={2} borderBottom="2px solid" borderColor="line.strong">
          <Text fontSize="9px" fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">All</Text>
        </Flex>
        {columns.map((t) => (
          <Flex key={t.id} direction="column" align="center" justify="flex-end" gap={1} pb={2} minW={0} title={t.name} borderBottom="2px solid" borderColor="line.strong">
            {t.logo && <Image src={t.logo} alt="" w="18px" h="18px" objectFit="contain" />}
            <Text fontSize="9px" fontWeight="900" color="text.secondary" textTransform="uppercase" letterSpacing="0.04em" whiteSpace="nowrap">{t.short}</Text>
            <Text fontSize="10px" fontWeight="900" color="text.primary" fontVariantNumeric="tabular-nums">
              {totals[t.id] ?? 0}
            </Text>
          </Flex>
        ))}

        {/* One row per foul */}
        {rows.map((r) => (
          <Box key={r.key} display="contents">
            <Flex
              position="sticky" left={0} zIndex={1} bg="bg.secondary" align="center" pr={3} py="3px" minW={0}
              borderBottom="1px solid" borderColor="line"
            >
              <Text fontSize="11px" fontWeight="900" color="text.primary" lineClamp={1} title={r.label}>{r.label}</Text>
            </Flex>
            <Flex align="center" justify="center" bg="line.subtle" borderBottom="1px solid" borderLeft="1px solid" borderColor="line">
              <Text fontSize="10px" fontWeight="900" color="text.secondary" fontVariantNumeric="tabular-nums">{r.total}</Text>
            </Flex>
            {r.cells.map((n, i) => {
              const leader = n > 0 && n === r.max;
              return (
                <Flex
                  key={columns[i].id} align="center" justify="center" minW={0} py="4px"
                  bg={heatFill(n, r.max, r.total, heatRgb)}
                  borderBottom="1px solid" borderLeft="1px solid" borderColor="line"
                  title={`${columns[i].short} · ${r.label} · ${n}`}
                >
                  {n > 0 ? (
                    <Text
                      fontSize="10px" fontWeight={leader ? "900" : "700"}
                      color={leader ? "text.primary" : "text.secondary"} fontVariantNumeric="tabular-nums"
                    >
                      {n}
                    </Text>
                  ) : (
                    <Text fontSize="10px" color="text.muted" lineHeight={1}>·</Text>
                  )}
                </Flex>
              );
            })}
          </Box>
        ))}
      </Grid>
    </Box>
  );
};
