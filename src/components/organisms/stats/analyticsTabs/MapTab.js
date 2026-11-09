import { Box, Flex, Text, Image, Grid } from "@chakra-ui/react";
import { useState, useMemo, useRef } from "react";
import { Kicker, SectionFlush, Section } from "./AnalyticsPrimitives";
import { Link } from "react-router-dom";
import { fmtAxis, SCATTER_SECTIONS, SCATTER_PRESETS, presetFor, scatterSeries, SCATTER_AXES, ADV_AXIS_GROUPS } from "../../../../pages/analytics/scatterPresets";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { DownDistanceCharts } from "../../downDistance/DownDistanceCharts";
import { DeepDiveCharts } from "../../deepDive/DeepDiveCharts";
import { ThreeAndOuts, ThirdAndLong } from "../../threeAndOuts/ThreeAndOuts";
import { RunGame } from "../../runDefense/RunDefense";
import { ExportCardButton } from "../ExportCardButton";
import { TeamBarChart } from "../TeamBarChart";

// Existing implementation extracted along responsibility boundaries.

const SCATTER_SCOPES = [
  { id: "all", label: "All 18", match: () => true },
  { id: "MEAC", label: "MEAC", match: (i) => i.conference === "MEAC" },
  { id: "SWAC", label: "SWAC", match: (i) => i.conference === "SWAC" },
  { id: "East", label: "East", match: (i) => i.division === "East" },
  { id: "West", label: "West", match: (i) => i.division === "West" },
];

// The title spells an axis out: "Off Adj EPA / Play" reads "Offensive Adjusted EPA / Play".
const SPELLED = { Off: "Offensive", Def: "Defensive", Adj: "Adjusted" };
const spell = (label) => String(label).split(" ").map((w) => SPELLED[w] ?? w).join(" ");

const niceAxis = (vals, target = 5, tight = false) => {
  if (!vals.length) return { lo: 0, hi: 1, ticks: [0, 0.5, 1] };
  let lo = Math.min(...vals);
  let hi = Math.max(...vals);
  const pad = (hi - lo) * 0.08 || Math.abs(hi) * 0.1 || 0.01;
  lo -= pad;
  hi += pad;
  const raw = (hi - lo) / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((m) => m >= raw) ?? 10 * mag;
  // EPA uses padded data bounds, independently per axis. Rounding those
  // bounds to the tick step can otherwise add almost a full interval per end.
  const a = tight ? lo : Math.floor(lo / step) * step;
  const b = tight ? hi : Math.ceil(hi / step) * step;
  const ticks = [];
  const firstTick = tight ? Math.ceil(a / step) * step : a;
  for (let v = firstTick; v <= b + step / 1e6; v += step) ticks.push(Number(v.toFixed(10)));
  return { lo: a, hi: b, ticks };
};

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
    bg={active ? "brand.500" : "line"} color={active ? "white" : "text.secondary"}
    _hover={{ bg: active ? "brand.500" : "line.strong" }}>
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
        <Flex px={2} py={2} bg="line.subtle" borderRadius="md" gap={2} align="center">
          <Box w="26px" flexShrink={0}><Kicker>Rk</Kicker></Box>
          <Box flex="1" minW="9rem"><Kicker>Team</Kicker></Box>
          <Box w="9rem" flexShrink={0}><Head k="x">{x.label}</Head></Box>
          <Box w="9rem" flexShrink={0}><Head k="y">{y.label}</Head></Box>
        </Flex>
        {rows.map((p, i) => (
          <Flex key={p.id} px={2} align="center" gap={2} borderBottom="1px solid" borderColor="line.subtle">
            <Box w="26px" flexShrink={0} py={2}>
              <Text fontSize="11px" fontWeight="900" color="text.muted" fontVariantNumeric="tabular-nums">{i + 1}</Text>
            </Box>
            <Flex flex="1" minW="9rem" align="center" gap={2} py={2} as={Link} to={`/teams/${p.id}`} color="text.primary" _hover={{ color: "brand.400" }}>
              {p.logo && <Image src={p.logo} alt="" w="18px" h="18px" objectFit="contain" flexShrink={0} />}
              <Text fontSize="11px" fontWeight="800" color="inherit" lineClamp={1}>{p.name}</Text>
            </Flex>
            <Flex w="9rem" flexShrink={0} justify="flex-end" px={2} py={2} bg={cellBg(p.x, xs, x.low)}>
              <Text fontSize="12px" fontWeight="900" color="text.primary" fontVariantNumeric="tabular-nums">{fmtAxis(p.x, x.unit)}</Text>
            </Flex>
            <Flex w="9rem" flexShrink={0} justify="flex-end" px={2} py={2} bg={cellBg(p.y, ys, y.low)}>
              <Text fontSize="12px" fontWeight="900" color="text.primary" fontVariantNumeric="tabular-nums">{fmtAxis(p.y, y.unit)}</Text>
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

  const tightEpa = activePreset?.id === "off_def_epa" || Boolean(activePreset?.tight);
  const xAxis = niceAxis(points.map((pt) => pt.x), tightEpa ? 7 : 5, tightEpa);
  const yAxis = niceAxis(points.map((pt) => pt.y), tightEpa ? 7 : 5, tightEpa);
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
        bg="line" color="text.primary" fontSize={m ? "0.78rem" : "11px"} fontWeight="700" borderRadius={m ? 0 : "md"} px={2} py={m ? "0.5rem" : 1.5}
        border="1px solid" borderColor="line.strong" w="100%">
        <optgroup label="Chart axes" style={{ background: "var(--gg-bg-secondary)" }}>
          {Object.values(SCATTER_AXES).map((a) => (
            <option key={a.key} value={a.key} style={{ background: "var(--gg-bg-secondary)" }}>{a.label}</option>
          ))}
        </optgroup>
        {ADV_AXIS_GROUPS.map((g) => (
          <optgroup key={g.label} label={g.label} style={{ background: "var(--gg-bg-secondary)" }}>
            {g.options.map((a) => (
              <option key={a.key} value={a.key} style={{ background: "var(--gg-bg-secondary)" }}>{a.label}</option>
            ))}
          </optgroup>
        ))}
        <optgroup label="Win levers" style={{ background: "var(--gg-bg-secondary)" }}>
          {hub.levers.map((l) => (
            <option key={l.field} value={l.field} style={{ background: "var(--gg-bg-secondary)" }}>
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
        {/* Scatter | Bar | 3 & Outs | 3rd & Long | Run Game | Down & Distance | Deep Dive — which kind of
            chart. Down & Distance and Deep Dive are the backend's one-off
            exports (desktop only). */}
        <Flex gap="1px" mb={m ? "0.75rem" : 4} {...(m ? { mx: "-0.75rem", mt: "-0.25rem" } : {})}>
          {[["scatter", "Scatter"], ["bar", "Bar"], ["tao", "3 & Outs"], ["tal", "3rd & Long"], ["rund", "Run Game"], ...(m ? [] : [["dd", "Down & Distance"], ["deep", "Deep Dive"]])].map(([id, label], i, all) => (
            <Box
              key={id}
              as="button"
              type="button"
              onClick={() => setMode(id)}
              flex={m ? 1 : undefined}
              px={m ? 0 : 5}
              py={m ? "0.7rem" : 2}
              borderRadius={m ? 0 : i === 0 ? "md 0 0 md" : i === all.length - 1 ? "0 md md 0" : 0}
              bg={mode === id ? "brand.500" : "line"}
              _hover={mode === id ? undefined : { bg: "line.strong" }}
            >
              <Text fontSize={m ? "0.78rem" : "11px"} fontWeight="900" color={mode === id ? "white" : "text.secondary"} textTransform="uppercase" letterSpacing="0.1em">{label}</Text>
            </Box>
          ))}
        </Flex>

        {mode === "dd" ? (
          <DownDistanceCharts />
        ) : mode === "deep" ? (
          <DeepDiveCharts />
        ) : mode === "tao" ? (
          <ThreeAndOuts season={season} />
        ) : mode === "tal" ? (
          <ThirdAndLong season={season} />
        ) : mode === "rund" ? (
          <RunGame />
        ) : mode === "bar" ? (
          <>
            <Grid templateColumns={m ? "minmax(0, 1fr)" : "minmax(0, 2fr) minmax(0, 1fr)"} gap={m ? "0.5rem" : 4} alignItems="end">
              <AxisPicker value={barKey} onChange={setBarKey} label="Measure" />
              <Flex gap="1px">
                {[[true, "Highest"], [false, "Lowest"]].map(([d, label]) => (
                  <Box key={label} as="button" type="button" onClick={() => setBarDesc(d)} flex={1} py={m ? "0.5rem" : 1.5}
                    borderRadius={m ? 0 : d ? "md 0 0 md" : "0 md md 0"} bg={barDesc === d ? "brand.500" : "line"}>
                    <Text fontSize={m ? "0.75rem" : "10px"} fontWeight="900" color={barDesc === d ? "white" : "text.secondary"} textTransform="uppercase" letterSpacing="0.08em">{label}</Text>
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
                      flexShrink={0} px="0.85rem" py="0.7rem" bg={on ? "brand.500" : "line"}>
                      <Text fontSize="0.72rem" fontWeight="900" color={on ? "white" : "text.secondary"} textTransform="uppercase" letterSpacing="0.06em" whiteSpace="nowrap">
                        {c.label}
                      </Text>
                    </Box>
                  );
                }),
              ])}
              <Box as="button" type="button" onClick={customAxes} flexShrink={0} px="0.85rem" py="0.7rem" bg={!activePreset ? "brand.500" : "line"}>
                <Text fontSize="0.72rem" fontWeight="900" color={!activePreset ? "white" : "text.secondary"} textTransform="uppercase" letterSpacing="0.06em" whiteSpace="nowrap">
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
                  <Box key={sc.id} as="button" type="button" onClick={() => setScope(sc.id)} py="0.7rem" minW={0} bg={on ? "brand.500" : "line"}>
                    <Text fontSize="0.72rem" fontWeight="900" color={on ? "white" : "text.secondary"} textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
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

      {mode !== "dd" && mode !== "deep" && mode !== "tao" && mode !== "tal" && mode !== "rund" && (
      <Section
        ref={chartRef}
        title={mode === "bar" ? `${barTitle} · ${season}` : `${activePreset?.label ?? "Custom"} · ${season}`}
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
        {mode === "scatter" && (
          // The chart's name, big: "Y ×" over "X", the × in the brand colour. It is part of the card, so it exports.
          <Text mb={m ? 2 : 3} fontSize={{ base: "1.5rem", lg: "2.4rem" }} fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.95} letterSpacing="-0.03em" color="text.primary">
            <Box as="span" display="block">{spell(y.label)} <Box as="span" color="brand.500">×</Box></Box>
            <Box as="span" display="block">{spell(x.label)}</Box>
          </Text>
        )}
        {mode === "bar" ? (
          barPoints.length === 0 ? (
            <Flex h="240px" mt={2} align="center" justify="center" border="1px dashed" borderColor="line.strong" borderRadius="md">
              <Text fontSize="sm" fontWeight="800" color="text.muted">No {season} data for this measure yet.</Text>
            </Flex>
          ) : (
            <TeamBarChart points={barPoints} fmt={(v) => fmtAxis(v, barAxis.unit)} mobile={m} />
          )
        ) : points.length === 0 ? (
          <Flex h={{ base: "340px", lg: "500px" }} mt={2} align="center" justify="center" border="1px dashed" borderColor="line.strong" borderRadius="md">
            <Text fontSize="sm" fontWeight="800" color="text.muted">No {season} data for this chart yet.</Text>
          </Flex>
        ) : m ? (
          /* Mobile: tall, edge to edge. Axis numbers and titles sit inside
             the plot, so no gutter eats the width. */
          <Box mx="-0.75rem" mb="-0.75rem" mt={2}>
            <Flex px="0.75rem" pb="0.4rem">
              <Text fontSize="0.68rem" fontWeight="900" color="text.primary" textTransform="uppercase" letterSpacing="0.1em" lineClamp={1}>
                ↑ {spell(y.label)}{y.low && flipY ? " · less is up" : ""}
              </Text>
            </Flex>
            <Box position="relative" h="clamp(26rem, 140vw, 42rem)" w="100%" bg="line.subtle"
              borderTop="1px solid" borderBottom="1px solid" borderColor="line.strong" overflow="hidden">
              {activePreset?.tint && (
                <>
                  <Box position="absolute" left={`${cx}%`} right={0} top={0} h={`${cy}%`} bg="rgba(72,187,120,0.07)" />
                  <Box position="absolute" left={0} w={`${cx}%`} bottom={0} top={`${cy}%`} bg="rgba(239,68,68,0.07)" />
                </>
              )}
              {quads && [
                { t: quads[0], pos: { top: "0.5rem", left: "0.5rem" }, color: "text.muted" },
                { t: quads[1], pos: { top: "0.5rem", right: "0.5rem" }, color: "#68D391", align: "right" },
                { t: quads[2], pos: { bottom: "1.6rem", left: "0.5rem" }, color: "#FC8181" },
                { t: quads[3], pos: { bottom: "1.6rem", right: "0.5rem" }, color: "text.muted", align: "right" },
              ].map((q) => (
                <Text key={q.t} position="absolute" {...q.pos} maxW="44%" textAlign={q.align ?? "left"} zIndex={1} pointerEvents="none"
                  fontSize="0.6rem" fontWeight="900" color={q.color} textTransform="uppercase" letterSpacing="0.08em" lineHeight={1.2}>
                  {q.t}
                </Text>
              ))}
              {xAxis.ticks.map((t) => (
                <Box key={`gx-${t}`} position="absolute" left={`${xPct(t)}%`} top={0} bottom={0} w="1px"
                  bg={Math.abs(t) < 1e-9 ? "line.strong" : "line"} />
              ))}
              {yAxis.ticks.map((t) => (
                <Box key={`gy-${t}`} position="absolute" top={`${yPct(t)}%`} left={0} right={0} h="1px"
                  bg={Math.abs(t) < 1e-9 ? "line.strong" : "line"} />
              ))}
              {/* y numbers ride just above their gridline, on the left edge */}
              {yAxis.ticks.map((t) => (
                <Text key={`ty-${t}`} position="absolute" left="0.35rem" top={`${yPct(t)}%`} transform="translateY(-110%)"
                  fontSize="0.6rem" fontWeight="800" color="text.muted" fontVariantNumeric="tabular-nums" pointerEvents="none">
                  {fmtAxis(t, y.unit)}
                </Text>
              ))}
              {/* x numbers along the bottom edge, kept inside at the ends */}
              {xAxis.ticks.map((t) => {
                const at = xPct(t);
                const shift = at < 8 ? "0%" : at > 92 ? "-100%" : "-50%";
                return (
                  <Text key={`tx-${t}`} position="absolute" bottom="0.3rem" left={`${at}%`} transform={`translateX(${shift})`} px="0.2rem"
                    fontSize="0.6rem" fontWeight="800" color="text.muted" fontVariantNumeric="tabular-nums" pointerEvents="none">
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
                    <Text fontSize="0.65rem" fontWeight="900" color="text.primary">{pt.short}</Text>
                  )}
                </Box>
              ))}
            </Box>
            <Flex px="0.75rem" py="0.5rem" justify="flex-end">
              <Text fontSize="0.68rem" fontWeight="900" color="text.primary" textTransform="uppercase" letterSpacing="0.1em" lineClamp={1}>
                {spell(x.label)}{x.low && flipX ? " · less is right" : ""} →
              </Text>
            </Flex>
          </Box>
        ) : (
        <Flex mt={2}>
          {/* y-axis title + ticks */}
          <Flex w="1.4rem" flexShrink={0} align="center" justify="center" h={{ base: "340px", lg: "500px" }}>
            <Text transform="rotate(-90deg)" whiteSpace="nowrap" fontSize="10px" fontWeight="900" color="text.secondary" textTransform="uppercase" letterSpacing="0.14em">
              {spell(y.label)}{y.low ? (flipY ? " · less is up" : " · lower is better") : ""}
            </Text>
          </Flex>
          <Box position="relative" w="3.2rem" flexShrink={0} h={{ base: "340px", lg: "500px" }}>
            {yAxis.ticks.map((t) => (
              <Text key={t} position="absolute" right="0.6rem" top={`${yPct(t)}%`} transform="translateY(-50%)"
                fontSize="10px" fontWeight="800" color="text.muted" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
                {fmtAxis(t, y.unit)}
              </Text>
            ))}
          </Box>

          <Box flex="1" minW={0}>
            <Box position="relative" h={{ base: "340px", lg: "500px" }} w="100%" bg="line.subtle"
              borderLeft="1px solid" borderBottom="1px solid" borderColor="line.strong" overflow="hidden">
              {/* Quadrants: best (top-right) washed green, worst (bottom-left) red. */}
              {activePreset?.tint && (
                <>
                  <Box position="absolute" left={`${cx}%`} right={0} top={0} h={`${cy}%`} bg="rgba(72,187,120,0.06)" />
                  <Box position="absolute" left={0} w={`${cx}%`} bottom={0} top={`${cy}%`} bg="rgba(239,68,68,0.06)" />
                </>
              )}
              {quads && [
                { t: quads[0], pos: { top: "10px", left: "12px" }, color: "text.muted" },
                { t: quads[1], pos: { top: "10px", right: "12px" }, color: "#68D391", align: "right" },
                { t: quads[2], pos: { bottom: "10px", left: "12px" }, color: "#FC8181" },
                { t: quads[3], pos: { bottom: "10px", right: "12px" }, color: "text.muted", align: "right" },
              ].map((q) => (
                <Text key={q.t} position="absolute" {...q.pos} textAlign={q.align ?? "left"} zIndex={1} pointerEvents="none"
                  fontSize="10px" fontWeight="900" color={q.color} textTransform="uppercase" letterSpacing="0.12em">
                  {q.t}
                </Text>
              ))}
              {xAxis.ticks.map((t) => (
                <Box key={`gx-${t}`} position="absolute" left={`${xPct(t)}%`} top={0} bottom={0} w="1px"
                  bg={Math.abs(t) < 1e-9 ? "line.strong" : "line"} />
              ))}
              {yAxis.ticks.map((t) => (
                <Box key={`gy-${t}`} position="absolute" top={`${yPct(t)}%`} left={0} right={0} h="1px"
                  bg={Math.abs(t) < 1e-9 ? "line.strong" : "line"} />
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
                  title={`${pt.name} · ${spell(x.label)} ${fmtAxis(pt.x, x.unit)} · ${spell(y.label)} ${fmtAxis(pt.y, y.unit)}`}>
                  {pt.logo ? (
                    <Image src={pt.logo} alt={pt.short} w="100%" h="100%" objectFit="contain" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.75))" />
                  ) : (
                    <Text fontSize="10px" fontWeight="900" color="text.primary">{pt.short}</Text>
                  )}
                </Box>
              ))}
            </Box>

            {/* x-axis ticks + title */}
            <Box position="relative" h="1.3rem" mt={1.5}>
              {xAxis.ticks.map((t) => (
                <Text key={t} position="absolute" left={`${xPct(t)}%`} transform="translateX(-50%)"
                  fontSize="10px" fontWeight="800" color="text.muted" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
                  {fmtAxis(t, x.unit)}
                </Text>
              ))}
            </Box>
            <Text textAlign="center" mt={1} fontSize="10px" fontWeight="900" color="text.secondary" textTransform="uppercase" letterSpacing="0.14em">
              {spell(x.label)}{x.low ? (flipX ? " · less is right →" : " · lower is better") : ""}
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
