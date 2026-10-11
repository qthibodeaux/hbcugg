import { useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";
import { buildIdentityIndex, resolveImages, resolveImage, splitDisplayName } from "../../../utils/headshots";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

// Week Central brief — the two blocks adapted from the game page's Summary
// tab (TeamStatsComparisonCard, NotablePerformersCard). Same stat set, same
// reads off the game file, same visual language; sized for the brief column.
// Nothing here derives a number the file doesn't carry and nothing mocks:
// no season-average notch (the game page's is a placeholder), no stand-in
// performers.

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});
const normalizeTeamKey = (value) => String(value ?? "").replace(/25$/, "");
const teamMeta = (id) => TEAM_BY_ID[normalizeTeamKey(id)] ?? null;
const teamShort = (id, fallback = "TBD") => teamMeta(id)?.bannerShort ?? teamMeta(id)?.shortName ?? fallback;
const teamLogo = (id) => teamMeta(id)?.logo ?? (id ? `/assets/${normalizeTeamKey(id)}.svg` : null);

// ─── Identity ────────────────────────────────────────────────────────────────
// Roster identity for a game-file player row. `player_key` is the PERS_ id on
// the 2026 files, so the roster joins on person_id first; older files carry a
// name key and fall back to the name+team headshot lane. No image when neither
// resolves — the avatar renders initials.
// `priorPlayerSeasons` is the season before — same person_id, and often a
// real headshot where the current roster's URL is dead (the 2026 drop ships
// placeholder hosts; see LAUNCH_0_BACKEND_NOTES.md). Candidates are tried
// in order at render time; a URL that fails to load falls through to the next.
export { buildIdentityIndex, resolveImages, resolveImage };

export const initialsOf = (name) => String(name ?? "")
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase() ?? "")
  .join("") || "--";

// Headshot with an initials fallback. No placeholder photo: a missing or dead
// URL shows the player's initials, never someone else's face.
export const HeadshotOrInitials = ({ name, src, srcs, fontSize = "sm" }) => {
  const candidates = srcs ?? (src ? [src] : []);
  const [attempt, setAttempt] = useState(0);
  const current = candidates[attempt] ?? null;
  if (!current) {
    return (
      <Flex w="100%" h="100%" align="center" justify="center">
        <Text fontSize={fontSize} color="white" fontWeight="black" letterSpacing="0.04em">{initialsOf(name)}</Text>
      </Flex>
    );
  }
  return <Image key={current} src={current} alt={name} w="100%" h="100%" objectFit="cover" onError={() => setAttempt((a) => a + 1)} />;
};

const BlockLabel = ({ children, color }) => (
  <Text fontSize="9px" color={color} fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
    {children}
  </Text>
);

// ─── Team stats ──────────────────────────────────────────────────────────────
// The game page's ten rows, verbatim: every value is a straight field read off
// team_box / advanced_team except yards per play (total_yards / plays_offense,
// on the backend ask list). `stuff_rate` is the rate a team's OWN runs were
// stuffed, so a defence's run-stuff figure is the opponent's number.
const pctOf = (v) => (v || 0) * 100;
const asPct = (v) => `${v.toFixed(0)}%`;
const signed2 = (v) => (v > 0 ? "+" : "") + v.toFixed(2);
const signed0 = (v) => (v > 0 ? "+" : "") + v.toFixed(0);
const perPlay = (stats) => {
  const plays = stats.plays_offense || 0;
  return plays ? (stats.total_yards || 0) / plays : 0;
};

// League context comes from shared/league_avg_{season}.json — `keys` is a
// map of game-payload field paths to { avg, min, max } over the season's
// team-games. The notch is the league average, the fill is measured against
// the league max. Rows whose field has no league key (yards per play is
// derived, not shipped) carry no notch and fill against the larger of the
// two values. Nothing is estimated.
const leagueContext = (leagueAvg, path, scale = 1) => {
  const entry = leagueAvg?.keys?.[path];
  if (!entry || entry.avg == null) return null;
  return {
    avg: Number(entry.avg) * scale,
    max: entry.max != null ? Number(entry.max) * scale : null,
    min: entry.min != null ? Number(entry.min) * scale : null,
  };
};

export const buildTeamStatRows = (parsedGame, awayId, homeId, leagueAvg = null) => {
  if (!parsedGame) return [];
  const aStats = parsedGame.team_box?.[awayId] ?? {};
  const hStats = parsedGame.team_box?.[homeId] ?? {};
  const aAdv = parsedGame.advanced_team?.[awayId] ?? {};
  const hAdv = parsedGame.advanced_team?.[homeId] ?? {};
  const ctx = (path, scale) => leagueContext(leagueAvg, path, scale);

  return [
    { label: "Total Yards", away: aStats.total_yards || 0, home: hStats.total_yards || 0, format: (v) => v.toLocaleString(), league: ctx("team_box.total_yards") },
    { label: "EPA / Play", away: aAdv.epa_per_play ?? 0, home: hAdv.epa_per_play ?? 0, format: signed2, league: ctx("advanced_team.epa_per_play"), allowNegative: true },
    { label: "Success Rate", away: pctOf(aAdv.success_rate), home: pctOf(hAdv.success_rate), format: asPct, league: ctx("advanced_team.success_rate", 100) },
    { label: "Yards / Play", away: perPlay(aStats), home: perPlay(hStats), format: (v) => v.toFixed(1), league: null },
    { label: "Explosive Rate", away: pctOf(aAdv.explosive_rate_yardage), home: pctOf(hAdv.explosive_rate_yardage), format: asPct, league: ctx("advanced_team.explosive_rate_yardage", 100) },
    { label: "3rd Down Rate", away: pctOf(aStats.third_down_conversion_rate), home: pctOf(hStats.third_down_conversion_rate), format: asPct, league: ctx("team_box.third_down_conversion_rate", 100) },
    { label: "Havoc Rate", away: pctOf(aAdv.havoc_rate_forced), home: pctOf(hAdv.havoc_rate_forced), format: asPct, league: ctx("advanced_team.havoc_rate_forced", 100) },
    { label: "Def Run Stuff", away: pctOf(hAdv.stuff_rate), home: pctOf(aAdv.stuff_rate), format: asPct, league: ctx("advanced_team.stuff_rate", 100) },
    { label: "Spec Teams Yds", away: aAdv.special_teams_hidden_yards ?? 0, home: hAdv.special_teams_hidden_yards ?? 0, format: signed0, league: ctx("advanced_team.special_teams_hidden_yards"), allowNegative: true },
    { label: "Avg Start", away: aStats.avg_start_field_position ?? 0, home: hStats.avg_start_field_position ?? 0, format: (v) => v.toFixed(0), league: ctx("team_box.avg_start_field_position") },
  ];
};

// One team's cell, matching the game page's card: the number with a hairline
// meter beneath it. Away is anchored to its right edge and grows leftward,
// home anchored left and grows right, so the pair reads outward from the
// gutter. Fill is |value| against the league max; the notch is the league
// average. A negative still has a length — it renders washed out so it can
// never read as a positive one.
const NOTCH_COLOR = "rgba(255,255,255,0.75)";

const StatCell = ({ stat, side, color }) => {
  const isAway = side === "away";
  const value = isAway ? stat.away : stat.home;
  const other = isAway ? stat.home : stat.away;
  const tied = value === other;
  const wins = !tied && value > other;
  const scaleMax = stat.league?.max != null
    ? Math.max(Math.abs(stat.league.max), Math.abs(stat.league.min ?? 0), Math.abs(value), 1e-9)
    : Math.max(Math.abs(stat.away), Math.abs(stat.home), 1e-9);
  const fill = Math.min(100, (Math.abs(value) / scaleMax) * 100);
  const avgPct = stat.league ? Math.min(100, (Math.abs(stat.league.avg) / scaleMax) * 100) : null;

  return (
    <Box minW={0}>
      <Text
        fontSize={{ base: "12px", xl: "sm" }}
        fontWeight="950"
        color={wins ? color : "rgba(255,255,255,0.5)"}
        textAlign={isAway ? "right" : "left"}
        lineHeight={1}
        lineClamp={1}
      >
        {stat.format(value)}
      </Text>
      <Box position="relative" h="0.125rem" w="full" mt="0.3rem">
        <Box position="absolute" inset={0} borderRadius="full" bg="rgba(0,0,0,0.35)" />
        <Box
          position="absolute"
          top={0}
          bottom={0}
          borderRadius="full"
          bg={color}
          opacity={value < 0 ? 0.28 : 0.85}
          style={{ width: `${fill}%`, ...(isAway ? { right: 0 } : { left: 0 }) }}
        />
        {avgPct != null && (
          <Box
            position="absolute"
            top="-0.125rem"
            bottom="-0.125rem"
            w="0.0625rem"
            bg={NOTCH_COLOR}
            zIndex={2}
            style={isAway ? { right: `${avgPct}%` } : { left: `${avgPct}%` }}
          />
        )}
      </Box>
    </Box>
  );
};

export const BriefTeamStats = ({ rows, awayId, homeId, awayColor, homeColor, accent }) => {
  if (!rows.length) return null;
  return (
    <Box>
      <Flex align="center" justify="space-between" mb={2} pb={2} borderBottom="1px solid" borderColor="rgba(255,255,255,0.14)">
        <BlockLabel color={accent}>Team Stats</BlockLabel>
        <Flex align="center" gap={2}>
          <Flex align="center" gap={1}>
            <Image src={teamLogo(awayId)} alt="" h="14px" w="14px" objectFit="contain" />
            <Text fontSize="9px" color="rgba(255,255,255,0.7)" fontWeight="black" textTransform="uppercase" letterSpacing="0.1em">{teamShort(awayId)}</Text>
          </Flex>
          <Box w="1px" h="10px" bg="rgba(255,255,255,0.2)" />
          <Flex align="center" gap={1}>
            <Text fontSize="9px" color="rgba(255,255,255,0.7)" fontWeight="black" textTransform="uppercase" letterSpacing="0.1em">{teamShort(homeId)}</Text>
            <Image src={teamLogo(homeId)} alt="" h="14px" w="14px" objectFit="contain" />
          </Flex>
        </Flex>
      </Flex>
      <Flex direction="column" gap={{ base: "9px", xl: "12px" }}>
        {rows.map((stat) => (
          <Grid key={stat.label} templateColumns="minmax(0, 1.75fr) minmax(0, 1fr) minmax(0, 1fr)" columnGap="0.5rem" alignItems="center">
            <Text fontSize={{ base: "9px", xl: "10px" }} fontWeight="black" color="rgba(255,255,255,0.62)" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.15}>
              {stat.label}
            </Text>
            <StatCell stat={stat} side="away" color={awayColor} />
            <StatCell stat={stat} side="home" color={homeColor} />
          </Grid>
        ))}
      </Flex>

      {/* Key — the notch and the unfilled remainder are both deliberate and
          neither is self-explanatory. Only shown when league context loaded. */}
      {rows.some((stat) => stat.league) && (
        <Flex align="center" justify="center" gap={5} mt={3} pt={2} borderTop="1px solid" borderColor="rgba(255,255,255,0.14)" flexWrap="wrap" rowGap={1}>
          <Flex align="center" gap={1.5}>
            <Box w="0.0625rem" h="0.5rem" bg={NOTCH_COLOR} flexShrink={0} />
            <Text fontSize="8px" color="rgba(255,255,255,0.55)" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">League Avg</Text>
          </Flex>
          <Flex align="center" gap={1.5}>
            <Box position="relative" w="1.75rem" h="0.125rem" borderRadius="full" bg="rgba(0,0,0,0.35)" flexShrink={0} overflow="hidden">
              <Box position="absolute" left={0} top={0} bottom={0} w="58%" borderRadius="full" bg="rgba(255,255,255,0.5)" />
            </Box>
            <Text fontSize="8px" color="rgba(255,255,255,0.55)" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Fill = vs League Max</Text>
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

// ─── Desktop stat chips ──────────────────────────────────────────────────────
// The production cards' stat sets, read straight off the player's
// individual_stats rows. Twelve per position; a stat the row doesn't carry
// prints "—". Position picks the primary category; the row is found by
// player_key in that team's stats.
const DASH = "\u2014";
const num = (v) => (v == null ? DASH : Number.isInteger(Number(v)) ? String(v) : Number(v).toFixed(1));
const rate1 = (v) => (v == null ? DASH : Number(v).toFixed(1));
const rate2 = (v) => (v == null ? DASH : Number(v).toFixed(2));
const pctOf1 = (v) => (v == null ? DASH : `${Math.round(Number(v) * 100)}%`);
const ratio = (a, b) => (a == null || b == null ? DASH : `${a}-${b}`);

const CATEGORY_BY_POSITION = {
  QB: "passing", RB: "rushing", FB: "rushing", WR: "receiving", TE: "receiving",
  DB: "defense", CB: "defense", S: "defense", LB: "defense", DL: "defense", DE: "defense", DT: "defense", DEF: "defense",
};

const CHIPS_BY_CATEGORY = {
  passing: (p) => [
    ["Cmp/ Att", ratio(p.completions, p.attempts)],
    ["Yds", num(p.yards)],
    ["Cmp Rt", pctOf1(p.completion_pct)],
    ["Yd/ Att", rate1(p.yards_per_attempt)],
    ["TD", num(p.touchdowns)],
    ["INT", num(p.interceptions)],
    ["Sacks", num(p.sacks_taken)],
    ["aDOT", rate1(p.adot)],
    ["EPA/ Play", rate2(p.epa_per_play)],
    ["Succ Rt", pctOf1(p.success_rate)],
    ["3rd Dn", p.third_down_breakdown?.attempts ? pctOf1(p.third_down_breakdown.completions / p.third_down_breakdown.attempts) : DASH],
    ["Deep C-A", ratio(p.deep_completions, p.deep_attempts)],
  ],
  rushing: (p) => [
    ["Car-Yds", ratio(p.attempts, p.yards)],
    ["Yd/ Car", rate1(p.yards_per_carry)],
    ["TD", num(p.touchdowns)],
    ["Long", num(p.long)],
    ["Succ Rt", pctOf1(p.success_rate)],
    ["EPA/ Car", rate2(p.epa_per_play)],
    ["LY/ Car", rate1(p.line_yards_per_carry)],
    ["Opp Rt", pctOf1(p.opportunity_rate)],
    ["Hlt/ Opp", rate1(p.highlight_yards_per_opportunity)],
    ["Stuff Rt", pctOf1(p.stuff_rate)],
    ["Power Rt", pctOf1(p.power_rate)],
    ["Expl 10+", num(p.explosive_carries_10)],
  ],
  receiving: (p) => [
    ["Ct/ Tg", ratio(p.receptions, p.targets)],
    ["Yds", num(p.yards)],
    ["Catch Rt", pctOf1(p.catch_rate)],
    ["Yd/ Ch", rate1(p.yards_per_reception)],
    ["Yd/ Tg", rate1(p.yards_per_target)],
    ["TD", num(p.touchdowns)],
    ["Deep C-T", ratio(p.deep_receptions, p.deep_targets)],
    ["Fum", num(p.fumbles)],
  ],
  defense: (p) => [
    ["Tkl", num(p.tackles)],
    ["Solo", num(p.solo_tackles)],
    ["TFL", num(p.tfl)],
    ["Sacks", num(p.sacks)],
    ["INT", num(p.interceptions)],
    ["PD", num(p.passes_defended)],
    ["FF", num(p.forced_fumbles)],
    ["FR", num(p.fumble_recoveries)],
    ["Hrry", num(p.qb_hurries)],
    ["3rd Stp", num(p.third_down_stops)],
    ["Clutch", num(p.clutch_stops)],
    ["RZ Dsr", num(p.red_zone_disruptions)],
  ],
};

const findStatRow = (parsedGame, teamId, category, playerKey) => {
  const rows = parsedGame?.individual_stats?.[normalizeTeamKey(teamId)]?.[category];
  return Array.isArray(rows) ? rows.find((row) => row.player_key === playerKey) ?? null : null;
};

export const buildDesktopChips = (parsedGame, performer) => {
  const primary = CATEGORY_BY_POSITION[String(performer.position ?? "").toUpperCase()];
  const order = primary ? [primary, ...Object.keys(CHIPS_BY_CATEGORY).filter((c) => c !== primary)] : Object.keys(CHIPS_BY_CATEGORY);
  const category = order.find((cat) => findStatRow(parsedGame, performer.teamId, cat, performer.key));
  if (!category) return [];
  const row = findStatRow(parsedGame, performer.teamId, category, performer.key);
  const chips = CHIPS_BY_CATEGORY[category](row).map(([label, value]) => ({ label, value }));
  // A receiver's or back's second line, when he had one.
  const secondary = category === "receiving" ? "rushing" : category === "rushing" ? "receiving" : null;
  const secondRow = secondary ? findStatRow(parsedGame, performer.teamId, secondary, performer.key) : null;
  if (secondRow && chips.length < 12) {
    const extra = secondary === "rushing"
      ? [["Car-Yds", ratio(secondRow.attempts, secondRow.yards)], ["Rush TD", num(secondRow.touchdowns)], ["Yd/ Car", rate1(secondRow.yards_per_carry)], ["Rush Long", num(secondRow.long)]]
      : [["Ct/ Tg", ratio(secondRow.receptions, secondRow.targets)], ["Rec Yds", num(secondRow.yards)], ["Rec TD", num(secondRow.touchdowns)], ["Yd/ Ch", rate1(secondRow.yards_per_reception)]];
    extra.forEach(([label, value]) => { if (chips.length < 12) chips.push({ label, value }); });
  }
  return chips;
};

// ─── Notable performers ──────────────────────────────────────────────────────
// The file's `notable_performers[]` — backend-ranked, chips pre-built. Top
// three ride the carousel. Nothing computed here beyond the name split.
const AUTO_ROTATE_MS = 4500;
const PERFORMER_COUNT = 3;

export const buildPerformers = (parsedGame, identity) => {
  const rows = Array.isArray(parsedGame?.notable_performers) ? parsedGame.notable_performers : [];
  return rows.slice(0, PERFORMER_COUNT).map((p) => {
    const [first, last] = splitDisplayName(p.name);
    return {
      key: p.player_key ?? p.name,
      first,
      last,
      name: `${first} ${last}`.trim(),
      teamId: normalizeTeamKey(p.team_id),
      position: p.position ?? null,
      total: Number(p.production_total) || 0,
      chips: Array.isArray(p.chips) ? p.chips : [],
      images: resolveImages(identity, p, p.team_id),
    };
  }).map((performer) => ({ ...performer, desktopChips: buildDesktopChips(parsedGame, performer) }));
};

// Portrait bleed. Tries each headshot candidate in turn; when none loads,
// the team logo watermark stands in — never a stock face.
const PerformerPortrait = ({ performer }) => {
  const [attempt, setAttempt] = useState(0);
  const src = performer.images[attempt] ?? null;
  if (!src) {
    return (
      <Flex h="full" align="center" justify="center">
        <Image src={teamLogo(performer.teamId)} alt="" h="70%" maxW="80%" objectFit="contain" opacity={0.18} />
      </Flex>
    );
  }
  return <Image key={src} src={src} alt={performer.name} w="full" h="full" objectFit="cover" objectPosition="top center" onError={() => setAttempt((a) => a + 1)} />;
};

export const BriefPerformers = ({ performers, homeId, awayColor, homeColor, accent }) => {
  const { isStandard } = useLayoutDensity();
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  // Bumped on every advance AND every click; keying the ticker and the sweep
  // on it remounts both so a hand-pick gets a fresh interval.
  const [cycle, setCycle] = useState(0);
  const advanceTo = (next) => {
    setIndex(next);
    setCycle((c) => c + 1);
  };

  if (!performers.length) return null;
  const active = performers[Math.min(index, performers.length - 1)];
  const colorFor = (teamId) => (normalizeTeamKey(teamId) === normalizeTeamKey(homeId) ? homeColor : awayColor);
  const activeColor = colorFor(active.teamId);
  // Desktop: the production-card stat set off the raw rows (up to 12, four
  // across). Compact/mobile: the backend's chips (up to 6, three across).
  const useDesktopChips = isStandard && active.desktopChips.length > 0;
  const chips = useDesktopChips ? active.desktopChips : active.chips.slice(0, 6);
  const chipColumns = useDesktopChips ? 4 : 3;

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="md"
      bg="rgba(0,0,0,0.28)"
      border="1px solid"
      borderColor="rgba(255,255,255,0.12)"
      display="flex"
      flexDirection="column"
      minH={{ base: "150px", xl: "230px" }}
    >
      <style>{`
        @keyframes wcbRotateTick { 0%, 100% { opacity: 1; } }
        @keyframes wcbRotateSweep { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .wcb-rotate-sweep { transform-origin: left center; transform: scaleX(0); }
        @media (prefers-reduced-motion: reduce) { .wcb-rotate-sweep { animation: none !important; opacity: 0; } }
      `}</style>

      {/* Portrait, bleeding from the left and fading out under the copy. Team
          logo watermark when there's no headshot. */}
      {/* Portrait fades out early and hard — the copy column starts at 38%,
          so the image is fully gone by the time the name begins, and a
          bottom scrim keeps the chip rows clean. A mask (not an overlay)
          blends the photo into the card surface instead of painting a
          gray veil over it. */}
      <Box
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        w="62%"
        zIndex={0}
        overflow="hidden"
        style={{
          WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.35) 52%, rgba(0,0,0,0) 72%)",
          maskImage: "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.35) 52%, rgba(0,0,0,0) 72%)",
        }}
      >
        <PerformerPortrait key={active.key} performer={active} />
        <Box position="absolute" inset={0} bg="linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)" pointerEvents="none" />
      </Box>
      <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={activeColor} zIndex={3} />

      {/* CSS-driven auto-advance — no timers. The invisible looping animation
          fires onAnimationIteration once per cycle; pause is declarative. */}
      {performers.length > 1 && (
        <Box
          w={0} h={0} overflow="hidden"
          key={cycle}
          style={{ animation: `wcbRotateTick ${AUTO_ROTATE_MS}ms linear infinite`, animationPlayState: isPlaying ? "running" : "paused" }}
          onAnimationIteration={() => advanceTo((index + 1) % performers.length)}
        />
      )}

      <Box position="relative" zIndex={2} flex="1" minH={0} p={3} display="flex" flexDirection="column">
        <BlockLabel color={accent}>Notable Performers</BlockLabel>
        <Box flex="1" minH={0} display="flex" flexDirection="column" justifyContent="flex-end" w="62%" ml="auto" minW={0} pt={2}>
          <Text fontSize={{ base: "md", xl: "xl" }} fontWeight="950" color="white" lineHeight={0.92} textTransform="uppercase" lineClamp={1}>{active.first}</Text>
          <Text fontSize={{ base: "md", xl: "xl" }} fontWeight="950" color="white" lineHeight={0.92} textTransform="uppercase" lineClamp={1}>{active.last}</Text>
          <Text mt={1} fontSize="9px" fontWeight="900" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.16em" lineClamp={1}>
            {teamMeta(active.teamId)?.shortName ?? teamShort(active.teamId)} <Box as="span" color={activeColor} mx={1}>|</Box> {active.position || "—"}
          </Text>
          <Text mt={1} fontSize={{ base: "10px", xl: "xs" }} fontWeight="900" color={activeColor} lineClamp={1}>
            {active.total.toFixed(1)} Production Score
          </Text>
          {chips.length > 0 && (
            <Grid mt={2} templateColumns={`repeat(${chipColumns}, minmax(0, 1fr))`} gap="0.3rem 0.5rem">
              {chips.map((chip) => (
                <Box key={chip.label} minW={0}>
                  <Text fontSize={{ base: "11px", xl: "sm" }} fontWeight="950" color="white" lineHeight={1.05} lineClamp={1}>{chip.value}</Text>
                  <Text fontSize="8px" fontWeight="900" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.1em" lineClamp={1}>{chip.label}</Text>
                </Box>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Control strip — pause + one tab per performer, active tab carries the
          time-to-next sweep, locked to the ticker by sharing duration and play state. */}
      <Flex flexShrink={0} w="full" position="relative" zIndex={3} bg="rgba(0,0,0,0.55)" borderTop="1px solid" borderColor="whiteAlpha.200" px={2} py={1.5} gap={1.5} align="center">
        <Box
          as="button"
          onClick={() => setIsPlaying((p) => !p)}
          w="1.5rem" h="1.5rem" borderRadius="sm" bg="rgba(255,255,255,0.1)"
          display="flex" alignItems="center" justifyContent="center"
          color="white" fontSize="0.55rem" cursor="pointer" flexShrink={0}
          _hover={{ bg: "rgba(255,255,255,0.18)" }}
        >
          {isPlaying ? "❚❚" : "▶"}
        </Box>
        {performers.map((p, i) => (
          <Box
            key={p.key}
            as="button"
            onClick={() => advanceTo(i)}
            position="relative" overflow="hidden"
            flex="1" minW={0} h="1.5rem" px={2} borderRadius="sm"
            bg={i === index ? colorFor(p.teamId) : "rgba(255,255,255,0.1)"}
            color="white" fontSize="0.62rem" fontWeight="800" cursor="pointer"
            whiteSpace="nowrap" textOverflow="ellipsis"
            transition="all 0.2s"
            _hover={{ bg: i === index ? colorFor(p.teamId) : "rgba(255,255,255,0.18)" }}
          >
            {i === index && performers.length > 1 && (
              <Box
                key={cycle}
                className="wcb-rotate-sweep"
                position="absolute" inset={0} zIndex={0} bg="rgba(0,0,0,0.28)" pointerEvents="none"
                style={{ animation: `wcbRotateSweep ${AUTO_ROTATE_MS}ms linear forwards`, animationPlayState: isPlaying ? "running" : "paused" }}
              />
            )}
            <Box as="span" position="relative" zIndex={1} display="block" overflow="hidden" textOverflow="ellipsis">
              {p.last || p.first}
            </Box>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};
