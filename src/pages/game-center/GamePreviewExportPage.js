import { useRef, useState } from "react";
import { Box, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { Link, useParams } from "react-router-dom";
import { PreviewPoster } from "../../components/game/export/PreviewPoster";
import { POSTER_W } from "../../components/game/export/PosterChrome";
import { dataUrlToFile, downloadDataUrl, toPng } from "../../components/game/export/exportImage";
import { teamShort } from "../../components/game/export/exportData";
import { previewPath } from "../../utils/gamePreview";
import { useGamePreview } from "../../hooks/useGamePreview";

// /game/preview/:gameId/export — the shareable image for an upcoming game.
// Same Save / Share actions as the played-game export, one poster.

const GamePreviewExportPage = () => {
  const { gameId } = useParams();
  const { model, isLoading, notFound } = useGamePreview(gameId);
  const ref = useRef(null);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  if (isLoading) {
    return (
      <Box bg="#08080A" minH="100vh" pt="calc(var(--app-header-height) + 2rem)" px={4}>
        <Flex justify="center" align="center" py={20} gap={3}>
          <Spinner color="brand.500" />
          <Text color="text.muted">Loading preview…</Text>
        </Flex>
      </Box>
    );
  }
  if (notFound) {
    return (
      <Box bg="#08080A" minH="100vh" pt="calc(var(--app-header-height) + 2rem)" px={4}>
        <Flex justify="center" py={20}>
          <Text color="text.muted">We couldn’t find that game on the schedule.</Text>
        </Flex>
      </Box>
    );
  }

  const file = `${model.date}-${teamShort(model.away.id)}-at-${teamShort(model.home.id)}-preview.png`.toLowerCase();

  const run = async (label, fn) => {
    setBusy(label);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e?.message ?? String(e));
    } finally {
      setBusy(null);
    }
  };

  const save = () => run("save", async () => downloadDataUrl(await toPng(ref.current), file));
  const share = () => run("share", async () => {
    const files = [await dataUrlToFile(await toPng(ref.current), file)];
    if (navigator.canShare?.({ files })) {
      await navigator.share({ files, title: `${teamShort(model.away.id)} at ${teamShort(model.home.id)} — game preview` });
    } else {
      throw new Error("Sharing files isn't supported in this browser — use Save and post the image.");
    }
  });

  return (
    <Box bg="#08080A" minH="100vh" pt="calc(var(--app-header-height) + 2rem)" pb={6} px={4}>
      <Flex maxW={`${POSTER_W}px`} mx="auto" align="center" justify="space-between" mb={4} gap={3} flexWrap="wrap">
        <Box>
          <Text fontSize="xs" fontWeight="black" color="text.secondary" textTransform="uppercase" letterSpacing="0.2em">Export preview</Text>
          <Text fontSize="lg" fontWeight="black" color="white" textTransform="uppercase">
            {teamShort(model.away.id)} at {teamShort(model.home.id)}
          </Text>
        </Box>
        <Flex gap={2} flexWrap="wrap">
          <Button as={Link} to={previewPath(gameId)} size="sm" variant="ghost" color="white">Back to preview</Button>
          <Button size="sm" bg="whiteAlpha.200" color="white" _hover={{ bg: "whiteAlpha.300" }} onClick={share} disabled={busy != null}>
            {busy === "share" ? "Preparing…" : "Share"}
          </Button>
          <Button size="sm" bg="brand.500" color="white" _hover={{ bg: "brand.600" }} onClick={save} disabled={busy != null}>
            {busy === "save" ? "Rendering…" : "Save PNG"}
          </Button>
        </Flex>
      </Flex>
      {error ? <Text maxW={`${POSTER_W}px`} mx="auto" mb={4} fontSize="sm" color="#ef4444" fontWeight="bold">{error}</Text> : null}
      <Flex justify="center">
        <Box w={`${POSTER_W}px`} maxW="100%" overflowX="auto">
          <Box border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflow="hidden" w="fit-content">
            <PreviewPoster model={model} innerRef={ref} />
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default GamePreviewExportPage;
