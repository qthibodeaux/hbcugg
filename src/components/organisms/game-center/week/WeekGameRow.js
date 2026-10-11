import { memo } from "react";
import { Box } from "@chakra-ui/react";
import { WeekCentralGameRowJ } from "../../test/WeekCentralGameRowJ";
import { WeekCentralGameRowMobile } from "./WeekCentralGameRowMobile";
import { getSelectedGameTheme, toGradientRow } from "./weekCentralAdapter";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";

const WeekGameRowBase = ({ game, selected, onSelect }) => {
  const selectedTheme = getSelectedGameTheme(game);
  const row = toGradientRow(game);
  const { isMobile } = useLayoutDensity();

  if (isMobile) {
    return (
      <WeekCentralGameRowMobile
        row={row}
        selected={selected}
        onClick={() => onSelect(game.id)}
        highlightColor={selectedTheme.surface}
        highlightAccent={selectedTheme.border}
      />
    );
  }

  return (
    <Box
      as="button"
      type="button"
      onClick={() => onSelect(game.id)}
      w="100%"
      textAlign="left"
      border="1px solid"
      borderColor="transparent"
      borderRadius="md"
      bg="transparent"
      cursor="pointer"
      overflow="hidden"
      outline="none"
      _focus={{ outline: "none" }}
      _focusVisible={{ outline: "none", boxShadow: "0 0 0 1px rgba(255,255,255,0.18)" }}
      style={{ transition: "background 0.15s, border-color 0.15s" }}
    >
      <Box display={{ base: "block", xl: "none" }}>
        <WeekCentralGameRowJ row={row} mb={0} variant="compact" selected={selected} highlightColor={selectedTheme.surface} highlightAccent={selectedTheme.border} />
      </Box>
      <Box display={{ base: "none", xl: "block" }}>
        <WeekCentralGameRowJ row={row} mb={0} variant="standard" selected={selected} highlightColor={selectedTheme.surface} highlightAccent={selectedTheme.border} />
      </Box>
    </Box>
  );
};

export const WeekGameRow = memo(WeekGameRowBase);
