import { useState, useRef } from "react";
import { P_BG, POSTER_W } from "./scoutPresentation";
import { downloadDataUrl } from "../../../game/export/exportImage";
import { teamShort } from "../../../game/export/exportData";
import { Flex, Text, Box } from "@chakra-ui/react";
import { Download, X } from "lucide-react";
import { GamePreviewScoutPoster } from "./GamePreviewScoutPoster";

export const ExportScout = ({ m }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const posterRef = useRef(null);
  const save = async () => {
    if (!posterRef.current || busy) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(posterRef.current, { pixelRatio: 2, backgroundColor: P_BG, cacheBust: true, width: POSTER_W, style: { transform: "none" } });
      downloadDataUrl(url, `preview-${m.week_label.toLowerCase().replace(/\s+/g, "")}-${teamShort(m.away.team_id).toLowerCase()}-at-${teamShort(m.home.team_id).toLowerCase()}.png`);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Flex as="button" type="button" onClick={() => setOpen(true)} position="absolute" top="0.75rem" right="0.75rem" zIndex={5}
        align="center" gap={1.5} px={3} py={1.5} borderRadius="md" bg="whiteAlpha.200" _hover={{ bg: "whiteAlpha.300" }}>
        <Download size={13} />
        <Text fontSize="10px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.16em">Export</Text>
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
            {/* Shown shrunk to the window; the PNG comes off a hidden full-size
                copy, so zoom never touches the capture. */}
            <Box boxShadow="0 1rem 3rem rgba(0,0,0,0.6)" style={{ zoom: Math.min(1, (window.innerWidth - 48) / POSTER_W) }}>
              <GamePreviewScoutPoster m={m} />
            </Box>
            <Box position="fixed" left="-20000px" top={0} aria-hidden="true">
              <GamePreviewScoutPoster m={m} innerRef={posterRef} />
            </Box>
          </Flex>
        </Box>
      )}
    </>
  );
};
