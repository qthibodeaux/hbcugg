import { useState } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { BigNumber, Headline, Mark, Micro, lastName, useTileVariant } from "./LiveTile";
import { vivid } from "./StatsTileFaces";
import { PLAYER_FACES_MOBILE } from "./PlayersTileFacesMobile";
import { teamLogo, teamMeta, teamShort, withAlpha } from "../../game/export/exportData";

// ─────────────────────────────────────────────────────────────────────────────
// HOME PLAYERS TILE — one face per item key in
// src/pages/players/md/Home Players Tile Fetch Contract.md.
//
// The backend picks every item and every player. Faces read only the item's
// `data`; team identity is joined from teams.json. PLAYER_FACES[key] is the API.
// ─────────────────────────────────────────────────────────────────────────────

const GOOD = "#22C55E";
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
  breakout: Breakout,
  transfer_impact: TransferImpact,
  freshman: Freshman,
};

export const playerFacesFor = (payload) => {
  const pool = [...(payload?.items ?? [])];
  return (payload?.rotation ?? [])
    .map((k) => {
      const i = pool.findIndex((x) => x.key === k);
      return i >= 0 ? pool.splice(i, 1)[0] : null;
    })
    .filter((it) => it && PLAYER_FACES[it.key])
    .map((it, n) => <PlayerFace key={`${it.key}-${n}`} item={it} />);
};

// The tile's variant picks the face: mobile tiles get their own versions.
const PlayerFace = ({ item }) => {
  const mobile = useTileVariant() === "mobile";
  const Face = (mobile && PLAYER_FACES_MOBILE[item.key]) || PLAYER_FACES[item.key];
  return <Face item={item} />;
};
