// ARCHIVE (2026-10-03): the full home-tile face catalog before the cut to 5
// per tile. Not imported anywhere. Mobile versions of the Teams and Players
// faces live in ../HomeTeamsTileMobileFacesA.js / ../HomePlayersTileMobileFacesA.js.
import { useState } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { BigNumber, Headline, Mark, Micro, lastName, useTileVariant } from "../../../molecules/home/LiveTile";
import { vivid } from "../../../molecules/home/StatsTileFaces";
import { CELL, GRID } from "../../../molecules/home/usTileGrid";
import { teamLogo, teamMeta, teamShort, withAlpha } from "../../../game/export/exportData";

// ─────────────────────────────────────────────────────────────────────────────
// HOME PLAYERS TILE — one face per item key in
// src/pages/players/md/Home Players Tile Fetch Contract.md.
//
// The backend picks every item and every player. Faces read only the item's
// `data`; team identity is joined from teams.json. PLAYER_FACES[key] is the API.
// ─────────────────────────────────────────────────────────────────────────────

const GOOD = "#22C55E";
const BAD = "#EF4444";
const GOLD = "#EAB308";
const INK = "rgba(255,255,255,0.88)";
const FAINT = "rgba(255,255,255,0.14)";
const DIM = "rgba(255,255,255,0.45)";

const PT_CSS = `
  @keyframes ptFlip { 0%, 86% { transform: rotateY(0); } 89%, 97% { transform: rotateY(180deg); } 100% { transform: rotateY(360deg); } }
  .pt-card { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; animation: ptFlip var(--pt-cycle, 30s) ease-in-out infinite; animation-delay: var(--pt-delay, 0s); }
  .pt-side { position: absolute; inset: 0; backface-visibility: hidden; }
  .pt-back { transform: rotateY(180deg); }
  @media (prefers-reduced-motion: reduce) { .pt-card { animation: none; } }
`;

const Title = ({ children, color = DIM, ...rest }) => <Micro color={color} size={2.6} {...rest}>{children}</Micro>;
const Svg = ({ w, h, children, ...rest }) => (
  <Box as="svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" w="100%" h="100%" display="block" overflow="visible" {...rest}>
    {children}
  </Box>
);

// A headshot that falls back to the team mark on the team color.
const Photo = ({ player, fade = true, ...rest }) => {
  const [broken, setBroken] = useState(false);
  const color = teamMeta(player.team_id)?.colors?.primary ?? "#27272A";
  if (!player.image_url || broken) {
    return (
      <Flex align="center" justify="center" bg={withAlpha(color, 0.55)} {...rest}>
        <Mark logo={teamLogo(player.team_id)} label={teamShort(player.team_id)} size={14} />
      </Flex>
    );
  }
  return (
    <Image
      src={player.image_url}
      alt=""
      objectFit="cover"
      objectPosition="top"
      onError={() => setBroken(true)}
      style={fade ? { maskImage: "linear-gradient(180deg, #000 55%, transparent 100%)", WebkitMaskImage: "linear-gradient(180deg, #000 55%, transparent 100%)" } : undefined}
      {...rest}
    />
  );
};

const Who = ({ player, size = 7 }) => {
  const mobile = useTileVariant() === "mobile";
  return (
  <Box minW={0}>
    <Flex align="center" gap="1.6cqmin">
      <Mark logo={teamLogo(player.team_id)} label={teamShort(player.team_id)} size={5.5} />
      <Micro size={2.3} color={INK}>{[player.position, teamShort(player.team_id), player.class_year].filter(Boolean).join(" · ")}</Micro>
    </Flex>
    <Text fontSize={`${size}cqmin`} fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.95} letterSpacing="-0.02em" mt="1cqmin" lineClamp={2} textShadow="0 2px 12px rgba(0,0,0,0.7)">
      {mobile ? lastName(player.name) : player.name}
    </Text>
  </Box>
  );
};

const Line = ({ cells, accent }) => (
  <Flex borderTop="0.4cqmin solid" borderColor={accent}>
    {cells.map((c) => (
      <Box key={c.label} flex={1} py="1.6cqmin" textAlign="center" borderRight="1px solid" borderColor={FAINT} _last={{ borderRight: "none" }} bg="rgba(0,0,0,0.35)">
        <Text fontSize="5.4cqmin" fontWeight="black" fontStyle="italic" color="white" lineHeight={1}>{c.display}</Text>
        <Micro size={2} mt="0.6cqmin">{c.label}</Micro>
      </Box>
    ))}
  </Flex>
);

// ── Top Producers — the People-tile collage, cells flipping one at a time ───
const Collage = ({ item }) => {
  const mobile = useTileVariant() === "mobile";
  const players = item.data.players.slice(0, 16);
  const n = players.length;
  return (
    <Box h="100%" m="calc(-1 * var(--hl-pad, 5cqmin))" display="grid" gridTemplateColumns="repeat(4, minmax(0, 1fr))" gridTemplateRows="repeat(4, minmax(0, 1fr))" gap="0.5cqmin" style={{ perspective: "120cqmin" }}>
      <style>{PT_CSS}</style>
      {players.map((p, i) => {
        // Spread the flips so neighbours never turn together.
        const order = (i * 7) % n;
        return (
          <Box key={p.player_id ?? i} minW={0} minH={0}>
            <Box className="pt-card" style={{ "--pt-cycle": `${n * 1.9}s`, "--pt-delay": `${order * 1.9 - n * 1.9}s` }}>
              <Box className="pt-side" overflow="hidden" bg="#1A1A1D">
                <Photo player={p} fade={false} w="100%" h="100%" style={{ filter: `brightness(${1 - (p.rank - 1) * 0.025})` }} />
              </Box>
              <Flex className="pt-side pt-back" direction="column" align="center" justify="center" gap="1cqmin" bg={withAlpha(teamMeta(p.team_id)?.colors?.primary ?? "#27272A", 0.9)} px="1cqmin">
                <Mark logo={teamLogo(p.team_id)} label={teamShort(p.team_id)} size={7} />
                <Text fontSize="4.4cqmin" fontWeight="black" fontStyle="italic" color="white" lineHeight={1}>{p.production_display}</Text>
                <Text fontSize="2cqmin" fontWeight="black" color="white" textTransform="uppercase" textAlign="center" lineClamp={1}>{mobile ? lastName(p.name) : p.name}</Text>
              </Flex>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

// ── Player of the Week — the headshot tall, the game line across the bottom ─
const PlayerOfWeek = ({ item }) => {
  const { player, line } = item.data;
  const accent = vivid(player.team_id);
  return (
    <Box position="relative" h="100%" m="calc(-1 * var(--hl-pad, 5cqmin))" overflow="hidden">
      <Box position="absolute" inset={0} bg={`radial-gradient(circle at 75% 30%, ${withAlpha(accent, 0.35)} 0%, transparent 60%)`} />
      <Photo player={player} position="absolute" right={0} top={0} h="100%" w="58%" />
      <Flex position="relative" direction="column" h="100%" justify="space-between">
        <Box p="var(--hl-pad, 5cqmin)" pb={0}>
          <Title color={GOLD}>{item.title}</Title>
        </Box>
        <Box px="var(--hl-pad, 5cqmin)" maxW="70%">
          <Who player={player} size={9} />
          <Headline size={4.2} lines={2} mt="2cqmin" color={INK}>{item.headline}</Headline>
        </Box>
        <Line cells={line} accent={accent} />
      </Flex>
    </Box>
  );
};

// ── QB Spotlight — every throw on the field, completions lit ────────────────
const QBSpotlight = ({ item }) => {
  const { player, throws, line } = item.data;
  const accent = vivid(player.team_id);
  const W = 220;
  const H = 300;
  const x = (v) => W / 2 + (v / 28) * (W / 2 - 10);
  const y = (d) => H - 40 - (d / 45) * (H - 60);
  return (
    <Flex h="100%" gap="4cqmin">
      <Box w="40%" flexShrink={0} h="100%">
        <Svg w={W} h={H}>
          <rect x={0} y={0} width={W} height={H} fill="rgba(34,197,94,0.06)" rx={6} />
          {[0, 10, 20, 30, 40].map((d) => (
            <g key={d}>
              <line x1={0} x2={W} y1={y(d)} y2={y(d)} stroke={d === 0 ? "#fff" : FAINT} strokeWidth={d === 0 ? 2.5 : 1} />
              {d ? <text x={4} y={y(d) - 3} fill={DIM} fontSize={10} fontWeight={900}>{d}</text> : null}
            </g>
          ))}
          {throws.map((t, i) => (
            <circle key={i} cx={x(t.x)} cy={y(t.depth)} r={t.td ? 8 : 6} fill={t.td ? GOLD : t.complete ? accent : "none"} stroke={t.complete || t.td ? "none" : "rgba(239,68,68,0.7)"} strokeWidth={2} opacity={t.complete ? 0.9 : 0.8} />
          ))}
          <circle cx={W / 2} cy={H - 22} r={7} fill="#fff" />
        </Svg>
      </Box>
      <Flex direction="column" justify="space-between" flex={1} minW={0}>
        <Title color={accent}>{item.title}</Title>
        <Flex align="flex-end" gap="3cqmin">
          <Photo player={player} w="22cqmin" h="26cqmin" borderRadius="md" flexShrink={0} />
          <Who player={player} size={6.5} />
        </Flex>
        <Headline size={4.4} lines={2} color={INK}>{item.headline}</Headline>
        <Line cells={line} accent={accent} />
      </Flex>
    </Flex>
  );
};

// ── Ball Carrier — runs fanned left / middle / right ────────────────────────
const LANE_LABEL = { left: "Left", middle: "Middle", right: "Right" };
const BallCarrier = ({ item }) => {
  const { player, lanes, line } = item.data;
  const accent = vivid(player.team_id);
  const maxYpc = Math.max(...lanes.map((l) => l.yards / Math.max(1, l.carries)));
  const maxCar = Math.max(...lanes.map((l) => l.carries));
  const W = 320;
  const H = 210;
  const ox = W / 2;
  const oy = H - 14;
  // left → right across the top of the fan
  const ANGLE = { left: 0.72, middle: 0.5, right: 0.28 };
  return (
    <Flex direction="column" h="100%" gap="2cqmin">
      <Flex justify="space-between" align="flex-start" gap="3cqmin">
        <Box minW={0}>
          <Title color={accent}>{item.title}</Title>
          <Box mt="2cqmin"><Who player={player} size={6.5} /></Box>
        </Box>
        <Photo player={player} w="20cqmin" h="22cqmin" borderRadius="md" flexShrink={0} />
      </Flex>
      <Box flex={1} minH={0}>
        <Svg w={W} h={H}>
          <line x1={10} x2={W - 10} y1={oy - 40} y2={oy - 40} stroke="#fff" strokeWidth={2} opacity={0.5} />
          {lanes.map((l) => {
            const ang = Math.PI * (ANGLE[l.lane] ?? 0.5);
            const ypc = l.yards / Math.max(1, l.carries);
            const len = 60 + (ypc / maxYpc) * (H - 90);
            const ex = ox + Math.cos(ang) * len * 1.2;
            const ey = oy - Math.sin(ang) * len;
            return (
              <g key={l.lane}>
                <line x1={ox} y1={oy} x2={ex} y2={ey} stroke={accent} strokeWidth={8 + (l.carries / maxCar) * 22} strokeLinecap="round" opacity={0.4 + (0.6 * l.carries) / maxCar} />
                <text x={ex} y={ey - 22} fill="#fff" fontSize={18} fontWeight={900} textAnchor="middle">{ypc.toFixed(1)}</text>
                <text x={ex} y={ey - 8} fill={INK} fontSize={11} fontWeight={900} textAnchor="middle" letterSpacing="1.5">{(LANE_LABEL[l.lane] ?? l.lane).toUpperCase()}</text>
              </g>
            );
          })}
          <circle cx={ox} cy={oy} r={7} fill="#fff" />
        </Svg>
      </Box>
      <Line cells={line} accent={accent} />
    </Flex>
  );
};

// ── Go-To Target — his slice of the team's targets ──────────────────────────
const GoToTarget = ({ item }) => {
  const { player, target_share: share, line } = item.data;
  const accent = vivid(player.team_id);
  const R = 15.9155;
  return (
    <Flex h="100%" gap="5cqmin" align="center">
      <Box w="48%" maxH="100%" aspectRatio="1" flexShrink={0} position="relative">
        <Svg w={36} h={36}>
          <circle cx={18} cy={18} r={R} fill="none" stroke={FAINT} strokeWidth={2.6} />
          <circle cx={18} cy={18} r={R} fill="none" stroke={accent} strokeWidth={2.6} strokeDasharray={`${share * 100} ${100 - share * 100}`} strokeDashoffset={25} />
        </Svg>
        <Box position="absolute" inset="16%" borderRadius="full" overflow="hidden" bg="#1A1A1D">
          <Photo player={player} fade={false} w="100%" h="100%" />
        </Box>
      </Box>
      <Flex direction="column" justify="space-between" h="100%" flex={1} minW={0}>
        <Title color={accent}>{item.title}</Title>
        <Box>
          <BigNumber size={16} color={accent}>{Math.round(share * 100)}%</BigNumber>
          <Micro size={2.2} mt="1cqmin">Target share</Micro>
        </Box>
        <Who player={player} size={6} />
        <Line cells={line} accent={accent} />
      </Flex>
    </Flex>
  );
};

// ── Breakout — production by week, the line that takes off ──────────────────
const Breakout = ({ item }) => {
  const { player, weeks, this_season: now, prior_season: before } = item.data;
  const accent = vivid(player.team_id);
  const W = 400;
  const H = 180;
  const max = Math.max(...weeks.map((w) => w.production), 1);
  const pts = weeks.map((w, i) => [10 + (i / Math.max(1, weeks.length - 1)) * (W - 60), H - 10 - (w.production / max) * (H - 30)]);
  const path = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <Flex direction="column" h="100%" gap="2cqmin">
      <Flex justify="space-between" align="flex-start">
        <Box minW={0}>
          <Title color={accent}>{item.title}</Title>
          <Box mt="2cqmin"><Who player={player} size={6.5} /></Box>
        </Box>
        <Box textAlign="right" flexShrink={0}>
          <Flex align="baseline" gap="2cqmin" justify="flex-end">
            <Text fontSize="5cqmin" fontWeight="black" color={DIM} textDecoration="line-through">{before}</Text>
            <BigNumber size={11} color={GOOD}>{now}</BigNumber>
          </Flex>
          <Micro size={2.1}>Production</Micro>
        </Box>
      </Flex>
      <Box flex={1} minH={0} position="relative">
        <Svg w={W} h={H}>
          <defs>
            <linearGradient id="pt-bo" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={accent} stopOpacity="0.45" />
              <stop offset="1" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${path} L ${last[0]} ${H} L ${pts[0][0]} ${H} Z`} fill="url(#pt-bo)" />
          <path d={path} fill="none" stroke={accent} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
          {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={4} fill="#fff" />)}
          <foreignObject x={last[0] - 6} y={Math.max(0, last[1] - 50)} width={56} height={56}>
            <Box w="100%" h="100%" borderRadius="full" overflow="hidden" border={`3px solid ${accent}`} bg="#1A1A1D">
              <Photo player={player} fade={false} w="100%" h="100%" />
            </Box>
          </foreignObject>
        </Svg>
      </Box>
      <Headline size={4.4} lines={2}>{item.headline}</Headline>
    </Flex>
  );
};

// ── Transfer Impact — where he came from, where he landed ───────────────────
const TransferImpact = ({ item }) => {
  const { player, from_school: from, after } = item.data;
  const accent = vivid(player.team_id);
  return (
    <Box position="relative" h="100%" m="calc(-1 * var(--hl-pad, 5cqmin))" overflow="hidden">
      <Photo player={player} position="absolute" right={0} top={0} h="100%" w="50%" />
      <Flex position="relative" direction="column" h="100%" justify="space-between" p="var(--hl-pad, 5cqmin)">
        <Title color={accent}>{item.title}</Title>
        <Flex align="center" gap="3cqmin" maxW="62%">
          <Box px="2.5cqmin" py="2cqmin" border="0.4cqmin solid" borderColor={FAINT} borderRadius="md" bg="rgba(255,255,255,0.04)" minW={0}>
            <Text fontSize="4.4cqmin" fontWeight="black" color={DIM} textTransform="uppercase" lineHeight={1} lineClamp={2}>{from.name}</Text>
            {from.tier ? <Micro size={2} mt="1cqmin">{from.tier}</Micro> : null}
          </Box>
          <Text fontSize="8cqmin" fontWeight="black" color={accent} flexShrink={0}>→</Text>
          <Mark logo={teamLogo(player.team_id)} label={teamShort(player.team_id)} size={16} />
        </Flex>
        <Box maxW="58%">
          <Who player={player} size={7} />
          <Flex align="baseline" gap="2cqmin" mt="2cqmin">
            <BigNumber size={10} color={accent}>{after.display}</BigNumber>
            <Micro size={2.2}>{after.label}</Micro>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

// ── Record Chase — the finish line, and how close he is ─────────────────────
const RecordChase = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.player.team_id);
  const pct = Math.min(1, d.current / d.record);
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Flex justify="space-between" align="flex-start" gap="3cqmin">
        <Box minW={0}>
          <Title color={GOLD}>{item.title}</Title>
          <Box mt="2cqmin"><Who player={d.player} size={6.5} /></Box>
        </Box>
        <Photo player={d.player} w="22cqmin" h="24cqmin" borderRadius="md" flexShrink={0} />
      </Flex>
      <Box>
        <Micro size={2.4} color={INK}>{d.record_label}</Micro>
        <Box position="relative" h="9cqmin" mt="2cqmin" bg="rgba(255,255,255,0.06)" borderRadius="md">
          <Box h="100%" w={`${pct * 100}%`} bg={`linear-gradient(90deg, ${withAlpha(accent, 0.4)}, ${accent})`} borderRadius="md" />
          <Box position="absolute" right={0} top="-2cqmin" bottom="-2cqmin" w="1.4cqmin" bg="repeating-linear-gradient(180deg, #fff 0 1.4cqmin, #0B0B0D 1.4cqmin 2.8cqmin)" />
        </Box>
        <Flex justify="space-between" mt="2cqmin">
          <Box>
            <BigNumber size={9} color={accent}>{d.current_display}</BigNumber>
          </Box>
          <Box textAlign="right">
            <BigNumber size={9} color={GOLD}>{d.record_display}</BigNumber>
            <Micro size={2}>{d.holder}</Micro>
          </Box>
        </Flex>
      </Box>
      <Headline size={4.4} lines={2}>{item.headline}</Headline>
    </Flex>
  );
};

// ── Veteran — a career, season by season ────────────────────────────────────
const Veteran = ({ item }) => {
  const { player, seasons } = item.data;
  const accent = vivid(player.team_id);
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Flex gap="4cqmin" align="flex-end">
        <Photo player={player} w="26cqmin" h="32cqmin" borderRadius="md" flexShrink={0} />
        <Box minW={0}>
          <Title color={accent}>{item.title}</Title>
          <Box mt="2cqmin"><Who player={player} size={7} /></Box>
        </Box>
      </Flex>
      <Flex position="relative" align="flex-start">
        <Box position="absolute" left="5%" right="5%" top="3.5cqmin" h="0.5cqmin" bg={withAlpha(accent, 0.5)} />
        {seasons.map((s, i) => {
          const now = i === seasons.length - 1;
          return (
            <Flex key={s.season} direction="column" align="center" flex={1} gap="1cqmin" position="relative">
              <Flex w="7cqmin" h="7cqmin" borderRadius="full" bg={now ? accent : "#1A1A1D"} border="0.5cqmin solid" borderColor={accent} align="center" justify="center">
                <Mark logo={teamLogo(s.team_id)} label={teamShort(s.team_id)} size={4.4} />
              </Flex>
              <Text fontSize="3.6cqmin" fontWeight="black" color={now ? "white" : INK}>{s.season}</Text>
              {s.class_year ? <Micro size={2}>{s.class_year}</Micro> : null}
            </Flex>
          );
        })}
      </Flex>
      <Headline size={4.6} lines={2}>{item.headline}</Headline>
    </Flex>
  );
};

// ── Hometown Hero — from his hometown to his school ─────────────────────────
const HometownHero = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.player.team_id);
  const cols = [3, 10];
  const rows = [3, 7];
  const states = Object.entries(GRID).filter(([, [c, r]]) => c >= cols[0] && c <= cols[1] && r >= rows[0] && r <= rows[1]);
  return (
    <Flex h="100%" gap="4cqmin">
      <Flex direction="column" justify="space-between" w="46%" flexShrink={0}>
        <Title color={accent}>{item.title}</Title>
        <Flex align="flex-end" gap="3cqmin">
          <Photo player={d.player} w="20cqmin" h="24cqmin" borderRadius="md" flexShrink={0} />
          <Who player={d.player} size={5.6} />
        </Flex>
        <Box>
          <Text fontSize="6cqmin" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={1}>{d.home_city}, {d.home_state}</Text>
          {d.distance_miles != null ? <Micro size={2.2} mt="1cqmin">{Math.round(d.distance_miles)} mi</Micro> : null}
        </Box>
      </Flex>
      <Box flex={1} minW={0}>
        <Svg w={(cols[1] - cols[0] + 1) * CELL} h={(rows[1] - rows[0] + 1) * CELL}>
          {states.map(([st, [c, r]]) => {
            const home = st === d.home_state;
            const school = st === d.school_state;
            return (
              <g key={st}>
                <rect x={(c - cols[0]) * CELL + 1} y={(r - rows[0]) * CELL + 1} width={CELL - 2} height={CELL - 2} rx={3} fill={home ? accent : "rgba(255,255,255,0.05)"} stroke={school ? "#fff" : "none"} strokeWidth={2} />
                <text x={(c - cols[0]) * CELL + CELL / 2} y={(r - rows[0]) * CELL + CELL / 2 + 3} fontSize={8} fontWeight={900} textAnchor="middle" fill={home ? "#0B0B0D" : "rgba(255,255,255,0.3)"}>{st}</text>
              </g>
            );
          })}
        </Svg>
      </Box>
    </Flex>
  );
};

// ── The Leg — every kick by distance, makes and misses ──────────────────────
const TheLeg = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.player.team_id);
  const W = 420;
  const H = 150;
  const x = (yd) => 20 + ((yd - 15) / 45) * (W - 40);
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Flex justify="space-between" align="flex-start" gap="3cqmin">
        <Box minW={0}>
          <Title color={accent}>{item.title}</Title>
          <Box mt="2cqmin"><Who player={d.player} size={6.5} /></Box>
        </Box>
        <Box textAlign="right" flexShrink={0}>
          <BigNumber size={12} color={accent}>{d.made}/{d.attempts}</BigNumber>
          <Micro size={2.1}>Long {d.long}</Micro>
        </Box>
      </Flex>
      <Box h="34cqmin">
        <Svg w={W} h={H}>
          <rect x={10} y={20} width={W - 20} height={H - 50} fill="rgba(34,197,94,0.06)" />
          {[20, 30, 40, 50, 60].map((yd) => (
            <g key={yd}>
              <line x1={x(yd)} x2={x(yd)} y1={20} y2={H - 30} stroke={FAINT} />
              <text x={x(yd)} y={H - 12} fill={DIM} fontSize={12} fontWeight={900} textAnchor="middle">{yd}</text>
            </g>
          ))}
          {d.kicks.map((k, i) => (
            <line key={i} x1={x(k.distance)} x2={x(k.distance)} y1={H - 30} y2={k.made ? 26 : 62} stroke={k.made ? GOOD : BAD} strokeWidth={4} strokeLinecap="round" opacity={0.9} />
          ))}
        </Svg>
      </Box>
      <Headline size={4.4} lines={2}>{item.headline}</Headline>
    </Flex>
  );
};

// ── Freshman to Watch — him against every other freshman ────────────────────
const Freshman = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.player.team_id);
  const max = Math.max(d.production, d.freshman_avg) * 1.05;
  return (
    <Box position="relative" h="100%" m="calc(-1 * var(--hl-pad, 5cqmin))" overflow="hidden">
      <Photo player={d.player} position="absolute" right={0} top={0} h="100%" w="50%" />
      <Flex position="relative" direction="column" h="100%" justify="space-between" p="var(--hl-pad, 5cqmin)" maxW="62%">
        <Flex align="center" gap="2cqmin">
          <Flex px="2cqmin" py="0.8cqmin" bg={accent} borderRadius="sm">
            <Text fontSize="3cqmin" fontWeight="black" color="#0B0B0D">FR</Text>
          </Flex>
          <Title color={accent}>{item.title}</Title>
        </Flex>
        <Who player={d.player} size={8} />
        <Box>
          {[
            { label: teamShort(d.player.team_id), v: d.production, c: accent },
            { label: "Freshman avg", v: d.freshman_avg, c: "rgba(255,255,255,0.25)" },
          ].map((r) => (
            <Flex key={r.label} align="center" gap="2cqmin" mt="1.6cqmin">
              <Box h="5cqmin" w={`${(r.v / max) * 70}%`} bg={r.c} borderRadius="sm" />
              <Text fontSize="4cqmin" fontWeight="black" color="white" flexShrink={0}>{r.v}</Text>
            </Flex>
          ))}
        </Box>
      </Flex>
    </Box>
  );
};

// ── Registry ─────────────────────────────────────────────────────────────────

export const PLAYER_FACES = {
  collage: Collage,
  player_of_week: PlayerOfWeek,
  qb_spotlight: QBSpotlight,
  ball_carrier: BallCarrier,
  go_to_target: GoToTarget,
  breakout: Breakout,
  transfer_impact: TransferImpact,
  record_chase: RecordChase,
  veteran: Veteran,
  hometown_hero: HometownHero,
  the_leg: TheLeg,
  freshman: Freshman,
};
