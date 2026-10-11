import { Box, Grid, Text } from "@chakra-ui/react";
import { SectionEyebrow } from "../../atoms/SectionEyebrow";

// The Data Room's table language, pulled out of DataRoomTab so every Stats
// page shares one look instead of each growing its own: accent bar + uppercase
// title on a bg.secondary card, a header strip on whiteAlpha.50, hairline row
// rules, uppercase row labels, tabular figures, green on the better value.

const TONE_COLOR = {
  default: "text.primary",
  good: "#48BB78",
  bad: "#ED8936",
  muted: "text.muted",
};

export const StatSection = ({ title, controls, children }) => (
  <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflow="hidden">
    <Box px={4} pt={3}>
      <SectionEyebrow mb={0} rightContent={controls}>{title}</SectionEyebrow>
    </Box>
    {children}
  </Box>
);

// columns: [{ key, label, w, align }]
// rows:    [{ id, cells: { [key]: { text, tone, node } } }]
export const StatTable = ({ columns, rows, onSort, sortKey, sortDir }) => {
  const templateColumns = columns.map((c) => c.w ?? "minmax(0, 1fr)").join(" ");

  return (
    // Metric tables get wide; scroll the table, never the page.
    <Box overflowX="auto">
      <Box minW="fit-content">
        <Grid templateColumns={templateColumns} gap={2} px={3} py={1.5} bg="whiteAlpha.50" alignItems="center">
          {columns.map((col) => {
            const isSorted = sortKey === col.key;
            return (
              <Text
                key={col.key}
                as={onSort && col.sortable !== false ? "button" : "div"}
                onClick={onSort && col.sortable !== false ? () => onSort(col.key) : undefined}
                fontSize="9px"
                color={isSorted ? "text.primary" : "text.muted"}
                fontWeight="950"
                textTransform="uppercase"
                letterSpacing="0.06em"
                textAlign={col.align ?? "right"}
                whiteSpace="nowrap"
                cursor={onSort && col.sortable !== false ? "pointer" : "default"}
                _hover={onSort && col.sortable !== false ? { color: "text.primary" } : undefined}
                _focusVisible={{ outline: "1px solid", outlineColor: "brand.500", outlineOffset: "2px" }}
              >
                {col.label}
                {isSorted ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
              </Text>
            );
          })}
        </Grid>

        {rows.map((row) => (
          <Grid
            key={row.id}
            templateColumns={templateColumns}
            gap={2}
            px={3}
            py={2}
            alignItems="center"
            _hover={{ bg: "whiteAlpha.50" }}
            borderBottom="1px solid"
            borderColor="whiteAlpha.50"
          >
            {columns.map((col) => {
              const cell = row.cells[col.key] ?? {};
              if (cell.node) return <Box key={col.key} minW={0}>{cell.node}</Box>;
              const isLabel = (col.align ?? "right") === "left";
              return (
                <Text
                  key={col.key}
                  fontSize={isLabel ? "11px" : "12px"}
                  fontWeight={isLabel ? "800" : "900"}
                  color={TONE_COLOR[cell.tone ?? "default"]}
                  textTransform={isLabel ? "uppercase" : "none"}
                  letterSpacing={isLabel ? "0.02em" : undefined}
                  textAlign={col.align ?? "right"}
                  fontVariantNumeric="tabular-nums"
                  whiteSpace="nowrap"
                >
                  {cell.text ?? "—"}
                </Text>
              );
            })}
          </Grid>
        ))}
      </Box>
    </Box>
  );
};

// The Data Room's overview strip — a row of label-over-value tiles. Used for
// league context above a table.
export const StatKpiStrip = ({ items }) => (
  <Grid templateColumns={{ base: "repeat(3, 1fr)", md: `repeat(${items.length}, 1fr)` }} gap={3}>
    {items.map((item) => (
      <Box key={item.label} textAlign="center" p={2} bg="whiteAlpha.50" borderRadius="sm">
        <Text fontSize="9px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.06em" mb={1}>
          {item.label}
        </Text>
        <Text fontSize="sm" fontWeight="900" color="text.primary" fontVariantNumeric="tabular-nums">
          {item.value}
        </Text>
      </Box>
    ))}
  </Grid>
);
