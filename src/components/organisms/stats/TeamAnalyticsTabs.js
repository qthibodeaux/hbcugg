import { createContext, useContext, useMemo, useRef, useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Link, useSearchParams } from "react-router-dom";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar as RadarShape,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { useTeamAnalyticsGames } from "../../../hooks/useTeamAnalyticsData";
import { ExportCardButton } from "./ExportCardButton";
import { TeamBarChart } from "./TeamBarChart";
import { DownDistanceCharts } from "../downDistance/DownDistanceCharts";
import { AlertTriangle } from "lucide-react";
import { ADV_AXIS_GROUPS, SCATTER_AXES, SCATTER_PRESETS, SCATTER_SECTIONS, scatterSeries, presetFor, fmtAxis } from "../../../pages/analytics/scatterPresets";
import {
  TAPE_GROUPS,
  HEAD_TO_HEAD_ROWS,
  MATCHUP_FIELDS,
  matchupTable,
  fmtMatchup,
} from "../../../pages/analytics/matchupMetrics";
import {
  LAB_PRESETS,
  labLevers,
  presetWeights,
  presetFor as labPresetFor,
  rankLeague,
  backtest,
  backtestSeasons,
  contributions,
  standingsRanks,
  encodeModel,
  decodeModel,
} from "../../../pages/analytics/ratingLab";
import {
  trendMetricGroups,
  trendMetric,
  trendField,
  buildTrendRows,
  fmtTrend,
} from "../../../pages/analytics/trendSeries";
import { GLOSSARY, GLOSSARY_FAMILIES } from "../../../pages/analytics/metricGlossary";
import { readableTeamColor } from "../../../utils/teamColor";
import { SectionEyebrow } from "../../atoms/SectionEyebrow";
import { MatchupPicker, TeamTile, LEAGUE_ID } from "./MatchupPicker";

// ─────────────────────────────────────────────────────────────────────────────
// TEAM ANALYTICS — TAB VIEWS
//
// THE STRUCTURAL IDEA: a player is one entity; a team is a bundle of units.
// Offense and defense are effectively two teams in the same colors. So the
// content hierarchy is unit-first (Run Game / Pass Game / Run Defense / Pass
// Defense, plus four units we don't have data for yet), and the TABS are
// analytical lenses over that hierarchy — not the football concepts themselves.
//
// That split is why this doesn't copy GameOnPaper: their nav is tool-shaped
// (Leaderboards / Charts / Seasons / Teams / Matchup) and flattens a team to
// two numbers. Ours keeps the unit structure as the content and uses lenses to
// ask different questions of it.
//
// Every number comes from team_analytics_hub.json (real, 108 team-seasons).
// Units with no data render an explicit gap card rather than a fabricated one.
// ─────────────────────────────────────────────────────────────────────────────

const PANEL_BG = "bg.secondary";
const POSITIVE = "#48BB78";
const NEGATIVE = "#F6AD55";

const fmt = (value, unit) =>
  !Number.isFinite(value) ? "—" : unit === "pct" ? `${(value * 100).toFixed(1)}%` : value.toFixed(2);

export const Kicker = ({ children, color = "text.muted", ...rest }) => (
  <Text fontSize="9px" fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.13em" lineClamp={1} {...rest}>
    {children}
  </Text>
);

// Mobile: sections butt together — square, no side borders, a hairline under.
export const SectionFlush = createContext(false);

export const Section = ({ title, right, children, ...rest }) => {
  const flush = useContext(SectionFlush);
  const shape = flush
    ? { borderRadius: 0, border: "none", borderBottom: "1px solid", borderColor: "whiteAlpha.100", p: "0.75rem" }
    : { border: "1px solid", borderColor: "whiteAlpha.100", borderRadius: "lg", p: 4 };
  return (
    <Box bg={PANEL_BG} {...shape} {...rest}>
      <SectionEyebrow rightContent={right} dotColor="var(--chakra-colors-brand-500)">{title}</SectionEyebrow>
      {children}
    </Box>
  );
};

const TeamChip = ({ team, active, onClick }) => (
  <Flex
    as="button" onClick={onClick} align="center" gap={1.5} px={2.5} py={1.5} borderRadius="md"
    bg={active ? "brand.500" : "whiteAlpha.50"} border="1px solid"
    borderColor={active ? "brand.500" : "whiteAlpha.100"}
    _hover={{ bg: active ? "brand.500" : "whiteAlpha.100" }} style={{ transition: "all 0.15s" }} flexShrink={0}
  >
    {team.logo && <Image src={team.logo} alt="" w="14px" h="14px" objectFit="contain" />}
    <Text fontSize="10px" fontWeight="900" color={active ? "white" : "whiteAlpha.700"}>{team.short}</Text>
  </Flex>
);

export const TeamPicker = ({ teams, value, onChange, label = "Team" }) => (
  <Box>
    <Kicker mb={2}>{label}</Kicker>
    <Flex gap={1.5} wrap="wrap">
      {Object.values(teams).map((t) => (
        <TeamChip key={t.identity.id} team={t.identity} active={value === t.identity.id} onClick={() => onChange(t.identity.id)} />
      ))}
    </Flex>
  </Box>
);

// ═══ RADAR (shared by Profile and Matchup) ═══════════════════════════════════
// Recharts, so the axis labels stay at a real type size instead of scaling
// with the viewBox. Values are percentiles, so the ring is always 0-100.
export const Radar = ({ axes, series, size = 210, compact = false }) => {
  const data = axes.map((a, i) => {
    const row = { axis: a.label };
    series.forEach((sr, si) => {
      row[`s${si}`] = Number.isFinite(sr.values[i]) ? sr.values[i] : 0;
    });
    return row;
  });
  return (
    <Box w="100%">
      {series.length > 1 && (
        <Flex justify="center" gap={4} mb={1}>
          {series.map((sr) => (
            <Flex key={sr.label} align="center" gap={1.5}>
              <Box w="10px" h="3px" borderRadius="full" bg={sr.color} />
              <Kicker color="whiteAlpha.600">{sr.label}</Kicker>
            </Flex>
          ))}
        </Flex>
      )}
      <Box w="100%" h={`${size}px`}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius={compact ? "62%" : "68%"} margin={compact ? { top: 4, right: 4, bottom: 4, left: 4 } : { top: 8, right: 8, bottom: 8, left: 8 }}>
            <PolarGrid stroke="rgba(255,255,255,0.12)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: compact ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.55)", fontSize: compact ? "0.62rem" : 9, fontWeight: 800 }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            {series.map((sr, si) => (
              <RadarShape
                key={sr.label}
                name={sr.label}
                dataKey={`s${si}`}
                stroke={sr.color}
                fill={sr.color}
                fillOpacity={0.22}
                strokeWidth={2}
                isAnimationActive={false}
              />
            ))}
            <Tooltip
              cursor={false}
              formatter={(v) => `${Math.round(v)}th`}
              contentStyle={{
                background: "#141416",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 800,
              }}
              labelStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}
              itemStyle={{ color: "#fff" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

// ═══ TAB 1 — PROFILE ═════════════════════════════════════════════════════════
// ═══ TAB 2 — LEADER BOARD ════════════════════════════════════════════════════
// The league in one table. Three dropdowns pick what you are looking at —
// which unit, which teams, and which column leads — and every cell is shaded
// by percentile rather than by raw value, so a row reads as a shape before
// you read a single number.
//
// Net is computed here rather than stored: offense minus what the defense
// gives up, signed so that positive is always the good direction.

const BOARD_SIDES = [
  { id: "o", label: "Offensive" },
  { id: "d", label: "Defensive" },
  { id: "net", label: "Net statistics" },
];

const BOARD_SCOPES = [
  { id: "all", label: "All 18" },
  { id: "MEAC", label: "MEAC", test: (t) => t.conference === "MEAC" },
  { id: "SWAC", label: "SWAC", test: (t) => t.conference === "SWAC" },
  { id: "East", label: "East division", test: (t) => t.division === "East" },
  { id: "West", label: "West division", test: (t) => t.division === "West" },
];

const boardNet = (row, base, offGood) => {
  const o = row?.metrics?.[`o_${base}`];
  const d = row?.metrics?.[`d_${base}`];
  if (!Number.isFinite(o) || !Number.isFinite(d)) return undefined;
  return offGood ? o - d : d - o;
};

// Green where a team is good at this, purple where it is not. Distance from
// the median sets the weight, so the middle of the league stays quiet.
const boardFill = (pct) => {
  if (!Number.isFinite(pct)) return "transparent";
  const strength = Math.min(1, Math.abs(pct - 50) / 50);
  const alpha = (0.08 + strength * 0.44).toFixed(2);
  return pct >= 50 ? `rgba(34,197,94,${alpha})` : `rgba(168,85,247,${alpha})`;
};

export const BoardTab = ({ hub, season }) => {
  const { isMobile: m } = useLayoutDensity();
  const [side, setSide] = useState("o");
  const [scope, setScope] = useState("all");
  const [sortField, setSortField] = useState("rating");
  const [desc, setDesc] = useState(true);

  const bases = useMemo(
    () => [...new Set((hub.units ?? []).filter((u) => u.available).flatMap((u) => u.metrics))],
    [hub.units],
  );

  // The columns are the same list read through whichever side is chosen.
  const columns = useMemo(() => {
    const cols = [{ key: "rating", label: "Team Rating", group: "Overall", unit: "num", signed: true }];
    bases.forEach((base) => {
      const def = hub.metrics?.[base] ?? {};
      cols.push({
        key: side === "net" ? `net_${base}` : `${side}_${base}`,
        base,
        label: def.short ?? base,
        full: def.label ?? base,
        group: (def.family ?? "other").replace(/^./, (c) => c.toUpperCase()),
        unit: def.unit ?? "num",
        offGood: def.offGood !== false,
        signed: side === "net",
      });
    });
    return cols;
  }, [bases, hub.metrics, side]);

  const scopeDef = BOARD_SCOPES.find((x) => x.id === scope) ?? BOARD_SCOPES[0];

  // Values first, then percentiles — in net mode the percentile has to be
  // earned by ranking the nets, since nothing on file carries them.
  const rows = useMemo(() => {
    const base = Object.values(hub.teams ?? {})
      .filter((t) => t.seasons?.[season])
      .filter((t) => !scopeDef.test || scopeDef.test(t.identity))
      .map((t) => {
        const row = t.seasons[season];
        const values = { rating: row.rating };
        const pcts = { rating: undefined };
        columns.slice(1).forEach((c) => {
          values[c.key] = side === "net" ? boardNet(row, c.base, c.offGood) : row.metrics?.[c.key];
          pcts[c.key] = side === "net" ? undefined : row.percentiles?.[c.key];
        });
        return { id: t.identity.id, identity: t.identity, record: row.record, values, pcts };
      });

    const n = base.length;
    const pctOf = (rank) => (n > 1 ? Math.round(((n - rank) / (n - 1)) * 100) : 50);
    // Rating always needs one; net columns need all of them.
    columns.forEach((c) => {
      if (side !== "net" && c.key !== "rating") return;
      const sorted = base
        .map((r) => ({ id: r.id, v: r.values[c.key] }))
        .filter((x) => Number.isFinite(x.v))
        .sort((a, b) => b.v - a.v);
      sorted.forEach((x, i) => {
        const hit = base.find((r) => r.id === x.id);
        if (hit) hit.pcts[c.key] = pctOf(i + 1);
      });
    });

    return base.sort((a, b) => {
      const av = a.values[sortField];
      const bv = b.values[sortField];
      if (!Number.isFinite(av)) return 1;
      if (!Number.isFinite(bv)) return -1;
      return desc ? bv - av : av - bv;
    });
  }, [hub.teams, season, columns, side, scopeDef, sortField, desc]);

  const sortBy = (key) => {
    if (key === sortField) setDesc((v) => !v);
    else { setSortField(key); setDesc(true); }
  };

  const groups = [...new Set(columns.map((c) => c.group))];
  const active = columns.find((c) => c.key === sortField) ?? columns[0];
  // Mobile: the sorted column sits right after the team, so the number the
  // board is ranked by is on screen without scrolling.
  const shown = m ? [active, ...columns.filter((c) => c.key !== active.key)] : columns;
  // Mobile column widths: rank and team pinned narrow, metric columns fixed.
  const RK_W = m ? "1.9rem" : "2.6rem";
  const TEAM_W = m ? "4.4rem" : "9rem";
  const COL_W = m ? "4.1rem" : undefined;

  const Picker = ({ label, value, onChange, children }) => (
    <Box flex="1" minW={m ? 0 : "9rem"}>
      <Kicker mb={1}>{label}</Kicker>
      <Box as="select" value={value} onChange={(e) => onChange(e.target.value)}
        bg="whiteAlpha.100" color="white" fontSize={m ? "0.8rem" : "11px"} fontWeight="700" borderRadius={m ? 0 : "md"} px={2} py={m ? "0.5rem" : 1.5}
        border="1px solid" borderColor="whiteAlpha.200" w="100%">
        {children}
      </Box>
    </Box>
  );

  return (
    <SectionFlush.Provider value={m}>
    <Flex direction="column" gap={m ? 0 : 4}>
      <Section title={m ? `${BOARD_SIDES.find((x) => x.id === side)?.label} rankings` : `${season} ${BOARD_SIDES.find((x) => x.id === side)?.label} team rankings`} right={m ? null : <Kicker color="whiteAlpha.500">{rows.length} teams</Kicker>}>
        <Flex gap={m ? "0.4rem" : 3} wrap={m ? "nowrap" : "wrap"} align="flex-end">
          <Picker label="Unit" value={side} onChange={(v) => { setSide(v); setSortField("rating"); setDesc(true); }}>
            {BOARD_SIDES.map((x) => <option key={x.id} value={x.id} style={{ background: "#141416" }}>{x.label}</option>)}
          </Picker>
          <Picker label="Teams" value={scope} onChange={setScope}>
            {BOARD_SCOPES.map((x) => <option key={x.id} value={x.id} style={{ background: "#141416" }}>{x.label}</option>)}
          </Picker>
          <Picker label="Metric" value={sortField} onChange={(v) => { setSortField(v); setDesc(true); }}>
            {groups.map((g) => (
              <optgroup key={g} label={g} style={{ background: "#141416" }}>
                {columns.filter((c) => c.group === g).map((c) => (
                  <option key={c.key} value={c.key} style={{ background: "#141416" }}>{c.full ?? c.label}</option>
                ))}
              </optgroup>
            ))}
          </Picker>
        </Flex>
      </Section>

      <Section title={active.full ?? active.label}>
        <Box overflowX="auto">
          <Box as="table" minW={m ? undefined : "60rem"} w="100%" style={{ borderCollapse: "separate", borderSpacing: 0, tableLayout: m ? "fixed" : undefined }}>
            <Box as="thead">
              <Box as="tr">
                <Box as="th" position="sticky" left={0} zIndex={2} bg={PANEL_BG} textAlign="left" px={m ? "0.4rem" : 2} py={2} w={RK_W} minW={RK_W}>
                  <Kicker color="whiteAlpha.500">Rk</Kicker>
                </Box>
                <Box as="th" position="sticky" left={RK_W} zIndex={2} bg={PANEL_BG} textAlign="left" px={m ? "0.3rem" : 2} py={2} w={m ? TEAM_W : undefined} minW={TEAM_W} borderRight={m ? "1px solid" : undefined} borderColor="whiteAlpha.100">
                  <Kicker color="whiteAlpha.500">Team</Kicker>
                </Box>
                {shown.map((c) => (
                  <Box key={c.key} as="th" px={m ? "0.4rem" : 2} py={2} textAlign="right" whiteSpace="nowrap" w={COL_W} minW={COL_W} overflow="hidden" textOverflow="ellipsis"
                    cursor="pointer" onClick={() => sortBy(c.key)} title={c.full}>
                    <Kicker color={sortField === c.key ? "brand.400" : "whiteAlpha.500"}>
                      {c.label}{sortField === c.key ? (desc ? " \u2193" : " \u2191") : ""}
                    </Kicker>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box as="tbody">
              {rows.map((r, i) => (
                <Box as="tr" key={r.id} _hover={{ "& td": { filter: "brightness(1.25)" } }}>
                  <Box as="td" position="sticky" left={0} zIndex={1} bg={PANEL_BG} px={m ? "0.4rem" : 2} py={m ? "0.55rem" : 1.5} w={RK_W} minW={RK_W} borderBottom="1px solid" borderColor="whiteAlpha.50">
                    <Text fontSize={m ? "0.75rem" : "10px"} fontWeight="900" color="whiteAlpha.500" fontVariantNumeric="tabular-nums">{i + 1}</Text>
                  </Box>
                  <Box as="td" position="sticky" left={RK_W} zIndex={1} bg={PANEL_BG} px={m ? "0.3rem" : 2} py={m ? "0.55rem" : 1.5} w={m ? TEAM_W : undefined} minW={TEAM_W} borderBottom="1px solid" borderColor="whiteAlpha.50" borderRight={m ? "1px solid" : undefined} borderRightColor="whiteAlpha.100">
                    <Flex as={Link} to={`/teams/${r.id}`} align="center" gap={m ? "0.35rem" : 2} minW={0} color="text.primary">
                      {r.identity.logo && <Image src={r.identity.logo} alt="" w={m ? "1.1rem" : "16px"} h={m ? "1.1rem" : "16px"} objectFit="contain" flexShrink={0} />}
                      <Text fontSize={m ? "0.8rem" : "11px"} fontWeight="900" color="white" lineClamp={1}>{r.identity.short}</Text>
                    </Flex>
                  </Box>
                  {shown.map((c) => {
                    const v = r.values[c.key];
                    const pct = r.pcts[c.key];
                    return (
                      <Box key={c.key} as="td" px={m ? "0.4rem" : 2} py={m ? "0.55rem" : 1.5} textAlign="right" bg={boardFill(pct)} w={COL_W}
                        borderBottom="1px solid" borderColor="whiteAlpha.50">
                        <Text fontSize={m ? (sortField === c.key ? "0.85rem" : "0.78rem") : "11px"} fontWeight={sortField === c.key ? "900" : "700"} color="white" fontVariantNumeric="tabular-nums">
                          {c.signed && Number.isFinite(v) && v > 0 ? "+" : ""}{fmt(v, c.unit)}
                        </Text>
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Section>
    </Flex>
    </SectionFlush.Provider>
  );
};

// ═══ TAB 3 — MAP ═════════════════════════════════════════════════════════════
// Scope filters. MEAC ships no divisions, so East / West are SWAC's.
const SCATTER_SCOPES = [
  { id: "all", label: "All 18", match: () => true },
  { id: "MEAC", label: "MEAC", match: (i) => i.conference === "MEAC" },
  { id: "SWAC", label: "SWAC", match: (i) => i.conference === "SWAC" },
  { id: "East", label: "East", match: (i) => i.division === "East" },
  { id: "West", label: "West", match: (i) => i.division === "West" },
];

// Five ticks across the axis, at the plotted range — the chart says what its
// own min and max are instead of leaving the reader to guess the scale.
// Round-number axis: a 1 / 2 / 2.5 / 5 step, bounds snapped outward to it, so
// ticks read 0.10, 0.20 … rather than 12.9%, 28.2%.
const niceAxis = (vals, target = 5) => {
  if (!vals.length) return { lo: 0, hi: 1, ticks: [0, 0.5, 1] };
  let lo = Math.min(...vals);
  let hi = Math.max(...vals);
  const pad = (hi - lo) * 0.08 || Math.abs(hi) * 0.1 || 0.01;
  lo -= pad;
  hi += pad;
  const raw = (hi - lo) / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((m) => m >= raw) ?? 10 * mag;
  const a = Math.floor(lo / step) * step;
  const b = Math.ceil(hi / step) * step;
  const ticks = [];
  for (let v = a; v <= b + step / 1e6; v += step) ticks.push(Number(v.toFixed(10)));
  return { lo: a, hi: b, ticks };
};

// GOP's cell shading: green when the value is good for that axis, purple when
// it isn't, deeper the further it sits from the middle of the shown field.
const cellBg = (value, vals, low) => {
  if (!Number.isFinite(value) || vals.length < 2) return "transparent";
  const lo = Math.min(...vals), hi = Math.max(...vals);
  if (hi === lo) return "transparent";
  const norm = (value - lo) / (hi - lo);
  const good = low ? 1 - norm : norm;
  const strength = Math.min(1, Math.abs(good - 0.5) * 2);
  const alpha = (0.1 + strength * 0.45).toFixed(2);
  return good >= 0.5 ? `rgba(34,197,94,${alpha})` : `rgba(168,85,247,${alpha})`;
};

const ScopeButton = ({ active, children, onClick }) => (
  <Box as="button" onClick={onClick} px={3} py={2} borderRadius="md"
    fontSize="10px" fontWeight="900" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap"
    bg={active ? "brand.500" : "whiteAlpha.100"} color={active ? "white" : "whiteAlpha.700"}
    _hover={{ bg: active ? "brand.500" : "whiteAlpha.200" }}>
    {children}
  </Box>
);

const ScatterTable = ({ points, x, y }) => {
  const [sortKey, setSortKey] = useState("x");
  const [sortDir, setSortDir] = useState("desc");
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const rows = [...points].sort((a, b) => (sortDir === "asc" ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]));
  const onSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };
  const Head = ({ k, children }) => (
    <Box as="button" onClick={() => onSort(k)} textAlign="right" w="100%">
      <Kicker color={sortKey === k ? "brand.400" : "text.muted"}>
        {children}{sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
      </Kicker>
    </Box>
  );
  return (
    <Box overflowX="auto">
      <Box minW="30rem">
        <Flex px={2} py={2} bg="whiteAlpha.50" borderRadius="md" gap={2} align="center">
          <Box w="26px" flexShrink={0}><Kicker>Rk</Kicker></Box>
          <Box flex="1" minW="9rem"><Kicker>Team</Kicker></Box>
          <Box w="9rem" flexShrink={0}><Head k="x">{x.label}</Head></Box>
          <Box w="9rem" flexShrink={0}><Head k="y">{y.label}</Head></Box>
        </Flex>
        {rows.map((p, i) => (
          <Flex key={p.id} px={2} align="center" gap={2} borderBottom="1px solid" borderColor="whiteAlpha.50">
            <Box w="26px" flexShrink={0} py={2}>
              <Text fontSize="11px" fontWeight="900" color="whiteAlpha.500" fontVariantNumeric="tabular-nums">{i + 1}</Text>
            </Box>
            <Flex flex="1" minW="9rem" align="center" gap={2} py={2} as={Link} to={`/teams/${p.id}`} color="text.primary" _hover={{ color: "brand.400" }}>
              {p.logo && <Image src={p.logo} alt="" w="18px" h="18px" objectFit="contain" flexShrink={0} />}
              <Text fontSize="11px" fontWeight="800" color="inherit" lineClamp={1}>{p.name}</Text>
            </Flex>
            <Flex w="9rem" flexShrink={0} justify="flex-end" px={2} py={2} bg={cellBg(p.x, xs, x.low)}>
              <Text fontSize="12px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{fmtAxis(p.x, x.unit)}</Text>
            </Flex>
            <Flex w="9rem" flexShrink={0} justify="flex-end" px={2} py={2} bg={cellBg(p.y, ys, y.low)}>
              <Text fontSize="12px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{fmtAxis(p.y, y.unit)}</Text>
            </Flex>
          </Flex>
        ))}
      </Box>
    </Box>
  );
};

export const MapTab = ({ hub, season }) => {
  // The chart is nothing but a pair of axis keys. A preset sets both; the two
  // selectors stay live either way, so changing one axis of a preset is one
  // click and simply leaves no preset lit.
  // Every preset is a button: the four standard charts first, then the
  // originals. One without data this season just plots nothing.
  // Standard charts by section (Team, Rushing), then the originals as "More".
  const groups = [
    ...SCATTER_SECTIONS.map((sec) => ({ id: sec.id, label: sec.label, presets: SCATTER_PRESETS.filter((c) => c.standard && c.section === sec.id) })),
    { id: "more", label: "More", presets: SCATTER_PRESETS.filter((c) => !c.standard) },
  ].filter((g) => g.presets.length);
  const [xKey, setXKey] = useState(SCATTER_PRESETS[0].x);
  const [yKey, setYKey] = useState(SCATTER_PRESETS[0].y);
  const [presetId, setPresetId] = useState(SCATTER_PRESETS[0].id);
  const [scope, setScope] = useState("all");
  const activePreset = presetFor(xKey, yKey, presetId);
  const series = useMemo(() => scatterSeries(hub, season, xKey, yKey, presetId), [hub, season, xKey, yKey, presetId]);

  const scopeDef = SCATTER_SCOPES.find((sc) => sc.id === scope) ?? SCATTER_SCOPES[0];
  const points = series.points.filter((p) => scopeDef.match(hub.teams[p.id]?.identity ?? {}));
  const { x, y, avgX, avgY } = series;

  const xAxis = niceAxis(points.map((pt) => pt.x));
  const yAxis = niceAxis(points.map((pt) => pt.y));
  // A preset can flip an axis so "better" always sits right and up.
  const flipX = Boolean(activePreset?.flip?.x);
  const flipY = Boolean(activePreset?.flip?.y);
  const xPct = (v) => {
    const t = ((v - xAxis.lo) / (xAxis.hi - xAxis.lo)) * 100;
    return flipX ? 100 - t : t;
  };
  const yPct = (v) => {
    const t = 100 - ((v - yAxis.lo) / (yAxis.hi - yAxis.lo)) * 100;
    return flipY ? 100 - t : t;
  };
  const quads = activePreset?.quadrants ?? null;
  const cx = Number.isFinite(avgX) ? xPct(avgX) : 50;
  const cy = Number.isFinite(avgY) ? yPct(avgY) : 50;
  const chartRef = useRef(null);
  const { isMobile: m } = useLayoutDensity();

  // Bar mode: one measure, every team in scope, ranked. Same axis catalog as
  // the scatter; Highest / Lowest sets the order.
  const [mode, setMode] = useState("scatter");
  const [barKey, setBarKey] = useState("adv:d:explosive_rate");
  const [barDesc, setBarDesc] = useState(true);
  const barSeries = useMemo(() => scatterSeries(hub, season, barKey, barKey), [hub, season, barKey]);
  const barAxis = barSeries.x;
  const barPoints = barSeries.points
    .filter((p) => scopeDef.match(hub.teams[p.id]?.identity ?? {}))
    .map((p) => ({ ...p, value: p.x, identity: hub.teams[p.id]?.identity }))
    .sort((a, b) => (barDesc ? b.value - a.value : a.value - b.value));
  const barTitle = `${barDesc ? "Highest" : "Lowest"} ${barAxis.label}`;

  const customAxes = () => {
    setXKey(hub.levers.find((l) => l.side === "o")?.field ?? xKey);
    setYKey(hub.levers.find((l) => l.side === "d")?.field ?? yKey);
  };

  const AxisPicker = ({ value, onChange, label }) => (
    <Box minW={0}>
      <Kicker mb={1}>{label}</Kicker>
      <Box as="select" value={value} onChange={(e) => onChange(e.target.value)}
        bg="whiteAlpha.100" color="white" fontSize={m ? "0.78rem" : "11px"} fontWeight="700" borderRadius={m ? 0 : "md"} px={2} py={m ? "0.5rem" : 1.5}
        border="1px solid" borderColor="whiteAlpha.200" w="100%">
        <optgroup label="Chart axes" style={{ background: "#141416" }}>
          {Object.values(SCATTER_AXES).map((a) => (
            <option key={a.key} value={a.key} style={{ background: "#141416" }}>{a.label}</option>
          ))}
        </optgroup>
        {ADV_AXIS_GROUPS.map((g) => (
          <optgroup key={g.label} label={g.label} style={{ background: "#141416" }}>
            {g.options.map((a) => (
              <option key={a.key} value={a.key} style={{ background: "#141416" }}>{a.label}</option>
            ))}
          </optgroup>
        ))}
        <optgroup label="Win levers" style={{ background: "#141416" }}>
          {hub.levers.map((l) => (
            <option key={l.field} value={l.field} style={{ background: "#141416" }}>
              {l.label} (r {l.r > 0 ? "+" : ""}{l.r})
            </option>
          ))}
        </optgroup>
      </Box>
    </Box>
  );

  return (
    <SectionFlush.Provider value={m}>
    <Flex direction="column" gap={m ? 0 : 4}>
      <Section title="Charts" right={m || mode !== "scatter" ? null : <Kicker>{activePreset ? activePreset.label : "Custom"}</Kicker>}>
        {/* Scatter | Bar | Down & Distance — which kind of chart. Down & Distance
            is the backend's one-off thread export (TEMPORARY, desktop only). */}
        <Flex gap="1px" mb={m ? "0.75rem" : 4} {...(m ? { mx: "-0.75rem", mt: "-0.25rem" } : {})}>
          {[["scatter", "Scatter"], ["bar", "Bar"], ...(m ? [] : [["dd", "Down & Distance"]])].map(([id, label], i, all) => (
            <Box
              key={id}
              as="button"
              type="button"
              onClick={() => setMode(id)}
              flex={m ? 1 : undefined}
              px={m ? 0 : 5}
              py={m ? "0.7rem" : 2}
              borderRadius={m ? 0 : i === 0 ? "md 0 0 md" : i === all.length - 1 ? "0 md md 0" : 0}
              bg={mode === id ? "brand.500" : "whiteAlpha.100"}
              _hover={mode === id ? undefined : { bg: "whiteAlpha.200" }}
            >
              <Text fontSize={m ? "0.78rem" : "11px"} fontWeight="900" color={mode === id ? "white" : "whiteAlpha.700"} textTransform="uppercase" letterSpacing="0.1em">{label}</Text>
            </Box>
          ))}
        </Flex>

        {mode === "dd" ? (
          <DownDistanceCharts />
        ) : mode === "bar" ? (
          <>
            <Grid templateColumns={m ? "minmax(0, 1fr)" : "minmax(0, 2fr) minmax(0, 1fr)"} gap={m ? "0.5rem" : 4} alignItems="end">
              <AxisPicker value={barKey} onChange={setBarKey} label="Measure" />
              <Flex gap="1px">
                {[[true, "Highest"], [false, "Lowest"]].map(([d, label]) => (
                  <Box key={label} as="button" type="button" onClick={() => setBarDesc(d)} flex={1} py={m ? "0.5rem" : 1.5}
                    borderRadius={m ? 0 : d ? "md 0 0 md" : "0 md md 0"} bg={barDesc === d ? "brand.500" : "whiteAlpha.100"}>
                    <Text fontSize={m ? "0.75rem" : "10px"} fontWeight="900" color={barDesc === d ? "white" : "whiteAlpha.700"} textTransform="uppercase" letterSpacing="0.08em">{label}</Text>
                  </Box>
                ))}
              </Flex>
            </Grid>
            <Flex gap={2} wrap="wrap" mt={4}>
              {SCATTER_SCOPES.map((sc) => (
                <ScopeButton key={sc.id} active={scope === sc.id} onClick={() => setScope(sc.id)}>{sc.label}</ScopeButton>
              ))}
            </Flex>
          </>
        ) : m ? (
          <>
            {/* Mobile: every chart in one swipeable row, edge to edge. */}
            <Flex mx="-0.75rem" px="0.75rem" gap="1px" overflowX="auto" style={{ scrollbarWidth: "none", scrollSnapType: "x proximity" }}>
              {groups.map((g, gi) => [
                // Each section opens with its name, a step apart from the last.
                <Flex key={`h-${g.id}`} flexShrink={0} align="center" pl={gi ? "0.9rem" : "0.2rem"} pr="0.5rem" style={{ scrollSnapAlign: "start" }}>
                  <Text fontSize="0.62rem" fontWeight="900" color="brand.400" textTransform="uppercase" letterSpacing="0.14em" whiteSpace="nowrap">{g.label}</Text>
                </Flex>,
                ...g.presets.map((c) => {
                  const on = activePreset?.id === c.id;
                  return (
                    <Box key={c.id} as="button" type="button" onClick={() => { setXKey(c.x); setYKey(c.y); setPresetId(c.id); }}
                      flexShrink={0} px="0.85rem" py="0.7rem" bg={on ? "brand.500" : "whiteAlpha.100"}>
                      <Text fontSize="0.72rem" fontWeight="900" color={on ? "white" : "whiteAlpha.700"} textTransform="uppercase" letterSpacing="0.06em" whiteSpace="nowrap">
                        {c.label}
                      </Text>
                    </Box>
                  );
                }),
              ])}
              <Box as="button" type="button" onClick={customAxes} flexShrink={0} px="0.85rem" py="0.7rem" bg={!activePreset ? "brand.500" : "whiteAlpha.100"}>
                <Text fontSize="0.72rem" fontWeight="900" color={!activePreset ? "white" : "whiteAlpha.700"} textTransform="uppercase" letterSpacing="0.06em" whiteSpace="nowrap">
                  Custom ✎
                </Text>
              </Box>
            </Flex>
            {/* Axes: two equal columns. */}
            <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="0.5rem" mt="0.75rem">
              <AxisPicker value={xKey} onChange={setXKey} label="Horizontal" />
              <AxisPicker value={yKey} onChange={setYKey} label="Vertical" />
            </Grid>
            {/* Teams: one bar, five equal segments. */}
            <Grid templateColumns={`repeat(${SCATTER_SCOPES.length}, minmax(0, 1fr))`} gap="1px" mt="0.75rem" mx="-0.75rem" mb="-0.75rem">
              {SCATTER_SCOPES.map((sc) => {
                const on = scope === sc.id;
                return (
                  <Box key={sc.id} as="button" type="button" onClick={() => setScope(sc.id)} py="0.7rem" minW={0} bg={on ? "brand.500" : "whiteAlpha.100"}>
                    <Text fontSize="0.72rem" fontWeight="900" color={on ? "white" : "whiteAlpha.700"} textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
                      {sc.label}
                    </Text>
                  </Box>
                );
              })}
            </Grid>
          </>
        ) : (
        <>
        {groups.map((g, gi) => (
          <Flex key={g.id} align="center" gap={2} wrap="wrap" mt={gi ? 2.5 : 0}>
            <Kicker w="4.5rem" flexShrink={0} color="brand.400">{g.label}</Kicker>
            {g.presets.map((c) => (
              <ScopeButton key={c.id} active={activePreset?.id === c.id} onClick={() => { setXKey(c.x); setYKey(c.y); setPresetId(c.id); }}>
                {c.label}
              </ScopeButton>
            ))}
          </Flex>
        ))}
        <Flex gap={2} wrap="wrap" mt={2}>
          <ScopeButton active={!activePreset} onClick={customAxes}>Custom ✎</ScopeButton>
        </Flex>
        <Flex gap={4} direction={{ base: "column", md: "row" }} mt={4}>
          <Box flex="1"><AxisPicker value={xKey} onChange={setXKey} label="Horizontal" /></Box>
          <Box flex="1"><AxisPicker value={yKey} onChange={setYKey} label="Vertical" /></Box>
        </Flex>
        <Flex gap={2} wrap="wrap" mt={4}>
          {SCATTER_SCOPES.map((sc) => (
            <ScopeButton key={sc.id} active={scope === sc.id} onClick={() => setScope(sc.id)}>{sc.label}</ScopeButton>
          ))}
        </Flex>
        </>
        )}
      </Section>

      {mode !== "dd" && (
      <Section
        ref={chartRef}
        title={mode === "bar" ? `${barTitle} · ${season}` : m ? (activePreset?.label ?? "Custom") : `${y.label} × ${x.label} · ${season}`}
        right={
          <Flex align="center" gap={3}>
            {!m && mode === "scatter" && <Kicker>Dashed = {series.centerLabel}</Kicker>}
            <ExportCardButton
              target={chartRef}
              filename={() => (mode === "bar" ? `bar-${season}-${barDesc ? "highest" : "lowest"}-${barKey}.png` : `scatter-${season}-${y.key}-vs-${x.key}.png`).replace(/[^a-z0-9._-]+/gi, "-")}
            />
          </Flex>
        }
      >
        {mode === "bar" ? (
          barPoints.length === 0 ? (
            <Flex h="240px" mt={2} align="center" justify="center" border="1px dashed" borderColor="whiteAlpha.200" borderRadius="md">
              <Text fontSize="sm" fontWeight="800" color="whiteAlpha.500">No {season} data for this measure yet.</Text>
            </Flex>
          ) : (
            <TeamBarChart points={barPoints} fmt={(v) => fmtAxis(v, barAxis.unit)} mobile={m} />
          )
        ) : points.length === 0 ? (
          <Flex h={{ base: "340px", lg: "500px" }} mt={2} align="center" justify="center" border="1px dashed" borderColor="whiteAlpha.200" borderRadius="md">
            <Text fontSize="sm" fontWeight="800" color="whiteAlpha.500">No {season} data for this chart yet.</Text>
          </Flex>
        ) : m ? (
          /* Mobile: tall, edge to edge. Axis numbers and titles sit inside
             the plot, so no gutter eats the width. */
          <Box mx="-0.75rem" mb="-0.75rem" mt={2}>
            <Flex px="0.75rem" pb="0.4rem">
              <Text fontSize="0.68rem" fontWeight="900" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.1em" lineClamp={1}>
                ↑ {y.label}{y.low && flipY ? " · less is up" : ""}
              </Text>
            </Flex>
            <Box position="relative" h="clamp(26rem, 140vw, 42rem)" w="100%" bg="rgba(255,255,255,0.015)"
              borderTop="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.200" overflow="hidden">
              {activePreset?.tint && (
                <>
                  <Box position="absolute" left={`${cx}%`} right={0} top={0} h={`${cy}%`} bg="rgba(72,187,120,0.07)" />
                  <Box position="absolute" left={0} w={`${cx}%`} bottom={0} top={`${cy}%`} bg="rgba(239,68,68,0.07)" />
                </>
              )}
              {quads && [
                { t: quads[0], pos: { top: "0.5rem", left: "0.5rem" }, color: "whiteAlpha.500" },
                { t: quads[1], pos: { top: "0.5rem", right: "0.5rem" }, color: "#68D391", align: "right" },
                { t: quads[2], pos: { bottom: "1.6rem", left: "0.5rem" }, color: "#FC8181" },
                { t: quads[3], pos: { bottom: "1.6rem", right: "0.5rem" }, color: "whiteAlpha.500", align: "right" },
              ].map((q) => (
                <Text key={q.t} position="absolute" {...q.pos} maxW="44%" textAlign={q.align ?? "left"} zIndex={1} pointerEvents="none"
                  fontSize="0.6rem" fontWeight="900" color={q.color} textTransform="uppercase" letterSpacing="0.08em" lineHeight={1.2}>
                  {q.t}
                </Text>
              ))}
              {xAxis.ticks.map((t) => (
                <Box key={`gx-${t}`} position="absolute" left={`${xPct(t)}%`} top={0} bottom={0} w="1px"
                  bg={Math.abs(t) < 1e-9 ? "whiteAlpha.300" : "whiteAlpha.100"} />
              ))}
              {yAxis.ticks.map((t) => (
                <Box key={`gy-${t}`} position="absolute" top={`${yPct(t)}%`} left={0} right={0} h="1px"
                  bg={Math.abs(t) < 1e-9 ? "whiteAlpha.300" : "whiteAlpha.100"} />
              ))}
              {/* y numbers ride just above their gridline, on the left edge */}
              {yAxis.ticks.map((t) => (
                <Text key={`ty-${t}`} position="absolute" left="0.35rem" top={`${yPct(t)}%`} transform="translateY(-110%)"
                  fontSize="0.6rem" fontWeight="800" color="whiteAlpha.500" fontVariantNumeric="tabular-nums" pointerEvents="none">
                  {fmtAxis(t, y.unit)}
                </Text>
              ))}
              {/* x numbers along the bottom edge, kept inside at the ends */}
              {xAxis.ticks.map((t) => {
                const at = xPct(t);
                const shift = at < 8 ? "0%" : at > 92 ? "-100%" : "-50%";
                return (
                  <Text key={`tx-${t}`} position="absolute" bottom="0.3rem" left={`${at}%`} transform={`translateX(${shift})`} px="0.2rem"
                    fontSize="0.6rem" fontWeight="800" color="whiteAlpha.500" fontVariantNumeric="tabular-nums" pointerEvents="none">
                    {fmtAxis(t, x.unit)}
                  </Text>
                );
              })}
              {Number.isFinite(avgX) && (
                <Box position="absolute" left={`${xPct(avgX)}%`} top={0} bottom={0} w={0} borderLeft="1px dashed" borderColor="rgba(168,85,247,0.7)" />
              )}
              {Number.isFinite(avgY) && (
                <Box position="absolute" top={`${yPct(avgY)}%`} left={0} right={0} h={0} borderTop="1px dashed" borderColor="rgba(168,85,247,0.7)" />
              )}
              {points.map((pt) => (
                <Box key={pt.id} as={Link} to={`/teams/${pt.id}`} position="absolute"
                  left={`${xPct(pt.x)}%`} top={`${yPct(pt.y)}%`}
                  transform="translate(-50%, -50%)" w="2.1rem" h="2.1rem"
                  display="flex" alignItems="center" justifyContent="center" zIndex={2}>
                  {pt.logo ? (
                    <Image src={pt.logo} alt={pt.short} w="100%" h="100%" objectFit="contain" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.75))" />
                  ) : (
                    <Text fontSize="0.65rem" fontWeight="900" color="white">{pt.short}</Text>
                  )}
                </Box>
              ))}
            </Box>
            <Flex px="0.75rem" py="0.5rem" justify="flex-end">
              <Text fontSize="0.68rem" fontWeight="900" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.1em" lineClamp={1}>
                {x.label}{x.low && flipX ? " · less is right" : ""} →
              </Text>
            </Flex>
          </Box>
        ) : (
        <Flex mt={2}>
          {/* y-axis title + ticks */}
          <Flex w="1.4rem" flexShrink={0} align="center" justify="center" h={{ base: "340px", lg: "500px" }}>
            <Text transform="rotate(-90deg)" whiteSpace="nowrap" fontSize="10px" fontWeight="900" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.14em">
              {y.label}{y.low ? (flipY ? " · less is up" : " · lower is better") : ""}
            </Text>
          </Flex>
          <Box position="relative" w="3.2rem" flexShrink={0} h={{ base: "340px", lg: "500px" }}>
            {yAxis.ticks.map((t) => (
              <Text key={t} position="absolute" right="0.6rem" top={`${yPct(t)}%`} transform="translateY(-50%)"
                fontSize="10px" fontWeight="800" color="whiteAlpha.500" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
                {fmtAxis(t, y.unit)}
              </Text>
            ))}
          </Box>

          <Box flex="1" minW={0}>
            <Box position="relative" h={{ base: "340px", lg: "500px" }} w="100%" bg="rgba(255,255,255,0.015)"
              borderLeft="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.300" overflow="hidden">
              {/* Quadrants: best (top-right) washed green, worst (bottom-left) red. */}
              {activePreset?.tint && (
                <>
                  <Box position="absolute" left={`${cx}%`} right={0} top={0} h={`${cy}%`} bg="rgba(72,187,120,0.06)" />
                  <Box position="absolute" left={0} w={`${cx}%`} bottom={0} top={`${cy}%`} bg="rgba(239,68,68,0.06)" />
                </>
              )}
              {quads && [
                { t: quads[0], pos: { top: "10px", left: "12px" }, color: "whiteAlpha.500" },
                { t: quads[1], pos: { top: "10px", right: "12px" }, color: "#68D391", align: "right" },
                { t: quads[2], pos: { bottom: "10px", left: "12px" }, color: "#FC8181" },
                { t: quads[3], pos: { bottom: "10px", right: "12px" }, color: "whiteAlpha.500", align: "right" },
              ].map((q) => (
                <Text key={q.t} position="absolute" {...q.pos} textAlign={q.align ?? "left"} zIndex={1} pointerEvents="none"
                  fontSize="10px" fontWeight="900" color={q.color} textTransform="uppercase" letterSpacing="0.12em">
                  {q.t}
                </Text>
              ))}
              {xAxis.ticks.map((t) => (
                <Box key={`gx-${t}`} position="absolute" left={`${xPct(t)}%`} top={0} bottom={0} w="1px"
                  bg={Math.abs(t) < 1e-9 ? "whiteAlpha.300" : "whiteAlpha.100"} />
              ))}
              {yAxis.ticks.map((t) => (
                <Box key={`gy-${t}`} position="absolute" top={`${yPct(t)}%`} left={0} right={0} h="1px"
                  bg={Math.abs(t) < 1e-9 ? "whiteAlpha.300" : "whiteAlpha.100"} />
              ))}
              {Number.isFinite(avgX) && (
                <Box position="absolute" left={`${xPct(avgX)}%`} top={0} bottom={0} w={0} borderLeft="1px dashed" borderColor="rgba(168,85,247,0.7)" />
              )}
              {Number.isFinite(avgY) && (
                <Box position="absolute" top={`${yPct(avgY)}%`} left={0} right={0} h={0} borderTop="1px dashed" borderColor="rgba(168,85,247,0.7)" />
              )}
              {/* Logos only — no ring. A shadow lifts each one off the grid. */}
              {points.map((pt) => (
                <Box key={pt.id} as={Link} to={`/teams/${pt.id}`} position="absolute"
                  left={`${xPct(pt.x)}%`} top={`${yPct(pt.y)}%`}
                  transform="translate(-50%, -50%)" w={{ base: "28px", lg: "38px" }} h={{ base: "28px", lg: "38px" }}
                  display="flex" alignItems="center" justifyContent="center" zIndex={2}
                  _hover={{ transform: "translate(-50%,-50%) scale(1.35)", zIndex: 4 }}
                  style={{ transition: "transform 0.15s" }}
                  title={`${pt.name} · ${x.label} ${fmtAxis(pt.x, x.unit)} · ${y.label} ${fmtAxis(pt.y, y.unit)}`}>
                  {pt.logo ? (
                    <Image src={pt.logo} alt={pt.short} w="100%" h="100%" objectFit="contain" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.75))" />
                  ) : (
                    <Text fontSize="10px" fontWeight="900" color="white">{pt.short}</Text>
                  )}
                </Box>
              ))}
            </Box>

            {/* x-axis ticks + title */}
            <Box position="relative" h="1.3rem" mt={1.5}>
              {xAxis.ticks.map((t) => (
                <Text key={t} position="absolute" left={`${xPct(t)}%`} transform="translateX(-50%)"
                  fontSize="10px" fontWeight="800" color="whiteAlpha.500" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
                  {fmtAxis(t, x.unit)}
                </Text>
              ))}
            </Box>
            <Text textAlign="center" mt={1} fontSize="10px" fontWeight="900" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.14em">
              {x.label}{x.low ? (flipX ? " · less is right →" : " · lower is better") : ""}
            </Text>
          </Box>
        </Flex>
        )}
      </Section>
      )}

      {mode === "scatter" && (
        <Section title={`${scopeDef.label} · the numbers`} right={m ? null : <Kicker>{points.length} teams</Kicker>}>
          <ScatterTable points={points} x={x} y={y} />
        </Section>
      )}
    </Flex>
    </SectionFlush.Provider>
  );
};

// ═══ TAB 4 — MATCHUP ═════════════════════════════════════════════════════════
// ── Matchup ──────────────────────────────────────────────────────────────────
// Two teams, or a team against the 18-team mean. The comparison is always
// unit-against-unit — A's offense reads against B's defense on the same
// metric, and vice versa — because that is the matchup that actually gets
// played. Bars by default; the radar is the same numbers in the other shape.

const LEAGUE_IDENTITY = {
  id: LEAGUE_ID,
  name: "League Average",
  short: "LG AVG",
  logo: null,
  primary: "#A855F7",
  secondary: "#E9D5FF",
  conference: null,
  division: null,
};

// The 18-team mean as a team row, so every comparison below works unchanged.
const leagueSeasonRow = (hub, season) => {
  const rows = Object.values(hub.teams ?? {}).map((t) => t.seasons?.[season]).filter(Boolean);
  if (!rows.length) return null;
  const mean = (get) => {
    const vals = rows.map(get).filter(Number.isFinite);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : undefined;
  };
  const fields = new Set(rows.flatMap((r) => Object.keys(r.metrics ?? {})));
  const metrics = {}, percentiles = {};
  fields.forEach((f) => {
    metrics[f] = mean((r) => r.metrics?.[f]);
    percentiles[f] = 50;
  });
  return { metrics, percentiles, rating: mean((r) => r.rating), rating_rank: null, record: null };
};

const sideOf = (base, side) => `${side === "defense" ? "d" : "o"}_${base}`;

// Rank within the league on a field, by percentile (already polarity-aware).
const buildRanks = (hub, season, fields) => {
  const map = {};
  fields.forEach((f) => {
    const sorted = Object.values(hub.teams ?? {})
      .map((t) => ({ id: t.identity.id, p: t.seasons?.[season]?.percentiles?.[f] }))
      .filter((x) => Number.isFinite(x.p))
      .sort((a, b) => b.p - a.p);
    map[f] = Object.fromEntries(sorted.map((x, i) => [x.id, i + 1]));
  });
  return map;
};

const RankChip = ({ rank, total }) => {
  if (!Number.isFinite(rank)) return null;
  const good = rank <= total / 2;
  const strength = Math.min(1, Math.abs(rank - (total + 1) / 2) / ((total - 1) / 2));
  const alpha = (0.14 + strength * 0.4).toFixed(2);
  return (
    <Box px={1.5} py={0.5} borderRadius="sm" bg={good ? `rgba(34,197,94,${alpha})` : `rgba(168,85,247,${alpha})`} flexShrink={0}>
      <Text fontSize="9px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">#{rank}</Text>
    </Box>
  );
};

// The bars view of a unit matchup: one metric, the attacking side's number
// against the defending side's, with opposed percentile bars under them. The
// higher percentile owns the row.
const MatchupRow = ({ metric, a, b, ranks, total }) => {
  const aWins = (a.pct ?? 0) >= (b.pct ?? 0);
  return (
    <Box>
      <Flex align="center" justify="space-between" gap={2} mb={1}>
        <Flex align="center" gap={1.5} w="30%" minW={0}>
          <Text fontSize="11px" fontWeight="900" color={aWins ? "white" : "whiteAlpha.500"} fontVariantNumeric="tabular-nums">
            {fmt(a.value, metric.unit)}
          </Text>
          <RankChip rank={ranks?.[a.field]?.[a.id]} total={total} />
        </Flex>
        <Kicker color="whiteAlpha.600" flex="1" textAlign="center">{metric.label}</Kicker>
        <Flex align="center" gap={1.5} w="30%" minW={0} justify="flex-end">
          <RankChip rank={ranks?.[b.field]?.[b.id]} total={total} />
          <Text fontSize="11px" fontWeight="900" color={!aWins ? "white" : "whiteAlpha.500"} fontVariantNumeric="tabular-nums">
            {fmt(b.value, metric.unit)}
          </Text>
        </Flex>
      </Flex>
      <Flex gap="2px" h="7px">
        <Flex flex="1" justify="flex-end">
          <Box h="100%" borderRadius="sm" bg={aWins ? a.color : "whiteAlpha.200"} style={{ width: `${a.pct ?? 0}%` }} />
        </Flex>
        <Flex flex="1">
          <Box h="100%" borderRadius="sm" bg={!aWins ? b.color : "whiteAlpha.200"} style={{ width: `${b.pct ?? 0}%` }} />
        </Flex>
      </Flex>
    </Box>
  );
};

const PreviousMeetings = ({ games, idA, idB }) => {
  const meetings = useMemo(() => {
    if (!idA || !idB || idA.id === LEAGUE_ID || idB.id === LEAGUE_ID) return [];
    const pair = new Set([idA.id, idB.id]);
    return games
      .filter((g) => pair.has(g.home_team_id) && pair.has(g.away_team_id) && g.home_team_id !== g.away_team_id)
      .filter((g) => Number.isFinite(g.home_score) && Number.isFinite(g.away_score))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [games, idA, idB]);

  if (!idA || !idB) return null;
  const record = meetings.reduce(
    (acc, g) => {
      const homeWon = g.home_score > g.away_score;
      const winner = homeWon ? g.home_team_id : g.away_team_id;
      if (g.home_score === g.away_score) acc.t += 1;
      else if (winner === idA.id) acc.a += 1;
      else acc.b += 1;
      return acc;
    },
    { a: 0, b: 0, t: 0 },
  );

  return (
    <Section
      title="Previous meetings"
      right={
        <Kicker color="whiteAlpha.700">
          {meetings.length ? `${idA.short} ${record.a}–${record.b}${record.t ? `–${record.t}` : ""} ${idB.short}` : "None on file"}
        </Kicker>
      }
    >
      {meetings.length === 0 ? (
        <Text fontSize="sm" color="whiteAlpha.500" fontStyle="italic">
          {idA.id === LEAGUE_ID || idB.id === LEAGUE_ID
            ? "Pick two teams to see their head-to-head."
            : "These two have not met in a parsed season (2019–2026)."}
        </Text>
      ) : (
        <Flex direction="column">
          {meetings.map((g) => {
            const aHome = g.home_team_id === idA.id;
            const aScore = aHome ? g.home_score : g.away_score;
            const bScore = aHome ? g.away_score : g.home_score;
            const aWon = aScore > bScore;
            return (
              <Flex key={g.game_stem} as={Link} to={`/game/${g.game_stem}`} align="center" gap={3}
                py={2.5} borderBottom="1px solid" borderColor="whiteAlpha.50"
                color="text.primary" _hover={{ bg: "whiteAlpha.50" }}>
                <Box w="4.5rem" flexShrink={0}>
                  <Text fontSize="11px" fontWeight="900" color="whiteAlpha.600" fontVariantNumeric="tabular-nums">{g.date}</Text>
                </Box>
                <Flex flex="1" minW={0} align="center" gap={2}>
                  <Text fontSize="11px" fontWeight="800" color="whiteAlpha.700" lineClamp={1}>
                    {aHome ? `${idB.short} at ${idA.short}` : `${idA.short} at ${idB.short}`}
                  </Text>
                </Flex>
                <Flex align="center" gap={2} flexShrink={0}>
                  <Text fontSize="12px" fontWeight="900" color={aWon ? "white" : "whiteAlpha.500"} fontVariantNumeric="tabular-nums">{aScore}</Text>
                  <Text fontSize="10px" color="whiteAlpha.400">–</Text>
                  <Text fontSize="12px" fontWeight="900" color={!aWon ? "white" : "whiteAlpha.500"} fontVariantNumeric="tabular-nums">{bScore}</Text>
                </Flex>
                <Box w="3rem" flexShrink={0} textAlign="right">
                  <Kicker color={aWon ? (idA.primary ?? POSITIVE) : (idB.primary ?? NEGATIVE)}>{aWon ? idA.short : idB.short}</Kicker>
                </Box>
              </Flex>
            );
          })}
        </Flex>
      )}
    </Section>
  );
};

// ── Tale of the tape ─────────────────────────────────────────────────────────
// Three columns: a team on its own terms, the head to head, the other team.
// The outside columns run TAPE_GROUPS - a net headline with the two halves
// that make it indented under it, each carrying its league rank.

const TapeLine = ({ label, value, rank, total, head }) => (
  <Flex align="center" gap={2} py={head ? 1 : 0.5} pl={head ? 0 : 3}>
    <Text
      flex="1" minW={0} lineClamp={1}
      fontSize={head ? "10px" : "9px"} fontWeight={head ? "900" : "800"}
      color={head ? "white" : "whiteAlpha.500"}
      textTransform={head ? "uppercase" : "none"} letterSpacing={head ? "0.05em" : "0"}
    >
      {label}
    </Text>
    <Text
      fontSize={head ? "11px" : "10px"} fontWeight="900" fontVariantNumeric="tabular-nums"
      color={head ? "white" : "whiteAlpha.700"} flexShrink={0}
    >
      {value}
    </Text>
    <Box w="2.2rem" flexShrink={0} display="flex" justifyContent="flex-end">
      <RankChip rank={rank} total={total} />
    </Box>
  </Flex>
);

const TapeGroup = ({ group, vals, ranks, id, color, total }) => {
  const unitOf = (key) => MATCHUP_FIELDS[key]?.unit ?? "num2";
  return (
    <Box mb={2.5} borderLeft="2px solid" borderColor={color} pl={2}>
      <TapeLine
        head
        label={group.label}
        value={fmtMatchup(vals?.[group.key], unitOf(group.key), group.signed)}
        rank={ranks?.[group.key]?.[id]}
        total={total}
      />
      {group.children.map((c) => (
        <TapeLine
          key={c.key}
          label={c.label}
          value={fmtMatchup(vals?.[c.key], unitOf(c.key), false)}
          rank={ranks?.[c.key]?.[id]}
          total={total}
        />
      ))}
    </Box>
  );
};

const TeamTapeColumn = ({ T, vals, ranks, color, total, season }) => (
  <Section
    title={T.identity.short}
    right={<Kicker color={color}>{T.row.record?.record ?? season}</Kicker>}
    flex="1" minW={0}
  >
    <Flex align="center" gap={2.5} mb={3} pb={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
      {T.identity.logo ? (
        <Image src={T.identity.logo} alt="" w="clamp(2rem, 4vw, 3rem)" h="clamp(2rem, 4vw, 3rem)" objectFit="contain" flexShrink={0} />
      ) : (
        <Box w="clamp(2rem, 4vw, 3rem)" h="clamp(2rem, 4vw, 3rem)" borderRadius="md" bg={color} flexShrink={0} />
      )}
      <Box minW={0} flex="1">
        <Text
          fontSize="clamp(0.85rem, 1.5vw, 1.15rem)" fontWeight="900" fontStyle="italic" textTransform="uppercase"
          letterSpacing="-0.03em" lineHeight={0.95} color="white" lineClamp={2}
        >
          {T.identity.name}
        </Text>
        <Kicker color="whiteAlpha.500" mt={1}>
          {T.row.record?.conference_record ? `${T.row.record.conference_record} conf` : T.identity.conference ?? ""}
        </Kicker>
      </Box>
      <Flex direction="column" align="flex-end" flexShrink={0}>
        <Text fontSize="clamp(1.1rem, 2.2vw, 1.9rem)" fontWeight="900" lineHeight={0.9} letterSpacing="-0.04em" color="white" fontVariantNumeric="tabular-nums">
          {fmt(T.row.rating, "num")}
        </Text>
        <Flex align="center" gap={1} mt={1}>
          <Kicker color="whiteAlpha.400">Glory</Kicker>
          <RankChip rank={T.row.rating_rank} total={total} />
        </Flex>
      </Flex>
    </Flex>
    {TAPE_GROUPS.map((g) => (
      <TapeGroup key={g.key} group={g} vals={vals} ranks={ranks} id={T.identity.id} color={color} total={total} />
    ))}
  </Section>
);

// The centre column: chips ride the outside, values inside, metric between.
// Lower rank wins the row and takes that team's colour.
const CompareRow = ({ row, leftKey, rightKey, left, right, leftColor, rightColor, ranks, total }) => {
  const lr = ranks?.[leftKey]?.[left.id];
  const rr = ranks?.[rightKey]?.[right.id];
  const leftWins = Number.isFinite(lr) && Number.isFinite(rr) ? lr <= rr : false;
  const rightWins = Number.isFinite(lr) && Number.isFinite(rr) ? rr < lr : false;
  const Cell = ({ v, unit, color, win, side }) => (
    <Flex flex="1" minW={0} justify={side === "left" ? "flex-end" : "flex-start"} px={2} py={1} borderRadius="sm" bg={win ? color : "transparent"}>
      <Text fontSize="11px" fontWeight="900" color={win ? "white" : "whiteAlpha.600"} fontVariantNumeric="tabular-nums">
        {fmtMatchup(v, unit, false)}
      </Text>
    </Flex>
  );
  return (
    <Flex align="center" gap={1.5} py={1}>
      <Box w="2.4rem" flexShrink={0}><RankChip rank={lr} total={total} /></Box>
      <Cell v={left.vals?.[leftKey]} unit={MATCHUP_FIELDS[leftKey]?.unit} color={leftColor} win={leftWins} side="left" />
      <Text
        w="42%" minW="5rem" flexShrink={0} textAlign="center" lineClamp={2}
        fontSize="9px" fontWeight="900" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.07em"
      >
        {row.label}
      </Text>
      <Cell v={right.vals?.[rightKey]} unit={MATCHUP_FIELDS[rightKey]?.unit} color={rightColor} win={rightWins} side="right" />
      <Flex w="2.4rem" flexShrink={0} justify="flex-end"><RankChip rank={rr} total={total} /></Flex>
    </Flex>
  );
};

// `[logo] OFFENSE vs [logo] DEFENSE` — the header both the tables and the
// radars sit under.
const MatchupHeading = ({ left, right, leftSide, leftColor, rightColor }) => (
  <Flex align="center" justify="center" gap={2} mb={2} wrap="wrap">
    {left.identity.logo && <Image src={left.identity.logo} alt="" w="18px" h="18px" objectFit="contain" />}
    <Text fontSize="clamp(0.8rem, 1.4vw, 1.05rem)" fontWeight="900" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.02em" color={leftColor}>
      {left.identity.short} {leftSide === "off" ? "Offense" : "Defense"}
    </Text>
    <Text fontSize="10px" fontWeight="900" color="whiteAlpha.400" textTransform="uppercase">vs</Text>
    {right.identity.logo && <Image src={right.identity.logo} alt="" w="18px" h="18px" objectFit="contain" />}
    <Text fontSize="clamp(0.8rem, 1.4vw, 1.05rem)" fontWeight="900" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.02em" color={rightColor}>
      {right.identity.short} {leftSide === "off" ? "Defense" : "Offense"}
    </Text>
  </Flex>
);

export const MatchupTab = ({ hub, season, teamA, setTeamA, teamB, setTeamB, games = [] }) => {
  const { isMobile: mu } = useLayoutDensity();
  const [view, setView] = useState("bars");

  const league = useMemo(() => leagueSeasonRow(hub, season), [hub, season]);
  const pickerTeams = useMemo(
    () => Object.values(hub.teams ?? {}).map((t) => t.identity).sort((x, y) => x.name.localeCompare(y.name)),
    [hub.teams],
  );
  // MOCK: the tale-of-the-tape and head-to-head fields are stand-ins until the
  // backend ships them. See src/pages/analytics/matchupMetrics.js.
  const tape = useMemo(() => matchupTable(hub, season), [hub, season]);

  const resolve = (id) =>
    id === LEAGUE_ID
      ? { identity: LEAGUE_IDENTITY, row: league, vals: tape.league }
      : {
          identity: hub.teams[id]?.identity ?? null,
          row: hub.teams[id]?.seasons?.[season] ?? null,
          vals: tape.values[id],
        };
  const A = resolve(teamA);
  const B = resolve(teamB);

  // The bars / radar section runs on the real unit metrics from the hub.
  const offBases = useMemo(
    () => (hub.units ?? []).filter((u) => u.available && u.side === "offense").flatMap((u) => u.metrics),
    [hub.units],
  );
  const defBases = useMemo(
    () => (hub.units ?? []).filter((u) => u.available && u.side === "defense").flatMap((u) => u.metrics),
    [hub.units],
  );
  const bases = useMemo(
    () => [...new Set(offBases)].filter((m) => defBases.includes(m)),
    [offBases, defBases],
  );
  const ranks = useMemo(
    () => buildRanks(hub, season, bases.flatMap((m) => [sideOf(m, "offense"), sideOf(m, "defense")])),
    [hub, season, bases],
  );
  const total = Object.keys(hub.teams ?? {}).length;

  if (!A.row || !B.row || !A.identity || !B.identity) {
    return (
      <Flex direction="column" gap={4}>
        {mu ? (
          <MatchupPicker teams={pickerTeams} teamA={teamA} teamB={teamB} setTeamA={setTeamA} setTeamB={setTeamB} mobile={mu} colorA={A.identity?.primary} colorB={B.identity?.primary} />
        ) : (
        <Section title="Pick the matchup">
          <MatchupPicker teams={pickerTeams} teamA={teamA} teamB={teamB} setTeamA={setTeamA} setTeamB={setTeamB} mobile={mu}
            colorA={A.identity?.primary} colorB={B.identity?.primary} />
        </Section>
        )}
        <Section title="Matchup"><Text fontSize="sm" color="whiteAlpha.600">Pick two teams with {season} data.</Text></Section>
      </Flex>
    );
  }

  const colorA = A.identity.primary ?? "#A855F7";
  const colorB = B.identity.primary ?? "#4299E1";

  // One block = A's unit against the B unit it faces. leftSide "off" is A's
  // offense against B's defense; "def" is the reverse.
  const unitBlock = (leftSide) => {
    const lPrefix = leftSide === "off" ? "offense" : "defense";
    const rPrefix = leftSide === "off" ? "defense" : "offense";
    const metrics = bases.map((m) => ({
      base: m,
      label: hub.metrics[m]?.short ?? m,
      unit: hub.metrics[m]?.unit ?? "num",
    }));
    const side = (T, color, prefix) =>
      metrics.map((m) => {
        const field = sideOf(m.base, prefix);
        return {
          id: T.identity.id, color, field,
          value: T.row.metrics?.[field],
          pct: T.row.percentiles?.[field],
        };
      });
    return {
      leftSide,
      metrics,
      left: side(A, colorA, lPrefix),
      right: side(B, colorB, rPrefix),
    };
  };
  const blocks = [unitBlock("off"), unitBlock("def")];

  const ViewButton = ({ id, children }) => (
    <Box as="button" onClick={() => setView(id)} px={3} py={1.5} borderRadius="md"
      fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em"
      bg={view === id ? "brand.500" : "whiteAlpha.100"} color={view === id ? "white" : "whiteAlpha.600"}
      _hover={{ bg: view === id ? "brand.500" : "whiteAlpha.200" }}>
      {children}
    </Box>
  );

  return (
    <Flex direction="column" gap={mu ? 0 : 4}>
      {mu ? (
        <MatchupPicker teams={pickerTeams} teamA={teamA} teamB={teamB} setTeamA={setTeamA} setTeamB={setTeamB} mobile={mu} colorA={colorA} colorB={colorB} />
      ) : (
      <Section title="Pick the matchup">
        <MatchupPicker teams={pickerTeams} teamA={teamA} teamB={teamB} setTeamA={setTeamA} setTeamB={setTeamB} mobile={mu}
          colorA={colorA} colorB={colorB} />
      </Section>
      )}

      <Section
        title="Unit matchups"
        right={<Flex gap={2}><ViewButton id="bars">Bars</ViewButton><ViewButton id="spider">Spider</ViewButton></Flex>}
      >
        <Flex gap={6} direction={{ base: "column", lg: "row" }} align="stretch">
          {blocks.map((blk) => (
            <Box key={blk.leftSide} flex="1" minW={0}>
              <MatchupHeading left={A} right={B} leftSide={blk.leftSide} leftColor={colorA} rightColor={colorB} />
              {view === "bars" ? (
                <Flex direction="column" gap={2.5}>
                  {blk.metrics.map((m, i) => (
                    <MatchupRow key={m.base} metric={m} a={blk.left[i]} b={blk.right[i]} ranks={ranks} total={total} />
                  ))}
                </Flex>
              ) : (
                <Radar
                  axes={blk.metrics.map((m) => ({ key: m.base, label: m.label }))}
                  series={[
                    { label: A.identity.short, color: colorA, values: blk.left.map((v) => v.pct) },
                    { label: B.identity.short, color: colorB, values: blk.right.map((v) => v.pct) },
                  ]}
                  size={300}
                />
              )}
            </Box>
          ))}
        </Flex>
      </Section>

      {/* Tale of the tape: team A, the head to head, team B. */}
      <Flex gap={4} direction={{ base: "column", xl: "row" }} align="stretch">
        <TeamTapeColumn T={A} vals={A.vals} ranks={tape.ranks} color={colorA} total={tape.total} season={season} />

        <Box flex="1.6" minW={0}>
          <Section title="Head to head" right={<Kicker color="whiteAlpha.500">Rank of {tape.total}</Kicker>}>
            {["off", "def"].map((leftSide, bi) => (
              <Box key={leftSide} mt={bi ? 5 : 0}>
                <MatchupHeading left={A} right={B} leftSide={leftSide} leftColor={colorA} rightColor={colorB} />
                {HEAD_TO_HEAD_ROWS.map((row) => (
                  <CompareRow
                    key={`${leftSide}-${row.label}`}
                    row={row}
                    leftKey={leftSide === "off" ? row.off : row.def}
                    rightKey={leftSide === "off" ? row.def : row.off}
                    left={{ id: A.identity.id, vals: A.vals }}
                    right={{ id: B.identity.id, vals: B.vals }}
                    leftColor={colorA}
                    rightColor={colorB}
                    ranks={tape.ranks}
                    total={tape.total}
                  />
                ))}
              </Box>
            ))}
          </Section>
        </Box>

        <TeamTapeColumn T={B} vals={B.vals} ranks={tape.ranks} color={colorB} total={tape.total} season={season} />
      </Flex>

      <PreviousMeetings games={games} idA={A.identity} idB={B.identity} />
    </Flex>
  );
};

// ═══ TAB 5 — RATING LAB ══════════════════════════════════════════════════════
// Build your own rating, then find out whether it holds up. The sliders start
// at each metric's real correlation with winning, so the default ranking IS
// the "what actually wins" model; the scoreboard runs every parsed game of
// the season through your weights and reports how often the model picked the
// winner, against the default and against simply taking the home team.

const LAB_POS = "#48BB78";
const LAB_NEG = "#FC8181";

const ScoreCard = ({ label, value, sub, tone = "white", lead }) => (
  <Box flex="1" minW={0} bg={lead ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.04)"} borderRadius="md" p={3}
    border="1px solid" borderColor={lead ? "brand.500" : "transparent"}>
    <Kicker color="whiteAlpha.500">{label}</Kicker>
    <Text
      fontSize="clamp(1.3rem, 3vw, 2.4rem)" fontWeight="900" fontStyle="italic" color={tone}
      lineHeight={0.9} letterSpacing="-0.04em" mt={1.5} fontVariantNumeric="tabular-nums"
    >
      {value}
    </Text>
    {sub && <Kicker color="whiteAlpha.400" mt={1.5}>{sub}</Kicker>}
  </Box>
);

// One lever. The track carries a tick where the correlation would put it, so
// you can see how far the weight has been moved from what the data says.
const LeverSlider = ({ lever, value, onChange }) => {
  const seed = Math.round(lever.abs * 100);
  const tickPct = ((seed + 100) / 200) * 100;
  const tone = value > 0 ? LAB_POS : value < 0 ? LAB_NEG : "whiteAlpha.400";
  return (
    <Box>
      <Flex align="baseline" justify="space-between" gap={2} mb={1}>
        <Kicker color="whiteAlpha.700">{lever.label}</Kicker>
        <Flex gap={2} align="baseline" flexShrink={0}>
          <Kicker color="whiteAlpha.400">r {lever.r > 0 ? "+" : ""}{lever.r}</Kicker>
          <Text fontSize="10px" fontWeight="900" color={tone} w="30px" textAlign="right" fontVariantNumeric="tabular-nums">
            {value > 0 ? "+" : ""}{value}
          </Text>
        </Flex>
      </Flex>
      {/* Correlation drawn behind the track: strong levers look strong. */}
      <Box position="relative" h="14px">
        <Box position="absolute" left={0} right={0} top="5px" h="4px" borderRadius="full" bg="whiteAlpha.100" />
        <Box position="absolute" left="50%" top="2px" w="1px" h="10px" bg="whiteAlpha.300" />
        <Box position="absolute" left={`${tickPct}%`} top="1px" w="2px" h="12px" borderRadius="full" bg="brand.500" opacity={0.8} />
        <Box
          as="input" type="range" min={-100} max={100} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          position="absolute" inset={0} w="100%" h="14px" accentColor="#A855F7" cursor="pointer" bg="transparent"
        />
      </Box>
    </Box>
  );
};

// How many places the model has a team above or below the actual standings.
const MoveChip = ({ move }) => {
  if (!Number.isFinite(move)) return <Box w="2.6rem" flexShrink={0} />;
  const tone = move > 0 ? LAB_POS : move < 0 ? LAB_NEG : "whiteAlpha.400";
  return (
    <Flex w="2.6rem" flexShrink={0} align="center" justify="flex-end" gap={0.5}>
      <Text fontSize="9px" fontWeight="900" color={tone}>{move > 0 ? "\u25B2" : move < 0 ? "\u25BC" : "\u2013"}</Text>
      {move !== 0 && (
        <Text fontSize="10px" fontWeight="900" color={tone} fontVariantNumeric="tabular-nums">{Math.abs(move)}</Text>
      )}
    </Flex>
  );
};

// Which levers earned this team its number, biggest first.
const Waterfall = ({ items, score }) => {
  const max = Math.max(...items.map((c) => Math.abs(c.value)), 0.01);
  return (
    <Box pl={7} pr={2} pb={3} pt={1}>
      {items.slice(0, 8).map((c) => (
        <Flex key={c.field} align="center" gap={2} py={1}>
          <Text flex="1" minW={0} fontSize="10px" fontWeight="800" color="whiteAlpha.700" lineClamp={1}>{c.label}</Text>
          <Kicker w="2.4rem" flexShrink={0} textAlign="right" color="whiteAlpha.400">{c.percentile}%</Kicker>
          <Flex w="40%" minW="5rem" flexShrink={0} align="center" gap="2px" h="7px">
            <Flex flex="1" justify="flex-end">
              {c.value < 0 && <Box h="100%" borderRadius="sm" bg={LAB_NEG} style={{ width: `${(Math.abs(c.value) / max) * 100}%` }} />}
            </Flex>
            <Box w="1px" h="9px" bg="whiteAlpha.300" flexShrink={0} />
            <Flex flex="1">
              {c.value > 0 && <Box h="100%" borderRadius="sm" bg={LAB_POS} style={{ width: `${(c.value / max) * 100}%` }} />}
            </Flex>
          </Flex>
          <Text w="2.8rem" flexShrink={0} textAlign="right" fontSize="10px" fontWeight="900" fontVariantNumeric="tabular-nums"
            color={c.value >= 0 ? LAB_POS : LAB_NEG}>
            {c.value > 0 ? "+" : ""}{c.value.toFixed(1)}
          </Text>
        </Flex>
      ))}
      <Flex align="center" gap={2} pt={2} mt={1} borderTop="1px solid" borderColor="whiteAlpha.100">
        <Kicker flex="1" color="whiteAlpha.500">Total</Kicker>
        <Text fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">
          {score > 0 ? "+" : ""}{score.toFixed(1)}
        </Text>
      </Flex>
    </Box>
  );
};

export const RatingLabTab = ({ hub, season, games = [] }) => {
  const levers = useMemo(() => labLevers(hub), [hub]);
  const [params, setParams] = useSearchParams();
  // A model in the URL wins over the default, so a shared link opens on the
  // model it was shared with.
  const [weights, setWeights] = useState(() => {
    const seeded = labLevers(hub);
    return decodeModel(params.get("model"), seeded) ?? presetWeights("wins", seeded);
  });
  const [openTeam, setOpenTeam] = useState(null);
  const [copied, setCopied] = useState(null);

  const active = labPresetFor(weights, levers);
  const rows = useMemo(() => rankLeague(hub, season, levers, weights), [hub, season, levers, weights]);
  const mine = useMemo(() => backtest(hub, season, games, levers, weights), [hub, season, games, levers, weights]);
  const wins = useMemo(
    () => backtest(hub, season, games, levers, presetWeights("wins", levers)),
    [hub, season, games, levers],
  );

  const pooled = useMemo(
    () => backtestSeasons(hub, hub.seasons ?? [], games, levers, weights),
    [hub, games, levers, weights],
  );
  const standings = useMemo(() => standingsRanks(hub, season), [hub, season]);
  const encoded = encodeModel(levers, weights);

  const share = () => {
    const next = new URLSearchParams(params);
    next.set("model", encoded);
    setParams(next, { replace: true });
    const url = `${window.location.origin}${window.location.pathname}?${next.toString()}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    setCopied(encoded);
  };

  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.score)), 1);
  const offense = levers.filter((l) => l.field.startsWith("o_"));
  const defense = levers.filter((l) => l.field.startsWith("d_"));
  const beating = Number.isFinite(mine.rate) && Number.isFinite(wins.rate) && mine.rate > wins.rate;
  const asPct = (v) => (Number.isFinite(v) ? `${(v * 100).toFixed(1)}%` : "—");

  const PresetButton = ({ preset }) => (
    <Box as="button" onClick={() => setWeights(presetWeights(preset.id, levers))}
      px={3} py={2} borderRadius="md" whiteSpace="nowrap"
      fontSize="10px" fontWeight="900" textTransform="uppercase" letterSpacing="0.08em"
      bg={active === preset.id ? "brand.500" : "whiteAlpha.100"} color={active === preset.id ? "white" : "whiteAlpha.700"}
      _hover={{ bg: active === preset.id ? "brand.500" : "whiteAlpha.200" }}>
      {preset.label}
    </Box>
  );

  return (
    <Flex direction="column" gap={4}>
      <Section
        title="How the model holds up"
        right={<Kicker color="whiteAlpha.500">{season} · {mine.games} games</Kicker>}
      >
        <Flex gap={3} direction={{ base: "column", md: "row" }} align="stretch">
          <ScoreCard
            label="Your model" value={asPct(mine.rate)} lead={beating}
            tone={beating ? LAB_POS : "white"}
            sub={`${mine.hits} of ${mine.games} winners`}
          />
          <ScoreCard label="What actually wins" value={asPct(wins.rate)} sub="The seeded weights" />
          <ScoreCard label="Home team" value={asPct(mine.homeRate)} sub="The floor" />
          <ScoreCard
            label="Margin correlation" value={Number.isFinite(mine.marginR) ? mine.marginR.toFixed(3) : "—"}
            sub="Model gap vs final margin"
            tone={mine.marginR >= 0.4 ? LAB_POS : "white"}
          />
          <ScoreCard
            label="Every season" value={asPct(pooled.rate)}
            sub={`${pooled.hits} of ${pooled.games} · same weights`}
          />
        </Flex>
        <Kicker color="whiteAlpha.300" mt={3}>
          Descriptive — season metrics include these games
        </Kicker>
      </Section>

      <Section
        title="Build a rating"
        right={
          <Flex gap={2}>
            <Box as="button" onClick={share} px={2.5} py={1} borderRadius="md"
              bg={copied === encoded ? "brand.500" : "whiteAlpha.100"}
              fontSize="9px" fontWeight="900" color={copied === encoded ? "white" : "whiteAlpha.700"}
              textTransform="uppercase" _hover={{ bg: copied === encoded ? "brand.500" : "whiteAlpha.200" }}>
              {copied === encoded ? "Link copied" : "Copy link"}
            </Box>
            <Box as="button" onClick={() => setWeights(presetWeights("wins", levers))} px={2.5} py={1} borderRadius="md" bg="whiteAlpha.100"
              fontSize="9px" fontWeight="900" color="whiteAlpha.700" textTransform="uppercase" _hover={{ bg: "whiteAlpha.200" }}>
              Reset
            </Box>
          </Flex>
        }
      >
        <Flex gap={2} wrap="wrap">
          {LAB_PRESETS.map((p) => <PresetButton key={p.id} preset={p} />)}
        </Flex>

        <Flex gap={6} mt={5} direction={{ base: "column", lg: "row" }} align="flex-start">
          {[["Offense", offense, "#ECC94B"], ["Defense", defense, "#4299E1"]].map(([label, list, tone]) => (
            <Box key={label} flex="1" minW={0} w="100%">
              <Flex align="center" gap={2} mb={3}>
                <Box w="8px" h="8px" borderRadius="sm" bg={tone} flexShrink={0} />
                <Kicker color="whiteAlpha.700">{label}</Kicker>
                <Box flex="1" h="1px" bg="whiteAlpha.100" />
              </Flex>
              <Flex direction="column" gap={3}>
                {list.map((l) => (
                  <LeverSlider key={l.field} lever={l} value={weights[l.field] ?? 0}
                    onChange={(v) => setWeights((w) => ({ ...w, [l.field]: v }))} />
                ))}
              </Flex>
            </Box>
          ))}
        </Flex>
      </Section>

      <Section title={`Your ranking · ${season}`} right={<Kicker color="whiteAlpha.500">Move = places above the standings</Kicker>}>
        <Flex align="center" gap={2} pb={1.5} mb={1} borderBottom="1px solid" borderColor="whiteAlpha.100">
          <Box w="20px" flexShrink={0} />
          <Kicker flex="1" color="whiteAlpha.500">Team</Kicker>
          <Kicker w="40px" flexShrink={0} textAlign="right" color="whiteAlpha.500">Score</Kicker>
          <Kicker w="34px" flexShrink={0} textAlign="right" color="whiteAlpha.500">Rec</Kicker>
          <Kicker w="2.6rem" flexShrink={0} textAlign="right" color="whiteAlpha.500">Move</Kicker>
        </Flex>
        <Flex direction="column">
          {rows.map((r, i) => {
            const open = openTeam === r.identity.id;
            const real = standings[r.identity.id];
            return (
              <Box key={r.identity.id} borderBottom="1px solid" borderColor="whiteAlpha.50">
                <Flex as="button" w="100%" textAlign="left" onClick={() => setOpenTeam(open ? null : r.identity.id)}
                  align="center" gap={2} py={1.5} _hover={{ bg: "whiteAlpha.50" }}>
                  <Text fontSize="10px" fontWeight="900" color="whiteAlpha.500" w="20px" flexShrink={0} fontVariantNumeric="tabular-nums">{i + 1}</Text>
                  {r.identity.logo && <Image src={r.identity.logo} alt="" w="16px" h="16px" objectFit="contain" flexShrink={0} />}
                  <Text fontSize="11px" fontWeight="900" color="white" w="70px" flexShrink={0} lineClamp={1}>{r.identity.short}</Text>
                  <Box flex="1" h="8px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden" minW={0}>
                    <Box h="100%" borderRadius="full" bg={r.score >= 0 ? (r.identity.primary ?? "#A855F7") : "whiteAlpha.300"}
                      style={{ width: `${(Math.abs(r.score) / maxAbs) * 100}%` }} />
                  </Box>
                  <Text fontSize="10px" fontWeight="900" color="whiteAlpha.600" w="40px" flexShrink={0} textAlign="right" fontVariantNumeric="tabular-nums">
                    {r.score > 0 ? "+" : ""}{r.score.toFixed(1)}
                  </Text>
                  <Kicker color="whiteAlpha.400" w="34px" flexShrink={0} textAlign="right">{r.record?.record}</Kicker>
                  <MoveChip move={Number.isFinite(real) ? real - (i + 1) : undefined} />
                </Flex>
                {open && (
                  <Waterfall
                    items={contributions(hub.teams[r.identity.id]?.seasons?.[season], levers, weights)}
                    score={r.score}
                  />
                )}
              </Box>
            );
          })}
        </Flex>
      </Section>
    </Flex>
  );
};

// ═══ TAB 6 — TRENDS ══════════════════════════════════════════════════════════
// Pick a metric, a side and a timeline, then put teams on it. The league
// average and the conference average ride along as reference lines, the way
// a trends chart is supposed to work — a number means nothing without the
// field it was posted against.
//
// Season is real: six seasons of every metric, plus the hub's own league
// averages. Week is a stand-in until the backend ships a per-week series.

const TREND_LEAGUE = "rgba(255,255,255,0.5)";
const TREND_CONF = "rgba(255,255,255,0.3)";
const MAX_TREND_TEAMS = 5;

const Select = ({ label, value, onChange, children }) => (
  <Box flex="1" minW="9rem">
    <Kicker mb={1}>{label}</Kicker>
    <Box as="select" value={value} onChange={(e) => onChange(e.target.value)}
      bg="whiteAlpha.100" color="white" fontSize="11px" fontWeight="700" borderRadius="md" px={2} py={1.5}
      border="1px solid" borderColor="whiteAlpha.200" w="100%">
      {children}
    </Box>
  </Box>
);

const Check = ({ on, onToggle, color, children }) => (
  <Flex as="button" onClick={onToggle} align="center" gap={2} px={2.5} py={1.5} borderRadius="md"
    bg={on ? "whiteAlpha.100" : "transparent"} border="1px solid" borderColor={on ? "whiteAlpha.200" : "whiteAlpha.100"}
    _hover={{ bg: "whiteAlpha.100" }} flexShrink={0}>
    <Box w="10px" h="2px" borderRadius="full" bg={on ? color : "whiteAlpha.300"} />
    <Kicker color={on ? "white" : "whiteAlpha.500"}>{children}</Kicker>
  </Flex>
);

export const TrendsTab = ({ hub, teamId, season, games = [] }) => {
  const groups = useMemo(() => trendMetricGroups(hub), [hub]);
  const [metricKey, setMetricKey] = useState("rating");
  const [side, setSide] = useState("offense");
  const [mode, setMode] = useState("season");
  const [showLeague, setShowLeague] = useState(true);
  const [showConf, setShowConf] = useState(false);
  // The picked list is the whole truth — the sidebar's team only seeds it.
  // Switching teams over there brings that team onto the chart (derived
  // during render, no effect), but any team can then be taken off again as
  // long as one is left.
  const [picked, setPicked] = useState([teamId]);
  const [seeded, setSeeded] = useState(teamId);
  if (seeded !== teamId) {
    setSeeded(teamId);
    setPicked((list) => (list.includes(teamId) ? list : [teamId, ...list].slice(0, MAX_TREND_TEAMS)));
  }

  const teamIds = picked.slice(0, MAX_TREND_TEAMS);
  const teams = teamIds.map((id) => hub.teams?.[id]?.identity).filter(Boolean);
  const metric = trendMetric(hub, metricKey);
  const field = trendField(metricKey, side);
  const conference = teams[0]?.conference ?? null;

  const seasonGames = useTeamAnalyticsGames(season).teams;
  const rows = useMemo(
    () => buildTrendRows(hub, { teams, field, mode, season, seasonGames, conference: showConf ? conference : null }),
    [hub, teams, field, mode, season, seasonGames, showConf, conference],
  );

  const all = Object.values(hub.teams ?? {}).map((t) => t.identity).sort((a, b) => a.name.localeCompare(b.name));
  const toggleTeam = (id) => {
    setPicked((list) => {
      if (!list.includes(id)) return [...list, id].slice(-MAX_TREND_TEAMS);
      // Never leave the chart with nothing on it.
      return list.length > 1 ? list.filter((x) => x !== id) : list;
    });
  };

  return (
    <Flex direction="column" gap={4}>
      <Section
        title={`${metric.label}${metric.sideless ? "" : ` · ${side === "defense" ? "Defense" : "Offense"}`}`}
        right={<Kicker color="whiteAlpha.500">{mode === "week" ? `${season} · game by game` : "By season"}</Kicker>}
      >
        <Flex gap={3} wrap="wrap" align="flex-end">
          <Select label="Metric" value={metricKey} onChange={setMetricKey}>
            {groups.map((g) => (
              <optgroup key={g.label} label={g.label} style={{ background: "#141416" }}>
                {g.options.map((o) => (
                  <option key={o.key} value={o.key} style={{ background: "#141416" }}>{o.label}</option>
                ))}
              </optgroup>
            ))}
          </Select>
          <Select label="Side" value={metric.sideless ? "" : side} onChange={setSide}>
            {metric.sideless ? (
              <option value="">Team</option>
            ) : (
              <>
                <option value="offense" style={{ background: "#141416" }}>Offense</option>
                <option value="defense" style={{ background: "#141416" }}>Defense</option>
              </>
            )}
          </Select>
          <Select label="Timeline" value={mode} onChange={setMode}>
            <option value="season" style={{ background: "#141416" }}>Season to season</option>
            <option value="week" style={{ background: "#141416" }}>Game by game ({season})</option>
          </Select>
          <Flex gap={2} pb={0.5}>
            <Check on={showLeague} onToggle={() => setShowLeague((v) => !v)} color={TREND_LEAGUE}>League avg</Check>
            <Check on={showConf} onToggle={() => setShowConf((v) => !v)} color={TREND_CONF}>{conference ?? "Conf"} avg</Check>
          </Flex>
        </Flex>

        <Box w="100%" h={{ base: "260px", md: "360px" }} mt={4}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="x" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 800 }} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} />
              <YAxis
                width={50} domain={["auto", "auto"]} tickLine={false} axisLine={false}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 800 }}
                tickFormatter={(v) => fmtTrend(v, metric.unit)}
              />
              <Tooltip
                formatter={(v, name) => [fmtTrend(v, metric.unit), name]}
                contentStyle={{ background: "#141416", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 11, fontWeight: 800 }}
                labelStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 900 }}
                itemStyle={{ color: "#fff" }}
              />
              {showLeague && (
                <Line type="linear" dataKey="__league" name="League" stroke={TREND_LEAGUE} strokeDasharray="5 5" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              )}
              {showConf && (
                <Line type="linear" dataKey="__conference" name={`${conference ?? "Conf"} avg`} stroke={TREND_CONF} strokeDasharray="2 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              )}
              {teams.map((t) => {
                // A black primary is invisible as a line here — see utils/teamColor.
                const stroke = readableTeamColor(t);
                return (
                  <Line key={t.id} type="linear" dataKey={t.id} name={t.short} stroke={stroke}
                    strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: stroke }} connectNulls isAnimationActive={false} />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Flex gap={4} wrap="wrap" mt={2}>
          {teams.map((t) => (
            <Flex key={t.id} align="center" gap={1.5}>
              <Box w="12px" h="3px" borderRadius="full" bg={readableTeamColor(t)} />
              <Kicker color="whiteAlpha.700">{t.short}</Kicker>
            </Flex>
          ))}
        </Flex>
      </Section>

      <Section title="Compare" right={<Kicker color="whiteAlpha.500">{teamIds.length} of {MAX_TREND_TEAMS}</Kicker>}>
        <Flex gap={1.5} wrap="wrap">
          {all.map((t) => {
            const on = teamIds.includes(t.id);
            const last = on && teamIds.length === 1;
            return (
              <Flex key={t.id} as="button" onClick={() => toggleTeam(t.id)} align="center" gap={1.5} px={2.5} py={1.5} borderRadius="md"
                title={last ? "The chart needs at least one team" : undefined}
                cursor={last ? "default" : "pointer"}
                bg={on ? t.primary ?? "brand.500" : "whiteAlpha.50"} border="1px solid"
                borderColor={on ? t.secondary ?? "whiteAlpha.300" : "whiteAlpha.100"}
                _hover={{ bg: on ? t.primary ?? "brand.500" : "whiteAlpha.100" }} flexShrink={0}>
                {t.logo && <Image src={t.logo} alt="" w="14px" h="14px" objectFit="contain" />}
                <Text fontSize="10px" fontWeight="900" color={on ? "white" : "whiteAlpha.700"}>{t.short}</Text>
              </Flex>
            );
          })}
        </Flex>
      </Section>

      <Section title="The numbers" right={<Kicker color="whiteAlpha.500">{metric.label}</Kicker>}>
        <Box overflowX="auto">
          <Box as="table" w="100%" style={{ borderCollapse: "collapse" }}>
            <Box as="thead">
              <Box as="tr">
                <Box as="th" textAlign="left" pb={2} borderBottom="1px solid" borderColor="whiteAlpha.100">
                  <Kicker color="whiteAlpha.500">{mode === "week" ? "Game" : "Season"}</Kicker>
                </Box>
                {teams.map((t) => (
                  <Box as="th" key={t.id} textAlign="right" pb={2} pl={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
                    <Kicker color={readableTeamColor(t)}>{t.short}</Kicker>
                  </Box>
                ))}
                {showLeague && (
                  <Box as="th" textAlign="right" pb={2} pl={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
                    <Kicker color="whiteAlpha.500">League</Kicker>
                  </Box>
                )}
                {showConf && (
                  <Box as="th" textAlign="right" pb={2} pl={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
                    <Kicker color="whiteAlpha.500">{conference ?? "Conf"}</Kicker>
                  </Box>
                )}
              </Box>
            </Box>
            <Box as="tbody">
              {rows.map((r) => (
                <Box as="tr" key={r.x}>
                  <Box as="td" py={1.5} borderBottom="1px solid" borderColor="whiteAlpha.50">
                    <Text fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{r.x}</Text>
                  </Box>
                  {teams.map((t) => (
                    <Box as="td" key={t.id} textAlign="right" pl={3} py={1.5} borderBottom="1px solid" borderColor="whiteAlpha.50">
                      <Text fontSize="11px" fontWeight="800" color="whiteAlpha.800" fontVariantNumeric="tabular-nums">
                        {fmtTrend(r[t.id], metric.unit)}
                      </Text>
                    </Box>
                  ))}
                  {showLeague && (
                    <Box as="td" textAlign="right" pl={3} py={1.5} borderBottom="1px solid" borderColor="whiteAlpha.50">
                      <Text fontSize="11px" fontWeight="800" color="whiteAlpha.500" fontVariantNumeric="tabular-nums">
                        {fmtTrend(r.__league, metric.unit)}
                      </Text>
                    </Box>
                  )}
                  {showConf && (
                    <Box as="td" textAlign="right" pl={3} py={1.5} borderBottom="1px solid" borderColor="whiteAlpha.50">
                      <Text fontSize="11px" fontWeight="800" color="whiteAlpha.500" fontVariantNumeric="tabular-nums">
                        {fmtTrend(r.__conference, metric.unit)}
                      </Text>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Section>
    </Flex>
  );
};

// ═══ TAB 7 — GLOSSARY ════════════════════════════════════════════════════════
// One source, two consumers: this tab and every tooltip on the site both read
// src/pages/analytics/metricGlossary.js. Where GameOnPaper defines a term we
// also carry, their wording is used and credited — there is no reason to
// invent a second definition of success rate.
//
// The tab opens with the argument, not the reference: every metric ranked by
// how hard it actually pulls on winning, across 108 team-seasons.

const GLOSS_POS = "#48BB78";
const GLOSS_NEG = "#F6AD55";

const SourceBadge = ({ source }) =>
  source === "gop" ? (
    <Box px={1.5} py={0.5} borderRadius="sm" bg="rgba(99,179,237,0.16)" flexShrink={0}>
      <Text fontSize="8px" fontWeight="900" color="#63B3ED" textTransform="uppercase" letterSpacing="0.1em">GameOnPaper</Text>
    </Box>
  ) : null;

const StatusBadge = ({ status }) =>
  status === "mock" ? (
    <Box px={1.5} py={0.5} borderRadius="sm" bg="rgba(246,173,85,0.16)" flexShrink={0}>
      <Text fontSize="8px" fontWeight="900" color={GLOSS_NEG} textTransform="uppercase" letterSpacing="0.1em">Not yet on file</Text>
    </Box>
  ) : null;

// One metric-side, drawn as a pull away from zero.
//
// With a team picked the same bar does double duty: its LENGTH is still how
// hard the metric pulls on winning, and the solid part is how much of that
// pull the team earns — its percentile on that metric-side, which the hub
// already orients so higher is better on both sides of the ball. A long bar
// mostly filled is a strength that matters; a long bar barely filled is the
// team's real problem, and it sorts to the top of the list by itself.
const PullRow = ({ label, r, max, team }) => {
  const width = (Math.abs(r) / max) * 50;
  const tone = Math.abs(r) < 0.2 ? "whiteAlpha.300" : r > 0 ? GLOSS_POS : GLOSS_NEG;
  const pct = team && Number.isFinite(team.pct) ? team.pct : null;
  const earned = pct == null ? width : width * (pct / 100);
  return (
    <Flex align="center" gap={2} py={0.5}>
      <Text w={team ? "34%" : "46%"} minW={0} fontSize="10px" fontWeight="800" color="whiteAlpha.700" lineClamp={1} textAlign="right">{label}</Text>
      <Flex flex="1" minW={0} align="center" h="9px" position="relative">
        <Box position="absolute" left="50%" top={0} bottom={0} w="1px" bg="whiteAlpha.200" />
        {/* The pull itself — solid with no team picked, the track once there is one. */}
        <Box
          position="absolute" left={r >= 0 ? "50%" : `${50 - width}%`} h="100%" borderRadius="sm"
          bg={tone} opacity={team ? 0.22 : 1} style={{ width: `${width}%` }}
        />
        {team && (
          <Box
            position="absolute" left={r >= 0 ? "50%" : `${50 - earned}%`} h="100%" borderRadius="sm"
            bg={tone} style={{ width: `${earned}%` }}
          />
        )}
      </Flex>
      <Text w="2.6rem" flexShrink={0} textAlign="right" fontSize="10px" fontWeight="900" color={tone} opacity={team ? 0.6 : 1} fontVariantNumeric="tabular-nums">
        {r > 0 ? "+" : ""}{r}
      </Text>
      {team && (
        <>
          <Text w="3rem" flexShrink={0} textAlign="right" fontSize="10px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">
            {fmt(team.value, team.unit)}
          </Text>
          <Box w="2.2rem" flexShrink={0} display="flex" justifyContent="flex-end">
            <RankChip rank={team.rank} total={team.total} />
          </Box>
        </>
      )}
    </Flex>
  );
};

// A term's real numbers: who leads it, and what the league does.
const MetricFacts = ({ hub, season, metricKey }) => {
  const rows = ["o", "d"].map((sideKey) => {
    const field = `${sideKey}_${metricKey}`;
    const unit = hub.metrics?.[metricKey]?.unit ?? "num";
    const leader = Object.values(hub.teams ?? {})
      .map((t) => ({ t, p: t.seasons?.[season]?.percentiles?.[field], v: t.seasons?.[season]?.metrics?.[field] }))
      .filter((x) => Number.isFinite(x.p))
      .sort((a, b) => b.p - a.p)[0];
    return { sideKey, field, unit, leader, league: hub.league?.[season]?.metrics?.[field] };
  });
  return (
    <Flex direction="column" gap={1.5} mt={3} pt={3} borderTop="1px solid" borderColor="whiteAlpha.100">
      {rows.map(({ sideKey, unit, leader, league }) => (
        <Flex key={sideKey} align="center" gap={2} minW={0}>
          <Kicker w="3.6rem" flexShrink={0} color={sideKey === "d" ? "#4299E1" : "#ECC94B"}>
            {sideKey === "d" ? "Defense" : "Offense"}
          </Kicker>
          {leader?.t?.identity?.logo && <Image src={leader.t.identity.logo} alt="" w="14px" h="14px" objectFit="contain" flexShrink={0} />}
          <Text fontSize="10px" fontWeight="900" color="white" lineClamp={1} minW={0} flex="1">
            {leader?.t?.identity?.short ?? "—"}
          </Text>
          <Text fontSize="11px" fontWeight="900" color="white" flexShrink={0} fontVariantNumeric="tabular-nums">
            {fmt(leader?.v, unit)}
          </Text>
          <Kicker w="4.4rem" flexShrink={0} textAlign="right" color="whiteAlpha.400">
            Lg {fmt(league, unit)}
          </Kicker>
        </Flex>
      ))}
    </Flex>
  );
};

export const GlossaryTab = ({ hub, season }) => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const focus = params.get("term");

  // Every metric-side the hub carries a correlation for, hardest pull first.
  const ladder = useMemo(() => {
    const rows = (hub.glossary ?? []).flatMap((g) =>
      (g.wins_correlation ?? []).map((c) => ({
        key: `${g.key}-${c.side}`,
        field: `${c.side}_${g.key}`,
        unit: g.unit ?? "num",
        label: `${c.side === "d" ? "Defense" : "Offense"} ${g.label}`,
        r: c.r,
      })),
    );
    return rows.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
  }, [hub.glossary]);
  const maxPull = Math.max(...ladder.map((l) => Math.abs(l.r)), 0.1);

  // ── Read the ladder against one team ──────────────────────────────────────
  // The ladder alone says what wins in this league. Picking a team says how
  // much of that a team actually does, on the season the banner is set to.
  const [pick, setPick] = useState(null);
  const pickerTeams = useMemo(
    () => Object.values(hub.teams ?? {}).map((t) => t.identity).sort((x, y) => x.name.localeCompare(y.name)),
    [hub.teams],
  );
  const ladderRanks = useMemo(
    () => buildRanks(hub, season, ladder.map((l) => l.field)),
    [hub, season, ladder],
  );
  const picked = pick ? hub.teams?.[pick] : null;
  const pickedRow = picked?.seasons?.[season] ?? null;
  const teamTotal = Object.keys(hub.teams ?? {}).length;
  const readingFor = (l) =>
    pickedRow
      ? {
          pct: pickedRow.percentiles?.[l.field],
          value: pickedRow.metrics?.[l.field],
          rank: ladderRanks[l.field]?.[pick],
          total: teamTotal,
          unit: l.unit,
        }
      : null;

  const byKey = useMemo(() => Object.fromEntries((hub.glossary ?? []).map((g) => [g.key, g])), [hub.glossary]);

  const terms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY.filter((e) => {
      if (family !== "all" && e.family !== family) return false;
      if (!q) return true;
      return e.term.toLowerCase().includes(q) || e.def.toLowerCase().includes(q) || e.aliases.some((a) => a.includes(q));
    });
  }, [query, family]);

  const core = terms.filter((e) => e.tier === "core");
  const box = terms.filter((e) => e.tier !== "core");
  const gopCount = GLOSSARY.filter((e) => e.source === "gop").length;

  const openTerm = (term) => {
    const next = new URLSearchParams(params);
    if (focus === term) next.delete("term");
    else next.set("term", term);
    setParams(next, { replace: true });
  };

  const FamilyChip = ({ id, children }) => (
    <Box as="button" onClick={() => setFamily(id)} px={2.5} py={1.5} borderRadius="md" whiteSpace="nowrap"
      fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em"
      bg={family === id ? "brand.500" : "whiteAlpha.100"} color={family === id ? "white" : "whiteAlpha.600"}
      _hover={{ bg: family === id ? "brand.500" : "whiteAlpha.200" }}>
      {children}
    </Box>
  );

  return (
    <Flex direction="column" gap={4}>
      {/* ── The argument ─────────────────────────────────────────────── */}
      <Section
        title="What actually pulls on winning"
      >
        <Flex gap={4} direction={{ base: "column", lg: "row" }} align="flex-start">
          {/* 3 x 6 of the league, in the matchup picker's tile language. */}
          <Box w={{ base: "100%", lg: "10.5rem" }} flexShrink={0}>
            <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="1px" bg="whiteAlpha.100" borderRadius="md" overflow="hidden">
              {pickerTeams.map((t) => (
                <TeamTile
                  key={t.id}
                  team={t}
                  active={t.id === pick}
                  onClick={() => setPick((cur) => (cur === t.id ? null : t.id))}
                />
              ))}
            </Grid>
            <Box
              as="button" type="button" w="100%" mt="1px" py={2.5} borderRadius="md"
              bg={pick ? "whiteAlpha.100" : "brand.500"}
              _hover={{ bg: pick ? "whiteAlpha.200" : "brand.500" }}
              onClick={() => setPick(null)} transition="background 0.15s"
            >
              <Text fontSize="0.56rem" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em" whiteSpace="nowrap" color={pick ? "whiteAlpha.600" : "white"}>
                {pick ? "Clear · league" : `League · ${season}`}
              </Text>
            </Box>
            {picked && (
              <Flex align="center" gap={2} mt={3} minW={0}>
                {picked.identity.logo && <Image src={picked.identity.logo} alt="" w="16px" h="16px" objectFit="contain" flexShrink={0} />}
                <Box minW={0}>
                  <Text fontSize="10px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.03em" lineClamp={1}>
                    {picked.identity.short}
                  </Text>
                  <Kicker color="whiteAlpha.400">{season}{pickedRow?.record?.record ? ` · ${pickedRow.record.record}` : ""}</Kicker>
                </Box>
              </Flex>
            )}
          </Box>

          <Flex direction="column" flex="1" minW={0}>
            {picked && (
              <Flex align="center" gap={2} pb={1.5} mb={1} borderBottom="1px solid" borderColor="whiteAlpha.100">
                <Box w="34%" flexShrink={0} />
                <Box flex="1" minW={0} />
                <Kicker w="2.6rem" flexShrink={0} textAlign="right" color="whiteAlpha.400">r</Kicker>
                <Kicker w="3rem" flexShrink={0} textAlign="right" color="whiteAlpha.400">Them</Kicker>
                <Kicker w="2.2rem" flexShrink={0} textAlign="right" color="whiteAlpha.400">Rk</Kicker>
              </Flex>
            )}
            {ladder.map((l) => (
              <PullRow key={l.key} label={l.label} r={l.r} max={maxPull} team={readingFor(l)} />
            ))}
          </Flex>
        </Flex>
      </Section>

      {/* The TFL finding and polarity audit cards were removed 2026-10-04: the
          backend traced the TFL result to swapped columns in team_season_avg,
          and on its recount all 20 metric-sides agree with their polarity. */}

      {/* ── The reference ────────────────────────────────────────────── */}
      <Section
        title="Definitions"
        right={<Kicker color="whiteAlpha.500">{GLOSSARY.length} terms · {gopCount} from GameOnPaper</Kicker>}
      >
        <Flex gap={3} wrap="wrap" align="center">
          <Box
            as="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search terms"
            bg="whiteAlpha.100" color="white" fontSize="11px" fontWeight="700" borderRadius="md" px={3} py={2}
            border="1px solid" borderColor="whiteAlpha.200" minW="12rem" flex="1"
          />
          <Flex gap={2} wrap="wrap">
            <FamilyChip id="all">All</FamilyChip>
            {GLOSSARY_FAMILIES.map((fam) => <FamilyChip key={fam} id={fam}>{fam}</FamilyChip>)}
          </Flex>
        </Flex>
      </Section>

      <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, minmax(0,1fr))" }} gap={4}>
        {core.map((entry) => {
          const g = entry.metric ? byKey[entry.metric] : null;
          const open = focus === entry.term;
          return (
            <Section
              key={entry.term}
              title={entry.term}
              right={
                <Flex gap={1.5} align="center">
                  <SourceBadge source={entry.source} />
                  <StatusBadge status={entry.status} />
                </Flex>
              }
              borderColor={open ? "brand.500" : "whiteAlpha.100"}
            >
              <Box as="button" onClick={() => openTerm(entry.term)} textAlign="left" w="100%">
                <Text fontSize="11px" color="whiteAlpha.800" lineHeight={1.6}>{entry.def}</Text>
              </Box>
              {g && (
                <Flex direction="column" gap={1} mt={3}>
                  {(g.wins_correlation ?? []).map((c) => (
                    <PullRow key={c.side} label={c.side === "d" ? "Defense" : "Offense"} r={c.r} max={maxPull} />
                  ))}
                </Flex>
              )}
              {entry.metric && hub.metrics?.[entry.metric] && <MetricFacts hub={hub} season={season} metricKey={entry.metric} />}
            </Section>
          );
        })}
      </Box>

      {box.length > 0 && (
        <Section title="Box-score vocabulary" right={<Kicker color="whiteAlpha.500">{box.length} terms</Kicker>}>
          <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, minmax(0,1fr))" }} gapX={6}>
            {box.map((entry) => (
              <Flex key={entry.term} align="baseline" gap={2} py={1.5} borderBottom="1px solid" borderColor="whiteAlpha.50">
                <Text w="8.5rem" flexShrink={0} fontSize="10px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.04em" lineClamp={1}>
                  {entry.term}
                </Text>
                <Text flex="1" minW={0} fontSize="10px" color="whiteAlpha.600" lineHeight={1.5}>{entry.def}</Text>
              </Flex>
            ))}
          </Box>
        </Section>
      )}

      {terms.length === 0 && (
        <Section title="Nothing matches">
          <Text fontSize="sm" color="whiteAlpha.600">No term matches “{query}”.</Text>
        </Section>
      )}
    </Flex>
  );
};
