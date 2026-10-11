import { useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import LiveTile, { TileStyles, lastName } from "../../molecules/home/LiveTile";
import { vivid } from "../../molecules/home/StatsTileFaces";
import { PLAYERS_MOCK_TILE } from "../../molecules/home/playersTileMock";
import { teamLogo, teamMeta, teamShort, withAlpha } from "../../game/export/exportData";

// ─────────────────────────────────────────────────────────────────────────────
// HOME PLAYERS TILE — MOBILE FACES (lab). One mobile face per contract key, for
// the ~190px square tile in the phone 2×2. Photo-led where there is a photo;
// last names only; one big number per face; no headlines or fine print.
// Sized in cqmin off LiveTile's size container.
// ─────────────────────────────────────────────────────────────────────────────

const GOOD = "#22C55E";
const BAD = "#EF4444";
const GOLD = "#EAB308";
const FAINT = "rgba(255,255,255,0.14)";
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

// ── QB Spotlight — the throw map, the completion rate ───────────────────────
const QBSpotlightM = ({ item }) => {
  const { player, throws, line } = item.data;
  const accent = vivid(player.team_id);
  const W = 160;
  const H = 300;
  const x = (v) => W / 2 + (v / 28) * (W / 2 - 8);
  const y = (d) => H - 30 - (d / 45) * (H - 45);
  const top = line[0];
  return (
    <Flex h="100%" gap="3cqmin">
      <Box w="42%" flexShrink={0}>
        <Svg w={W} h={H}>
          <rect x={0} y={0} width={W} height={H} fill="rgba(34,197,94,0.08)" />
          {[0, 10, 20, 30, 40].map((d) => (
            <line key={d} x1={0} x2={W} y1={y(d)} y2={y(d)} stroke={d === 0 ? "#fff" : FAINT} strokeWidth={d === 0 ? 3 : 1.2} />
          ))}
          {throws.map((t, i) => (
            <circle key={i} cx={x(t.x)} cy={y(t.depth)} r={t.td ? 9 : 7} fill={t.td ? GOLD : t.complete ? accent : "none"} stroke={t.complete || t.td ? "none" : "rgba(239,68,68,0.8)"} strokeWidth={2.5} opacity={0.9} />
          ))}
        </Svg>
      </Box>
      <Flex direction="column" justify="space-between" flex={1} minW={0}>
        <Photo player={player} w="100%" h="38cqmin" logoSize={20} />
        <Name player={player} size={9} />
        <Box>
          <Big size={17} color={accent}>{top.display}</Big>
          <Label mt="1cqmin">{top.label}</Label>
        </Box>
      </Flex>
    </Flex>
  );
};

// ── Ball Carrier — three lanes, yards per carry on each ─────────────────────
const LANE = { left: "L", middle: "M", right: "R" };
const BallCarrierM = ({ item }) => {
  const { player, lanes } = item.data;
  const accent = vivid(player.team_id);
  const ypc = (l) => l.yards / Math.max(1, l.carries);
  const best = Math.max(...lanes.map(ypc));
  const ordered = ["left", "middle", "right"].map((k) => lanes.find((l) => l.lane === k)).filter(Boolean);
  return (
    <Flex direction="column" h="100%" gap="2.5cqmin">
      <Flex align="center" gap="3cqmin">
        <Photo player={player} w="20cqmin" h="20cqmin" flexShrink={0} logoSize={14} />
        <Name player={player} size={10} />
      </Flex>
      <Flex flex={1} minH={0} gap="2cqmin" align="flex-end">
        {ordered.map((l) => {
          const v = ypc(l);
          const top = v === best;
          return (
            <Flex key={l.lane} direction="column" flex={1} h="100%" justify="flex-end" align="center" gap="1cqmin">
              <Text fontSize={top ? "9cqmin" : "7.5cqmin"} fontWeight="black" fontStyle="italic" color={top ? "white" : DIM} lineHeight={1}>{v.toFixed(1)}</Text>
              <Box w="100%" h={`${(v / best) * 62}%`} bg={withAlpha(accent, top ? 0.95 : 0.45)} />
              <Text fontSize="5.5cqmin" fontWeight="black" color={DIM}>{LANE[l.lane] ?? l.lane}</Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};

// ── Go-To Target — his face inside his share of the targets ─────────────────
const GoToTargetM = ({ item }) => {
  const { player, target_share: share } = item.data;
  const accent = vivid(player.team_id);
  const pct = Math.round(share * 100);
  const R = 15.9155;
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Flex align="center" gap="3cqmin" flex={1} minH={0}>
        <Box h="100%" maxH="62cqmin" aspectRatio="1" position="relative" flexShrink={0}>
          <Svg w={36} h={36}>
            <circle cx={18} cy={18} r={R} fill="none" stroke={FAINT} strokeWidth={3} />
            <circle cx={18} cy={18} r={R} fill="none" stroke={accent} strokeWidth={3} strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={25} />
          </Svg>
          <Box position="absolute" inset="15%" borderRadius="full" overflow="hidden" bg="#1A1A1D">
            <Photo player={player} w="100%" h="100%" logoSize={20} />
          </Box>
        </Box>
        <Box minW={0}>
          <Big size={17} color={accent}>{pct}%</Big>
          <Label mt="1.5cqmin" lineClamp={2}>Targets</Label>
        </Box>
      </Flex>
      <Name player={player} size={11} mt="2cqmin" />
    </Flex>
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

// ── Record Chase — the bar to the line, how close he is ─────────────────────
const RecordChaseM = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.player.team_id);
  const pct = Math.min(1, d.current / d.record);
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Flex align="center" gap="3cqmin">
        <Photo player={d.player} w="20cqmin" h="20cqmin" flexShrink={0} logoSize={14} />
        <Name player={d.player} size={10} />
      </Flex>
      <Box>
        <Big size={17} color={accent}>{d.current_display}</Big>
        <Box position="relative" h="9cqmin" mt="2.5cqmin" bg="rgba(255,255,255,0.07)">
          <Box h="100%" bg={`linear-gradient(90deg, ${withAlpha(accent, 0.4)}, ${accent})`} style={{ width: `${pct * 100}%` }} />
          <Box position="absolute" right={0} top="-2cqmin" bottom="-2cqmin" w="1.6cqmin" bg="repeating-linear-gradient(180deg, #fff 0 1.6cqmin, #0B0B0D 1.6cqmin 3.2cqmin)" />
        </Box>
        <Flex justify="space-between" align="baseline" mt="2cqmin" gap="2cqmin">
          <Label lineClamp={1}>{d.record_label}</Label>
          <Big size={9} color={GOLD} flexShrink={0}>{d.record_display}</Big>
        </Flex>
      </Box>
    </Flex>
  );
};

// ── Veteran — a career, one logo per season ─────────────────────────────────
const VeteranM = ({ item }) => {
  const { player, seasons } = item.data;
  const accent = vivid(player.team_id);
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Flex align="flex-end" gap="3cqmin">
        <Photo player={player} w="26cqmin" h="30cqmin" flexShrink={0} logoSize={16} />
        <Box minW={0}>
          <Big size={15} color={accent}>{seasons.length}</Big>
          <Label mt="1cqmin">Seasons</Label>
        </Box>
      </Flex>
      <Name player={player} size={11} />
      <Flex position="relative" align="flex-start">
        <Box position="absolute" left="8%" right="8%" top="6cqmin" h="0.6cqmin" bg={withAlpha(accent, 0.5)} />
        {seasons.map((s, i) => {
          const now = i === seasons.length - 1;
          return (
            <Flex key={s.season} direction="column" align="center" flex={1} gap="1cqmin" position="relative">
              <Flex w="12cqmin" h="12cqmin" borderRadius="full" bg={now ? accent : "#1A1A1D"} border="0.6cqmin solid" borderColor={accent} align="center" justify="center">
                <Logo id={s.team_id} size={8} />
              </Flex>
              <Text fontSize="4.5cqmin" fontWeight="black" color={now ? "white" : DIM}>’{String(s.season).slice(2)}</Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};

// ── Hometown Hero — the hometown, huge, over his photo ──────────────────────
const HometownHeroM = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.player.team_id);
  return (
    <Bleed bg={withAlpha(accent, 0.2)}>
      <Photo player={d.player} fade position="absolute" right={0} top={0} h="100%" w="60%" />
      <Flex position="relative" direction="column" h="100%" justify="space-between" p="var(--hl-pad, 3cqmin)">
        <Label color={accent}>Hometown</Label>
        <Box>
          <Text fontSize="13cqmin" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.9} letterSpacing="-0.03em" lineClamp={2} textShadow="0 2px 12px rgba(0,0,0,0.8)" maxW="90%">
            {d.home_city}
          </Text>
          <Flex align="center" gap="2cqmin" mt="2cqmin">
            <Big size={9} color={accent}>{d.home_state}</Big>
            <Text fontSize="7cqmin" fontWeight="black" color={DIM}>→</Text>
            <Logo id={d.player.team_id} size={11} />
          </Flex>
        </Box>
        <Name player={d.player} size={9} />
      </Flex>
    </Bleed>
  );
};

// ── The Leg — every kick by distance, makes and misses ──────────────────────
const TheLegM = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.player.team_id);
  const W = 300;
  const H = 120;
  const x = (yd) => 10 + ((yd - 15) / 45) * (W - 20);
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Name player={d.player} size={10} />
      <Flex align="baseline" gap="3cqmin">
        <Big size={20} color={accent}>{d.made}/{d.attempts}</Big>
        <Box>
          <Big size={9}>{d.long}</Big>
          <Label>Long</Label>
        </Box>
      </Flex>
      <Box h="32cqmin">
        <Svg w={W} h={H}>
          <rect x={0} y={10} width={W} height={H - 34} fill="rgba(34,197,94,0.08)" />
          {[20, 30, 40, 50].map((yd) => (
            <g key={yd}>
              <line x1={x(yd)} x2={x(yd)} y1={10} y2={H - 24} stroke={FAINT} strokeWidth={1.2} />
              <text x={x(yd)} y={H - 4} fill={DIM} fontSize={17} fontWeight={900} textAnchor="middle">{yd}</text>
            </g>
          ))}
          {d.kicks.map((k, i) => (
            <line key={i} x1={x(k.distance)} x2={x(k.distance)} y1={H - 24} y2={k.made ? 14 : 52} stroke={k.made ? GOOD : BAD} strokeWidth={5} strokeLinecap="round" />
          ))}
        </Svg>
      </Box>
    </Flex>
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
  qb_spotlight: QBSpotlightM,
  ball_carrier: BallCarrierM,
  go_to_target: GoToTargetM,
  breakout: BreakoutM,
  transfer_impact: TransferImpactM,
  record_chase: RecordChaseM,
  veteran: VeteranM,
  hometown_hero: HometownHeroM,
  the_leg: TheLegM,
  freshman: FreshmanM,
};

// ── Lab export ───────────────────────────────────────────────────────────────
// Every face at phone tile size (the 2×2 on a ~390px phone), then one tile
// rotating through them all.

const TILE = "195px";
const items = PLAYERS_MOCK_TILE.items.filter((it) => PLAYER_FACES_MOBILE[it.key]);
const faceOf = (it, n) => {
  const Face = PLAYER_FACES_MOBILE[it.key];
  return <Face key={`${it.key}-${n}`} item={it} />;
};

export const HomePlayersTileMobileFacesA = () => (
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
          {items.map((it, n) => (
            <Box key={`${it.key}-${n}`}>
              <Box w={TILE} h={TILE} display="grid">
                <LiveTile href="#" variant="mobile" faces={[faceOf(it, n)]} />
              </Box>
              <Text fontSize="10px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mt={1}>{it.key.replace(/_/g, " ")}</Text>
            </Box>
          ))}
        </Grid>
      </Box>
    </Flex>
  </Box>
);
