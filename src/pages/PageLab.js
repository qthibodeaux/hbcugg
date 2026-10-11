import { useQuery } from "@tanstack/react-query";
import { Box, Flex, Image, Spinner, Text } from "@chakra-ui/react";
import { SfaPvamuPreviewA } from "../components/organisms/test/SfaPvamuPreviewA";

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

const PANEL = "#141416";
const LINE = "rgba(255,255,255,0.07)";

// Percentile shading. A diverging ramp so the eye separates "bad" from "good"
// without having to read the number: amber below the median, green above, and
// nearly nothing in the middle where the difference is not meaningful.
const shadeFor = (pct) => {
  if (pct == null) return "transparent";
  const d = (pct - 50) / 50; // -1 … +1
  const a = Math.min(0.32, Math.abs(d) * 0.34);
  return d >= 0 ? `rgba(72, 187, 120, ${a})` : `rgba(246, 173, 85, ${a})`;
};
const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const Kicker = ({ children, ...rest }) => (
  <Text fontSize="9px" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.12em" {...rest}>
    {children}
  </Text>
);

const TeamHead = ({ teams }) => (
  <Flex align="center" gap={2} justify="flex-end" flexShrink={0}>
    {teams.map((t) => (
      <Flex key={t.id} w="4.4rem" justify="center" align="center" gap={1}>
        {t.logo
          ? <Image src={t.logo} alt={t.short} w="18px" h="18px" objectFit="contain" />
          : <Text fontSize="9px" fontWeight="900" color="white">{t.short}</Text>}
      </Flex>
    ))}
  </Flex>
);

const StatTable = ({ table, teams }) => (
  <Box bg={PANEL} border="1px solid" borderColor={LINE} borderRadius="md" mb={3} style={{ breakInside: "avoid" }}>
    <Flex align="center" justify="space-between" gap={3} px={3} py={2} borderBottom="1px solid" borderColor={LINE}>
      <Text fontSize="11px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.1em">
        {table.title}
      </Text>
      <TeamHead teams={teams} />
    </Flex>

    {table.rows.map((row, i) => (
      <Flex
        key={`${row.label}-${i}`}
        align="center"
        justify="space-between"
        gap={3}
        px={3}
        py={1}
        borderBottom={i === table.rows.length - 1 ? "none" : "1px solid"}
        borderColor="rgba(255,255,255,0.04)"
        _hover={{ bg: "whiteAlpha.50" }}
      >
        <Text
          fontSize="11px"
          color={row.indent ? "whiteAlpha.600" : "whiteAlpha.900"}
          pl={row.indent ? `${row.indent * 0.9}rem` : 0}
          lineClamp={1}
          title={row.label}
        >
          {row.label}
        </Text>
        <Flex gap={2} flexShrink={0}>
          {row.values.map((v, j) => (
            <Flex
              key={j}
              w="4.4rem"
              justify="center"
              align="baseline"
              gap={1}
              bg={shadeFor(v.pct)}
              borderRadius="sm"
              px={1}
              py={0.5}
            >
              <Text fontSize="11px" fontWeight="700" color="white" fontVariantNumeric="tabular-nums">
                {v.display}
              </Text>
              {v.pct != null && (
                <Text fontSize="8px" color="whiteAlpha.600" fontVariantNumeric="tabular-nums">
                  {ordinal(v.pct)}
                </Text>
              )}
            </Flex>
          ))}
        </Flex>
      </Flex>
    ))}

    {table.footnote && (
      <Text fontSize="9px" color="whiteAlpha.400" lineHeight={1.5} px={3} py={2} borderTop="1px solid" borderColor={LINE}>
        {table.footnote}
      </Text>
    )}
  </Box>
);

// ─── Matrices ────────────────────────────────────────────────────────────────
// GOP's target matrix is depth x direction. Ours has the same nine cells
// because heat_maps ships short/medium/deep against left/middle/right — what it
// does not ship is air yards and YAC, so the aDOT line theirs carries is absent.

const DEPTHS = [["deep", "Deep"], ["medium", "Medium"], ["short", "Short"]];
const DIRS = [["left", "Left"], ["middle", "Middle"], ["right", "Right"]];

const Matrix = ({ team, pass, rush }) => {
  const cells = DEPTHS.flatMap(([d]) => DIRS.map(([dir]) => pass?.[`${d}_${dir}`]?.attempts ?? 0));
  const peak = Math.max(1, ...cells);
  return (
    <Box bg={PANEL} border="1px solid" borderColor={LINE} borderRadius="md" mb={3} style={{ breakInside: "avoid" }}>
      <Flex align="center" gap={2} px={3} py={2} borderBottom="1px solid" borderColor={LINE}>
        {team.logo && <Image src={team.logo} alt="" w="16px" h="16px" objectFit="contain" />}
        <Text fontSize="11px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.1em">
          {team.short} · target matrix
        </Text>
      </Flex>

      <Box px={3} py={3}>
        {DEPTHS.map(([d, dLabel]) => (
          <Flex key={d} gap={1} mb={1} align="stretch">
            <Flex w="4rem" align="center" flexShrink={0}>
              <Kicker>{dLabel}</Kicker>
            </Flex>
            {DIRS.map(([dir]) => {
              const c = pass?.[`${d}_${dir}`];
              const att = c?.attempts ?? 0;
              return (
                <Box
                  key={dir}
                  flex="1"
                  minW={0}
                  py={2}
                  borderRadius="sm"
                  textAlign="center"
                  bg={att ? `rgba(168,85,247,${0.12 + (att / peak) * 0.34})` : "whiteAlpha.50"}
                >
                  <Text fontSize="12px" fontWeight="900" color={att ? "white" : "whiteAlpha.400"} fontVariantNumeric="tabular-nums">
                    {c ? `${c.completions}/${att}` : "0/0"}
                  </Text>
                  <Text fontSize="9px" color="whiteAlpha.600" fontVariantNumeric="tabular-nums">
                    {c?.yards ?? 0} yds
                  </Text>
                </Box>
              );
            })}
          </Flex>
        ))}
        <Flex gap={1} mt={1}>
          <Box w="4rem" flexShrink={0} />
          {DIRS.map(([dir, label]) => (
            <Box key={dir} flex="1" textAlign="center"><Kicker>{label}</Kicker></Box>
          ))}
        </Flex>

        <Box mt={4}>
          <Kicker mb={2}>Rush matrix</Kicker>
          <Flex gap={1}>
            {DIRS.map(([dir, label]) => {
              const c = rush?.[dir];
              return (
                <Box key={dir} flex="1" py={2} borderRadius="sm" textAlign="center" bg="whiteAlpha.100">
                  <Text fontSize="12px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">
                    {c?.yards ?? 0}
                  </Text>
                  <Text fontSize="9px" color="whiteAlpha.600" fontVariantNumeric="tabular-nums">
                    {c?.attempts ?? 0} car · {c?.yards_per_carry?.toFixed(1) ?? "—"} ypc
                  </Text>
                  <Kicker mt={1}>{label}</Kicker>
                </Box>
              );
            })}
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

// ─── Player lines ────────────────────────────────────────────────────────────

const PlayerBlock = ({ team, dropbacks, rushes, targets }) => {
  const Group = ({ label, rows }) =>
    !rows.length ? null : (
      <Box mb={3}>
        <Kicker mb={1.5}>{label}</Kicker>
        {rows.map((r) => (
          <Flex key={r.name} align="baseline" gap={3} py={1} borderBottom="1px solid" borderColor="rgba(255,255,255,0.04)">
            <Box flex="1" minW={0}>
              <Text fontSize="11px" fontWeight="700" color="white" lineClamp={1}>{r.name}</Text>
              <Text fontSize="10px" color="whiteAlpha.500" lineClamp={1}>{r.stat_line}</Text>
            </Box>
            {[["EPA", r.epa], ["EPA/Play", r.epa_per_play], ["SR", r.sr], ["WPA", r.wpa]].map(([k, v]) => (
              <Box key={k} w="3.1rem" textAlign="right" flexShrink={0}>
                <Text fontSize="11px" fontWeight="700" color="white" fontVariantNumeric="tabular-nums">{v}</Text>
                <Kicker>{k}</Kicker>
              </Box>
            ))}
          </Flex>
        ))}
      </Box>
    );

  return (
    <Box bg={PANEL} border="1px solid" borderColor={LINE} borderRadius="md" mb={3} style={{ breakInside: "avoid" }}>
      <Flex align="center" gap={2} px={3} py={2} borderBottom="1px solid" borderColor={LINE}>
        {team.logo && <Image src={team.logo} alt="" w="16px" h="16px" objectFit="contain" />}
        <Text fontSize="11px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.1em">
          {team.name}
        </Text>
      </Flex>
      <Box px={3} py={3}>
        <Group label="Dropbacks" rows={dropbacks} />
        <Group label="Rush attempts" rows={rushes} />
        <Group label="Pass targets" rows={targets} />
      </Box>
    </Box>
  );
};

// ─── Play lists ──────────────────────────────────────────────────────────────

const PlayList = ({ title, plays, note }) => (
  <Box bg={PANEL} border="1px solid" borderColor={LINE} borderRadius="md" mb={3}>
    <Flex align="center" justify="space-between" px={3} py={2} borderBottom="1px solid" borderColor={LINE}>
      <Text fontSize="11px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.1em">{title}</Text>
      {note && <Kicker>{note}</Kicker>}
    </Flex>
    {!plays.length ? (
      <Text fontSize="10px" color="whiteAlpha.500" px={3} py={3}>Not available — see the gap list.</Text>
    ) : (
      plays.map((p, i) => (
        <Flex key={i} gap={3} px={3} py={2} borderBottom={i === plays.length - 1 ? "none" : "1px solid"} borderColor="rgba(255,255,255,0.04)" align="flex-start">
          <Box w="4.2rem" flexShrink={0}>
            <Text fontSize="10px" fontWeight="900" color="whiteAlpha.700" fontVariantNumeric="tabular-nums">{p.time}</Text>
            <Kicker>{p.offense}</Kicker>
          </Box>
          <Text fontSize="10px" color="whiteAlpha.700" lineHeight={1.5} flex="1" minW={0}>{p.text}</Text>
          <Box w="3rem" textAlign="right" flexShrink={0}>
            <Text
              fontSize="11px"
              fontWeight="900"
              fontVariantNumeric="tabular-nums"
              color={p.epa === "—" ? "whiteAlpha.400" : Number(p.epa) >= 0 ? "#48BB78" : "#F6AD55"}
            >
              {p.epa ?? "—"}
            </Text>
            <Kicker>{p.points != null ? `${p.points} pts` : "EPA"}</Kicker>
          </Box>
          {p.wpa != null && (
            <Box w="3.2rem" textAlign="right" flexShrink={0}>
              <Text fontSize="11px" fontWeight="900" color="whiteAlpha.800" fontVariantNumeric="tabular-nums">
                {p.wpa}
              </Text>
              <Kicker>WPA</Kicker>
            </Box>
          )}
        </Flex>
      ))
    )}
  </Box>
);

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
