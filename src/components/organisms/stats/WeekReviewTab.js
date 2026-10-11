import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ExportCardButton } from "./ExportCardButton";

// ═════════════════════════════════════════════════════════════════════════════
// WEEK REVIEW — "Did we really get beat that bad?"
//
// One bar per game played that week. The bar is the net success rate of the
// WINNER minus the LOSER:
//
//   tall bar      the better team won, and won like it
//   short bar     the scoreboard was louder than the football
//   NEGATIVE bar  the losing team out-played the winner — no, you did not
//                 really get beat that bad
//
// LOGO PLACEMENT is anchored to the BASELINE, not to up and down: the loser
// always sits on the zero line and the winner always rides the bar's far end.
// So the bar reads as a distance travelled away from the team that lost, and
// its length is how far the winner got — which holds whichever side of zero the
// bar falls on. On a positive bar that puts the winner on top; on a negative bar
// the winner is underneath, and that inversion is the point, because a negative
// bar means the winner was the one being out-played.
//
// The Y DOMAIN is computed per week, never fixed. A week whose biggest edge is
// 0.30 gets an axis to roughly 0.35; a week of near-zero games gets a tight one.
// Padding exists so the logos have somewhere to hang, so it is floored in
// absolute terms as well as proportional — otherwise a week of tiny bars pads
// by a tiny amount and clips every logo against the frame.
//
// The week control belongs to this component, not the page banner: it is the
// only view on the page that is weekly, so week is this card's scope rather
// than the page's. All 17 weeks are listed; weeks with nothing final are
// visible and unclickable, because seeing that Week 16 exists and is empty is
// information and a list that silently stops at 15 is not.
//
// The y-axis names the measure (net success rate, winner − loser); the
// zero-line labels and the method line that used to sit under the chart
// was removed 2026-10-04. 2026 is measured: the export ships
// success_rate_down_distance per team per game, so the bar is the real
// difference (scripts/build_week_review_2026.js). 2025 is the older proxy,
// projected from season averages (scripts/build_week_review.js). Same contract,
// so this component renders either without knowing which it has.
// ═════════════════════════════════════════════════════════════════════════════

const OVERSTATED = "#F6AD55";

// The bar is net success rate: the winner's success rate minus the loser's
// (`winner_edge` = `net_success`, ruled 2026-10-04).
const net = (v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(3)}`;

// ─── Colour ──────────────────────────────────────────────────────────────────
// Bars carry the winner's team colour, which is what makes the chart read as
// this league rather than as a generic plot. Two problems have to be handled or
// it stops being team colour at all:
//
//   1. Three schools ship #000000 as their primary — ASU, UAPB and GSU — and a
//      black bar on a near-black panel is not a bar. Their real identity is the
//      gold in `secondary`, so for an achromatic dark primary the secondary is
//      not a fudge, it is the correct colour.
//   2. Dark chromatic primaries (AAMU maroon, JSU navy) have no usable
//      secondary — both ship white — so they get lifted instead. Lifting in HSL
//      raises lightness while holding hue and saturation; mixing toward white,
//      which is the obvious move, desaturates maroon into pink and navy into
//      grey and loses the identity the colour was there to carry.

const hexToRgb = (hex) => {
  const h = String(hex ?? "").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) };
};

const rgbToHsl = ({ r, g, b }) => {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === R ? ((G - B) / d + (G < B ? 6 : 0))
      : max === G ? (B - R) / d + 2
        : (R - G) / d + 4;
  return { h: h / 6, s, l };
};

const hslToHex = ({ h, s, l }) => {
  const f = (n) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(v * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Lift only as far as legibility needs. Pushed higher (0.42+) a saturated
// dark red resolves to pure red and AAMU stops looking maroon; the panel is
// dark enough that this clears it with the identity intact.
const MIN_L = 0.34;

const barColor = (primary, secondary) => {
  const rgb = hexToRgb(primary);
  if (!rgb) return "#6B7280";
  const hsl = rgbToHsl(rgb);
  if (hsl.l >= MIN_L) return primary;

  // Achromatic and dark — the primary carries no hue to preserve, so use the
  // school's secondary when it has one bright enough to read.
  if (hsl.s < 0.12) {
    const alt = hexToRgb(secondary);
    if (alt) {
      const altHsl = rgbToHsl(alt);
      if (altHsl.l >= 0.3 && altHsl.s >= 0.2) return secondary;
    }
    return "#8A8A8F";
  }

  return hslToHex({ ...hsl, l: MIN_L });
};

// ─── Week control ────────────────────────────────────────────────────────────

// Every week gets an equal share of the full width, so the strip reads as one
// control rather than a row of loose chips. Mobile: 8 columns, wrapping to
// three rows. A week with nothing parsed is shown and unclickable.
const WeekControl = ({ weeks, value, onChange }) => (
  <Grid gap={1} w="100%" templateColumns={{ base: "repeat(8, minmax(0, 1fr))", lg: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
    {weeks.map((w) => {
      const active = w.week === value;
      return (
        <Flex
          key={w.week}
          as="button"
          type="button"
          disabled={!w.played}
          title={w.played ? `${w.label} · ${w.charted_count ?? w.final_count} charted` : `${w.label} · not played`}
          onClick={() => w.played && onChange(w.week)}
          minW={0}
          h="2.6rem"
          align="center"
          justify="center"
          borderRadius="md"
          bg={active ? "brand.500" : "whiteAlpha.100"}
          opacity={w.played ? 1 : 0.28}
          cursor={w.played ? "pointer" : "not-allowed"}
          _hover={w.played && !active ? { bg: "whiteAlpha.200" } : {}}
          style={{ transition: "background 0.12s" }}
        >
          <Text fontSize="0.95rem" fontWeight="900" color={active ? "white" : "whiteAlpha.700"} fontVariantNumeric="tabular-nums">
            {w.week}
          </Text>
        </Flex>
      );
    })}
  </Grid>
);

// ─── Bar shape ───────────────────────────────────────────────────────────────
// A custom shape rather than <Cell> + <LabelList>, because the shape receives
// the whole datum as `payload` — so the rect, both logos and the value all come
// from one place instead of three renderers each re-deriving the row. It also
// sidesteps the LabelList formatter-args drift noted in RosterHubCards.js:823.

const BarShape = (props) => {
  const { x, y, width, height, payload, onSelect } = props;
  if (!payload) return null;

  const { winner, loser, edge, provisional, route } = payload;
  // Logos track bar width so nine games stay legible without nine games'
  // worth of overlap, and one game doesn't get a comically large crest.
  const size = Math.max(16, Math.min(64, width * 0.65));
  const cx = x + width / 2;
  const up = edge >= 0;

  // Recharts reports a negative bar as either (y = zero line, height > 0) or
  // (y = value, height < 0) depending on version and axis setup. Deriving the
  // edges instead of trusting either convention is what stops a downward bar
  // collapsing to a 1px line — which is exactly what it did before.
  const top = Math.min(y, y + height);
  const h = Math.max(Math.abs(height), 2);
  const bottom = top + h;

  return (
    <g
      onClick={route ? () => onSelect(route) : undefined}
      style={{ cursor: route ? "pointer" : "default" }}
    >
      {/* The bar always carries the WINNING team's colour — that is the one
          identity a reader should be able to take from the chart at a glance,
          whichever side of the line the bar falls on. */}
      <rect
        x={x}
        y={top}
        width={width}
        height={h}
        rx={2}
        fill={provisional ? "transparent" : payload.fill}
        stroke={payload.fill}
        strokeWidth={provisional ? 1 : 0.5}
        strokeDasharray={provisional ? "3 2" : undefined}
        opacity={0.92}
      />

      {/* Value, just outside the bar's outer end */}
      <text
        x={cx}
        y={up ? top - size / 2 - 5 : bottom + size / 2 + 12}
        textAnchor="middle"
        fontSize={10}
        fontWeight={900}
        fill={up ? "rgba(255,255,255,0.75)" : OVERSTATED}
      >
        {net(edge)}
      </text>

      {/* Loser on the baseline, winner on the far end. `up` decides which
          physical edge each of those is. */}
      {winner.logo && (
        <image
          href={winner.logo}
          x={cx - size / 2}
          y={(up ? top : bottom) - size / 2}
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid meet"
        />
      )}
      {loser.logo && (
        <image
          href={loser.logo}
          x={cx - size * 0.38}
          y={(up ? bottom : top) - size * 0.38}
          width={size * 0.76}
          height={size * 0.76}
          opacity={0.55}
          preserveAspectRatio="xMidYMid meet"
        />
      )}
    </g>
  );
};

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const up = d.edge >= 0;
  return (
    <Box bg="#1C1C1F" border="1px solid" borderColor="whiteAlpha.200" borderRadius="md" px={3} py={2} boxShadow="0 0.5rem 1.5rem rgba(0,0,0,0.5)">
      <Text fontSize="11px" fontWeight="900" color="white">
        {d.winner.short} {d.winner.score}, {d.loser.short} {d.loser.score}
      </Text>
      <Text fontSize="10px" color={up ? "whiteAlpha.700" : OVERSTATED} mt={0.5}>
        {d.winner.short} {net(d.edge)} net success rate vs {d.loser.short} · {up ? "scoreboard and play agree" : `${d.loser.short} out-played the winner`}
      </Text>
      {d.provisional && <Text fontSize="9px" color="whiteAlpha.500" mt={1}>Provisional score — no parsed game yet</Text>}
    </Box>
  );
};

// ─── The chart ───────────────────────────────────────────────────────────────

const WeekChart = ({ games }) => {
  const navigate = useNavigate();

  // Ascending, so the games the scoreboard exaggerated lead — that ordering is
  // the question the card is named after.
  const rows = games
    .filter((g) => g.winner_edge != null)
    .sort((a, b) => a.winner_edge - b.winner_edge)
    .map((g) => {
      const winner = g.winner_id === g.home.id ? g.home : g.away;
      const loser = g.winner_id === g.home.id ? g.away : g.home;
      return {
        key: g.game_id,
        edge: g.winner_edge,
        label: `${winner.short} ${winner.score}-${loser.score}`,
        winner,
        loser,
        route: g.route,
        provisional: !!g.provisional,
        fill: barColor(winner.primary, winner.secondary),
      };
    });

  if (!rows.length) {
    return (
      <Flex h="240px" align="center" justify="center" border="1px dashed" borderColor="whiteAlpha.200" borderRadius="md" px={6}>
        <Text fontSize="xs" color="whiteAlpha.500" textAlign="center">
          No parsed games this week yet — a bar needs a parsed game file.
        </Text>
      </Flex>
    );
  }

  // Domain follows the week. Zero is always inside it so the baseline — the
  // line the whole card is read against — is never off-screen.
  const dataMax = Math.max(0, ...rows.map((r) => r.edge));
  const dataMin = Math.min(0, ...rows.map((r) => r.edge));
  const pad = Math.max((dataMax - dataMin) * 0.18, 0.02);
  const lo = dataMin - pad;
  const hi = dataMax + pad;
  // Ticks are built around zero rather than left to auto-ticking, which put a
  // "-0.003" gridline where the baseline belongs.
  const step = (hi - lo) / 8;
  const nice = [0.005, 0.01, 0.02, 0.025, 0.05, 0.1].find((v) => v >= step) ?? 0.1;
  const ticks = [];
  for (let v = Math.ceil(lo / nice) * nice; v <= hi + 1e-9; v += nice) ticks.push(Number(v.toFixed(4)));
  if (!ticks.some((t) => Math.abs(t) < 1e-9)) ticks.push(0);
  ticks.sort((a, b) => a - b);

  return (
    <Box>
      {/* ResponsiveContainer measures 0 unless the parent resolves a real
          height — same trap documented at RosterHubCards.js:584. */}
      <Box h={{ base: "320px", lg: "440px" }} w="100%" position="relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 16, right: 8, bottom: 4, left: 0 }} barCategoryGap="18%">
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" />
            <XAxis
              dataKey="label"
              interval={0}
              angle={-45}
              textAnchor="end"
              height={78}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700 }}
            />
            <YAxis
              domain={[lo, hi]}
              ticks={ticks}
              width={68}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
              // Net success rate: +0.100 = the winner succeeded on 10% more of its plays.
              tickFormatter={net}
              label={{ value: "Net Success Rate", angle: -90, position: "insideLeft", offset: 4, style: { fill: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 800, textAnchor: "middle", letterSpacing: "0.06em", textTransform: "uppercase" } }}
            />
            <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} content={<ChartTooltip />} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.35)" />
            <Bar
              dataKey="edge"
              maxBarSize={96}
              isAnimationActive={false}
              shape={<BarShape onSelect={(r) => navigate(r)} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

    </Box>
  );
};

// ─── Tab ─────────────────────────────────────────────────────────────────────

const WeekReviewTab = ({ review }) => {
  const [picked, setPicked] = useState(null);
  const cardRef = useRef(null);
  const week = picked ?? review.defaultWeek;
  const wk = review.weeks.find((w) => w.week === week) ?? review.weeks.find((w) => w.played);

  if (!wk) {
    return (
      <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={4}>
        <Text fontSize="sm" color="whiteAlpha.600">No weeks in this season yet.</Text>
      </Box>
    );
  }

  return (
    <Flex direction="column" gap={4}>
      {/* Own header rather than the shared Section: the title is the card's
          whole point here, so it carries the weight instead of an accent tick. */}
      <Box ref={cardRef} bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={{ base: 4, lg: 5 }}>
        <Flex align="baseline" justify="space-between" gap={4} wrap="wrap" mb={4}>
          <Text
            fontSize={{ base: "1.35rem", lg: "1.9rem" }}
            fontWeight="900"
            fontStyle="italic"
            color="white"
            textTransform="uppercase"
            letterSpacing="-0.02em"
            lineHeight={1}
          >
            Did We Really Get Beat That Bad?
          </Text>
          <Text w="100%" order={1} fontSize={{ base: "0.95rem", lg: "1.2rem" }} fontWeight="900" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={1} mt={-2}>
            Net Success Rates in {wk.label}
          </Text>
          <Flex align="center" gap={3}>
            <ExportCardButton target={cardRef} filename={`did-we-really-get-beat-that-bad-${review.season ?? "season"}-week-${wk.week}.png`} />
          </Flex>
        </Flex>

        <Box mb={4} data-export-skip="true">
          <WeekControl weeks={review.weeks} value={wk.week} onChange={setPicked} />
        </Box>

        <WeekChart games={wk.games} />
      </Box>

    </Flex>
  );
};

export default WeekReviewTab;
