import { useColorScheme } from "../../../../theme/colorScheme";
import { useState, useRef } from "react";
import { useQueries } from "@tanstack/react-query";
import { fetchJson, gameCenterPaths } from "../../../../utils/gameCenterPayloads";
import { paletteOf } from "../../../molecules/export/posterPalette";
import { POSTER_W } from "./recapPresentation";
import { downloadDataUrl } from "../../export/exportImage";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Download, X } from "lucide-react";
import { WeekRecapPoster } from "./WeekRecapPoster";

export const PreviewModal = ({ recap, onClose }) => {
  const [scheme] = useColorScheme();
  const [busy, setBusy] = useState(false);
  const [teamStyle, setTeamStyle] = useState(true);
  const posterRef = useRef(null);
  const results = useQueries({
    queries: (recap.games ?? []).map((g) => ({
      queryKey: ["game-file", recap.season, g.game_path_id],
      queryFn: () => fetchJson(gameCenterPaths.gameFile(recap.season, g.game_path_id)),
      staleTime: 5 * 60 * 1000,
    })),
  });
  const games = results.map((r) => r.data).filter(Boolean);
  const loading = results.some((r) => r.isLoading);

  const save = async () => {
    if (!posterRef.current || busy || loading) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(posterRef.current, { pixelRatio: 2, backgroundColor: paletteOf(scheme).bg, cacheBust: true, width: POSTER_W, height: posterRef.current.offsetHeight });
      downloadDataUrl(url, `how-saturday-was-won-${recap.season}-week-${recap.week}-${scheme}.png`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box position="fixed" inset={0} zIndex={2000} bg="rgba(0,0,0,0.85)" overflowY="auto" onClick={onClose}>
      <Flex direction="column" align="center" py={6} gap={4} onClick={(e) => e.stopPropagation()}>
        <Flex gap={2}>
          <Flex as="button" type="button" onClick={() => setTeamStyle((value) => !value)} align="center" px={4} bg="whiteAlpha.200" aria-pressed={teamStyle}>
            <Text fontSize="12px" fontWeight="900">Tile style: {teamStyle ? "Team" : "Original"}</Text>
          </Flex>
          <Flex as="button" type="button" onClick={save} align="center" gap={2} px={4} h="2.4rem" borderRadius="md" bg="brand.500" opacity={busy || loading ? 0.6 : 1}>
            <Download size={15} /><Text fontSize="12px" fontWeight="900" textTransform="uppercase" letterSpacing="0.12em">{busy ? "Saving" : loading ? "Loading" : "Save PNG"}</Text>
          </Flex>
          <Flex as="button" type="button" onClick={onClose} align="center" gap={2} px={4} h="2.4rem" borderRadius="md" bg="whiteAlpha.200">
            <X size={15} /><Text fontSize="12px" fontWeight="900" textTransform="uppercase" letterSpacing="0.12em">Close</Text>
          </Flex>
        </Flex>
        <Box boxShadow="0 1rem 3rem rgba(0,0,0,0.6)" style={{ zoom: Math.min(1, (window.innerWidth - 32) / POSTER_W) }}>
          <WeekRecapPoster recap={recap} games={games} scheme={scheme} teamStyle={teamStyle} />
        </Box>
        <Box position="fixed" left="-20000px" top={0} aria-hidden="true">
          <WeekRecapPoster recap={recap} games={games} innerRef={posterRef} scheme={scheme} teamStyle={teamStyle} />
        </Box>
      </Flex>
    </Box>
  );
};
