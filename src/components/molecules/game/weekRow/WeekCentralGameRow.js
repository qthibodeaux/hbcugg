// Live standard/compact row router, promoted from WeekCentralGameRowJ.
// Compact remains independent from the separate phone row design.
import { WeekCentralGameRowJCompact } from "./WeekCentralGameRowCompact";
import { WeekCentralGameRowJStandard } from "./WeekCentralGameRowStandard";

export const WeekCentralGameRowJ = ({
  row,
  mb = 6,
  variant = "standard",
  scale,
  selected = false,
  highlightColor,
  highlightAccent,
}) => {
  const resolvedVariant =
    variant === "compact" || scale === "slate" ? "compact" : "standard";
  if (resolvedVariant === "compact") {
    return (
      <WeekCentralGameRowJCompact
        row={row}
        mb={mb}
        selected={selected}
        highlightColor={highlightColor}
        highlightAccent={highlightAccent}
      />
    );
  }
  return (
    <WeekCentralGameRowJStandard
      row={row}
      mb={mb}
      selected={selected}
      highlightColor={highlightColor}
      highlightAccent={highlightAccent}
    />
  );
};
