import { useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Download, X } from "lucide-react";
import { teamShort } from "../export/exportData";
import { downloadDataUrl } from "../export/exportImage";
import { paletteOf } from "../../molecules/export/posterPalette";
import { useColorScheme } from "../../../theme/colorScheme";
import { GamePreviewShortPoster, SHORT_H, SHORT_W } from "./GamePreviewShortPoster";

// The preview's second Export button: "Export short". Opens the portrait poster
// in a preview; Save writes the PNG from a hidden full-size copy, so the preview's
// zoom never touches the capture. Sits beside the full Export button.

export const ExportShortPreview = ({ m }) => {
  const [scheme] = useColorScheme();
  const pal = paletteOf(scheme);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const posterRef = useRef(null);

  const save = async () => {
    if (!posterRef.current || busy) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(posterRef.current, { pixelRatio: 2, backgroundColor: pal.bg, cacheBust: true, width: SHORT_W, height: SHORT_H, style: { transform: "none" } });
      downloadDataUrl(url, `preview-short-${m.week_label.toLowerCase().replace(/\s+/g, "")}-${teamShort(m.away.team_id).toLowerCase()}-at-${teamShort(m.home.team_id).toLowerCase()}-${scheme}.png`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Flex as="button" type="button" onClick={() => setOpen(true)} position="relative" zIndex={5} align="center" gap={1.5} px={3} py={1.5} borderRadius="md" bg="whiteAlpha.200" _hover={{ bg: "whiteAlpha.300" }}>
        <Download size={13} />
        <Text fontSize="10px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.16em">Export short</Text>
      </Flex>
      {open && (
        <Box position="fixed" inset={0} zIndex={2000} bg="rgba(0,0,0,0.85)" overflowY="auto" onClick={() => setOpen(false)}>
          <Flex direction="column" align="center" py={6} gap={4} onClick={(e) => e.stopPropagation()}>
            <Flex gap={2}>
              <Flex as="button" type="button" onClick={save} align="center" gap={2} px={4} h="2.4rem" borderRadius="md" bg="brand.500" opacity={busy ? 0.6 : 1}>
                <Download size={15} /><Text fontSize="12px" fontWeight="900" textTransform="uppercase" letterSpacing="0.12em">{busy ? "Saving" : "Save PNG"}</Text>
              </Flex>
              <Flex as="button" type="button" onClick={() => setOpen(false)} align="center" gap={2} px={4} h="2.4rem" borderRadius="md" bg="whiteAlpha.200">
                <X size={15} /><Text fontSize="12px" fontWeight="900" textTransform="uppercase" letterSpacing="0.12em">Close</Text>
              </Flex>
            </Flex>
            <Box boxShadow="0 1rem 3rem rgba(0,0,0,0.6)" style={{ zoom: Math.min(1, (window.innerWidth - 48) / SHORT_W, (window.innerHeight - 120) / SHORT_H) }}>
              <GamePreviewShortPoster m={m} pal={pal} />
            </Box>
            <Box position="fixed" left="-20000px" top={0} aria-hidden="true">
              <GamePreviewShortPoster m={m} pal={pal} innerRef={posterRef} />
            </Box>
          </Flex>
        </Box>
      )}
    </>
  );
};
