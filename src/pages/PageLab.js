import { useQuery } from "@tanstack/react-query";
import { Box, Flex, Spinner, Text, Image } from "@chakra-ui/react";
import { SfaPvamuPreviewA } from "../components/organisms/test/SfaPvamuPreviewA";
import { StatTable, PlayerBlock } from "./pageLab/GameTableBlocks";
import { Matrix } from "./pageLab/GameMatrices";
import { PlayList } from "./pageLab/GamePlayList";
import { PANEL, LINE } from "./pageLab/gameTablesPresentation";

// ═════════════════════════════════════════════════════════════════════════════
// PAGE LAB — SINGLE-GAME TABLES
//
// A static read of one parsed game, grouped the way GameOnPaper groups a game:
// Overall, Expected Points, Production, Rushing, Explosiveness, Situational,
// Drives, Defensive, Turnovers, then player lines, the target/rush matrices and
// the play lists. Structure borrowed, numbers entirely ours — every cell is
// computed by scripts/build_game_tables.js from the parsed game export.
//
// The point of the demo is to find out how much of that grouping our export can
// already answer. It answers most of it. What it cannot answer is listed at the
// bottom of the page rather than left as an empty cell, because the blank list
// is the actual deliverable for the backend.
//
// Deliberately plain: no PageShell, no banner, no controls. This is a lab page
// for reading numbers off, not a production surface. It replaced the empty
// viewport scaffold that used to sit here — two bordered boxes reading "Game
// page content", already labelled with this exact payload and never filled in.
//
// MainLayout gives lab routes no top padding, so the page owns its own
// var(--app-header-height) offset; the old scaffold did not and rendered
// underneath the header.
// ═════════════════════════════════════════════════════════════════════════════

const fetchDemo = async () => {
  const res = await fetch("/data/0-data/game_tables.json");
  if (!res.ok) throw new Error("game_tables.json not found — run node scripts/build_game_tables.js");
  return res.json();
};

// ─── Page ────────────────────────────────────────────────────────────────────

const PageLab = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["game-tables"],
    queryFn: fetchDemo,
    staleTime: Infinity,
    retry: false,
  });

  if (isLoading) {
    return (
      <Box pt="var(--app-header-height)" minH="100vh" bg="bg.primary">
        <Flex justify="center" py={20}><Spinner color="brand.500" size="lg" /></Flex>
      </Box>
    );
  }
  if (isError) {
    return (
      <Box pt="var(--app-header-height)" minH="100vh" bg="bg.primary" px={6} py={10}>
        <Text fontSize="sm" color="text.muted">{String(error?.message ?? error)}</Text>
      </Box>
    );
  }

  const { teams, tables, matrices, players, big_plays, important_plays, scoring_plays, percentile_basis, gaps, game } = data;

  return (
    <Box pt="var(--app-header-height)" minH="100vh" bg="bg.primary" pb={16}>
      <Box maxW="1600px" mx="auto" px={{ base: 3, lg: 6 }} py={6}>
        {/* Contest preview test — moved up from the component lab (#1706) so it reads at page width. */}
        <Text fontSize="10px" color="brand.500" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em" mb={3}>
          Page Lab · Contest preview
        </Text>
        <Box mb={10}>
          <SfaPvamuPreviewA />
        </Box>

        <Text fontSize="10px" color="brand.500" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em" mb={3}>
          Page Lab · Single-game tables
        </Text>

        {/* Scoreboard */}
        <Flex align="center" gap={5} mb={2} wrap="wrap">
          {teams.map((t, i) => (
            <Flex key={t.id} align="center" gap={2}>
              {i === 1 && <Text fontSize="sm" color="whiteAlpha.400" mr={3}>at</Text>}
              {t.logo && <Image src={t.logo} alt="" w="34px" h="34px" objectFit="contain" />}
              <Box>
                <Text fontSize="sm" fontWeight="900" color="white" lineHeight={1}>{t.name}</Text>
                <Text fontSize="xl" fontWeight="900" color="white" lineHeight={1.1} fontVariantNumeric="tabular-nums">{t.score}</Text>
              </Box>
            </Flex>
          ))}
        </Flex>
        <Text fontSize="10px" color="whiteAlpha.500" mb={1}>
          {game.date} · {game.venue}{game.neutral_site ? " · neutral site" : ""}
          {game.attendance ? ` · ${game.attendance.toLocaleString()} attendance` : ""}
        </Text>
        <Text fontSize="10px" color="whiteAlpha.400" mb={6} maxW="60rem" lineHeight={1.6}>
          Shaded cells show where this performance ranks against all {percentile_basis.team_games} parsed
          team-games of {percentile_basis.season} — our own league, not FBS. Green is above the median, amber below.
        </Text>

        {/* Three-column masonry: tables are wildly different heights and the
            columns should fill, not line up row by row. */}
        <Box style={{ columnCount: 3, columnGap: "0.75rem" }} css={{ "@media (max-width: 1200px)": { columnCount: 2 }, "@media (max-width: 800px)": { columnCount: 1 } }}>
          {tables.map((t) => <StatTable key={t.id} table={t} teams={teams} />)}
          {matrices.map((m) => <Matrix key={m.team.id} {...m} />)}
          {players.map((p) => <PlayerBlock key={p.team.id} {...p} />)}
        </Box>

        <Box mt={6}>
          <PlayList title="Big Plays" plays={big_plays} note="By absolute EPA" />
          <PlayList title="Most Important Plays" plays={important_plays} note="By absolute WPA" />
          <PlayList title="Scoring Plays" plays={scoring_plays} />
        </Box>

        {/* The blank list IS the deliverable — what our export cannot answer,
            stated plainly, so the backend gets a checklist rather than a vibe. */}
        <Box bg={PANEL} border="1px solid" borderColor="rgba(246,173,85,0.3)" borderRadius="md" mt={6}>
          <Text fontSize="11px" fontWeight="900" color="#F6AD55" textTransform="uppercase" letterSpacing="0.1em" px={3} py={2} borderBottom="1px solid" borderColor={LINE}>
            What the export cannot answer yet — {gaps.length} gaps
          </Text>
          {gaps.map((g, i) => (
            <Box key={i} px={3} py={2} borderBottom={i === gaps.length - 1 ? "none" : "1px solid"} borderColor="rgba(255,255,255,0.04)">
              <Text fontSize="11px" fontWeight="700" color="white">{g.label}</Text>
              <Text fontSize="10px" color="whiteAlpha.600" lineHeight={1.6}>{g.why}</Text>
            </Box>
          ))}
        </Box>

        <Text fontSize="9px" color="whiteAlpha.400" mt={4} lineHeight={1.6} maxW="60rem">
          Source: {data.source_file}. Layout structure follows GameOnPaper's single-game breakdown;
          every number is computed from our own parsed export by scripts/build_game_tables.js.
        </Text>
      </Box>
    </Box>
  );
};

export default PageLab;
