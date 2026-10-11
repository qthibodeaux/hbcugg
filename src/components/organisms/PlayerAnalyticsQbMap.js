import { useMemo, useRef, useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { useQbMap } from "../../hooks/useQbMapData";
import { teamInDivision } from "./PlayerAnalyticsSearchRow";
import { ExportCardButton } from "./stats/ExportCardButton";
import teamsData from "../../data/teams.json";

// QB Map — EPA per dropback × success rate, numbered key beside the plot.
// Everything (who qualifies, rank, axes, quadrant lines, the wording) comes
// from the backend: src/pages/analytics/md/QB Map Fetch Contract.md. This only
// plots it.
//
// One plot (QbPlot) drawn twice: on the page, and on the export poster — a
// hidden, fixed-size copy the Export button captures, so the PNG is the same
// shape at any screen width. The poster uses team marks, not headshots:
// outside-hosted photos don't survive the image capture.

const SEASON = 2026;
const BRAND = "#A855F7";

const TEAM_BY_V5 = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

// Raw hex only inside SVG (no Chakra tokens).
const QUADRANT_FILL = {
  top_left: "rgba(214,190,120,0.09)",
  top_right: "rgba(72,187,120,0.12)",
  bottom_left: "rgba(229,62,62,0.10)",
  bottom_right: "rgba(99,130,190,0.09)",
};
const QUADRANT_INK = {
  top_left: "#D6BE78",
  top_right: "#68D391",
  bottom_left: "#FC8181",
  bottom_right: "#93A9D6",
};

const lum = (hex) => {
  const h = (hex || "#444").replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};
const inkFor = (hex) => (lum(hex) > 0.6 ? "#111" : "#fff");
// Dot = primary; ring = secondary, unless it would vanish against the fill.
const dotColors = (team) => {
  const fill = team?.colors?.primary || "#444";
  const sec = team?.colors?.secondary || "#FFFFFF";
  const ring = Math.abs(lum(fill) - lum(sec)) < 0.2 ? "#FFFFFF" : sec;
  return { fill, ring };
};

const pct = (v) => `${Math.round(v * 100)}%`;
const pct1 = (v) => `${(v * 100).toFixed(1)}%`;
const signed = (v) => (v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2));
// Last name for a dot label, skipping generational suffixes ("Brown IV" → Brown).
const SUFFIX = /^(jr|sr|ii|iii|iv|v)\.?$/i;
const lastName = (name) => {
  const parts = String(name ?? "").trim().split(/\s+/).filter((w) => !SUFFIX.test(w));
  return parts.slice(-1)[0] ?? "";
};

// ── The plot ─────────────────────────────────────────────────────────────────
// `s` scales every size (dots, type, padding) so the poster can draw the same
// plot bigger. Labels go right of the dot, or left when right would run off
// the frame or into a label/dot already placed; failing both, they step down.
const QbPlot = ({ data, players, hover, setHover, W, H, R = 14, s = 1, names = true }) => {
  const { axes, quadrants } = data;
  const PAD = { l: 58 * s, r: 18 * s, t: 44 * s, b: 52 * s };
  const left = PAD.l;
  const right = W - PAD.r;
  const top = PAD.t;
  const bottom = H - PAD.b;
  const px = (v) => left + ((v - axes.x.min) / (axes.x.max - axes.x.min)) * (right - left);
  const py = (v) => top + (1 - (v - axes.y.min) / (axes.y.max - axes.y.min)) * (bottom - top);
  const xm = px(axes.x_mid);
  const ym = py(axes.y_mid);
  const nameSize = 13 * s;
  const tick = 13 * s;

  // Label layout, once per render: boxes in plot space.
  const placed = (() => {
    const dots = players.map((p) => ({ x: px(p.success_rate), y: py(p.epa_per_dropback) }));
    const boxes = dots.map((d) => ({ x0: d.x - R, x1: d.x + R, y0: d.y - R, y1: d.y + R }));
    const hit = (b) => boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
    const out = {};
    players
      .map((p, i) => ({ p, d: dots[i] }))
      .sort((a, b) => a.d.y - b.d.y)
      .forEach(({ p, d }) => {
        const w = lastName(p.name).length * nameSize * 0.62;
        const h = nameSize * 1.1;
        const gap = R + 6 * s;
        const tries = [
          { side: 1, dy: 0 }, { side: -1, dy: 0 },
          { side: 1, dy: h }, { side: -1, dy: h }, { side: 1, dy: -h }, { side: -1, dy: -h },
        ];
        const fits = (t) => {
          const x0 = t.side > 0 ? d.x + gap : d.x - gap - w;
          const b = { x0, x1: x0 + w, y0: d.y + t.dy - h / 2, y1: d.y + t.dy + h / 2 };
          return b.x0 >= left && b.x1 <= right && !hit(b) ? b : null;
        };
        let pick = null;
        let box = null;
        for (const t of tries) {
          box = fits(t);
          if (box) { pick = t; break; }
        }
        if (!pick) {
          pick = d.x > right - 120 * s ? { side: -1, dy: 0 } : { side: 1, dy: 0 };
          box = null;
        }
        if (box) boxes.push(box);
        out[p.player_id] = pick;
      });
    return out;
  })();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} role="img" aria-label="Quarterback map: EPA per dropback versus success rate">
      <rect x={left} y={top} width={xm - left} height={ym - top} fill={QUADRANT_FILL.top_left} />
      <rect x={xm} y={top} width={right - xm} height={ym - top} fill={QUADRANT_FILL.top_right} />
      <rect x={left} y={ym} width={xm - left} height={bottom - ym} fill={QUADRANT_FILL.bottom_left} />
      <rect x={xm} y={ym} width={right - xm} height={bottom - ym} fill={QUADRANT_FILL.bottom_right} />

      {axes.y.ticks.map((t) => (
        <g key={`y${t}`}>
          <line x1={left} x2={right} y1={py(t)} y2={py(t)} stroke={Math.abs(t) < 1e-9 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)"} strokeWidth={s} />
          <text x={left - 10 * s} y={py(t) + tick * 0.35} textAnchor="end" fontSize={tick} fontWeight="800" fill="#A1A1AA">{t.toFixed(2)}</text>
        </g>
      ))}
      {axes.x.ticks.map((t) => (
        <g key={`x${t}`}>
          <line x1={px(t)} x2={px(t)} y1={top} y2={bottom} stroke="rgba(255,255,255,0.06)" strokeWidth={s} />
          <text x={px(t)} y={bottom + tick * 1.7} textAnchor="middle" fontSize={tick} fontWeight="800" fill="#A1A1AA">{pct(t)}</text>
        </g>
      ))}

      {/* Median lines, labelled where they meet the frame. */}
      <line x1={xm} x2={xm} y1={top} y2={bottom} stroke="rgba(255,255,255,0.45)" strokeDasharray={`${5 * s} ${5 * s}`} strokeWidth={s} />
      <line x1={left} x2={right} y1={ym} y2={ym} stroke="rgba(255,255,255,0.45)" strokeDasharray={`${5 * s} ${5 * s}`} strokeWidth={s} />
      <text x={xm + 6 * s} y={bottom - 6 * s} fontSize={10 * s} fontWeight="900" fill="rgba(255,255,255,0.5)" letterSpacing={s}>MEDIAN</text>
      <text x={right - 4 * s} y={ym - 6 * s} textAnchor="end" fontSize={10 * s} fontWeight="900" fill="rgba(255,255,255,0.5)" letterSpacing={s}>MEDIAN</text>

      {[
        ["top_left", left + 10 * s, top + 20 * s, "start"],
        ["top_right", right - 10 * s, top + 20 * s, "end"],
        ["bottom_left", left + 10 * s, bottom - 34 * s, "start"],
        ["bottom_right", right - 10 * s, bottom - 34 * s, "end"],
      ].map(([k, x, y, anchor]) => {
        const [a, b] = (quadrants[k] || "").split(" · ");
        return (
          <text key={k} x={x} y={y} textAnchor={anchor} fontSize={13 * s} fill={QUADRANT_INK[k]}>
            <tspan x={x} fontWeight="900">{a}</tspan>
            {b && <tspan x={x} dy={16 * s} fontWeight="600" fillOpacity="0.8">{b}</tspan>}
          </text>
        );
      })}

      {/* Axis titles: the question each axis asks, in the corner it reads from. */}
      <text x={left} y={top - 14 * s} fontSize={16 * s} fontWeight="900" fill="#F4F4F5">{axes.y.label} ↑</text>
      <text x={right} y={H - 4 * s} textAnchor="end" fontSize={16 * s} fontWeight="900" fill="#F4F4F5">{axes.x.label} →</text>

      {players
        .slice()
        .sort((a, b) => (a.rank === hover) - (b.rank === hover))
        .map((p) => {
          const team = TEAM_BY_V5[p.team_id];
          const { fill, ring } = dotColors(team);
          const on = p.rank === hover;
          const cx = px(p.success_rate);
          const cy = py(p.epa_per_dropback);
          const lab = placed[p.player_id] ?? { side: 1, dy: 0 };
          const r = on ? R + 3 * s : R;
          return (
            <g
              key={p.player_id}
              transform={`translate(${cx} ${cy})`}
              onMouseEnter={setHover ? () => setHover(p.rank) : undefined}
              onMouseLeave={setHover ? () => setHover(null) : undefined}
              style={{ cursor: "default" }}
            >
              <circle r={r + 2 * s} fill="rgba(0,0,0,0.45)" />
              <circle r={r} fill={fill} stroke={on ? "#fff" : ring} strokeWidth={(on ? 2.5 : 2) * s} />
              <text textAnchor="middle" y={R * 0.32} fontSize={R * 0.88} fontWeight="900" fill={inkFor(fill)} pointerEvents="none">{p.rank}</text>
              {names && (
                <text
                  x={lab.side > 0 ? R + 6 * s : -(R + 6 * s)}
                  y={lab.dy + nameSize * 0.35}
                  textAnchor={lab.side > 0 ? "start" : "end"}
                  fontSize={nameSize}
                  fontWeight="900"
                  fill="#F4F4F5"
                  stroke="#0B0B0D"
                  strokeWidth={3 * s}
                  paintOrder="stroke"
                  pointerEvents="none"
                >
                  {lastName(p.name)}
                </text>
              )}
            </g>
          );
        })}
    </svg>
  );
};

// ── Numbered key ─────────────────────────────────────────────────────────────
// `big` is the poster's size: larger chip, mark and type.
const KeyHead = ({ big = false }) => (
  <Flex align="center" gap={2} px={2} pb={1.5} borderBottom="1px solid" borderColor="whiteAlpha.100">
    <Box flex={1} />
    <Text w={big ? "84px" : "3.4rem"} textAlign="right" fontSize={big ? "14px" : "9px"} fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">EPA/DB</Text>
    <Text w={big ? "84px" : "3rem"} textAlign="right" fontSize={big ? "14px" : "9px"} fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">Succ</Text>
  </Flex>
);

const KeyRow = ({ p, team, active, onHover, photo = true, big = false }) => {
  const { fill, ring } = dotColors(team);
  const chip = big ? "40px" : "22px";
  return (
    <Flex
      align="center"
      gap={big ? "14px" : 2}
      px={2}
      py={big ? "12px" : "5px"}
      bg={active ? "whiteAlpha.200" : "transparent"}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      onMouseEnter={onHover ? () => onHover(p.rank) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
      cursor="default"
    >
      <Flex w={chip} h={chip} flexShrink={0} align="center" justify="center" borderRadius="full" bg={fill} border={big ? "3px solid" : "2px solid"} borderColor={ring}>
        <Text fontSize={big ? "18px" : "10px"} fontWeight="900" color={inkFor(fill)} lineHeight={1}>{p.rank}</Text>
      </Flex>
      {photo && (p.image_url ? (
        <Image src={p.image_url} alt="" boxSize="26px" borderRadius="6px" objectFit="cover" objectPosition="top" flexShrink={0} />
      ) : (
        <Box boxSize="26px" borderRadius="6px" bg="whiteAlpha.100" flexShrink={0} />
      ))}
      {team?.logo && <Image src={team.logo} alt="" boxSize={big ? "44px" : "18px"} objectFit="contain" flexShrink={0} />}
      <Box flex={1} minW={0}>
        <Text fontSize={big ? "24px" : "13px"} fontWeight="900" color="text.primary" lineHeight={1.1} lineClamp={1}>{p.name}</Text>
        <Text fontSize={big ? "15px" : "10px"} fontWeight="800" color="text.muted" mt={big ? "4px" : 0} lineClamp={1}>
          {team?.shortName ?? p.team_id}{p.class_year ? ` · ${p.class_year}` : ""} · {p.dropbacks} DB
        </Text>
      </Box>
      <Text w={big ? "84px" : "3.4rem"} textAlign="right" fontSize={big ? "26px" : "13px"} fontWeight="900" color={p.epa_per_dropback >= 0 ? "#68D391" : "#FC8181"} fontVariantNumeric="tabular-nums">
        {signed(p.epa_per_dropback)}
      </Text>
      <Text w={big ? "84px" : "3rem"} textAlign="right" fontSize={big ? "24px" : "13px"} fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{pct1(p.success_rate)}</Text>
    </Flex>
  );
};

// ── Export poster (hidden, fixed size) ───────────────────────────────────────
// 1200 x 1600 (3:4): the tallest shape X shows uncropped on a phone. Header,
// then the map across the full width, then the key in two columns. Everything sized to read at phone width after X scales it.
const POSTER_W = 1200;
const POSTER_H = 1600;

const QbMapPoster = ({ data, players, posterRef }) => {
  const { qualification } = data;
  const half = Math.ceil(players.length / 2);
  const cols = [players.slice(0, half), players.slice(half)];
  return (
    <Flex ref={posterRef} direction="column" w={`${POSTER_W}px`} h={`${POSTER_H}px`} bg="#0B0B0D" color="white" px="48px" pt="44px" pb="36px" fontFamily="inherit">
      <Flex align="center" gap="12px" mb="8px">
        <Box w="8px" h="28px" bg={BRAND} />
        <Text fontSize="20px" fontWeight="900" letterSpacing="0.24em" textTransform="uppercase" color={BRAND}>HBCU GridIron Glory</Text>
      </Flex>
      <Text fontSize="84px" fontWeight="900" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.035em" lineHeight={0.92}>
        The {data.season} QB Map
      </Text>
      <Text fontSize="22px" fontWeight="800" color="whiteAlpha.700" mt="12px">
        {players.length} HBCU quarterbacks · Min. {qualification.min_dropbacks} dropbacks{data.through_date ? ` · Through ${data.through_date}` : ""}
      </Text>

      <Box flex={1} minH={0} mt="18px" display="flex">
        <Box flex={1}>
          <QbPlot data={data} players={players} hover={null} W={1104} H={830} R={24} s={1.55} />
        </Box>
      </Box>

      <Grid templateColumns="repeat(2, minmax(0, 1fr))" columnGap="32px" mt="10px">
        {cols.map((col, i) => (
          <Box key={i}>
            <KeyHead big />
            {col.map((p) => (
              <KeyRow key={p.player_id} p={p} team={TEAM_BY_V5[p.team_id]} photo={false} big />
            ))}
          </Box>
        ))}
      </Grid>

    </Flex>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
const PlayerAnalyticsQbMap = ({ division }) => {
  const { data, isLoading } = useQbMap(SEASON);
  const [hover, setHover] = useState(null);
  const posterRef = useRef(null);

  const players = useMemo(
    () => (data?.players || []).filter((p) => teamInDivision(TEAM_BY_V5[p.team_id], division)),
    [data, division],
  );

  if (isLoading) {
    return <Text fontSize="sm" color="text.muted" py={10} textAlign="center">Loading QB map…</Text>;
  }
  if (!data) return null;

  const { qualification, measure } = data;
  const hovered = players.find((p) => p.rank === hover) || null;

  return (
    <Box>
      <Flex align="flex-end" justify="space-between" gap={3} mb={4} wrap="wrap">
        <Box minW={0}>
          <Text fontSize="clamp(1.6rem, 3.2vw, 2.6rem)" fontWeight="900" fontStyle="italic" color="white" textTransform="uppercase" letterSpacing="-0.03em" lineHeight={0.95}>
            The {data.season} Quarterback Map
          </Text>
          <Text fontSize="sm" fontWeight="700" color="text.secondary" mt={2}>
            {players.length} quarterbacks · Min. {qualification.min_dropbacks} non-garbage-time dropbacks
            {data.through_date && ` · Through ${data.through_date}`}
          </Text>
        </Box>
        {players.length > 0 && (
          <ExportCardButton target={posterRef} filename={() => `qb-map-${data.season}${division && division !== "all" ? `-${division}` : ""}.png`.toLowerCase()} />
        )}
      </Flex>

      {players.length === 0 ? (
        <Text fontSize="sm" color="text.muted" py={10} textAlign="center">No quarterback has {qualification.min_dropbacks} dropbacks yet.</Text>
      ) : (
        <Grid templateColumns={{ base: "minmax(0,1fr)", lg: "minmax(0,22rem) minmax(0,1fr)" }} gap={4} alignItems="start">
          <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" py={2} overflowY="auto" style={{ maxHeight: "min(46rem, 85vh)" }}>
            <Text px={3} pb={2} fontSize="10px" fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.12em">
              Numbered key · EPA per dropback, highest first
            </Text>
            <KeyHead />
            {players.map((p) => (
              <KeyRow key={p.player_id} p={p} team={TEAM_BY_V5[p.team_id]} active={hover === p.rank} onHover={setHover} />
            ))}
          </Box>

          <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={2} position="relative">
            <QbPlot data={data} players={players} hover={hover} setHover={setHover} W={760} H={720} />
            {hovered && (
              <Box position="absolute" top={3} right={3} bg="bg.primary" border="1px solid" borderColor="whiteAlpha.200" borderRadius="md" px={3} py={2} pointerEvents="none">
                <Text fontSize="sm" fontWeight="900" color="text.primary">{hovered.rank}. {hovered.name}</Text>
                <Text fontSize="xs" color="text.secondary">
                  {TEAM_BY_V5[hovered.team_id]?.shortName || hovered.team_id}
                  {hovered.class_year && ` · ${hovered.class_year}`}
                </Text>
                <Text fontSize="xs" color="text.secondary" mt={1}>
                  EPA/dropback {signed(hovered.epa_per_dropback)} · Success {pct1(hovered.success_rate)} · {hovered.dropbacks} dropbacks
                </Text>
                <Text fontSize="xs" color="text.secondary">
                  {hovered.completions}/{hovered.attempts} · {hovered.pass_yards} yds · {hovered.pass_tds} TD · {hovered.interceptions} INT
                </Text>
              </Box>
            )}
          </Box>
        </Grid>
      )}

      {measure?.length > 0 && (
        <Box mt={4}>
          <Text fontSize="10px" fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={1}>How we measure</Text>
          {measure.map((m) => (
            <Text key={m.label} fontSize="xs" color="text.secondary">
              <Text as="span" fontWeight="bold">{m.label}:</Text> {m.text}
            </Text>
          ))}
        </Box>
      )}

      {/* Export source: off screen, fixed size. */}
      {players.length > 0 && (
        <Box position="fixed" left="-20000px" top={0} aria-hidden="true" pointerEvents="none">
          <QbMapPoster data={data} players={players} posterRef={posterRef} />
        </Box>
      )}
    </Box>
  );
};

export default PlayerAnalyticsQbMap;
