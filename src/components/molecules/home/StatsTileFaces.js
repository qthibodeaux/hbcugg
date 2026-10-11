import { Box, Flex } from "@chakra-ui/react";
import { BigNumber, Headline, Mark, Micro, useTileVariant } from "./LiveTile";
import { teamLogo, teamShort, withAlpha } from "../../game/export/exportData";
import { vivid } from "./teamColor";
import { STAT_FACES_MOBILE } from "./StatsTileFacesMobile";

export { vivid };

// ─────────────────────────────────────────────────────────────────────────────
// HOME STATS TILE — 5 faces, one per item key in
// src/pages/stats/md/Home Stats Tile Fetch Contract.md.
//
// Each face takes one contract `item` and reads only its own `data`. Nothing
// here ranks, chooses or rewords: the backend sends the headline, the display
// strings and the order to rotate. FACES[item.key] is the whole API —
// production maps `rotation` → items → FACES and hands the list to LiveTile.
//
// Faces are deliberately not uniform. Everything is sized in cqmin off the
// tile (LiveTile is a size container); SVGs use raw hex, never tokens.
// ─────────────────────────────────────────────────────────────────────────────

const FAINT = "rgba(255,255,255,0.14)";
const DIM = "rgba(255,255,255,0.4)";
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

// ── Registry ─────────────────────────────────────────────────────────────────

export const FACES = {
  metric_of_week: MetricOfWeek,
  efficiency_king: EfficiencyKing,
  points_per_drive: PointsPerDrive,
  explosive_drives: ExplosiveDrives,
  havoc_leader: HavocLeader,
};

// What production does with the file: rotation keys → items → faces.
export const statFacesFor = (payload) => {
  const byKey = Object.fromEntries((payload?.items ?? []).map((i) => [i.key, i]));
  return (payload?.rotation ?? [])
    .map((k) => byKey[k])
    .filter((i) => i && FACES[i.key])
    .map((i) => <StatFace key={i.key} item={i} />);
};

// The tile's variant picks the face: mobile tiles get their own versions.
const StatFace = ({ item }) => {
  const mobile = useTileVariant() === "mobile";
  const Face = (mobile && STAT_FACES_MOBILE[item.key]) || FACES[item.key];
  return <Face item={item} />;
};
