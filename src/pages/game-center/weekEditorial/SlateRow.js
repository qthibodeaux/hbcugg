import { getSelectedGameTheme, toGradientRow } from "./editorialModel";
import { Box } from "@chakra-ui/react";
import { WeekCentralGameRowJ } from "../../../components/molecules/game/weekRow/WeekCentralGameRow";

export const SlateRow = ({ game, selected, onSelect }) => {
  const selectedTheme = getSelectedGameTheme(game);

  return (
    <Box
      as="button"
      type="button"
      onClick={onSelect}
      w="100%"
      textAlign="left"
      border="1px solid"
      borderColor="transparent"
      borderRadius="md"
      bg="transparent"
      cursor="pointer"
      overflow="hidden"
      style={{ transition: "background 0.15s, border-color 0.15s" }}
    >
      <Box display={{ base: "block", xl: "none" }}>
        <WeekCentralGameRowJ row={toGradientRow(game)} mb={0} variant="compact" selected={selected} highlightColor={selectedTheme.surface} highlightAccent={selectedTheme.border} />
      </Box>
      <Box display={{ base: "none", xl: "block" }}>
        <WeekCentralGameRowJ row={toGradientRow(game)} mb={0} variant="standard" selected={selected} highlightColor={selectedTheme.surface} highlightAccent={selectedTheme.border} />
      </Box>
    </Box>
  );
};
