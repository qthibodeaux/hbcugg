import { useState } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { lastName } from "./LiveTile";
import { vivid } from "./StatsTileFaces";
import { teamLogo, teamMeta, teamShort, withAlpha } from "../../game/export/exportData";

// ─────────────────────────────────────────────────────────────────────────────
// HOME PLAYERS TILE — MOBILE FACES. One mobile face per contract key, for
// the ~190px square tile in the phone 2×2. Photo-led where there is a photo;
// last names only; one big number per face; no headlines or fine print.
// Sized in cqmin off LiveTile's size container. PlayersTileFaces picks these
// when the tile's variant is "mobile".
// ─────────────────────────────────────────────────────────────────────────────

const GOOD = "#22C55E";
const GOLD = "#EAB308";
const DIM = "rgba(255,255,255,0.55)";

const PTM_CSS = `
  @keyframes ptmFlip { 0%, 86% { transform: rotateY(0); } 89%, 97% { transform: rotateY(180deg); } 100% { transform: rotateY(360deg); } }
  .ptm-card { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; animation: ptmFlip var(--pt-cycle, 20s) ease-in-out infinite; animation-delay: var(--pt-delay, 0s); }
  .ptm-side { position: absolute; inset: 0; backface-visibility: hidden; }
  .ptm-back { transform: rotateY(180deg); }
  @media (prefers-reduced-motion: reduce) { .ptm-card { animation: none; } }
`;

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
// Last name, big; position · team under it.
const Name = ({ player, size = 11, sub = true, ...rest }) => (
  <Box minW={0} {...rest}>
    <Text fontSize={`${size}cqmin`} fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.9} letterSpacing="-0.03em" lineClamp={1} textShadow="0 2px 10px rgba(0,0,0,0.7)">
      {lastName(player.name)}
    </Text>
    {sub ? <Label color="rgba(255,255,255,0.8)" mt="1.5cqmin">{[player.position, teamShort(player.team_id)].filter(Boolean).join(" · ")}</Label> : null}
  </Box>
);
const Logo = ({ id, size }) => <Image src={teamLogo(id)} alt="" w={`${size}cqmin`} h={`${size}cqmin`} objectFit="contain" flexShrink={0} />;
const Svg = ({ w, h, children, ...rest }) => (
  <Box as="svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" w="100%" h="100%" display="block" overflow="visible" {...rest}>
    {children}
  </Box>
);
const Bleed = (props) => <Box position="relative" h="100%" m="calc(-1 * var(--hl-pad, 3cqmin))" overflow="hidden" {...props} />;

// A headshot that falls back to the team mark on the team color.
const Photo = ({ player, fade = false, logoSize = 40, ...rest }) => {
  const [broken, setBroken] = useState(false);
  const color = teamMeta(player.team_id)?.colors?.primary ?? "#27272A";
  if (!player.image_url || broken) {
    return (
      <Flex align="center" justify="center" bg={withAlpha(color, 0.55)} {...rest}>
        <Logo id={player.team_id} size={logoSize} />
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
      style={fade ? { maskImage: "linear-gradient(180deg, #000 50%, transparent 100%)", WebkitMaskImage: "linear-gradient(180deg, #000 50%, transparent 100%)" } : undefined}
      {...rest}
    />
  );
};

// ── Top Producers — the top nine, 3×3, cells flipping to the number ─────────
const CollageM = ({ item }) => {
  const players = item.data.players.slice(0, 9);
  const n = players.length;
  return (
    <Bleed display="grid" gridTemplateColumns="repeat(3, minmax(0, 1fr))" gridTemplateRows="repeat(3, minmax(0, 1fr))" gap="0.6cqmin" style={{ perspective: "120cqmin" }}>
      <style>{PTM_CSS}</style>
      {players.map((p, i) => {
        const order = (i * 4) % n;
        return (
          <Box key={p.player_id ?? i} minW={0} minH={0}>
            <Box className="ptm-card" style={{ "--pt-cycle": `${n * 2}s`, "--pt-delay": `${order * 2 - n * 2}s` }}>
              <Box className="ptm-side" overflow="hidden" bg="#1A1A1D">
                <Photo player={p} w="100%" h="100%" logoSize={18} />
              </Box>
              <Flex className="ptm-side ptm-back" direction="column" align="center" justify="center" gap="1cqmin" bg={withAlpha(teamMeta(p.team_id)?.colors?.primary ?? "#27272A", 0.92)} px="1cqmin">
                <Logo id={p.team_id} size={11} />
                <Text fontSize="7.5cqmin" fontWeight="black" fontStyle="italic" color="white" lineHeight={1}>{p.production_display}</Text>
                <Text fontSize="4.2cqmin" fontWeight="black" color="white" textTransform="uppercase" textAlign="center" lineClamp={1}>{lastName(p.name)}</Text>
              </Flex>
            </Box>
          </Box>
        );
      })}
    </Bleed>
  );
};

// ── Player of the Week — the headshot fills the tile, the line across it ────
const PlayerOfWeekM = ({ item }) => {
  const { player, line } = item.data;
  const accent = vivid(player.team_id);
  return (
    <Bleed bg={withAlpha(accent, 0.25)}>
      <Photo player={player} position="absolute" inset={0} w="100%" h="100%" />
      <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(20,20,22,0) 35%, rgba(20,20,22,0.95) 80%)" />
      <Flex position="relative" direction="column" h="100%" justify="space-between" p="var(--hl-pad, 3cqmin)">
        <Box alignSelf="flex-start" bg={GOLD} px="2cqmin" py="1cqmin">
          <Text fontSize="4.5cqmin" fontWeight="black" color="#0B0B0D" letterSpacing="0.1em">POTW</Text>
        </Box>
        <Box>
          <Name player={player} size={13} />
          <Flex gap="5cqmin" mt="2.5cqmin">
            {line.slice(1, 3).map((c) => (
              <Flex key={c.label} align="baseline" gap="1.5cqmin">
                <Big size={11} color={accent}>{c.display}</Big>
                <Label>{c.label}</Label>
              </Flex>
            ))}
          </Flex>
        </Box>
      </Flex>
    </Bleed>
  );
};

// ── Breakout — the line that takes off, his face at the end of it ───────────
const BreakoutM = ({ item }) => {
  const { player, weeks, this_season: now, prior_season: before } = item.data;
  const accent = vivid(player.team_id);
  const W = 300;
  const H = 160;
  const max = Math.max(...weeks.map((w) => w.production), 1);
  const pts = weeks.map((w, i) => [8 + (i / Math.max(1, weeks.length - 1)) * (W - 50), H - 8 - (w.production / max) * (H - 30)]);
  const path = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <Flex direction="column" h="100%" gap="2cqmin">
      <Flex justify="space-between" align="flex-start" gap="2cqmin">
        <Name player={player} size={10} />
        <Box textAlign="right" flexShrink={0}>
          <Big size={13} color={GOOD}>{now}</Big>
          <Text fontSize="5cqmin" fontWeight="black" color={DIM} textDecoration="line-through" mt="1cqmin">{before}</Text>
        </Box>
      </Flex>
      <Box flex={1} minH={0}>
        <Svg w={W} h={H}>
          <defs>
            <linearGradient id="ptm-bo" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={accent} stopOpacity="0.5" />
              <stop offset="1" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${path} L ${last[0]} ${H} L ${pts[0][0]} ${H} Z`} fill="url(#ptm-bo)" />
          <path d={path} fill="none" stroke={accent} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
          <foreignObject x={last[0] - 4} y={Math.max(0, last[1] - 46)} width={46} height={46}>
            <Box w="100%" h="100%" borderRadius="full" overflow="hidden" border={`3px solid ${accent}`} bg="#1A1A1D">
              <Photo player={player} w="100%" h="100%" logoSize={20} />
            </Box>
          </foreignObject>
        </Svg>
      </Box>
    </Flex>
  );
};

// ── Transfer Impact — where he came from, where he landed ───────────────────
const TransferImpactM = ({ item }) => {
  const { player, from_school: from } = item.data;
  const accent = vivid(player.team_id);
  return (
    <Bleed>
      <Photo player={player} fade position="absolute" right={0} top={0} h="100%" w="55%" />
      <Flex position="relative" direction="column" h="100%" justify="space-between" p="var(--hl-pad, 3cqmin)" maxW="64%">
        <Box>
          <Label>From</Label>
          <Text fontSize="10cqmin" fontWeight="black" fontStyle="italic" color={DIM} textTransform="uppercase" lineHeight={0.92} lineClamp={2} mt="1cqmin">{from.name}</Text>
        </Box>
        <Flex align="center" gap="2cqmin">
          <Text fontSize="10cqmin" fontWeight="black" color={accent} lineHeight={1}>→</Text>
          <Logo id={player.team_id} size={20} />
        </Flex>
        <Name player={player} size={11} />
      </Flex>
    </Bleed>
  );
};

// ── Freshman to Watch — where he ranks among every freshman ─────────────────
const FreshmanM = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.player.team_id);
  return (
    <Bleed>
      <Photo player={d.player} fade position="absolute" right={0} top={0} h="100%" w="58%" />
      <Flex position="relative" direction="column" h="100%" justify="space-between" p="var(--hl-pad, 3cqmin)" maxW="62%">
        <Box alignSelf="flex-start" bg={accent} px="2cqmin" py="1cqmin">
          <Text fontSize="5cqmin" fontWeight="black" color="#0B0B0D" letterSpacing="0.1em">FR</Text>
        </Box>
        <Box>
          <Big size={26} color={accent}>#{d.freshman_rank}</Big>
          <Label mt="1.5cqmin">of {d.freshmen}</Label>
        </Box>
        <Name player={d.player} size={11} />
      </Flex>
    </Bleed>
  );
};

export const PLAYER_FACES_MOBILE = {
  collage: CollageM,
  player_of_week: PlayerOfWeekM,
  breakout: BreakoutM,
  transfer_impact: TransferImpactM,
  freshman: FreshmanM,
};
