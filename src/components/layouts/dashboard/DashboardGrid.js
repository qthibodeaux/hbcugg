import { Grid, GridItem } from "@chakra-ui/react";

const SPAN_MAP = {
  "1x1": { colSpan: 1, rowSpan: 1 },
  "2x1": { colSpan: 2, rowSpan: 1 },
  "1x2": { colSpan: 1, rowSpan: 2 },
  "2x2": { colSpan: 2, rowSpan: 2 },
};

const resolveSpan = (span) => SPAN_MAP[span] ?? SPAN_MAP["1x1"];

const DashboardGrid = ({
  items = [],
  renderItem,
  columns = 4,
  gap = 4,
  autoRows = "minmax(160px, auto)",
}) => {
  return (
    <Grid templateColumns={`repeat(${columns}, minmax(0, 1fr))`} autoRows={autoRows} gap={gap}>
      {items.map((item, index) => {
        const { colSpan, rowSpan } = resolveSpan(item.span);
        return (
          <GridItem key={item.id ?? index} colSpan={colSpan} rowSpan={rowSpan} minW={0}>
            {renderItem ? renderItem(item) : item.content}
          </GridItem>
        );
      })}
    </Grid>
  );
};

export default DashboardGrid;
