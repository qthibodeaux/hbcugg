// ARCHIVE (2026-10-03): the full home-tile face catalog before the cut to 5
// per tile. Not imported anywhere. Mobile versions of the Teams and Players
// faces live in ../HomeTeamsTileMobileFacesA.js / ../HomePlayersTileMobileFacesA.js.
import { Box, Flex, Text } from "@chakra-ui/react";
import { BigNumber, Headline, Mark, Micro } from "../../../molecules/home/LiveTile";
import { teamLogo, teamMeta, teamShort, withAlpha } from "../../../game/export/exportData";

// ─────────────────────────────────────────────────────────────────────────────
// HOME STATS TILE — 28 faces, one per item key in
// src/pages/stats/md/Home Stats Tile Fetch Contract.md.
//
// Each face takes one contract `item` and reads only its own `data`. Nothing
// here ranks, chooses or rewords: the backend sends the headline, the display
// strings and the five keys to rotate. FACES[item.key] is the whole API —
// production maps `rotation` → items → FACES and hands the list to LiveTile.
//
// Faces are deliberately not uniform. Everything is sized in cqmin off the
// tile (LiveTile is a size container); SVGs use raw hex, never tokens.
// ─────────────────────────────────────────────────────────────────────────────

const GOOD = "#22C55E";
const BAD = "#EF4444";
const INK = "rgba(255,255,255,0.88)";
const FAINT = "rgba(255,255,255,0.14)";
const DIM = "rgba(255,255,255,0.4)";
const PURPLE = "#C084FC";

const lum = (hex) => {
  const raw = String(hex ?? "").replace("#", "");
  if (raw.length !== 6) return 255;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(raw.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const lighten = (hex, k) => {
  const raw = hex.replace("#", "");
  const ch = [0, 2, 4].map((i) => Math.round(parseInt(raw.slice(i, i + 2), 16) + (255 - parseInt(raw.slice(i, i + 2), 16)) * k));
  return `#${ch.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
};

// A team color that reads on #141416: the primary, unless it is too dark,
// then whichever of secondary/accent is brighter.
export const vivid = (id) => {
  const c = teamMeta(id)?.colors ?? {};
  const options = [c.primary, c.secondary, c.accent].filter(Boolean);
  if (!options.length) return PURPLE;
  if (lum(options[0]) >= 70) return options[0];
  const best = options.reduce((b, x) => (lum(x) > lum(b) ? x : b), options[0]);
  return lum(best) >= 70 ? best : lighten(best, 0.55);
};

const scale = (v, d0, d1, r0, r1) => (d1 === d0 ? (r0 + r1) / 2 : r0 + ((v - d0) / (d1 - d0)) * (r1 - r0));
const extent = (arr) => [Math.min(...arr), Math.max(...arr)];

const Svg = ({ w, h, children, ...rest }) => (
  <Box as="svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" w="100%" h="100%" display="block" overflow="visible" {...rest}>
    {children}
  </Box>
);

const Logo = ({ id, x, y, s, opacity = 1 }) => (
  <image href={teamLogo(id)} x={x - s / 2} y={y - s / 2} width={s} height={s} opacity={opacity} preserveAspectRatio="xMidYMid meet" />
);

const Title = ({ children, color = DIM, ...rest }) => <Micro color={color} size={2.6} {...rest}>{children}</Micro>;

// ── 1 · Metric of the Week — the whole league on one number line ────────────
const MetricOfWeek = ({ item }) => {
  const d = item.data;
  const vals = d.values.map((v) => v.value);
  const [lo, hi] = extent([...vals, d.league_avg]);
  const x = (v) => scale(v, lo, hi, 20, 580);
  const accent = vivid(d.leader_id);
  return (
    <Flex direction="column" h="100%" gap="3cqmin">
      <Title color={accent}>{item.title} · {d.metric_label}</Title>
      <Flex align="center" gap="5cqmin" flex={1} minH={0}>
        <Mark logo={teamLogo(d.leader_id)} label={teamShort(d.leader_id)} size={30} />
        <Flex direction="column" gap="2cqmin" minW={0}>
          <BigNumber size={17} color={accent}>{item.primary.display}</BigNumber>
          <Headline size={5.2} lines={3}>{item.headline}</Headline>
        </Flex>
      </Flex>
      <Box h="22cqmin" flexShrink={0}>
        <Svg w={600} h={110}>
          <line x1={10} x2={590} y1={62} y2={62} stroke={FAINT} strokeWidth={2} />
          <line x1={x(d.league_avg)} x2={x(d.league_avg)} y1={30} y2={94} stroke={DIM} strokeWidth={2} strokeDasharray="4 4" />
          <text x={x(d.league_avg)} y={108} fill={DIM} fontSize={13} fontWeight={800} textAnchor="middle" letterSpacing="2">AVG {d.league_avg_display}</text>
          {d.values.map((v, i) => {
            const lead = v.team_id === d.leader_id;
            const y = lead ? 62 : i % 2 ? 40 : 84;
            return (
              <g key={v.team_id}>
                {!lead && <line x1={x(v.value)} x2={x(v.value)} y1={62} y2={y} stroke={FAINT} strokeWidth={1.5} />}
                <Logo id={v.team_id} x={x(v.value)} y={y} s={lead ? 50 : 24} opacity={lead ? 1 : 0.55} />
              </g>
            );
          })}
        </Svg>
      </Box>
    </Flex>
  );
};

// ── 2 · League Map — offense vs defense, four quadrants ──────────────────────
const LeagueMap = ({ item }) => {
  const d = item.data;
  const xs = d.teams.map((t) => t.x);
  const ys = d.teams.map((t) => t.y);
  const [x0, x1] = extent(xs);
  const [y0, y1] = extent(ys);
  const W = 600;
  const H = 360;
  const px = (v) => scale(v, x0, x1, 40, W - 40);
  // Lower defensive EPA is better, so better defenses sit higher.
  const py = (v) => (d.y_lower_is_better ? scale(v, y0, y1, 34, H - 34) : scale(v, y0, y1, H - 34, 34));
  const cx = px(d.league_x);
  const cy = py(d.league_y);
  const corner = { fill: DIM, fontSize: 12, fontWeight: 900, letterSpacing: "2" };
  return (
    <Box position="relative" h="100%">
      <Svg w={W} h={H}>
        <rect x={cx} y={0} width={W - cx} height={cy} fill={withAlpha(GOOD, 0.07)} />
        <rect x={0} y={cy} width={cx} height={H - cy} fill={withAlpha(BAD, 0.07)} />
        <line x1={cx} x2={cx} y1={0} y2={H} stroke={FAINT} strokeWidth={2} />
        <line x1={0} x2={W} y1={cy} y2={cy} stroke={FAINT} strokeWidth={2} />
        <text x={W - 8} y={18} textAnchor="end" {...corner}>GOOD BOTH WAYS</text>
        <text x={8} y={H - 8} {...corner}>STRUGGLING</text>
        <text x={W - 8} y={H - 8} textAnchor="end" {...corner}>OFFENSE CARRIES</text>
        <text x={8} y={18} {...corner}>DEFENSE CARRIES</text>
        {d.teams.map((t) => (
          <Logo key={t.team_id} id={t.team_id} x={px(t.x)} y={py(t.y)} s={34} />
        ))}
      </Svg>
      <Box position="absolute" left={0} bottom="9cqmin" maxW="62%" pointerEvents="none">
        <Title color={PURPLE} mb="1cqmin">{item.title}</Title>
        <Headline size={5} lines={2} textShadow="0 2px 10px rgba(0,0,0,0.8)">{item.headline}</Headline>
      </Box>
    </Box>
  );
};

// ── 3 · Best Team, Adjusted — a power ladder ─────────────────────────────────
const AdjustedLeader = ({ item }) => {
  const rows = item.data.rows;
  const max = Math.max(...rows.map((r) => Math.abs(r.value)));
  const lead = rows[0].team_id;
  return (
    <Flex h="100%" gap="5cqmin">
      <Flex direction="column" justify="space-between" w="44%" flexShrink={0}>
        <Title>{item.title}</Title>
        <Box>
          <Mark logo={teamLogo(lead)} label={teamShort(lead)} size={22} />
          <BigNumber size={15} color={vivid(lead)} mt="2cqmin">{item.primary.display}</BigNumber>
          <Micro size={2.4} mt="1cqmin">{item.primary.label}</Micro>
        </Box>
        <Headline size={4.8} lines={3}>{item.headline}</Headline>
      </Flex>
      <Flex direction="column" justify="space-between" flex={1} minW={0} py="1cqmin">
        {rows.map((r, i) => (
          <Flex key={r.team_id} align="center" gap="1.5cqmin" h={`${100 / rows.length}%`}>
            <Text w="4cqmin" fontSize="2.2cqmin" fontWeight="black" color={DIM} textAlign="right">{i + 1}</Text>
            <Box flex={1} position="relative" h="60%">
              <Box
                position="absolute"
                left={r.value >= 0 ? "50%" : `${50 - (Math.abs(r.value) / max) * 50}%`}
                w={`${(Math.abs(r.value) / max) * 50}%`}
                h="100%"
                bg={i === 0 ? vivid(r.team_id) : r.value >= 0 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.12)"}
                borderRadius="sm"
              />
            </Box>
            <Mark logo={teamLogo(r.team_id)} label={teamShort(r.team_id)} size={3.6} />
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

// ── 4 · Efficiency King — ten snaps, the successful ones lit ─────────────────
const EfficiencyKing = ({ item }) => {
  const d = item.data;
  const lit = Math.round(d.rate * 10);
  const league = Math.round(d.league_rate * 10);
  const accent = vivid(d.team_id);
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Flex align="center" gap="3cqmin">
        <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={12} />
        <Title>{item.title}</Title>
      </Flex>
      <Flex align="baseline" gap="3cqmin">
        <BigNumber size={30} color={accent}>{lit}</BigNumber>
        <Headline size={7} color={DIM} lines={1}>of every 10</Headline>
      </Flex>
      <Flex gap="1.6cqmin" h="16cqmin">
        {Array.from({ length: 10 }, (_, i) => (
          <Box
            key={i}
            flex={1}
            borderRadius="md"
            bg={i < lit ? accent : "transparent"}
            border="0.5cqmin solid"
            borderColor={i < lit ? accent : FAINT}
            position="relative"
          >
            {i === league - 1 ? <Box position="absolute" bottom="-3cqmin" left="50%" w="0.5cqmin" h="2cqmin" bg={DIM} /> : null}
          </Box>
        ))}
      </Flex>
      <Headline size={5} lines={2}>{item.headline}</Headline>
    </Flex>
  );
};

// ── 5 · Win Lever — the dots line up ─────────────────────────────────────────
const fitLine = (pts) => {
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  const sxy = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  const sxx = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0) || 1;
  const b = sxy / sxx;
  return (x) => my + b * (x - mx);
};

const Scatter = ({ points, color, line, W = 600, H = 300, dot = 9 }) => {
  const [x0, x1] = extent(points.map((p) => p.x));
  const px = (v) => scale(v, x0, x1, 20, W - 20);
  const py = (v) => scale(v, 0, 1, H - 16, 16);
  const f = line ? fitLine(points) : null;
  return (
    <Svg w={W} h={H}>
      <line x1={0} x2={W} y1={H - 4} y2={H - 4} stroke={FAINT} strokeWidth={2} />
      {f ? <line x1={px(x0)} y1={py(f(x0))} x2={px(x1)} y2={py(f(x1))} stroke={color} strokeWidth={4} strokeLinecap="round" opacity={0.85} /> : null}
      {points.map((p) => (
        <circle key={p.team_id} cx={px(p.x)} cy={py(p.y)} r={dot} fill={line ? "#fff" : DIM} opacity={line ? 0.9 : 0.6} />
      ))}
    </Svg>
  );
};

const WinLever = ({ item }) => (
  <Flex direction="column" h="100%" gap="2cqmin">
    <Flex justify="space-between" align="flex-start" gap="4cqmin">
      <Box>
        <Title color={PURPLE}>{item.title}</Title>
        <Text fontSize="4.2cqmin" fontWeight="black" color="white" textTransform="uppercase" mt="1cqmin" lineClamp={1}>{item.data.metric_label}</Text>
      </Box>
      <Box textAlign="right">
        <BigNumber size={13} color={PURPLE}>{item.primary.display}</BigNumber>
        <Micro size={2.2}>{item.primary.label}</Micro>
      </Box>
    </Flex>
    <Box flex={1} minH={0}>
      <Scatter points={item.data.points} color={PURPLE} line />
    </Box>
    <Headline size={4.8} lines={2}>{item.headline}</Headline>
  </Flex>
);

// ── 6 · Noise Stat — a shapeless cloud ───────────────────────────────────────
const NoiseStat = ({ item }) => (
  <Box position="relative" h="100%">
    <Box position="absolute" inset={0} opacity={0.8}>
      <Scatter points={item.data.points} color={DIM} dot={11} />
    </Box>
    <Flex position="absolute" inset={0} direction="column" justify="space-between">
      <Title>{item.title}</Title>
      <Flex direction="column" align="center">
        <Text fontSize="34cqmin" fontWeight="black" fontStyle="italic" lineHeight={0.9} color="white" textShadow="0 4px 30px rgba(0,0,0,0.9)">≈ 0</Text>
        <Micro size={2.4} color={INK}>r = {item.primary.display}</Micro>
      </Flex>
      <Headline size={5} lines={2} textShadow="0 2px 12px rgba(0,0,0,0.9)">{item.headline}</Headline>
    </Flex>
  </Box>
);

// ── 7 / 8 · Record vs numbers — two ladders, the logo climbs or falls ───────
const RankLadders = ({ item }) => {
  const d = item.data;
  const n = d.ranked_teams;
  const accent = vivid(d.team_id);
  const up = d.profile_rank < d.record_rank;
  const W = 260;
  const H = 400;
  const y = (rank) => scale(rank, 1, n, 22, H - 22);
  return (
    <Flex h="100%" gap="4cqmin">
      <Box w="42%" flexShrink={0} h="100%">
        <Svg w={W} h={H}>
          {[60, 200].map((x) => (
            <g key={x}>
              <line x1={x} x2={x} y1={10} y2={H - 10} stroke={FAINT} strokeWidth={3} />
              {Array.from({ length: n }, (_, i) => (
                <line key={i} x1={x - 12} x2={x + 12} y1={y(i + 1)} y2={y(i + 1)} stroke={FAINT} strokeWidth={2} />
              ))}
            </g>
          ))}
          <text x={60} y={H} fill={DIM} fontSize={15} fontWeight={900} textAnchor="middle" letterSpacing="2">RECORD</text>
          <text x={200} y={H} fill={DIM} fontSize={15} fontWeight={900} textAnchor="middle" letterSpacing="2">NUMBERS</text>
          <line x1={60} y1={y(d.record_rank)} x2={200} y2={y(d.profile_rank)} stroke={up ? GOOD : BAD} strokeWidth={5} strokeLinecap="round" />
          <circle cx={60} cy={y(d.record_rank)} r={9} fill="#fff" />
          <Logo id={d.team_id} x={200} y={y(d.profile_rank)} s={56} />
          <text x={30} y={y(d.record_rank) + 6} fill={INK} fontSize={18} fontWeight={900} textAnchor="end">{d.record_rank}</text>
          <text x={238} y={y(d.profile_rank) + 6} fill={INK} fontSize={18} fontWeight={900}>{d.profile_rank}</text>
        </Svg>
      </Box>
      <Flex direction="column" justify="space-between" flex={1} minW={0}>
        <Title color={accent}>{item.title}</Title>
        <Box>
          <BigNumber size={16} color={up ? GOOD : BAD}>{up ? "▲" : "▼"} {item.primary.display}</BigNumber>
          <Text fontSize="5cqmin" fontWeight="black" color={DIM} mt="1cqmin">{d.record}</Text>
        </Box>
        <Headline size={5} lines={3}>{item.headline}</Headline>
      </Flex>
    </Flex>
  );
};

// ── 9 · Statistical Twins — two profiles laid on top of each other ──────────
const Twins = ({ item }) => {
  const [a, b] = item.teams;
  const levers = item.data.levers;
  const R = 120;
  const pt = (z, i) => {
    const ang = (Math.PI * 2 * i) / levers.length - Math.PI / 2;
    const r = scale(Math.max(-2.5, Math.min(2.5, z)), -2.5, 2.5, 14, R);
    return [150 + r * Math.cos(ang), 150 + r * Math.sin(ang)];
  };
  const poly = (k) => levers.map((l, i) => pt(l[k], i).join(",")).join(" ");
  const ca = vivid(a);
  const cb = vivid(b);
  return (
    <Flex h="100%" gap="4cqmin" align="center">
      <Box w="50%" maxH="100%" aspectRatio="1" flexShrink={0} alignSelf="center">
        <Svg w={300} h={300}>
          {[0.33, 0.66, 1].map((k) => (
            <circle key={k} cx={150} cy={150} r={R * k} fill="none" stroke={FAINT} strokeWidth={1.5} />
          ))}
          <polygon points={poly("a")} fill={withAlpha(ca, 0.3)} stroke={ca} strokeWidth={3} />
          <polygon points={poly("b")} fill={withAlpha(cb, 0.3)} stroke={cb} strokeWidth={3} strokeDasharray="7 5" />
        </Svg>
      </Box>
      <Flex direction="column" justify="space-between" h="100%" minW={0} flex={1}>
        <Title>{item.title}</Title>
        <Flex align="center" gap="2cqmin">
          <Mark logo={teamLogo(a)} label={teamShort(a)} size={16} />
          <Text fontSize="9cqmin" fontWeight="black" color={DIM}>=</Text>
          <Mark logo={teamLogo(b)} label={teamShort(b)} size={16} />
        </Flex>
        <Headline size={4.4} lines={4}>{item.headline}</Headline>
      </Flex>
    </Flex>
  );
};

// ── 10 · One of a Kind — everyone near the middle, one team far out ─────────
const OneOfAKind = ({ item }) => {
  const d = item.data;
  const max = Math.max(...d.distances.map((x) => x.value));
  const accent = vivid(d.team_id);
  return (
    <Box position="relative" h="100%">
      <Box position="absolute" top={0} bottom={0} right={0} w="62%">
        <Svg w={360} h={300}>
          {[0.33, 0.66, 1].map((k) => (
            <circle key={k} cx={130} cy={150} r={130 * k} fill="none" stroke={FAINT} strokeWidth={1.5} />
          ))}
          <circle cx={130} cy={150} r={4} fill={DIM} />
          {d.distances.map((x, i) => {
            const me = x.team_id === d.team_id;
            const r = scale(x.value, 0, max, 0, 130);
            const ang = me ? -0.15 : (i * 2.39996) % (Math.PI * 2);
            const cx = 130 + r * Math.cos(ang);
            const cy = 150 + r * Math.sin(ang);
            return me ? <Logo key={x.team_id} id={x.team_id} x={cx + 30} y={cy} s={64} /> : <circle key={x.team_id} cx={cx} cy={cy} r={7} fill="rgba(255,255,255,0.35)" />;
          })}
        </Svg>
      </Box>
      <Flex position="relative" direction="column" justify="space-between" h="100%" w="48%">
        <Title color={accent}>{item.title}</Title>
        <Box>
          <BigNumber size={14} color={accent}>{item.primary.display}</BigNumber>
          <Micro size={2.3} mt="1cqmin">{item.primary.label}</Micro>
        </Box>
        <Headline size={5.2} lines={3}>{item.headline}</Headline>
      </Flex>
    </Box>
  );
};

// ── 11 · SWAC vs MEAC — the tile split down the middle ──────────────────────
const ConferenceSplit = ({ item }) => {
  const { swac, meac, metric_label: label } = item.data;
  const side = (name, v, align) => (
    <Flex direction="column" flex={1} justify="center" align={align} px="3cqmin">
      <Text fontSize="5cqmin" fontWeight="black" color={DIM} letterSpacing="0.2em">{name}</Text>
      <BigNumber size={20}>{v.display}</BigNumber>
    </Flex>
  );
  return (
    <Flex direction="column" h="100%" gap="2cqmin">
      <Flex justify="space-between">
        <Title>{item.title}</Title>
        <Title color={INK}>{label}</Title>
      </Flex>
      <Flex flex={1} minH={0} position="relative">
        {side("SWAC", swac, "flex-start")}
        <Box w="0.5cqmin" bg="linear-gradient(180deg, transparent, rgba(255,255,255,0.5), transparent)" />
        {side("MEAC", meac, "flex-end")}
        <Flex position="absolute" left="50%" top="50%" transform="translate(-50%,-50%)" bg="#141416" px="2cqmin" py="1cqmin" borderRadius="md" border="1px solid" borderColor="whiteAlpha.300">
          <Text fontSize="3.4cqmin" fontWeight="black" color={PURPLE} whiteSpace="nowrap">{item.primary.display}</Text>
        </Flex>
      </Flex>
      <Headline size={5} lines={2} textAlign="center">{item.headline}</Headline>
    </Flex>
  );
};

// ── 12 · Parity Meter — one column per season, this one lit ─────────────────
const ParityMeter = ({ item }) => {
  const { seasons, current } = item.data;
  const max = Math.max(...seasons.map((s) => s.spread));
  return (
    <Flex h="100%" gap="5cqmin">
      <Flex direction="column" justify="space-between" w="40%" flexShrink={0}>
        <Title>{item.title}</Title>
        <BigNumber size={14} color={PURPLE}>{item.primary.display}</BigNumber>
        <Headline size={5} lines={4}>{item.headline}</Headline>
      </Flex>
      <Flex flex={1} align="flex-end" gap="2.5cqmin" minW={0}>
        {seasons.map((s) => {
          const on = s.season === current;
          return (
            <Flex key={s.season} direction="column" align="center" flex={1} h="100%" justify="flex-end" gap="1.5cqmin">
              <Box w="100%" h={`${(s.spread / max) * 78}%`} bg={on ? PURPLE : "rgba(255,255,255,0.13)"} borderRadius="sm" />
              <Text fontSize="2.6cqmin" fontWeight="black" color={on ? "white" : DIM}>’{String(s.season).slice(2)}</Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};

// ── 13 · Biggest Mover — slope lines, one bold ──────────────────────────────
const BiggestMover = ({ item }) => {
  const d = item.data;
  const all = d.teams.flatMap((t) => [t.before, t.after]);
  const [lo, hi] = extent(all);
  const y = (v) => scale(v, lo, hi, 280, 20);
  const me = d.teams.find((t) => t.team_id === d.team_id);
  const accent = vivid(d.team_id);
  return (
    <Flex h="100%" gap="4cqmin">
      <Box flex={1} minW={0}>
        <Svg w={300} h={300}>
          <text x={30} y={300} fill={DIM} fontSize={13} fontWeight={900} textAnchor="middle" letterSpacing="2">LAST WK</text>
          <text x={240} y={300} fill={DIM} fontSize={13} fontWeight={900} textAnchor="middle" letterSpacing="2">THIS WK</text>
          {d.teams.filter((t) => t.team_id !== d.team_id).map((t) => (
            <line key={t.team_id} x1={30} y1={y(t.before)} x2={240} y2={y(t.after)} stroke="rgba(255,255,255,0.16)" strokeWidth={2} />
          ))}
          <line x1={30} y1={y(me.before)} x2={240} y2={y(me.after)} stroke={accent} strokeWidth={6} strokeLinecap="round" />
          <circle cx={30} cy={y(me.before)} r={8} fill={accent} />
          <Logo id={me.team_id} x={272} y={y(me.after)} s={52} />
        </Svg>
      </Box>
      <Flex direction="column" justify="space-between" w="44%" flexShrink={0}>
        <Title color={accent}>{item.title}</Title>
        <Box>
          <BigNumber size={17} color={GOOD}>{item.primary.display}</BigNumber>
          <Micro size={2.3} mt="1cqmin">{item.primary.label}</Micro>
        </Box>
        <Headline size={5} lines={3}>{item.headline}</Headline>
      </Flex>
    </Flex>
  );
};

// ── 14 · Points Per Drive — every possession as a column of points ──────────
const PointsPerDrive = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  return (
    <Flex direction="column" h="100%" gap="3cqmin">
      <Flex justify="space-between" align="flex-start">
        <Flex align="center" gap="3cqmin">
          <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={13} />
          <Title>{item.title}</Title>
        </Flex>
        <BigNumber size={18} color={accent}>{item.primary.display}</BigNumber>
      </Flex>
      <Flex flex={1} minH={0} align="flex-end" gap="0.8cqmin" borderBottom="0.4cqmin solid" borderColor={FAINT}>
        {d.drives.map((dr, i) => (
          <Box
            key={i}
            flex={1}
            h={dr.points ? `${(dr.points / 7) * 100}%` : "3%"}
            bg={dr.points === 7 ? accent : dr.points ? withAlpha(accent, 0.45) : "rgba(255,255,255,0.15)"}
            borderTopRadius="sm"
          />
        ))}
      </Flex>
      <Headline size={4.8} lines={2}>{item.headline}</Headline>
    </Flex>
  );
};

// ── 15 · Explosive Drives — a drive chart, the explosive arcs lit ───────────
const ExplosiveDrives = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  const W = 600;
  const H = 230;
  const x = (yd) => scale(yd, 0, 80, 20, W - 20);
  return (
    <Flex direction="column" h="100%" gap="2cqmin">
      <Flex justify="space-between" align="center">
        <Title color={accent}>{item.title}</Title>
        <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={10} />
      </Flex>
      <Box flex={1} minH={0}>
        <Svg w={W} h={H}>
          {[0, 20, 40, 60, 80].map((yd) => (
            <line key={yd} x1={x(yd)} x2={x(yd)} y1={H - 30} y2={H - 14} stroke={FAINT} strokeWidth={2} />
          ))}
          <line x1={20} x2={W - 20} y1={H - 22} y2={H - 22} stroke={FAINT} strokeWidth={2} />
          {d.drives.map((dr, i) => {
            const x1 = x(dr.yards);
            const h = Math.min(H - 40, dr.yards * 2.4 + 10);
            return (
              <path
                key={i}
                d={`M ${x(0)} ${H - 22} Q ${(x(0) + x1) / 2} ${H - 22 - h * 1.6} ${x1} ${H - 22}`}
                fill="none"
                stroke={dr.explosive ? accent : "rgba(255,255,255,0.14)"}
                strokeWidth={dr.explosive ? 4 : 2}
              />
            );
          })}
        </Svg>
      </Box>
      <Flex align="baseline" gap="4cqmin">
        <BigNumber size={13} color={accent}>{item.primary.display}</BigNumber>
        <Headline size={4.6} lines={2} flex={1}>{item.headline}</Headline>
      </Flex>
    </Flex>
  );
};

// ── 16 · Finishing Drives — the field from the 40 in, every trip marked ────
const RESULT = { T: { label: "TD", color: GOOD }, F: { label: "FG", color: "#EAB308" }, O: { label: "—", color: BAD } };
const FinishingDrives = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  return (
    <Flex direction="column" h="100%" gap="3cqmin">
      <Flex justify="space-between" align="center">
        <Title color={accent}>{item.title}</Title>
        <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={10} />
      </Flex>
      <Flex flex={1} minH={0} borderRadius="md" overflow="hidden" border="1px solid" borderColor={FAINT}>
        <Flex flex={4} position="relative" bg="rgba(34,197,94,0.06)">
          {[0, 1, 2, 3].map((k) => (
            <Box key={k} position="absolute" left={`${k * 25}%`} top={0} bottom={0} borderLeft="1px solid" borderColor={FAINT}>
              <Text fontSize="2.4cqmin" fontWeight="black" color={DIM} pl="1cqmin" pt="1cqmin">{40 - k * 10}</Text>
            </Box>
          ))}
          <Flex position="absolute" inset={0} align="center" justify="center" direction="column">
            <BigNumber size={22}>{item.primary.display}</BigNumber>
            <Micro size={2.3}>{item.primary.label}</Micro>
          </Flex>
        </Flex>
        <Flex flex={1.1} direction="column" wrap="wrap" align="center" justify="center" gap="0.8cqmin" bg={withAlpha(accent, 0.18)} p="1cqmin">
          {d.trips.map((t, i) => (
            <Box key={i} w="3.4cqmin" h="3.4cqmin" borderRadius="full" bg={RESULT[t.result].color} />
          ))}
        </Flex>
      </Flex>
      <Headline size={4.8} lines={2}>{item.headline}</Headline>
    </Flex>
  );
};

// ── 17 · Havoc Leader — 100 snaps, the wrecked ones filled ──────────────────
const HavocLeader = ({ item }) => {
  const d = item.data;
  const filled = Math.round((d.havoc_plays / d.snaps) * 100);
  const league = Math.round(d.league_rate * 100);
  const accent = vivid(d.team_id);
  return (
    <Flex h="100%" gap="5cqmin">
      <Box w="48%" maxH="100%" aspectRatio="1" flexShrink={0} alignSelf="center" display="grid" gridTemplateColumns="repeat(10, 1fr)" gap="0.7cqmin">
        {Array.from({ length: 100 }, (_, i) => (
          <Box key={i} borderRadius="0.6cqmin" bg={i < filled ? accent : i < league ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)"} />
        ))}
      </Box>
      <Flex direction="column" justify="space-between" minW={0} flex={1}>
        <Flex align="center" gap="2cqmin">
          <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={11} />
          <Title color={accent}>{item.title}</Title>
        </Flex>
        <Box>
          <BigNumber size={18} color={accent}>{filled}</BigNumber>
          <Micro size={2.3}>of every 100 snaps</Micro>
        </Box>
        <Headline size={4.8} lines={3}>{item.headline}</Headline>
      </Flex>
    </Flex>
  );
};

// ── 18 · Front Seven vs Secondary — where the havoc lives ───────────────────
const HavocSplit = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  const max = Math.max(d.front_seven.rate, d.db.rate, d.league_front_seven, d.league_db) * 1.15;
  const bar = (label, v, league) => (
    <Flex direction="column" align="center" h="100%" flex={1} justify="flex-end" gap="1.5cqmin">
      <Text fontSize="6cqmin" fontWeight="black" fontStyle="italic" color="white">{v.display}</Text>
      <Box position="relative" w="100%" h={`${(v.rate / max) * 52}%`} bg={accent} borderTopRadius="md">
        <Box position="absolute" left="-8%" right="-8%" bottom={`${(league / v.rate) * 100}%`} h="0.5cqmin" bg="white" opacity={0.6} />
      </Box>
      <Micro size={2.4} color={INK}>{label}</Micro>
    </Flex>
  );
  return (
    <Flex h="100%" gap="5cqmin">
      <Flex direction="column" justify="space-between" w="46%" flexShrink={0}>
        <Title color={accent}>{item.title}</Title>
        <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={20} />
        <Headline size={5.2} lines={3}>{item.headline}</Headline>
      </Flex>
      <Flex flex={1} gap="4cqmin" minW={0}>
        {bar("Front seven", d.front_seven, d.league_front_seven)}
        {bar("Secondary", d.db, d.league_db)}
      </Flex>
    </Flex>
  );
};

// ── 19 · Drive Killers — opponent drives, the stopped ones filled ───────────
const STOP = new Set(["punt", "turnover", "downs"]);
const DriveKillers = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  return (
    <Flex direction="column" h="100%" gap="3cqmin">
      <Flex align="center" gap="3cqmin">
        <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={12} />
        <Title color={accent}>{item.title}</Title>
        <BigNumber size={13} ml="auto" color={accent}>{item.primary.display}</BigNumber>
      </Flex>
      <Box flex={1} minH={0} display="grid" gridTemplateColumns="repeat(10, 1fr)" gridTemplateRows={`repeat(${Math.ceil(d.drives.length / 10)}, minmax(0, 1fr))`} gap="1cqmin">
        {d.drives.map((dr, i) => {
          const stop = STOP.has(dr.result);
          return (
            <Flex key={i} align="center" justify="center" borderRadius="sm" bg={stop ? accent : "transparent"} border="0.4cqmin solid" borderColor={stop ? accent : "rgba(239,68,68,0.55)"}>
              <Text fontSize="2cqmin" fontWeight="black" color={stop ? "#0B0B0D" : "rgba(239,68,68,0.9)"} textTransform="uppercase">
                {dr.result === "turnover" ? "TO" : dr.result === "punt" ? "P" : dr.result === "downs" ? "D" : dr.result === "td" ? "TD" : dr.result === "fg" ? "FG" : "·"}
              </Text>
            </Flex>
          );
        })}
      </Box>
      <Headline size={4.8} lines={2}>{item.headline}</Headline>
    </Flex>
  );
};

// ── 20 · Third Down Over Expected — what should have happened vs what did ──
const ThirdDown = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  const row = (label, v, color) => (
    <Flex align="center" gap="3cqmin">
      <Micro w="22cqmin" size={2.4} color={INK}>{label}</Micro>
      <Box flex={1} h="7cqmin" bg="rgba(255,255,255,0.06)" borderRadius="sm" overflow="hidden">
        <Box h="100%" w={`${v * 100}%`} bg={color} />
      </Box>
      <Text w="14cqmin" fontSize="5cqmin" fontWeight="black" color="white" textAlign="right">{Math.round(v * 100)}%</Text>
    </Flex>
  );
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Flex align="center" gap="3cqmin">
        <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={12} />
        <Title color={accent}>{item.title}</Title>
      </Flex>
      <BigNumber size={22} color={GOOD}>{item.primary.display}</BigNumber>
      <Flex direction="column" gap="2cqmin">
        {row("Expected", d.expected, "rgba(255,255,255,0.25)")}
        {row("Actual", d.actual, accent)}
      </Flex>
      <Headline size={4.8} lines={2}>{item.headline}</Headline>
    </Flex>
  );
};

// ── 21 · Turnover Luck — the bounces, counted ───────────────────────────────
const Ball = ({ on, ghost }) => (
  <Box as="svg" viewBox="0 0 40 24" w="11cqmin" h="6.6cqmin">
    <ellipse cx={20} cy={12} rx={18} ry={10} fill={ghost ? "none" : on} stroke={ghost ? DIM : on} strokeWidth={2} strokeDasharray={ghost ? "3 3" : undefined} />
    {!ghost && <line x1={13} x2={27} y1={12} y2={12} stroke="#141416" strokeWidth={2} />}
  </Box>
);
const TurnoverLuck = ({ item }) => {
  const d = item.data;
  const bad = item.primary.value < 0;
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Flex align="center" gap="3cqmin">
        <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={12} />
        <Title>{item.title}</Title>
        <BigNumber size={13} ml="auto" color={bad ? BAD : GOOD}>{item.primary.display}</BigNumber>
      </Flex>
      <Flex direction="column" gap="2.5cqmin">
        <Flex align="center" gap="2cqmin">
          <Micro w="20cqmin" size={2.4} color={INK}>Should have</Micro>
          {Array.from({ length: Math.round(d.expected) }, (_, i) => <Ball key={i} ghost />)}
          <Text fontSize="6cqmin" fontWeight="black" color={DIM}>{d.expected}</Text>
        </Flex>
        <Flex align="center" gap="2cqmin">
          <Micro w="20cqmin" size={2.4} color={INK}>Did</Micro>
          {Array.from({ length: d.actual }, (_, i) => <Ball key={i} on={i < Math.round(d.expected) ? "rgba(255,255,255,0.7)" : BAD} />)}
          <Text fontSize="6cqmin" fontWeight="black" color="white">{d.actual}</Text>
        </Flex>
      </Flex>
      <Headline size={5} lines={2}>{item.headline}</Headline>
    </Flex>
  );
};

// ── 22 · Middle 8 — the clock, with the eight minutes around halftime ──────
const arc = (cx, cy, r, a0, a1) => {
  const p = (a) => [cx + r * Math.cos(a - Math.PI / 2), cy + r * Math.sin(a - Math.PI / 2)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1}`;
};
const MiddleEight = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  const min = (m) => (m / 60) * Math.PI * 2;
  return (
    <Flex h="100%" gap="5cqmin" align="center">
      <Box w="52%" maxH="100%" aspectRatio="1" flexShrink={0} alignSelf="center" position="relative">
        <Svg w={300} h={300}>
          <circle cx={150} cy={150} r={128} fill="none" stroke={FAINT} strokeWidth={14} />
          {[0, 15, 30, 45].map((m) => {
            const a = min(m) - Math.PI / 2;
            return <line key={m} x1={150 + 112 * Math.cos(a)} y1={150 + 112 * Math.sin(a)} x2={150 + 144 * Math.cos(a)} y2={150 + 144 * Math.sin(a)} stroke={DIM} strokeWidth={3} />;
          })}
          <path d={arc(150, 150, 128, min(26), min(34))} fill="none" stroke={accent} strokeWidth={22} strokeLinecap="round" />
        </Svg>
        <Flex position="absolute" inset={0} direction="column" align="center" justify="center">
          <Text fontSize="10cqmin" fontWeight="black" fontStyle="italic" color="white" lineHeight={1}>{d.points_for}–{d.points_against}</Text>
          <Text fontSize="5cqmin" fontWeight="black" color={GOOD}>{item.primary.display}</Text>
        </Flex>
      </Box>
      <Flex direction="column" justify="space-between" h="100%" minW={0} flex={1}>
        <Title color={accent}>{item.title}</Title>
        <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={16} />
        <Headline size={4.4} lines={4}>{item.headline}</Headline>
      </Flex>
    </Flex>
  );
};

// ── 23 · Trench Report — yards gained at the line ───────────────────────────
const TrenchReport = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  const W = 600;
  const x = (yd) => scale(yd, -1, 5, 40, W - 20);
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Flex align="center" gap="3cqmin">
        <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={12} />
        <Title color={accent}>{item.title}</Title>
      </Flex>
      <Box h="34cqmin">
        <Svg w={W} h={170}>
          {[-1, 0, 1, 2, 3, 4, 5].map((yd) => (
            <g key={yd}>
              <line x1={x(yd)} x2={x(yd)} y1={10} y2={150} stroke={yd === 0 ? "#fff" : FAINT} strokeWidth={yd === 0 ? 4 : 1.5} />
              <text x={x(yd)} y={168} fill={DIM} fontSize={14} fontWeight={900} textAnchor="middle">{yd}</text>
            </g>
          ))}
          <rect x={x(0)} y={30} width={x(d.line_yards) - x(0)} height={44} fill={accent} rx={4} />
          <text x={x(d.line_yards) + 10} y={62} fill="#fff" fontSize={26} fontWeight={900}>{item.primary.display}</text>
          <rect x={x(0)} y={92} width={x(d.league_line_yards) - x(0)} height={30} fill="rgba(255,255,255,0.2)" rx={4} />
          <text x={x(d.league_line_yards) + 10} y={114} fill={DIM} fontSize={18} fontWeight={900}>AVG {d.league_line_yards}</text>
        </Svg>
      </Box>
      <Flex align="baseline" gap="3cqmin">
        <Micro size={2.4} color={INK} flexShrink={0}>Stuffed {Math.round(d.stuff_rate * 100)}%</Micro>
        <Micro size={2.4} flexShrink={0}>Avg {Math.round(d.league_stuff_rate * 100)}%</Micro>
      </Flex>
      <Headline size={5} lines={2}>{item.headline}</Headline>
    </Flex>
  );
};

// ── 24 · Field Position Battle — where each side's drives begin ─────────────
const FieldPosition = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  const W = 600;
  const x = (yd) => scale(yd, 0, 100, 20, W - 20);
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Title color={accent}>{item.title}</Title>
          <BigNumber size={16} color={GOOD} mt="2cqmin">{item.primary.display}</BigNumber>
          <Micro size={2.3} mt="1cqmin">{item.primary.label}</Micro>
        </Box>
        <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={18} />
      </Flex>
      <Box h="30cqmin">
        <Svg w={W} h={150}>
          <rect x={20} y={40} width={W - 40} height={70} fill="rgba(34,197,94,0.08)" stroke={FAINT} />
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((yd) => (
            <g key={yd}>
              <line x1={x(yd)} x2={x(yd)} y1={40} y2={110} stroke={FAINT} />
              <text x={x(yd)} y={132} fill={DIM} fontSize={13} fontWeight={900} textAnchor="middle">{yd > 50 ? 100 - yd : yd}</text>
            </g>
          ))}
          <rect x={x(d.opp_start)} y={62} width={x(d.own_start) - x(d.opp_start)} height={26} fill={withAlpha(accent, 0.5)} />
          <line x1={x(d.own_start)} x2={x(d.own_start)} y1={26} y2={124} stroke={accent} strokeWidth={5} />
          <line x1={x(d.opp_start)} x2={x(d.opp_start)} y1={26} y2={124} stroke="rgba(255,255,255,0.5)" strokeWidth={5} />
          <text x={x(d.own_start)} y={18} fill="#fff" fontSize={15} fontWeight={900} textAnchor="middle">OWN {d.own_start.toFixed(1)}</text>
          <text x={x(d.opp_start)} y={18} fill={DIM} fontSize={15} fontWeight={900} textAnchor="end">OPP {d.opp_start.toFixed(1)}</text>
        </Svg>
      </Box>
      <Headline size={5} lines={2}>{item.headline}</Headline>
    </Flex>
  );
};

// ── 25 · Tendency Meter — run-heavy to pass-heavy, everyone on the dial ─────
const TendencyMeter = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  const W = 600;
  const x = (v) => scale(v, 0.25, 0.75, 30, W - 30);
  const others = d.teams.filter((t) => t.team_id !== d.team_id);
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Title color={accent}>{item.title}</Title>
      <Flex align="center" gap="4cqmin">
        <BigNumber size={20} color={accent} flexShrink={0}>{item.primary.display}</BigNumber>
        <Headline size={5} lines={3}>{item.headline}</Headline>
      </Flex>
      <Box h="30cqmin">
        <Svg w={W} h={150}>
          <defs>
            <linearGradient id="hst-tend" x1="0" x2="1">
              <stop offset="0" stopColor="#38BDF8" stopOpacity="0.5" />
              <stop offset="1" stopColor="#F472B6" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <rect x={30} y={80} width={W - 60} height={10} rx={5} fill="url(#hst-tend)" />
          <line x1={x(d.league_avg)} x2={x(d.league_avg)} y1={68} y2={102} stroke="#fff" strokeWidth={2} strokeDasharray="3 3" />
          {others.map((t, i) => (
            <Logo key={t.team_id} id={t.team_id} x={x(t.pass_rate)} y={i % 2 ? 118 : 52} s={22} opacity={0.5} />
          ))}
          <Logo id={d.team_id} x={x(d.teams.find((t) => t.team_id === d.team_id).pass_rate)} y={30} s={52} />
          <text x={30} y={146} fill="#38BDF8" fontSize={14} fontWeight={900} letterSpacing="2">RUN</text>
          <text x={W - 30} y={146} fill="#F472B6" fontSize={14} fontWeight={900} textAnchor="end" letterSpacing="2">PASS</text>
        </Svg>
      </Box>
    </Flex>
  );
};

// ── 26 · Tempo — two stopwatches, fastest and slowest ───────────────────────
const Stopwatch = ({ side, label }) => {
  const accent = vivid(side.team_id);
  const a = (side.seconds / 40) * Math.PI * 2;
  return (
    <Flex direction="column" align="center" flex={1} minW={0} gap="1.5cqmin">
      <Box w="100%" maxW="40cqmin" aspectRatio="1" position="relative">
        <Svg w={200} h={200}>
          <rect x={90} y={0} width={20} height={12} rx={3} fill={DIM} />
          <circle cx={100} cy={108} r={84} fill="none" stroke={FAINT} strokeWidth={10} />
          <path d={arc(100, 108, 84, 0, a)} fill="none" stroke={accent} strokeWidth={10} strokeLinecap="round" />
          <Logo id={side.team_id} x={100} y={108} s={70} />
        </Svg>
      </Box>
      <Text fontSize="7cqmin" fontWeight="black" fontStyle="italic" color="white" lineHeight={1}>{side.display}</Text>
      <Micro size={2.3}>{label}</Micro>
    </Flex>
  );
};
const Tempo = ({ item }) => (
  <Flex direction="column" h="100%" gap="2cqmin">
    <Title>{item.title}</Title>
    <Flex flex={1} minH={0} gap="4cqmin" align="center">
      <Stopwatch side={item.data.fastest} label="Fastest" />
      <Stopwatch side={item.data.slowest} label="Slowest" />
    </Flex>
    <Headline size={4.8} lines={2} textAlign="center">{item.headline}</Headline>
  </Flex>
);

// ── 27 · Special Teams Edge — the hidden yards, unit by unit ────────────────
const SpecialTeams = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  const max = Math.max(...d.units.map((u) => Math.abs(u.value)));
  return (
    <Flex h="100%" gap="5cqmin">
      <Flex direction="column" justify="space-between" w="44%" flexShrink={0}>
        <Title color={accent}>{item.title}</Title>
        <Flex align="center" gap="3cqmin">
          <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={14} />
          <BigNumber size={16} color={GOOD}>{item.primary.display}</BigNumber>
        </Flex>
        <Headline size={5} lines={3}>{item.headline}</Headline>
      </Flex>
      <Flex direction="column" flex={1} justify="center" gap="2.5cqmin" minW={0}>
        {d.units.map((u) => (
          <Box key={u.label}>
            <Flex justify="space-between">
              <Micro size={2.2} color={INK}>{u.label}</Micro>
              <Micro size={2.2} color={u.value >= 0 ? GOOD : BAD}>{u.display}</Micro>
            </Flex>
            <Box position="relative" h="3cqmin" mt="0.8cqmin" bg="rgba(255,255,255,0.05)">
              <Box position="absolute" left="50%" top={0} bottom={0} w="1px" bg={DIM} />
              <Box
                position="absolute"
                top={0}
                bottom={0}
                left={u.value >= 0 ? "50%" : `${50 - (Math.abs(u.value) / max) * 50}%`}
                w={`${(Math.abs(u.value) / max) * 50}%`}
                bg={u.value >= 0 ? GOOD : BAD}
              />
            </Box>
          </Box>
        ))}
      </Flex>
    </Flex>
  );
};

// ── 28 · Coach's Call — every 4th-down decision, right or wrong ─────────────
const CoachsCall = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  return (
    <Flex direction="column" h="100%" gap="3cqmin">
      <Flex align="center" gap="3cqmin">
        <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={12} />
        <Title color={accent}>{item.title}</Title>
        <BigNumber size={13} ml="auto" color={GOOD}>{item.primary.display}</BigNumber>
      </Flex>
      <Flex flex={1} minH={0} wrap="wrap" gap="1.6cqmin" alignContent="center">
        {d.decisions.map((x, i) => (
          <Flex
            key={i}
            w="9cqmin"
            h="9cqmin"
            align="center"
            justify="center"
            borderRadius={x.went ? "full" : "sm"}
            border="0.6cqmin solid"
            borderColor={x.agreed ? GOOD : BAD}
            bg={x.converted ? withAlpha(x.agreed ? GOOD : BAD, 0.35) : "transparent"}
          >
            <Text fontSize="2.4cqmin" fontWeight="black" color="white">{x.went ? "GO" : "K"}</Text>
          </Flex>
        ))}
      </Flex>
      <Headline size={4.8} lines={2}>{item.headline}</Headline>
    </Flex>
  );
};

// ── Registry ─────────────────────────────────────────────────────────────────

export const FACES = {
  metric_of_week: MetricOfWeek,
  league_map: LeagueMap,
  adjusted_leader: AdjustedLeader,
  efficiency_king: EfficiencyKing,
  win_lever: WinLever,
  noise_stat: NoiseStat,
  better_than_record: RankLadders,
  ahead_of_numbers: RankLadders,
  statistical_twins: Twins,
  one_of_a_kind: OneOfAKind,
  conference_split: ConferenceSplit,
  parity_meter: ParityMeter,
  biggest_mover: BiggestMover,
  points_per_drive: PointsPerDrive,
  explosive_drives: ExplosiveDrives,
  finishing_drives: FinishingDrives,
  havoc_leader: HavocLeader,
  havoc_split: HavocSplit,
  drive_killers: DriveKillers,
  third_down_over_expected: ThirdDown,
  turnover_luck: TurnoverLuck,
  middle_eight: MiddleEight,
  trench_report: TrenchReport,
  field_position: FieldPosition,
  tendency_meter: TendencyMeter,
  tempo: Tempo,
  special_teams_edge: SpecialTeams,
  coaches_call: CoachsCall,
};
