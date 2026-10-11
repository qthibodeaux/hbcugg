import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { fetchGame } from "./GamePage";
import { useLeagueAverages } from "../../hooks/useSWACData";
import { OffensePoster } from "../../components/game/export/OffensePoster";
import { DrivesPoster } from "../../components/game/export/DrivesPoster";
import { BoxscorePoster } from "../../components/game/export/BoxscorePoster";
import { buildHeader, teamShort } from "../../components/game/export/exportData";
import { POSTER_W } from "../../components/game/export/PosterChrome";

// ═══════════════════════════════════════════════════════════════════════════════
// GAME EXPORT — /game/:gameId/export
// ═══════════════════════════════════════════════════════════════════════════════
// Four posters off the game the page already holds, each rasterised to a 2×
// PNG with html-to-image. "Save" downloads one; "Save all" downloads four;
// "Share" hands the PNGs to the OS share sheet where the browser supports
// files (mobile Safari / Chrome), which is the social-post path.
//
// Player headshots are deliberately absent from the posters — cross-origin
// images taint the canvas and would block the export.

const toPng = async (node) => {
  const mod = await import("html-to-image");
  return mod.toPng(node, { pixelRatio: 2, backgroundColor: "#0B0B0D", cacheBust: true, width: POSTER_W, style: { transform: "none" } });
};

const dataUrlToFile = async (dataUrl, filename) => {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], filename, { type: "image/png" });
};

const download = (dataUrl, filename) => {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

const GameExportPage = () => {
  const { gameId } = useParams();
  const { data: game, isLoading, isError } = useQuery({ queryKey: ["game", gameId], queryFn: () => fetchGame(gameId) });
  const season = Number(game?.season) || undefined;
  const { data: leagueAvg } = useLeagueAverages(season);

  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  if (isLoading) return <Flex justify="center" py={20}><Text color="text.muted">Loading game…</Text></Flex>;
  if (isError || !game) return <Flex justify="center" py={20}><Text color="text.muted">Game data not found.</Text></Flex>;

  const header = buildHeader(game);
  const stem = String(gameId ?? "game").toLowerCase();
  const posters = [
    { key: "offense", label: "Offensive Breakdown", file: `${stem}-1-offense.png`, node: <OffensePoster game={game} leagueAvg={leagueAvg} innerRef={refs[0]} /> },
    { key: "drives", label: "Drives & Situations", file: `${stem}-2-drives.png`, node: <DrivesPoster game={game} innerRef={refs[1]} /> },
    { key: "away", label: `${teamShort(header.awayId)} Boxscore`, file: `${stem}-3-${teamShort(header.awayId).toLowerCase()}.png`, node: <BoxscorePoster game={game} leagueAvg={leagueAvg} teamId={header.awayId} innerRef={refs[2]} /> },
    { key: "home", label: `${teamShort(header.homeId)} Boxscore`, file: `${stem}-4-${teamShort(header.homeId).toLowerCase()}.png`, node: <BoxscorePoster game={game} leagueAvg={leagueAvg} teamId={header.homeId} innerRef={refs[3]} /> },
  ];

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

  const saveOne = (i) => run(posters[i].key, async () => download(await toPng(refs[i].current), posters[i].file));
  const saveAll = () => run("all", async () => {
    for (let i = 0; i < posters.length; i += 1) download(await toPng(refs[i].current), posters[i].file);
  });
  const shareAll = () => run("share", async () => {
    const files = [];
    for (let i = 0; i < posters.length; i += 1) files.push(await dataUrlToFile(await toPng(refs[i].current), posters[i].file));
    if (navigator.canShare?.({ files })) {
      await navigator.share({ files, title: `${teamShort(header.awayId)} ${header.away.score} – ${teamShort(header.homeId)} ${header.home.score}` });
    } else {
      throw new Error("Sharing files isn't supported in this browser — use Save all and post the images.");
    }
  });

  return (
    <Box bg="#08080A" minH="100vh" py={6} px={4}>
      <Flex maxW={`${POSTER_W}px`} mx="auto" align="center" justify="space-between" mb={4} gap={3} flexWrap="wrap">
        <Box>
          <Text fontSize="xs" fontWeight="black" color="text.secondary" textTransform="uppercase" letterSpacing="0.2em">Export game</Text>
          <Text fontSize="lg" fontWeight="black" color="white" textTransform="uppercase">
            {teamShort(header.awayId)} {header.away.score ?? "—"} @ {teamShort(header.homeId)} {header.home.score ?? "—"}
          </Text>
        </Box>
        <Flex gap={2} flexWrap="wrap">
          <Button as={Link} to={`/game/${gameId}`} size="sm" variant="ghost" color="white">Back to game</Button>
          <Button size="sm" bg="whiteAlpha.200" color="white" _hover={{ bg: "whiteAlpha.300" }} onClick={shareAll} disabled={busy != null}>
            {busy === "share" ? "Preparing…" : "Share"}
          </Button>
          <Button size="sm" bg="brand.500" color="white" _hover={{ bg: "brand.600" }} onClick={saveAll} disabled={busy != null}>
            {busy === "all" ? "Rendering…" : "Save all (4 PNG)"}
          </Button>
        </Flex>
      </Flex>
      {error && (
        <Text maxW={`${POSTER_W}px`} mx="auto" mb={4} fontSize="sm" color="#ef4444" fontWeight="bold">{error}</Text>
      )}

      <Flex direction="column" gap={8} align="center">
        {posters.map((p, i) => (
          <Box key={p.key} w={`${POSTER_W}px`} maxW="100%" overflowX="auto">
            <Flex align="center" justify="space-between" mb={2}>
              <Text fontSize="xs" fontWeight="black" color="text.secondary" textTransform="uppercase" letterSpacing="0.16em">{i + 1} · {p.label}</Text>
              <Button size="xs" variant="outline" borderColor="whiteAlpha.300" color="white" onClick={() => saveOne(i)} disabled={busy != null}>
                {busy === p.key ? "Rendering…" : "Save PNG"}
              </Button>
            </Flex>
            <Box border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflow="hidden" w="fit-content">
              {p.node}
            </Box>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default GameExportPage;
