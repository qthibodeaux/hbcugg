import { useRef, useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import teamsData from "../../../data/teams.json";
import { downloadDataUrl } from "../../game/export/exportImage";
import { teamLogo } from "../../game/export/exportData";
import { paletteOf, posterVars } from "../../game/recap/WeekRecapExport";
import { useLeadersFile, useLeadersIndex } from "../../../hooks/usePlayerLeaders";
import { useColorScheme } from "../../../theme/colorScheme";

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER LEADERS — the Player Stats page's export: Offensive Leaders (passing ·
// rushing · receiving) and Defensive Leaders (tackles · sacks · interceptions),
// top 10 each, as a poster for one week or for the whole season. 1400px wide,
// as tall as its content (title only, no scope line); follows the Light / Night switch like the recap poster.
//
// Everything on the poster is the backend's: stats/leaders/{season}/week_{n}.json
// and season.json — ranks, ties, values, opponent, result (Player Leaders Fetch
// Contract). Nothing is ranked or summed here.
// ─────────────────────────────────────────────────────────────────────────────

const POSTER_W = 1400;
const MAX_ROWS = 9;
const META = Object.fromEntries(teamsData.teams.map((t) => [t.exportId.replace(/25$/, ""), t]));
const short = (id) => META[id]?.shortName ?? String(id ?? "").toUpperCase();

const BG = "var(--rc-bg)";
const PANEL = "var(--rc-panel)";
const INK = "var(--rc-ink)";
const fg = (a) => `rgba(var(--rc-fg), ${a})`;
// Accents are the site's purple (the palette's brand, light or night); the
// tick on each row is the school's primary colour from teams.json.
const ACCENT = "var(--rc-brand)";
const primaryOf = (id) => META[id]?.colors?.primary ?? "#71717A";

const tds = (n) => (n > 0 ? (n === 1 ? "TD" : `${n} TD`) : null);
const ints = (n) => (n > 0 ? (n === 1 ? "INT" : `${n} INT`) : null);
const join = (...parts) => parts.filter(Boolean).join(", ");
const fmt = (v) => (Number.isInteger(v) ? v : Number(v).toFixed(1));

// The category's own line, off the row fields (week = that game, season = totals).
const LINES = {
  passing: (r) => join(`${r.completions}/${r.attempts}`, tds(r.touchdowns), ints(r.interceptions)),
  rushing: (r) => join(`${r.carries} car`, tds(r.touchdowns), r.long != null ? `long ${r.long}` : null),
  receiving: (r) => join(`${r.receptions} rec`, tds(r.touchdowns), r.long != null ? `long ${r.long}` : null),
  tackles: (r) => join(`${r.solo ?? 0} solo`, `${r.assisted ?? 0} ast`, r.tfl ? `${fmt(r.tfl)} TFL` : null),
  sacks: (r) => join(r.sack_yards ? `${r.sack_yards} yds` : null, r.tfl ? `${fmt(r.tfl)} TFL` : null, r.qb_hurries ? `${r.qb_hurries} hurries` : null, r.forced_fumbles ? `${r.forced_fumbles} FF` : null),
  interceptions: (r) => join(`${r.return_yards ?? 0} ret yds`, tds(r.touchdowns), r.pass_breakups ? `${r.pass_breakups} PBU` : null),
};

// Last name only, suffix kept: "Cornelious Brown IV" → "Brown IV", "Li'Darius Pryor" → "Pryor".
const SUFFIX = /^(jr\.?|sr\.?|ii|iii|iv|v)$/i;
const lastName = (full) => {
  const parts = String(full ?? "").trim().split(/\s+/);
  if (parts.length > 2 && SUFFIX.test(parts[parts.length - 1])) return parts.slice(-2).join(" ");
  return parts[parts.length - 1] ?? "";
};

const oppOf = (r) => r.opponent_short_name ?? (r.opponent_team_id ? short(r.opponent_team_id) : r.opponent_name ?? "");

// The third line: who it was against (week) or how the season looks (season).
const contextLine = (r, mode) => {
  if (mode === "week") {
    return `${r.result} ${r.score} ${r.home_away === "away" ? "at" : "vs."} ${oppOf(r)}`;
  }
  const best = r.best_game;
  return join(`${r.games} G`, `${fmt(r.per_game)}/G`, best ? `best ${fmt(best.value)} vs. ${best.opponent_short_name ?? short(best.opponent_team_id)} (Wk ${best.week})` : null);
};

const LeaderRow = ({ r, unit, mode, cat }) => (
  <Grid templateColumns="26px 48px minmax(0,1fr) auto" columnGap="12px" alignItems="center" bg={PANEL} borderLeft={`4px solid ${primaryOf(r.team_id)}`} px="12px" py="10px" minH="78px">
    <Text fontSize="14px" fontWeight="900" color={fg(0.4)} fontVariantNumeric="tabular-nums" alignSelf="start" pt="2px">{r.rank}</Text>
    <Image src={teamLogo(r.team_id)} alt="" w="44px" h="44px" objectFit="contain" />
    <Box minW={0}>
      <Flex align="baseline" gap="8px" minW={0}>
        <Text fontSize="20px" fontWeight="900" color={INK} lineHeight={1.1} whiteSpace="nowrap" flexShrink={0}>{lastName(r.display_name)}</Text>
        <Text fontSize="12px" fontWeight="900" color={fg(0.5)} letterSpacing="0.04em" whiteSpace="nowrap" flexShrink={0}>{[r.position, r.class_year].filter(Boolean).join(" · ")}</Text>
      </Flex>
      <Text fontSize="15px" fontWeight="700" color={fg(0.65)} lineHeight={1.3} lineClamp={1}>{LINES[cat](r)}</Text>
      <Text fontSize="13px" fontWeight="600" fontStyle="italic" color={fg(0.5)} lineHeight={1.3} lineClamp={1}>{contextLine(r, mode)}</Text>
    </Box>
    <Flex align="baseline" gap="5px">
      <Text fontSize="36px" fontWeight="950" color={INK} lineHeight={1} fontVariantNumeric="tabular-nums" letterSpacing="-0.02em">{fmt(r.value)}</Text>
      <Text fontSize="11px" fontWeight="900" color={fg(0.5)} letterSpacing="0.08em">{unit}</Text>
    </Flex>
  </Grid>
);

export const WeekLeadersPoster = ({ file, side, mode, scheme, innerRef }) => {
  const cats = (file?.categories ?? []).filter((c) => c.side === side);
  const title = `${side === "offense" ? "Offensive" : "Defensive"} Leaders`;
  const tag = mode === "week" ? file.week_label : `${file.season} Season`;
  return (
    <Box ref={innerRef} w={`${POSTER_W}px`} bg={BG} color={INK} style={posterVars(scheme)} px="48px" pt="40px" pb="40px">
      <Box h="6px" bg={ACCENT} mx="-48px" mt="-40px" mb="34px" />
      <Flex align="flex-end" gap="24px">
        <Text fontSize="54px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.9} letterSpacing="-0.03em" whiteSpace="nowrap">
          {title} <Box as="span" color={ACCENT}>— {tag}</Box>
        </Text>
      </Flex>
      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="20px" mt="30px">
        {cats.map((c) => (
          <Box key={c.id} minW={0}>
            <Text fontSize="26px" fontWeight="950" textTransform="uppercase" letterSpacing="0.01em" borderBottom="4px solid" borderColor={ACCENT} display="inline-block" lineHeight={1.1} mb="14px">{c.label}</Text>
            <Flex direction="column" gap="8px">
              {/* 9 rows a column at most, ties at the cut included or not, so the three columns stay even. */}
              {c.rows.slice(0, MAX_ROWS).map((r) => <LeaderRow key={`${r.person_id}-${r.game_path_id ?? "s"}`} r={r} unit={c.unit} mode={mode} cat={c.id} />)}
            </Flex>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

const Pill = ({ label, onClick, active, disabled }) => (
  <Flex as="button" type="button" onClick={onClick} disabled={disabled} align="center" gap={2} px={4} h="2.4rem" borderRadius="md" bg={active ? "brand.500" : "whiteAlpha.200"} opacity={disabled ? 0.4 : 1}>
    <Text fontSize="12px" fontWeight="900" textTransform="uppercase" letterSpacing="0.12em">{label}</Text>
  </Flex>
);

const PreviewModal = ({ index, season, initialSide, onClose }) => {
  const [scheme] = useColorScheme();
  const entry = index.seasons.find((s) => s.season === Number(season)) ?? null;
  const weeks = entry?.weeks ?? [];
  const isCurrent = Number(season) === index.current?.season;
  const [side, setSide] = useState(initialSide === "defense" ? "defense" : "offense");
  // The live season opens on its latest week; a finished one on the season.
  const [mode, setMode] = useState(isCurrent || !entry?.season_file ? "week" : "season");
  const [week, setWeek] = useState(isCurrent ? index.current.week : weeks[weeks.length - 1] ?? null);
  const [busy, setBusy] = useState(false);
  const posterRef = useRef(null);

  const { file, isLoading, isError } = useLeadersFile(season, mode === "week" ? week : null, mode === "week" ? week != null : !!entry?.season_file);
  const at = weeks.indexOf(week);
  const step = (d) => weeks[at + d] != null && setWeek(weeks[at + d]);

  const save = async () => {
    if (!posterRef.current || busy || !file) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(posterRef.current, { pixelRatio: 2, backgroundColor: paletteOf(scheme).bg, cacheBust: true, width: POSTER_W, height: posterRef.current.offsetHeight });
      downloadDataUrl(url, `${side}-leaders-${season}-${mode === "week" ? `week-${week}` : "season"}-${scheme}.png`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box position="fixed" inset={0} zIndex={2000} bg="rgba(0,0,0,0.85)" overflowY="auto" onClick={onClose}>
      <Flex direction="column" align="center" py={6} gap={4} onClick={(e) => e.stopPropagation()}>
        <Flex gap={2} wrap="wrap" justify="center" align="center">
          <Pill label="Offense" onClick={() => setSide("offense")} active={side === "offense"} />
          <Pill label="Defense" onClick={() => setSide("defense")} active={side === "defense"} />
          <Box w="1px" h="1.6rem" bg="whiteAlpha.300" mx={1} />
          <Pill label="Week" onClick={() => setMode("week")} active={mode === "week"} disabled={!weeks.length} />
          <Pill label="Season" onClick={() => setMode("season")} active={mode === "season"} disabled={!entry?.season_file} />
          {mode === "week" && (
            <Flex align="center" gap={1}>
              <Flex as="button" type="button" onClick={() => step(-1)} disabled={weeks[at - 1] == null} w="2.4rem" h="2.4rem" align="center" justify="center" borderRadius="md" bg="whiteAlpha.200" opacity={weeks[at - 1] == null ? 0.4 : 1} aria-label="Previous week"><ChevronLeft size={16} /></Flex>
              <Text w="5.5rem" textAlign="center" fontSize="12px" fontWeight="900" textTransform="uppercase" letterSpacing="0.12em">{week != null ? `Week ${week}` : "—"}</Text>
              <Flex as="button" type="button" onClick={() => step(1)} disabled={weeks[at + 1] == null} w="2.4rem" h="2.4rem" align="center" justify="center" borderRadius="md" bg="whiteAlpha.200" opacity={weeks[at + 1] == null ? 0.4 : 1} aria-label="Next week"><ChevronRight size={16} /></Flex>
            </Flex>
          )}
          <Box w="1px" h="1.6rem" bg="whiteAlpha.300" mx={1} />
          <Flex as="button" type="button" onClick={save} align="center" gap={2} px={4} h="2.4rem" borderRadius="md" bg="brand.500" opacity={busy || !file ? 0.6 : 1}>
            <Download size={15} /><Text fontSize="12px" fontWeight="900" textTransform="uppercase" letterSpacing="0.12em">{busy ? "Saving" : isLoading ? "Loading" : "Save PNG"}</Text>
          </Flex>
          <Flex as="button" type="button" onClick={onClose} align="center" gap={2} px={4} h="2.4rem" borderRadius="md" bg="whiteAlpha.200">
            <X size={15} /><Text fontSize="12px" fontWeight="900" textTransform="uppercase" letterSpacing="0.12em">Close</Text>
          </Flex>
        </Flex>

        {file ? (
          <>
            <Box boxShadow="0 1rem 3rem rgba(0,0,0,0.6)" style={{ zoom: Math.min(1, (window.innerWidth - 32) / POSTER_W) }}>
              <WeekLeadersPoster file={file} side={side} mode={mode} scheme={scheme} />
            </Box>
            <Box position="fixed" left="-20000px" top={0} aria-hidden="true">
              <WeekLeadersPoster file={file} side={side} mode={mode} scheme={scheme} innerRef={posterRef} />
            </Box>
          </>
        ) : (
          <Text fontSize="sm" color="whiteAlpha.700" py={16}>{isError ? "No leaders file for this selection." : "Loading…"}</Text>
        )}
      </Flex>
    </Box>
  );
};

/** The Export button for the Player Stats banner: opens on the page's side and season. */
export const WeekLeadersExport = ({ side = "offense", season, placement = {} }) => {
  const { index } = useLeadersIndex();
  const [open, setOpen] = useState(false);
  if (!index) return null;
  return (
    <>
      <Flex as="button" type="button" onClick={() => setOpen(true)} position="absolute" top="0.75rem" right="0.75rem" zIndex={5}
        align="center" gap={1.5} px={3} py={1.5} borderRadius="md" bg="whiteAlpha.200" _hover={{ bg: "whiteAlpha.300" }} {...placement}>
        <Download size={13} />
        <Text fontSize="10px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.16em">Leaders</Text>
      </Flex>
      {open && <PreviewModal key={`${season}-${side}`} index={index} season={season ?? index.current?.season} initialSide={side} onClose={() => setOpen(false)} />}
    </>
  );
};
