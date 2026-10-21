import { useRef, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Download, X } from "lucide-react";
import teamsData from "../../../data/teams.json";
import { downloadDataUrl } from "../export/exportImage";
import { teamLogo } from "../export/exportData";
import { brandOf } from "../preview/GamePreviewScout";
import { useWeekRecap } from "../../../hooks/useWeekRecap";
import { useColorScheme } from "../../../theme/colorScheme";
import { fetchJson, gameCenterPaths } from "../../../utils/gameCenterPayloads";

// ─────────────────────────────────────────────────────────────────────────────
// "HOW SATURDAY WAS WON" — the Game Center's weekly export (current week only,
// Week Recap Fetch Contract). Laid out after the "How wild was Saturday?"
// reference:
//
//   header       week line + the fixed title (right side left empty)
//   margins      away | score | home | score | net success edge | the edge as a
//                bar off a centre line — the Week Review read: right when the
//                winner won the play-by-play, left when the loser did
//   performers   the backend's performance_set: top 3 production, one per team
//   tiles        3 x 4 — the ranked items in the backend's order
//   record book  2 x 2 — the record_book items, ranked rows, this week lit
//
// 1400px wide, as tall as its content. Export → preview → Save PNG, like the others.
// ─────────────────────────────────────────────────────────────────────────────

const POSTER_W = 1400;
// The poster follows the site's Light / Night switch: a white page with light
// grey cards, or the night palette. Every colour below is a CSS variable set
// on the poster root from PALETTES, so one drawing serves both.
export const PALETTES = {
  light: { bg: "#FFFFFF", panel: "#F1F1F3", ink: "#111114", fg: "17,17,20", gold: "#B98900", up: "#15803D", down: "#DC2626", brand: "#7E22CE", shadow: 0.2 },
  night: { bg: "#0B0B0D", panel: "#141416", ink: "#FFFFFF", fg: "255,255,255", gold: "#EAB308", up: "#68D391", down: "#FC8181", brand: "#A855F7", shadow: 0.7 },
};
export const paletteOf = (scheme) => PALETTES[scheme] ?? PALETTES.night;
export const posterVars = (scheme) => {
  const c = paletteOf(scheme);
  return {
    "--rc-bg": c.bg, "--rc-panel": c.panel, "--rc-ink": c.ink, "--rc-fg": c.fg, "--rc-gold": c.gold,
    "--rc-up": c.up, "--rc-down": c.down, "--rc-brand": c.brand, "--rc-shadow": c.shadow,
  };
};
const BG = "var(--rc-bg)";
const PANEL = "var(--rc-panel)";
const INK = "var(--rc-ink)";
const fg = (a) => `rgba(var(--rc-fg), ${a})`;
const GOLD = "var(--rc-gold)";
const HILITE = "#EAB308"; // the lit row in the record book / race
const UP = "var(--rc-up)";
const DOWN = "var(--rc-down)";
const BRAND = "var(--rc-brand)";
const DIM = fg(0.55);
const LINE = fg(0.1);

const META = Object.fromEntries(teamsData.teams.map((t) => [t.exportId.replace(/25$/, ""), t]));
// teams.json short names ("Alcorn", "JSU") — not bannerShort, which reads ASU for Alcorn.
const short = (id) => META[id]?.shortName ?? String(id ?? "").toUpperCase();

// Tile edge colour by category: gold for players, red for games, blue for the rest.
const TILE_INK = { performance: GOLD, game: "#EF4444", team: "#3B82F6", crowd: "#3B82F6", event: "#3B82F6", race: "#3B82F6", record: GOLD };

const Kick = ({ children, color = DIM, size = 14, ...rest }) => (
  <Text fontSize={`${size}px`} fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.16em" lineHeight={1.15} {...rest}>{children}</Text>
);
const SectionHead = ({ children }) => <Kick size={16} color={fg(0.7)} mb="12px">{children}</Kick>;

// ── Margin board ─────────────────────────────────────────────────────────────
// Two blocks per row: the scoreboard (away, score, home, score) as one boxed
// unit, then the play-by-play read (net success edge + the bar). Rows run from
// the most negative edge to the largest.
// One table: the scoreboard columns, a divider, then the play-by-play read.
// The read (picked 2026-10-18 over a tug-of-war bar): each team's success rate
// on a 20-60% axis, logos as the ends, the line between them in the colour of
// the team that won the snaps — its length is the edge. Beside the winner's
// logo: the winner's name and their gap — green to the right when the winner
// also had the better rate, red to the left when they won it with the worse one.
// Each rate is the game file's `advanced_team[team].success_rate_down_distance`
// — the backend's edge is exactly the gap between the two.
const SCORE_COLS = "180px 64px 180px 64px 1px";

const TeamCell = ({ id, won }) => (
  <Flex align="center" gap="12px" minW={0}>
    <Image src={teamLogo(id)} alt="" w="36px" h="36px" objectFit="contain" opacity={won ? 1 : 0.5} flexShrink={0} />
    <Text fontSize="23px" fontWeight="900" color={won ? INK : fg(0.5)} textTransform="uppercase" lineClamp={1}>{short(id)}</Text>
  </Flex>
);
const ScoreCell = ({ v, won }) => (
  <Text fontSize="30px" fontWeight="950" fontStyle="italic" color={won ? INK : fg(0.5)} fontVariantNumeric="tabular-nums" textAlign="right" letterSpacing="-0.02em">{v}</Text>
);
const ColHead = ({ children, align = "left", ...rest }) => <Kick size={12} color={fg(0.45)} textAlign={align} {...rest}>{children}</Kick>;
const Divider = () => <Box alignSelf="stretch" bg={fg(0.12)} />;
const pct1 = (v) => (Number.isFinite(v) ? `${(v * 100).toFixed(1)}%` : "—");

const ratesOf = (g, gamesById) => {
  const adv = gamesById[g.game_path_id]?.advanced_team ?? {};
  const rate = (id) => {
    const v = adv[id]?.success_rate_down_distance ?? adv[id]?.success_rate;
    return Number.isFinite(v) ? v : null;
  };
  return { away: rate(g.away.team_id), home: rate(g.home.team_id) };
};

// ── read 1: dumbbell ──
const AX_LO = 0.2;
const AX_HI = 0.6;
const axPct = (v) => ((Math.min(AX_HI, Math.max(AX_LO, v)) - AX_LO) / (AX_HI - AX_LO)) * 100;
const TICKS = [0.3, 0.4, 0.5];

const DumbbellCell = ({ g, r }) => {
  if (r.away == null || r.home == null) return <Box />;
  const awayAhead = r.away >= r.home;
  const leadId = awayAhead ? g.away.team_id : g.home.team_id;
  const lo = Math.min(axPct(r.away), axPct(r.home));
  const hi = Math.max(axPct(r.away), axPct(r.home));
  return (
    <Box position="relative" h="40px" mx="18px">
      {TICKS.map((t) => <Box key={t} position="absolute" top="-10px" bottom="-10px" w="1px" bg={fg(0.08)} style={{ left: `${axPct(t)}%` }} />)}
      <Box position="absolute" top="50%" h="6px" mt="-3px" bg={brandOf(leadId)} borderRadius="3px" style={{ left: `${lo}%`, width: `${Math.max(hi - lo, 0.5)}%` }} />
      {(() => {
        const winId = g.winner_team_id;
        if (winId !== g.away.team_id && winId !== g.home.team_id) return null;
        const winRate = winId === g.away.team_id ? r.away : r.home;
        const gap = (winRate - (winId === g.away.team_id ? r.home : r.away)) * 100;
        const ahead = gap >= 0;
        return (
          <Flex position="absolute" top="50%" align="baseline" gap="6px" whiteSpace="nowrap"
            style={ahead ? { left: `calc(${hi}% + 24px)`, transform: "translateY(-50%)" } : { right: `calc(${100 - lo}% + 24px)`, transform: "translateY(-50%)" }}>
            <Text fontSize="16px" fontWeight="900" color={INK} textTransform="uppercase">{short(winId)}</Text>
            <Text fontSize="18px" fontWeight="950" color={ahead ? UP : DOWN} fontVariantNumeric="tabular-nums">{ahead ? "+" : "−"}{Math.abs(gap).toFixed(1)}</Text>
          </Flex>
        );
      })()}
      {[[g.away.team_id, r.away], [g.home.team_id, r.home]].map(([id, v]) => (
        <Image key={id} src={teamLogo(id)} alt="" position="absolute" top="50%" w="34px" h="34px" objectFit="contain"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,var(--rc-shadow)))" style={{ left: `${axPct(v)}%`, transform: "translate(-50%, -50%)" }} />
      ))}
    </Box>
  );
};

const RatesCell = ({ r }) => {
  const awayAhead = r.away != null && r.home != null && r.away >= r.home;
  return (
    <Flex justify="flex-end" gap="8px" fontVariantNumeric="tabular-nums">
      <Text fontSize="20px" fontWeight={awayAhead ? "950" : "700"} color={awayAhead ? INK : fg(0.55)}>{pct1(r.away)}</Text>
      <Text fontSize="20px" color={fg(0.3)}>·</Text>
      <Text fontSize="20px" fontWeight={!awayAhead ? "950" : "700"} color={!awayAhead ? INK : fg(0.55)}>{pct1(r.home)}</Text>
    </Flex>
  );
};

const MarginBoard = ({ rows, gamesById }) => {
  const sorted = [...rows].sort((a, b) => (a.net_success_edge ?? 0) - (b.net_success_edge ?? 0));
  const cols = `${SCORE_COLS} minmax(0,1fr) 170px`;
  return (
    <Box bg={PANEL} border="1px solid" borderColor={fg(0.12)}>
      <Grid templateColumns={cols} columnGap="16px" px="16px" h="38px" alignItems="center" bg={fg(0.04)} borderBottom="1px solid" borderColor={fg(0.12)}>
        <ColHead>Away</ColHead>
        <ColHead align="right">Pts</ColHead>
        <ColHead>Home</ColHead>
        <ColHead align="right">Pts</ColHead>
        <Divider />
        <Box position="relative" h="100%" mx="18px">
          {TICKS.map((t) => (
            <ColHead key={t} position="absolute" top="50%" style={{ left: `${axPct(t)}%`, transform: "translate(-50%, -50%)" }}>{Math.round(t * 100)}%</ColHead>
          ))}
        </Box>
        <ColHead align="right">Away · Home</ColHead>
      </Grid>
      {sorted.map((g, i) => {
        const awayWon = g.winner_team_id === g.away.team_id;
        const r = ratesOf(g, gamesById);
        return (
          <Grid key={g.game_path_id} templateColumns={cols} columnGap="16px" px="16px" h="48px" alignItems="center" borderTop={i ? "1px solid" : "none"} borderColor={LINE}>
            <TeamCell id={g.away.team_id} won={awayWon} />
            <ScoreCell v={g.away.score} won={awayWon} />
            <TeamCell id={g.home.team_id} won={!awayWon} />
            <ScoreCell v={g.home.score} won={!awayWon} />
            <Divider />
            <DumbbellCell g={g} r={r} />
            <RatesCell r={r} />
          </Grid>
        );
      })}
    </Box>
  );
};

// ── Performers ───────────────────────────────────────────────────────────────
// Left: the backend's performance_set (top 3 production, one per team), as
// bands. Right: the next 7 by production, as a ranked list.
const metaOf = (p) => [p.position, p.class_year, short(p.team_id)].filter(Boolean).join(" · ");

// More of the day than the backend's stat line carries: the takeaways and
// turnovers off the game file's box score, added when they are not zero and
// the stat line doesn't already have them. PREVIEW until stat_line carries
// them itself (Backend Notes 2026-10-18, 5c3).
const boxRow = (games, teamId, personId, cat) => {
  for (const gm of games) {
    const row = (gm?.individual_stats?.[teamId]?.[cat] ?? []).find((r) => r.player_key === personId);
    if (row) return row;
  }
  return null;
};
const statsFor = (p, games) => {
  const line = [...(p.stat_line ?? [])];
  const have = new Set(line.map((st) => String(st.label).toUpperCase()));
  const add = (label, v) => {
    if (!Number.isFinite(v) || v === 0 || have.has(label)) return;
    have.add(label);
    line.push({ label, value: v });
  };
  const d = boxRow(games, p.team_id, p.person_id, "defense");
  if (d) {
    add("INT", d.interceptions);
    add("FF", d.forced_fumbles);
    add("FR", d.fumble_recoveries);
    add("PD", d.passes_defended);
    add("DEF TD", (d.int_touchdowns ?? 0) + (d.fumble_return_touchdowns ?? 0));
  }
  const pa = boxRow(games, p.team_id, p.person_id, "passing");
  const ru = boxRow(games, p.team_id, p.person_id, "rushing");
  const re = boxRow(games, p.team_id, p.person_id, "receiving");
  if (pa) add("INT", pa.interceptions);
  add("FUM", (pa?.fumbles ?? 0) + (ru?.fumbles ?? 0) + (re?.fumbles ?? 0));
  return line;
};

// Text width in px, measured with the page's own font — the top-3 cards size
// their name and score columns to the widest of the three, so every bar starts
// right after the longest name and ends right before the score.
let measureCtx = null;
const textWidth = (text, font, spacingEm, size) => {
  if (typeof document === "undefined") return 0;
  measureCtx = measureCtx ?? document.createElement("canvas").getContext("2d");
  if (!measureCtx) return 0;
  const family = getComputedStyle(document.body).fontFamily || "sans-serif";
  measureCtx.font = `${font} ${family}`;
  const str = String(text ?? "");
  return measureCtx.measureText(str).width + spacingEm * size * str.length;
};
const nameColWidth = (players) => Math.ceil(Math.max(0, ...players.map((p) => Math.max(
  textWidth(String(p.last_name ?? "").toUpperCase(), "italic 900 30px", -0.02, 30),
  textWidth(metaOf(p).toUpperCase(), "900 11px", 0.16, 11),
))) + 6);
const scoreColWidth = (players) => Math.ceil(Math.max(0, ...players.map((p) => textWidth(Number(p.production).toFixed(1), "900 38px", 0, 38))) + 4);

const Performer = ({ p, games, max, nameW, scoreW }) => {
  const color = brandOf(p.team_id);
  const stats = statsFor(p, games);
  const withComps = { ...p, components: p.components ?? componentsOf(games, p.team_id, p.person_id) };
  return (
    <Box position="relative" overflow="hidden" bg={PANEL} borderLeft={`5px solid ${color}`} px="16px" py="7px" minW={0}>
      <Image src={teamLogo(p.team_id)} alt="" position="absolute" right="90px" top="-20px" w="130px" h="130px" objectFit="contain" opacity={0.1} />
      <Grid position="relative" templateColumns={`40px ${nameW}px minmax(0,1fr) ${scoreW}px`} columnGap="18px" alignItems="center">
        <Image src={teamLogo(p.team_id)} alt="" w="40px" h="40px" objectFit="contain" />
        <Box minW={0}>
          <Text fontSize="30px" fontWeight="950" fontStyle="italic" color={INK} textTransform="uppercase" lineHeight={0.95} letterSpacing="-0.02em" lineClamp={1}>{p.last_name}</Text>
          <Kick size={11} mt="4px">{metaOf(p)}</Kick>
        </Box>
        <CompBar p={withComps} max={max} h="20px" />
        <Text fontSize="38px" fontWeight="950" color={GOLD} lineHeight={1} fontVariantNumeric="tabular-nums" textAlign="right">{Number(p.production).toFixed(1)}</Text>
      </Grid>
      <Flex position="relative" gap="14px" mt="6px" pl="54px" wrap="nowrap" overflow="hidden">
        {stats.slice(0, 8).map((st) => (
          <Flex key={st.label} align="baseline" gap="5px">
            <Text fontSize="19px" fontWeight="900" color={INK} lineHeight={1} fontVariantNumeric="tabular-nums">{st.value}</Text>
            <Kick size={9}>{st.label}</Kick>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};

// The production bar on the next-7 list: the player's components stacked
// left to right, offense in purples, defense in greens, positive parts only.
const COMP_INK = [
  ["passing_production", "#5B21B6"],
  ["receiving_production", "#8B5CF6"],
  ["rushing_production", "#C4B5FD"],
  ["hit_production", "#166534"],
  ["hawk_production", "#22C55E"],
  ["scrum_production", "#86EFAC"],
];
// A player's production components off the game file (performance_set rows
// don't carry them yet).
const componentsOf = (games, teamId, personId) => {
  for (const gm of games) {
    const row = (gm?.production_scores?.[teamId] ?? []).find((r) => r.player_key === personId);
    if (row) return row.components ?? {};
  }
  return {};
};

// One or two stats for a next-7 row, picked by where the production came
// from: yards + TD for the offense, the matching defensive counts otherwise.
// From the backend's stat_line when the row has one.
const rowStats = (p, games) => {
  if (p.stat_line?.length) return p.stat_line.slice(0, 2);
  const comps = p.components ?? {};
  const top = Object.entries(comps).sort((x, y) => y[1] - x[1])[0]?.[0];
  const box = (cat) => boxRow(games, p.team_id, p.person_id, cat) ?? {};
  const pick = {
    passing_production: () => { const r = box("passing"); return [["YDS", r.yards], ["TD", r.touchdowns]]; },
    rushing_production: () => { const r = box("rushing"); return [["RUSH YDS", r.yards], ["TD", r.touchdowns]]; },
    receiving_production: () => { const r = box("receiving"); return [["REC YDS", r.yards], ["TD", r.touchdowns]]; },
    hit_production: () => { const r = box("defense"); return [["TKL", r.tackles], ["TFL", r.tfl], ["FF", r.forced_fumbles], ["FR", r.fumble_recoveries]]; },
    hawk_production: () => { const r = box("defense"); return [["INT", r.interceptions], ["PD", r.passes_defended], ["FR", r.fumble_recoveries], ["TKL", r.tackles]]; },
    scrum_production: () => { const r = box("defense"); return [["SACKS", r.sacks], ["FF", r.forced_fumbles], ["FR", r.fumble_recoveries], ["TFL", r.tfl], ["QBH", r.qb_hurries], ["TKL", r.tackles]]; },
  }[top];
  if (!pick) return [];
  // The first two the player actually had, in that order — never a zero
  // (a pass rusher with no sacks shows his forced fumble instead).
  const list = pick().filter(([, v]) => Number.isFinite(v));
  const had = list.filter(([, v]) => v !== 0);
  return (had.length ? had : list.slice(0, 1)).slice(0, 2).map(([label, value]) => ({ label, value }));
};

const posTotal = (p) => COMP_INK.reduce((sum, [k]) => sum + Math.max(0, p.components?.[k] ?? 0), 0);

const CompBar = ({ p, max, h = "16px" }) => (
  <Flex h={h} minW={0}>
    {max > 0 && COMP_INK.map(([k, ink]) => {
      const v = Math.max(0, p.components?.[k] ?? 0);
      return v > 0 ? <Box key={k} h="100%" bg={ink} flexShrink={0} style={{ width: `${(v / max) * 100}%` }} /> : null;
    })}
  </Flex>
);

const NextRow = ({ p, rank, first, max, games }) => (
  <Grid templateColumns="24px 26px 210px 150px minmax(0,1fr) 52px" columnGap="12px" alignItems="center" h="37px" px="14px" borderTop={first ? "none" : "1px solid"} borderColor={LINE}>
    <Text fontSize="15px" fontWeight="900" color={DIM} fontVariantNumeric="tabular-nums">{rank}</Text>
    <Image src={teamLogo(p.team_id)} alt="" w="24px" h="24px" objectFit="contain" />
    <Flex align="baseline" gap="8px" minW={0}>
      <Text fontSize="18px" fontWeight="900" color={INK} textTransform="uppercase" lineClamp={1}>{p.last_name}</Text>
      <Kick size={10} flexShrink={0}>{metaOf(p)}</Kick>
    </Flex>
    <Flex gap="12px" minW={0}>
      {rowStats(p, games).map((st) => (
        <Flex key={st.label} align="baseline" gap="4px" flexShrink={0}>
          <Text fontSize="17px" fontWeight="900" color={INK} fontVariantNumeric="tabular-nums">{st.value}</Text>
          <Kick size={9}>{st.label}</Kick>
        </Flex>
      ))}
    </Flex>
    <CompBar p={p} max={max} />
    <Text fontSize="19px" fontWeight="950" color={INK} fontVariantNumeric="tabular-nums" textAlign="right">{Number(p.production).toFixed(1)}</Text>
  </Grid>
);

// The next 7. From the backend once performance_set ships them (`data.next`,
// or `data.players` past the first 3). PREVIEW until then: the week's game
// files' production_scores, highest production_total first, the top 3 left
// out. Take this out when the backend sends them.
const lastOfBox = (name) => String(name ?? "").split(",")[0].trim();
const nextSeven = (set, games) => {
  const sent = set?.data?.next ?? (set?.data?.players ?? []).slice(3);
  if (sent.length) return sent.slice(0, 7);
  const top = new Set((set?.data?.players ?? []).slice(0, 3).map((p) => p.person_id));
  const all = [];
  games.forEach((gm) => {
    Object.entries(gm?.production_scores ?? {}).forEach(([teamId, list]) => {
      (Array.isArray(list) ? list : []).forEach((r) => {
        if (!Number.isFinite(r?.production_total) || top.has(r.player_key)) return;
        all.push({ person_id: r.player_key, last_name: lastOfBox(r.name), position: r.position, team_id: teamId, production: r.production_total, components: r.components ?? {} });
      });
    });
  });
  return all.sort((x, y) => y.production - x.production).slice(0, 7);
};

// ── Tiles (3 x 4) ────────────────────────────────────────────────────────────
// A homecoming / event tile: the schools it names, as logos.
const EventBody = ({ it }) => (
  <Flex gap="8px" mt="8px" wrap="wrap">
    {(it.data?.events ?? []).map((e) => (
      <Flex key={`${e.team_id}-${e.game_path_id}`} align="center" gap="6px" px="8px" py="4px" bg={fg(0.06)}>
        <Image src={teamLogo(e.team_id)} alt="" w="22px" h="22px" objectFit="contain" />
        <Text fontSize="14px" fontWeight="900" color={INK} textTransform="uppercase">{short(e.team_id)}</Text>
      </Flex>
    ))}
  </Flex>
);

// A crowd tile: every reported crowd, by whose stadium it was.
const CrowdBody = ({ it }) => (
  <Box mt="8px">
    {(it.data?.games ?? []).slice(0, 3).map((g) => (
      <Flex key={g.game_path_id} align="center" gap="8px" h="22px">
        <Image src={teamLogo(g.home_team_id)} alt="" w="20px" h="20px" objectFit="contain" flexShrink={0} />
        <Text flex={1} minW={0} fontSize="13px" fontWeight="700" color={fg(0.75)} lineClamp={1}>{short(g.home_team_id)} · {g.venue_name}</Text>
        <Text fontSize="15px" fontWeight="900" color={INK} fontVariantNumeric="tabular-nums">{Number(g.attendance).toLocaleString()}</Text>
      </Flex>
    ))}
  </Box>
);

const Tile = ({ it }) => {
  const ink = TILE_INK[it.category] ?? BRAND;
  const body = it.kind === "event_set" ? <EventBody it={it} /> : it.kind === "crowd" ? <CrowdBody it={it} /> : null;
  return (
    <Grid templateColumns="150px minmax(0,1fr)" columnGap="16px" alignItems="center" bg={PANEL} borderLeft={`5px solid ${ink}`} boxShadow={`inset -1px -1px 0 ${LINE}`} px="18px" py="10px" minW={0}>
      <Text fontSize={String(it.stat?.display ?? "").length > 5 ? "40px" : "56px"} fontWeight="950" fontStyle="italic" color={ink} lineHeight={0.9} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" textAlign="center" whiteSpace="nowrap">
        {it.stat?.display}
      </Text>
      <Box minW={0}>
        <Text fontSize="17px" fontWeight="900" color={INK} lineHeight={1.2}>{it.title}</Text>
        {/* The crowd tile keeps its sentence above the list; the event tile's logos stand in for it. */}
        {(!body || it.kind === "crowd") && <Text mt="4px" fontSize="15px" fontWeight="600" color={fg(0.7)} lineHeight={1.3}>{it.headline}</Text>}
        {body}
      </Box>
    </Grid>
  );
};

// ── Record book — one panel, a row per record: the number, the fact, who ──
// The rows share the panel's height evenly, so the card fills beside the race.
const RecordBook = ({ items }) => (
  <Flex direction="column" bg={PANEL} px="20px" py="16px" minW={0}>
    <Kick size={13} color={fg(0.65)}>The record book</Kick>
    {items.map((it, i) => {
      const cur = (it.data?.rows ?? []).find((r) => r.is_current);
      return (
        <Grid key={it.id} flex={1} templateColumns="92px minmax(0,1fr)" columnGap="14px" alignItems="center" py="10px" mt={i ? 0 : "6px"} borderTop={i ? "1px solid" : "none"} borderColor={LINE}>
          <Text fontSize="44px" fontWeight="950" fontStyle="italic" color={GOLD} lineHeight={0.9} fontVariantNumeric="tabular-nums" textAlign="center">{it.stat?.display}</Text>
          <Box minW={0}>
            <Text fontSize="16px" fontWeight="900" color={INK} lineHeight={1.2} lineClamp={2}>{it.data?.fact ?? it.stat?.label}</Text>
            {cur?.who && <Kick size={11} mt="4px">{cur.who}</Kick>}
          </Box>
        </Grid>
      );
    })}
  </Flex>
);

// The title race: the division table after the week, with the move and the
// chance at first, both straight off the item.
// The line beside the big number: the leader's chance to win the division,
// and how they got there this week ("PVAMU's probability to win the West after
// defeating Alcorn 41-38"). PREVIEW: built from the race rows and the week's
// games until the backend writes it as stat.label (Backend Notes 2026-10-18, 5e).
const raceLine = (it, games) => {
  const leadId = it.data?.rows?.[0]?.team_id ?? it.team_ids?.[0];
  if (!leadId) return it.stat?.label;
  const division = String(it.data?.group_label ?? "").replace(/^(SWAC|MEAC)\s+/i, "");
  const base = `${short(leadId)}'s probability to win the ${division || "division"}`;
  const g = games.find((x) => x.away?.team_id === leadId || x.home?.team_id === leadId);
  if (!g) return base;
  const isAway = g.away.team_id === leadId;
  const us = isAway ? g.away : g.home;
  const them = isAway ? g.home : g.away;
  const won = g.winner_team_id === leadId;
  return `${base} after ${won ? "defeating" : "losing to"} ${short(them.team_id)} ${us.score}-${them.score}`;
};

const RacePanel = ({ it, games = [] }) => (
  <Box bg={PANEL} px="20px" py="16px" minW={0}>
    <Kick size={13} color={fg(0.65)}>{it.data?.group_label ?? it.title} race</Kick>
    <Flex align="center" gap="14px" mt="8px">
      <Text fontSize="44px" fontWeight="950" fontStyle="italic" color={INK} lineHeight={0.9} fontVariantNumeric="tabular-nums">{it.stat?.display}</Text>
      <Text fontSize="16px" fontWeight="800" color={fg(0.85)} lineHeight={1.25} lineClamp={2}>{raceLine(it, games)}</Text>
    </Flex>
    <Box mt="10px">
      {(it.data?.rows ?? []).slice(0, 5).map((r) => {
        const moved = r.prev_rank != null ? r.prev_rank - r.rank : 0;
        const lead = r.rank === 1;
        return (
          <Flex key={r.team_id} align="center" gap="10px" px="10px" h="29px" bg={lead ? HILITE : "transparent"} borderRadius="4px">
            <Text w="18px" fontSize="15px" fontWeight="900" color={lead ? "#0B0B0D" : DIM}>{r.rank}</Text>
            <Image src={teamLogo(r.team_id)} alt="" w="20px" h="20px" objectFit="contain" />
            <Text flex={1} minW={0} fontSize="15px" fontWeight="900" color={lead ? "#0B0B0D" : INK} textTransform="uppercase" lineClamp={1}>{short(r.team_id)}</Text>
            <Text w="34px" fontSize="13px" fontWeight="900" color={lead ? "#0B0B0D" : moved > 0 ? UP : moved < 0 ? DOWN : DIM} textAlign="right">{moved > 0 ? `▲${moved}` : moved < 0 ? `▼${-moved}` : "–"}</Text>
            <Text w="48px" fontSize="14px" fontWeight="800" color={lead ? "#0B0B0D" : fg(0.7)} textAlign="right" fontVariantNumeric="tabular-nums">{r.conference_record}</Text>
            <Text w="54px" fontSize="15px" fontWeight="950" color={lead ? "#0B0B0D" : INK} textAlign="right" fontVariantNumeric="tabular-nums">{r.first_place_chance != null ? `${Math.round(r.first_place_chance * 100)}%` : "—"}</Text>
          </Flex>
        );
      })}
    </Box>
  </Box>
);

// ── The poster ───────────────────────────────────────────────────────────────
export const WeekRecapPoster = ({ recap, games = [], innerRef, scheme = "night" }) => {
  const rows = recap.games ?? [];
  const items = recap.items ?? [];
  const set = items.find((it) => it.kind === "performance_set");
  const performers = (set?.data?.players ?? []).slice(0, 3);
  const next = nextSeven(set, games);
  const topMax = Math.max(0, ...performers.map((p) => posTotal({ components: p.components ?? componentsOf(games, p.team_id, p.person_id) })));
  const nextMax = Math.max(0, ...next.map(posTotal));
  const nameW = nameColWidth(performers);
  const scoreW = scoreColWidth(performers);
  const gamesById = Object.fromEntries(games.map((gm) => [gm.game_path_id, gm]));
  // The bottom row: the record book beside the title race.
  const BOTTOM = new Set(["performance_set", "record_book", "race"]);
  const tiles = items.filter((it) => !BOTTOM.has(it.kind)).slice(0, 12);
  const records = items.filter((it) => it.kind === "record_book").slice(0, 3);
  const race = items.find((it) => it.kind === "race") ?? null;
  return (
    <Flex ref={innerRef} direction="column" w={`${POSTER_W}px`} bg={BG} color={INK} style={posterVars(scheme)} px="56px" pt="36px" pb="28px" gap="18px" overflow="hidden">
      <Flex align="flex-end" justify="space-between" gap="24px">
        <Text fontSize="78px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.88} letterSpacing="-0.04em" whiteSpace="nowrap">
          How Saturday <Box as="span" color={GOLD}>Was Won</Box>
        </Text>
        <Kick size={18} color={GOLD} textAlign="right" pb="6px">{recap.week_label} · {recap.date_label} · SWAC + MEAC</Kick>
      </Flex>

      <MarginBoard rows={rows} gamesById={gamesById} />

      {performers.length > 0 && (
        <Box>
          <SectionHead>Top performers</SectionHead>
          <Grid templateColumns="minmax(0,0.8fr) minmax(0,1.2fr)" gap="14px" alignItems="start">
            <Flex direction="column" gap="10px">
              {performers.map((p) => <Performer key={p.person_id ?? p.last_name} p={p} games={games} max={topMax} nameW={nameW} scoreW={scoreW} />)}
            </Flex>
            {next.length > 0 && (
              <Box bg={PANEL} py="4px">
                {next.map((p, i) => <NextRow key={p.person_id ?? `${p.last_name}-${i}`} p={p} rank={i + 4} first={i === 0} max={nextMax} games={games} />)}
              </Box>
            )}
          </Grid>
        </Box>
      )}

      {tiles.length > 0 && (
        <Grid templateColumns="repeat(3, minmax(0,1fr))" gap={0} autoRows="minmax(96px, auto)">
          {tiles.map((it) => <Tile key={it.id} it={it} />)}
        </Grid>
      )}

      {/* 1 x 2: the record book beside the title race. */}
      {(records.length > 0 || race) && (
        <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" gap="14px" alignItems="stretch">
          {records.length > 0 ? <RecordBook items={records} /> : <Box />}
          {race ? <RacePanel it={race} games={rows} /> : <Box />}
        </Grid>
      )}
    </Flex>
  );
};

// The open preview: loads the week's game files (for the performers), shows
// the poster shrunk to the window, and saves the PNG off a hidden full copy.
const PreviewModal = ({ recap, onClose }) => {
  const [scheme] = useColorScheme();
  const [busy, setBusy] = useState(false);
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
          <Flex as="button" type="button" onClick={save} align="center" gap={2} px={4} h="2.4rem" borderRadius="md" bg="brand.500" opacity={busy || loading ? 0.6 : 1}>
            <Download size={15} /><Text fontSize="12px" fontWeight="900" textTransform="uppercase" letterSpacing="0.12em">{busy ? "Saving" : loading ? "Loading" : "Save PNG"}</Text>
          </Flex>
          <Flex as="button" type="button" onClick={onClose} align="center" gap={2} px={4} h="2.4rem" borderRadius="md" bg="whiteAlpha.200">
            <X size={15} /><Text fontSize="12px" fontWeight="900" textTransform="uppercase" letterSpacing="0.12em">Close</Text>
          </Flex>
        </Flex>
        <Box boxShadow="0 1rem 3rem rgba(0,0,0,0.6)" style={{ zoom: Math.min(1, (window.innerWidth - 32) / POSTER_W) }}>
          <WeekRecapPoster recap={recap} games={games} scheme={scheme} />
        </Box>
        <Box position="fixed" left="-20000px" top={0} aria-hidden="true">
          <WeekRecapPoster recap={recap} games={games} innerRef={posterRef} scheme={scheme} />
        </Box>
      </Flex>
    </Box>
  );
};

export const WeekRecapExport = ({ placement = {} }) => {
  const { recap } = useWeekRecap();
  const [open, setOpen] = useState(false);
  if (!recap) return null;
  return (
    <>
      <Flex as="button" type="button" onClick={() => setOpen(true)} position="absolute" top="0.75rem" right="0.75rem" zIndex={5}
        align="center" gap={1.5} px={3} py={1.5} borderRadius="md" bg="whiteAlpha.200" _hover={{ bg: "whiteAlpha.300" }} {...placement}>
        <Download size={13} />
        <Text fontSize="10px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.16em">Export</Text>
      </Flex>
      {open && <PreviewModal recap={recap} onClose={() => setOpen(false)} />}
    </>
  );
};

export default WeekRecapExport;
