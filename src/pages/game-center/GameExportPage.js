import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { fetchGame } from "./GamePage";
import { useColorScheme } from "../../theme/colorScheme";
import { ThemeSwitch } from "../../components/organisms/ThemeSwitch";
import { useLeagueAverages } from "../../hooks/useSWACData";
import { OffensePoster } from "../../components/game/export/OffensePoster";
import { DrivesPoster, DrivesWidePoster } from "../../components/game/export/DrivesPoster";
import { BoxscorePoster } from "../../components/game/export/BoxscorePoster";
import { buildHeader, teamShort } from "../../components/game/export/exportData";
import { POSTER_W, WIDE_W, WIDE_H } from "../../components/game/export/PosterChrome";
import { toPng, dataUrlToFile, downloadDataUrl as download } from "../../components/game/export/exportImage";

// ═══════════════════════════════════════════════════════════════════════════════
// GAME EXPORT — /game/:gameId/export
// ═══════════════════════════════════════════════════════════════════════════════
// Four posters off the game the page already holds, each rasterised to a 2×
// PNG with html-to-image. "Save" downloads one; "Save all" downloads four;
// "Share" hands the PNGs to the OS share sheet where the browser supports
// files (mobile Safari / Chrome), which is the social-post path.
//
// Format switch: Vertical (1100 wide, the Twitter posters) or 16:9 (1920 x 1080, slides for
// the YouTube show). 16:9 previews are scaled to the page width; the saved PNGs are full size.
//
// Player headshots are deliberately absent from the posters — cross-origin
// images taint the canvas and would block the export.

const GameExportPage = () => {
  // Subscribed so the posters redraw (light mode team accents, chip strength) when the scheme flips.
  useColorScheme();
  const { gameId } = useParams();
  const { data: game, isLoading, isError } = useQuery({ queryKey: ["game", gameId], queryFn: () => fetchGame(gameId) });
  const season = Number(game?.season) || undefined;
  const { data: leagueAvg } = useLeagueAverages(season);

  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [format, setFormat] = useState("wide");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  if (isLoading) return <Flex justify="center" py={20}><Text color="text.muted">Loading game…</Text></Flex>;
  if (isError || !game) return <Flex justify="center" py={20}><Text color="text.muted">Game data not found.</Text></Flex>;

  const header = buildHeader(game);
  const stem = String(gameId ?? "game").toLowerCase();
  const wide = format === "wide";
  const suffix = wide ? "-16x9" : "";
  const posters = [
    { key: "offense", label: "Offensive Breakdown", file: `${stem}-1-offense${suffix}.png`, node: <OffensePoster game={game} leagueAvg={leagueAvg} innerRef={refs[0]} wide={wide} /> },
    { key: "drives", label: wide ? "Drives" : "Drives & Situations", file: `${stem}-2-drives${suffix}.png`, node: wide ? <DrivesWidePoster game={game} innerRef={refs[1]} /> : <DrivesPoster game={game} innerRef={refs[1]} /> },
    { key: "away", label: `${teamShort(header.awayId)} Boxscore`, file: `${stem}-3-${teamShort(header.awayId).toLowerCase()}${suffix}.png`, node: <BoxscorePoster game={game} leagueAvg={leagueAvg} teamId={header.awayId} innerRef={refs[2]} wide={wide} /> },
    { key: "home", label: `${teamShort(header.homeId)} Boxscore`, file: `${stem}-4-${teamShort(header.homeId).toLowerCase()}${suffix}.png`, node: <BoxscorePoster game={game} leagueAvg={leagueAvg} teamId={header.homeId} innerRef={refs[3]} wide={wide} /> },
  ];
  const previewScale = POSTER_W / WIDE_W;

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
    // Top padding clears the site's fixed nav, so the sticky toolbar never covers the first slide.
    <Box bg="bg.primary" minH="100vh" pt="calc(var(--app-header-height) + 1.5rem)" pb={6} px={4}>
      {/* Light / Night, floating bottom left (this page has no sidebar, and the live site hides the sidebar switch). */}
      <Box position="fixed" left="1rem" bottom="1rem" zIndex={60} w="11rem" boxShadow="0 0.25rem 1rem rgba(0,0,0,0.25)" borderRadius="full">
        <ThemeSwitch />
      </Box>
      {/* Sticks just under the site header so the switch and save buttons stay reachable while scrolling. */}
      <Flex maxW={`${(POSTER_W) / 16}rem`} mx="auto" align="center" justify="space-between" mb={4} gap={3} flexWrap="wrap"
        position="sticky" top="var(--app-header-height)" zIndex={40} bg="bg.primary" py={3} borderBottom="0.0625rem solid" borderColor="line">
        <Box>
          <Text fontSize="xs" fontWeight="black" color="text.secondary" textTransform="uppercase" letterSpacing="0.2em">Export game</Text>
          <Text fontSize="lg" fontWeight="black" color="text.primary" textTransform="uppercase">
            {teamShort(header.awayId)} {header.away.score ?? "—"} @ {teamShort(header.homeId)} {header.home.score ?? "—"}
          </Text>
        </Box>
        <Flex gap={2} flexWrap="wrap" align="center">
          <Flex border="0.0625rem solid" borderColor="line.strong" borderRadius="md" overflow="hidden">
            {[["vertical", "Vertical"], ["wide", "16:9"]].map(([key, label]) => (
              <Button key={key} size="sm" borderRadius={0} disabled={busy != null} onClick={() => setFormat(key)}
                bg={format === key ? "brand.500" : "transparent"} color={format === key ? "white" : "text.primary"} _hover={{ bg: format === key ? "brand.600" : "line.hover" }}>
                {label}
              </Button>
            ))}
          </Flex>
          <Button as={Link} to={`/game/${gameId}`} size="sm" variant="ghost" color="text.primary">Back to game</Button>
          <Button size="sm" bg="line.strong" color="text.primary" _hover={{ bg: "line.hover" }} onClick={shareAll} disabled={busy != null}>
            {busy === "share" ? "Preparing…" : "Share"}
          </Button>
          <Button size="sm" bg="brand.500" color="white" _hover={{ bg: "brand.600" }} onClick={saveAll} disabled={busy != null}>
            {busy === "all" ? "Rendering…" : `Save all (4 PNG${wide ? ", 16:9" : ""})`}
          </Button>
        </Flex>
      </Flex>
      {error && (
        <Text maxW={`${(POSTER_W) / 16}rem`} mx="auto" mb={4} fontSize="sm" color="red.500" fontWeight="bold">{error}</Text>
      )}

      <Flex direction="column" gap={8} align="center">
        {posters.map((p, i) => (
          <Box key={`${format}-${p.key}`} w={`${(POSTER_W) / 16}rem`} maxW="100%" overflowX="auto">
            <Flex align="center" justify="space-between" mb={2}>
              <Text fontSize="xs" fontWeight="black" color="text.secondary" textTransform="uppercase" letterSpacing="0.16em">{i + 1} · {p.label}</Text>
              <Button size="xs" variant="outline" borderColor="line.strong" color="text.primary" onClick={() => saveOne(i)} disabled={busy != null}>
                {busy === p.key ? "Rendering…" : "Save PNG"}
              </Button>
            </Flex>
            {wide ? (
              <Box border="0.0625rem solid" borderColor="line" borderRadius="md" overflow="hidden" w={`${(POSTER_W) / 16}rem`} h={`${(Math.round(WIDE_H * previewScale)) / 16}rem`}>
                <Box w={`${(WIDE_W) / 16}rem`} style={{ transform: `scale(${previewScale})`, transformOrigin: "top left" }}>
                  {p.node}
                </Box>
              </Box>
            ) : (
              <Box border="0.0625rem solid" borderColor="line" borderRadius="md" overflow="hidden" w="fit-content">
                {p.node}
              </Box>
            )}
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default GameExportPage;
