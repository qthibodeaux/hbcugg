import { Box, Text } from "@chakra-ui/react";
import { buildGameLog } from "./statsTabMock";

// Flattens each row's category stats into one wide table — prefixing
// columns with the category label only when a position has more than one
// (e.g. a QB's Passing Yds vs Rushing Yds), so single-category positions
// (WR, defense) don't carry a redundant "Receiving" prefix on every column.
export const PlayerGameLog = ({ player, primary }) => {
  const gameLog = buildGameLog(player);
  const categories = gameLog[0]?.categories ?? [];
  const multiCategory = categories.length > 1;

  return (
    <Box overflowX="auto">
      <Box as="table" w="full" style={{ borderCollapse: "collapse" }}>
        <Box as="thead">
          <Box as="tr" borderBottom="1px solid" borderColor="whiteAlpha.200">
            <Box as="th" px={2} py={2} textAlign="left">
              <Text fontSize="9px" fontWeight="800" color="text.muted" textTransform="uppercase">Wk</Text>
            </Box>
            {categories.flatMap((cat) =>
              cat.columns.map((col) => (
                <Box as="th" key={`${cat.key}-${col.key}`} px={2} py={2} textAlign="right">
                  <Text fontSize="9px" fontWeight="800" color="text.muted" textTransform="uppercase" whiteSpace="nowrap">
                    {multiCategory ? `${cat.label} ${col.label}` : col.label}
                  </Text>
                </Box>
              )),
            )}
          </Box>
        </Box>
        <Box as="tbody">
          {gameLog.map((row) => (
            <Box as="tr" key={row.week} borderBottom="1px solid" borderColor="whiteAlpha.50">
              <Box as="td" px={2} py={2}>
                <Text fontSize="sm" fontWeight="black" fontFamily="mono" color={primary}>
                  {row.week}
                </Text>
              </Box>
              {row.categories.flatMap((cat) =>
                cat.columns.map((col) => (
                  <Box as="td" key={`${cat.key}-${col.key}`} px={2} py={2} textAlign="right">
                    <Text fontSize="sm" fontWeight="700" fontFamily="mono" color="white">
                      {cat.stats[col.key]}
                    </Text>
                  </Box>
                )),
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
