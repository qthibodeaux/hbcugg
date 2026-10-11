import { useState } from "react";
import { Flex, Text } from "@chakra-ui/react";
import { Download } from "lucide-react";
import { downloadDataUrl } from "../../game/export/exportImage";

// ─────────────────────────────────────────────────────────────────────────────
// Export a card as a PNG — the Team Analytics charts (Week Review, Scatter).
// Captures the card the ref points at, as it looks on screen, at 2x. Anything
// inside it marked data-export-skip="true" (controls, this button) is left out.
// ─────────────────────────────────────────────────────────────────────────────

export const exportCardPng = async (node, filename) => {
  const { toPng } = await import("html-to-image");
  const url = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: "#141416",
    cacheBust: true,
    filter: (n) => !(n instanceof HTMLElement && n.dataset.exportSkip === "true"),
  });
  downloadDataUrl(url, filename);
};

/**
 * `target` is a ref to the card; `filename` a string or a function returning one.
 * `compact` drops the label for a tight header (icon only).
 */
export const ExportCardButton = ({ target, filename, compact = false }) => {
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!target?.current || busy) return;
    setBusy(true);
    try {
      await exportCardPng(target.current, typeof filename === "function" ? filename() : filename);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Flex
      as="button"
      type="button"
      data-export-skip="true"
      onClick={run}
      disabled={busy}
      align="center"
      justify="center"
      gap={1.5}
      px={compact ? 0 : 3}
      w={compact ? "1.75rem" : undefined}
      h={compact ? "1.75rem" : "2rem"}
      title="Export as image"
      aria-label="Export as image"
      borderRadius="md"
      border="1px solid"
      borderColor="whiteAlpha.200"
      color="whiteAlpha.800"
      flexShrink={0}
      opacity={busy ? 0.5 : 1}
      _hover={busy ? undefined : { bg: "whiteAlpha.100", color: "white" }}
    >
      <Download size={14} />
      {!compact && <Text fontSize="11px" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em">{busy ? "Saving" : "Export"}</Text>}
    </Flex>
  );
};

export default ExportCardButton;
