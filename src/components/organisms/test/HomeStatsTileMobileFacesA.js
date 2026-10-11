import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import LiveTile, { TileStyles } from "../../molecules/home/LiveTile";
import { vivid } from "../../molecules/home/StatsTileFaces";
import { MOCK_TILE } from "../../molecules/home/statsTileMock";
import { teamLogo, teamShort, withAlpha } from "../../game/export/exportData";

// ─────────────────────────────────────────────────────────────────────────────
// HOME STATS TILE — MOBILE FACES (lab). One mobile face per contract key, for
// the ~190px square tile in the phone 2×2. One bold visual + one big number
// per face; abbreviations only; no headlines or fine print.
// Sized in cqmin off LiveTile's size container; SVGs use raw hex.
// ─────────────────────────────────────────────────────────────────────────────

const FAINT = "rgba(255,255,255,0.14)";
const DIM = "rgba(255,255,255,0.55)";

const Label = ({ children, color = DIM, ...rest }) => (
  <Text fontSize="5cqmin" fontWeight="black" color={color} textTransform="uppercase" letterSpacing="0.12em" lineHeight={1.1} lineClamp={1} {...rest}>
    {children}
  </Text>
);
const Big = ({ children, size = 20, color = "white", ...rest }) => (
  <Text fontSize={`${size}cqmin`} fontWeight="black" fontStyle="italic" color={color} lineHeight={0.88} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" lineClamp={1} {...rest}>
    {children}
  </Text>
);
const Logo = ({ id, size }) => <Image src={teamLogo(id)} alt="" w={`${size}cqmin`} h={`${size}cqmin`} objectFit="contain" flexShrink={0} />;
const Svg = ({ w, h, children, ...rest }) => (
  <Box as="svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" w="100%" h="100%" display="block" overflow="visible" {...rest}>
    {children}
  </Box>
);
// Team mark + abbreviation, the face's subject.
const Team = ({ id, size = 14 }) => (
  <Flex align="center" gap="2.5cqmin" minW={0}>
    <Logo id={id} size={size} />
    <Big size={9}>{teamShort(id)}</Big>
  </Flex>
);
const scale = (v, d0, d1, r0, r1) => (d1 === d0 ? (r0 + r1) / 2 : r0 + ((v - d0) / (d1 - d0)) * (r1 - r0));

// ── Metric of the Week — the leader big, the league on one line ─────────────
const MetricOfWeekM = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.leader_id);
  const vals = d.values.map((v) => v.value);
  const lo = Math.min(...vals, d.league_avg);
  const hi = Math.max(...vals, d.league_avg);
  const W = 300;
  const x = (v) => scale(v, lo, hi, 14, W - 14);
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Label color={accent}>{d.metric_label}</Label>
      <Flex align="center" gap="3cqmin">
        <Logo id={d.leader_id} size={30} />
        <Box minW={0}>
          <Big size={22} color={accent}>{item.primary.display}</Big>
          <Big size={8} mt="2cqmin">{teamShort(d.leader_id)}</Big>
        </Box>
      </Flex>
      <Box h="22cqmin">
        <Svg w={W} h={70}>
          <line x1={4} x2={W - 4} y1={38} y2={38} stroke={FAINT} strokeWidth={2} />
          <line x1={x(d.league_avg)} x2={x(d.league_avg)} y1={16} y2={60} stroke={DIM} strokeWidth={2} strokeDasharray="4 4" />
          {d.values.filter((v) => v.team_id !== d.leader_id).map((v, i) => (
            <image key={v.team_id} href={teamLogo(v.team_id)} x={x(v.value) - 9} y={(i % 2 ? 22 : 54) - 9} width={18} height={18} opacity={0.6} preserveAspectRatio="xMidYMid meet" />
          ))}
          {(() => {
            const lead = d.values.find((v) => v.team_id === d.leader_id);
            return lead ? <circle cx={x(lead.value)} cy={38} r={9} fill={accent} /> : null;
          })()}
        </Svg>
      </Box>
    </Flex>
  );
};

// ── Efficiency King — the successful snaps out of ten, huge ─────────────────
const EfficiencyKingM = ({ item }) => {
  const d = item.data;
  const lit = Math.round(d.rate * 10);
  const accent = vivid(d.team_id);
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Team id={d.team_id} />
      <Flex align="baseline" gap="2cqmin">
        <Big size={44} color={accent}>{lit}</Big>
        <Big size={14} color={DIM}>/10</Big>
      </Flex>
      <Box>
        <Flex gap="1.5cqmin" h="14cqmin">
          {Array.from({ length: 10 }, (_, i) => (
            <Box key={i} flex={1} bg={i < lit ? accent : "transparent"} border="0.6cqmin solid" borderColor={i < lit ? accent : FAINT} />
          ))}
        </Flex>
        <Flex justify="space-between" mt="2cqmin">
          <Label color="white">{item.primary.display} {item.primary.label}</Label>
        </Flex>
      </Box>
    </Flex>
  );
};

// ── Points Per Drive — every possession a column, the average big ───────────
const PointsPerDriveM = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  return (
    <Flex direction="column" h="100%" gap="2.5cqmin">
      <Flex justify="space-between" align="flex-start" gap="2cqmin">
        <Team id={d.team_id} />
        <Box textAlign="right" flexShrink={0}>
          <Big size={17} color={accent}>{item.primary.display}</Big>
          <Label mt="1cqmin">Pts / drive</Label>
        </Box>
      </Flex>
      <Flex flex={1} minH={0} align="flex-end" gap="0.8cqmin" borderBottom="0.5cqmin solid" borderColor={FAINT}>
        {d.drives.map((dr, i) => (
          <Box key={i} flex={1} h={dr.points ? `${(dr.points / 7) * 100}%` : "4%"} bg={dr.points === 7 ? accent : dr.points ? withAlpha(accent, 0.45) : "rgba(255,255,255,0.18)"} />
        ))}
      </Flex>
    </Flex>
  );
};

// ── Explosive Drives — the drive arcs, explosive ones lit ───────────────────
const ExplosiveDrivesM = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  const W = 300;
  const H = 150;
  const x = (yd) => scale(yd, 0, 80, 8, W - 8);
  return (
    <Flex direction="column" h="100%" gap="2cqmin">
      <Team id={d.team_id} />
      <Box flex={1} minH={0}>
        <Svg w={W} h={H}>
          <line x1={8} x2={W - 8} y1={H - 6} y2={H - 6} stroke={FAINT} strokeWidth={2} />
          {d.drives.filter((dr) => !dr.explosive).concat(d.drives.filter((dr) => dr.explosive)).map((dr, i) => {
            const x1 = x(Math.min(80, dr.yards));
            const h = Math.min(H - 14, dr.yards * 1.5 + 8);
            return (
              <path key={i} d={`M ${x(0)} ${H - 6} Q ${(x(0) + x1) / 2} ${H - 6 - h * 1.6} ${x1} ${H - 6}`} fill="none" stroke={dr.explosive ? accent : "rgba(255,255,255,0.16)"} strokeWidth={dr.explosive ? 4 : 2} />
            );
          })}
        </Svg>
      </Box>
      <Flex align="baseline" gap="2.5cqmin">
        <Big size={20} color={accent}>{item.primary.display}</Big>
        <Label>Explosive</Label>
      </Flex>
    </Flex>
  );
};

// ── Havoc Leader — 100 snaps, the wrecked ones filled ───────────────────────
const HavocLeaderM = ({ item }) => {
  const d = item.data;
  const filled = Math.round((d.havoc_plays / d.snaps) * 100);
  const league = Math.round(d.league_rate * 100);
  const accent = vivid(d.team_id);
  return (
    <Flex h="100%" gap="3cqmin">
      <Box w="56%" maxH="100%" aspectRatio="1" flexShrink={0} alignSelf="center" display="grid" gridTemplateColumns="repeat(10, 1fr)" gap="0.8cqmin">
        {Array.from({ length: 100 }, (_, i) => (
          <Box key={i} bg={i < filled ? accent : i < league ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0.07)"} />
        ))}
      </Box>
      <Flex direction="column" justify="space-between" minW={0} flex={1}>
        <Logo id={d.team_id} size={16} />
        <Box>
          <Big size={9}>{teamShort(d.team_id)}</Big>
          <Big size={24} color={accent} mt="2cqmin">{filled}</Big>
          <Label mt="1cqmin">Havoc</Label>
        </Box>
        {item.compare ? <Label>Avg {item.compare.display}</Label> : <Box />}
      </Flex>
    </Flex>
  );
};

export const STAT_FACES_MOBILE = {
  metric_of_week: MetricOfWeekM,
  efficiency_king: EfficiencyKingM,
  points_per_drive: PointsPerDriveM,
  explosive_drives: ExplosiveDrivesM,
  havoc_leader: HavocLeaderM,
};

// ── Lab export ───────────────────────────────────────────────────────────────
// Every face at phone tile size (the 2×2 on a ~390px phone), then one tile
// rotating through them all.

const TILE = "195px";
const items = MOCK_TILE.rotation.map((k) => MOCK_TILE.items.find((it) => it.key === k)).filter((it) => it && STAT_FACES_MOBILE[it.key]);
const faceOf = (it) => {
  const Face = STAT_FACES_MOBILE[it.key];
  return <Face key={it.key} item={it} />;
};

export const HomeStatsTileMobileFacesA = () => (
  <Box h="100%" overflowY="auto" pr={2}>
    <TileStyles />
    <Flex gap={6} wrap="wrap" align="flex-start">
      <Box>
        <Text fontSize="xs" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={2}>Rotating</Text>
        <Box w={TILE} h={TILE} display="grid">
          <LiveTile href="#" variant="mobile" transition="random" rotateMs={3000} faces={items.map(faceOf)} />
        </Box>
      </Box>
      <Box flex={1} minW="300px">
        <Text fontSize="xs" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={2}>All faces · {TILE} tile</Text>
        <Grid templateColumns={`repeat(auto-fill, ${TILE})`} gap={4}>
          {items.map((it) => (
            <Box key={it.key}>
              <Box w={TILE} h={TILE} display="grid">
                <LiveTile href="#" variant="mobile" faces={[faceOf(it)]} />
              </Box>
              <Text fontSize="10px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mt={1}>{it.key.replace(/_/g, " ")}</Text>
            </Box>
          ))}
        </Grid>
      </Box>
    </Flex>
  </Box>
);
