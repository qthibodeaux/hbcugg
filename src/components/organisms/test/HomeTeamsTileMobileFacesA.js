import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";
import LiveTile, { TileStyles, lastName } from "../../molecules/home/LiveTile";
import { vivid } from "../../molecules/home/StatsTileFaces";
import { GRID } from "../../molecules/home/usTileGrid";
import { TEAMS_MOCK_TILE } from "../../molecules/home/teamsTileMock";
import { teamLogo, teamMeta, teamShort, withAlpha } from "../../game/export/exportData";

// ─────────────────────────────────────────────────────────────────────────────
// HOME TEAMS TILE — MOBILE FACES (lab). One mobile face per contract key, for
// the ~190px square tile in the phone 2×2. One big visual + one big number per
// face; abbreviations and last names only; no headlines or fine print.
// Sized in cqmin off LiveTile's size container.
// ─────────────────────────────────────────────────────────────────────────────

const GOLD = "#EAB308";
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
const Bleed = (props) => <Box position="relative" h="100%" m="calc(-1 * var(--hl-pad, 3cqmin))" overflow="hidden" {...props} />;
const colorsOf = (id) => {
  const c = teamMeta(id)?.colors ?? {};
  return [c.primary, c.secondary, c.accent].filter(Boolean);
};

// ── Division Race — each row's background fills to its conference wins ──────
const DivisionRaceM = ({ item }) => {
  const { rows, games_total: total, group_label: label } = item.data;
  return (
    <Flex direction="column" h="100%" gap="2cqmin">
      <Big size={9}>{label}</Big>
      <Flex direction="column" flex={1} minH={0} gap="1.5cqmin">
        {rows.slice(0, 4).map((r, i) => {
          const pct = total ? r.conf_wins / total : 0;
          const accent = vivid(r.team_id);
          return (
            <Flex key={r.team_id} flex={1} minH={0} align="center" gap="2.5cqmin" px="2cqmin" position="relative" bg="rgba(255,255,255,0.04)">
              <Box position="absolute" left={0} top={0} bottom={0} bg={withAlpha(accent, i === 0 ? 0.5 : 0.22)} style={{ width: `${pct * 100}%` }} />
              <Box position="relative"><Logo id={r.team_id} size={i === 0 ? 12 : 10} /></Box>
              <Text position="relative" flex={1} minW={0} fontSize={i === 0 ? "8cqmin" : "7cqmin"} fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>{teamShort(r.team_id)}</Text>
              <Text position="relative" fontSize={i === 0 ? "9cqmin" : "7.5cqmin"} fontWeight="black" fontStyle="italic" color={i === 0 ? "white" : DIM} fontVariantNumeric="tabular-nums">
                {r.conf_wins}-{r.conf_losses}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};

// ── Defending Champs — the banner, the abbreviation, the conference record ──
const DefendingChampsM = ({ item }) => {
  const d = item.data;
  const [primary, secondary] = colorsOf(d.team_id);
  return (
    <Flex h="100%" gap="3cqmin" align="stretch">
      <Box w="46%" flexShrink={0}>
        <Svg w={186} h={300}>
          <rect x={0} y={0} width={186} height={10} fill="rgba(255,255,255,0.35)" />
          <path d="M 12 10 H 174 V 270 L 93 236 L 12 270 Z" fill={primary ?? "#333"} stroke={secondary ?? "#fff"} strokeWidth={6} />
          <image href={teamLogo(d.team_id)} x={33} y={34} width={120} height={120} preserveAspectRatio="xMidYMid meet" />
          <text x={93} y={202} fill={secondary ?? "#fff"} fontSize={46} fontWeight={900} fontStyle="italic" textAnchor="middle">{d.season}</text>
        </Svg>
      </Box>
      <Flex direction="column" justify="space-between" flex={1} minW={0} py="1cqmin">
        <Label color={GOLD}>Champs</Label>
        <Box>
          <Big size={15}>{teamShort(d.team_id)}</Big>
          <Big size={17} color={GOLD} mt="3cqmin">{d.conf_record}</Big>
          <Label mt="1.5cqmin">{d.conference}</Label>
        </Box>
      </Flex>
    </Flex>
  );
};

// ── Hot Streak — W and the count, huge, over the chain of wins ──────────────
const HotStreakM = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Flex align="center" gap="3cqmin">
        <Logo id={d.team_id} size={18} />
        <Box minW={0}>
          <Big size={9}>{teamShort(d.team_id)}</Big>
          <Label color={accent} mt="1cqmin">Streak</Label>
        </Box>
      </Flex>
      <Big size={42} color={accent} textAlign="center">W{d.streak}</Big>
      <Flex gap="1.5cqmin" h="10cqmin">
        {Array.from({ length: d.streak }, (_, i) => (
          <Box key={i} flex={1} bg={accent} transform="skewX(-12deg)" opacity={0.45 + (0.55 * (i + 1)) / d.streak} />
        ))}
      </Flex>
    </Flex>
  );
};

// ── Title Count — top four, a block per crown ───────────────────────────────
const TitleCountM = ({ item }) => {
  const { rows, conference } = item.data;
  const top = rows.slice(0, 4);
  const max = Math.max(...top.map((r) => r.titles));
  return (
    <Flex direction="column" h="100%" gap="2cqmin">
      <Flex align="baseline" gap="2cqmin">
        <Big size={9}>{conference}</Big>
        <Label color={GOLD}>Titles</Label>
      </Flex>
      <Flex flex={1} minH={0} gap="3cqmin" align="flex-end">
        {top.map((r, i) => (
          <Flex key={r.team_id} direction="column" align="center" justify="flex-end" flex={1} h="100%" gap="1.5cqmin" minW={0}>
            <Text fontSize="8cqmin" fontWeight="black" fontStyle="italic" color={i === 0 ? GOLD : "white"} lineHeight={1}>{r.titles}</Text>
            <Flex direction="column-reverse" w="100%" h={`${(r.titles / max) * 62}%`} gap="0.4cqmin">
              {Array.from({ length: r.titles }, (_, k) => (
                <Box key={k} flex={1} minH="1px" bg={i === 0 ? GOLD : withAlpha(vivid(r.team_id), 0.8)} />
              ))}
            </Flex>
            <Logo id={r.team_id} size={13} />
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

// ── The Band — the band's name, huge, across the staff ──────────────────────
const BandM = ({ item }) => {
  const id = item.data.team_id;
  const band = teamMeta(id)?.wiki?.marching_band ?? {};
  const [primary, secondary] = colorsOf(id);
  return (
    <Bleed p="var(--hl-pad, 3cqmin)" bg={`linear-gradient(150deg, ${withAlpha(primary, 0.7)} 0%, #141416 75%)`}>
      <Flex position="absolute" left={0} right={0} top="30%" h="30%" direction="column" justify="space-between" pointerEvents="none">
        {[0, 1, 2, 3, 4].map((k) => (
          <Box key={k} h="0.5cqmin" bg={withAlpha(secondary ?? "#ffffff", 0.3)} />
        ))}
      </Flex>
      <Flex position="relative" direction="column" h="100%" justify="space-between">
        <Flex align="center" gap="3cqmin">
          <Logo id={id} size={15} />
          <Label color="white">The Band</Label>
        </Flex>
        <Text fontSize="13cqmin" fontWeight="black" fontStyle="italic" textTransform="uppercase" color="white" lineHeight={0.9} letterSpacing="-0.03em" lineClamp={3}>
          {band.bandName ?? teamShort(id)}
        </Text>
      </Flex>
    </Bleed>
  );
};

// ── Colors — the swatches fill the tile, the logo sits on them ──────────────
const ColorsM = ({ item }) => {
  const id = item.data.team_id;
  return (
    <Bleed>
      <Flex position="absolute" inset={0}>
        {colorsOf(id).map((c) => <Box key={c} flex={1} bg={c} />)}
      </Flex>
      <Flex position="absolute" inset={0} align="center" justify="center" pb="12cqmin">
        <Box w="48cqmin" h="48cqmin" style={{ filter: "drop-shadow(0 3cqmin 5cqmin rgba(0,0,0,0.55))" }}>
          <Logo id={id} size={48} />
        </Box>
      </Flex>
      <Flex position="absolute" left={0} right={0} bottom={0} bg="#141416" px="var(--hl-pad, 3cqmin)" py="2.5cqmin" align="baseline" justify="space-between">
        <Big size={11}>{teamShort(id)}</Big>
        <Label>Colors</Label>
      </Flex>
    </Bleed>
  );
};

// ── Home Field — the stadium, and the home record ───────────────────────────
const HomeFieldM = ({ item }) => {
  const d = item.data;
  const meta = teamMeta(d.team_id) ?? {};
  const stadium = meta.wiki?.stadium?.name ?? meta.stadium;
  return (
    <Bleed>
      {d.image_url ? (
        <Image src={d.image_url} alt="" position="absolute" inset={0} w="100%" h="100%" objectFit="cover" opacity={0.65} onError={(e) => { e.currentTarget.style.display = "none"; }} />
      ) : (
        <Box position="absolute" inset={0} bg="repeating-linear-gradient(90deg, rgba(34,197,94,0.12) 0 10%, rgba(34,197,94,0.05) 10% 20%)" />
      )}
      <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(20,20,22,0.1) 0%, rgba(20,20,22,0.95) 72%)" />
      <Flex position="relative" direction="column" h="100%" justify="space-between" p="var(--hl-pad, 3cqmin)">
        <Logo id={d.team_id} size={16} />
        <Box>
          <Text fontSize="8cqmin" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.95} lineClamp={2} textShadow="0 2px 10px rgba(0,0,0,0.8)">{stadium}</Text>
          <Flex align="baseline" gap="2.5cqmin" mt="2cqmin">
            <Big size={22} color={vivid(d.team_id)}>{d.home_wins}-{d.home_losses}</Big>
            <Label>At home</Label>
          </Flex>
        </Box>
      </Flex>
    </Bleed>
  );
};

// ── Head Coach — the last name, the record, the seasons ─────────────────────
const HeadCoachM = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Flex align="center" gap="3cqmin">
        <Logo id={d.team_id} size={14} />
        <Label color={accent}>Head Coach</Label>
      </Flex>
      <Box>
        <Text fontSize="17cqmin" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.88} letterSpacing="-0.04em" lineClamp={1}>{lastName(d.coach_name)}</Text>
        <Big size={15} color={accent} mt="3cqmin">{d.record}</Big>
      </Box>
      <Box>
        <Flex gap="1cqmin" h="6cqmin">
          {Array.from({ length: d.seasons }, (_, i) => (
            <Box key={i} flex={1} bg={withAlpha(accent, 0.3 + (0.7 * (i + 1)) / d.seasons)} />
          ))}
        </Flex>
        <Label mt="1.5cqmin">Since {d.first_season}</Label>
      </Box>
    </Flex>
  );
};

// ── Roster DNA — the transfer ring, the class bar ───────────────────────────
const RosterDNAM = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  const total = d.classes.reduce((s, c) => s + c.count, 0) || 1;
  const pct = Math.round(d.transfer_rate * 100);
  const R = 15.9155;
  return (
    <Flex direction="column" h="100%" justify="space-between" gap="2cqmin">
      <Flex align="center" gap="3cqmin">
        <Logo id={d.team_id} size={14} />
        <Big size={9}>{teamShort(d.team_id)}</Big>
      </Flex>
      <Flex align="center" gap="4cqmin" flex={1} minH={0}>
        <Box h="100%" maxH="44cqmin" aspectRatio="1" position="relative" flexShrink={0}>
          <Svg w={36} h={36}>
            <circle cx={18} cy={18} r={R} fill="none" stroke={FAINT} strokeWidth={4} />
            <circle cx={18} cy={18} r={R} fill="none" stroke={accent} strokeWidth={4} strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={25} />
          </Svg>
          <Flex position="absolute" inset={0} align="center" justify="center">
            <Big size={11}>{pct}%</Big>
          </Flex>
        </Box>
        <Label color={accent} lineClamp={2}>Transfers</Label>
      </Flex>
      <Box>
        <Flex h="10cqmin">
          {d.classes.map((c, i) => (
            <Flex key={c.class} w={`${(c.count / total) * 100}%`} bg={withAlpha(accent, 0.3 + i * 0.17)} align="center" justify="center" borderRight="1px solid #141416">
              <Text fontSize="5cqmin" fontWeight="black" color="#0B0B0D">{c.count}</Text>
            </Flex>
          ))}
        </Flex>
        <Flex mt="1cqmin">
          {d.classes.map((c) => (
            <Text key={c.class} w={`${(c.count / total) * 100}%`} textAlign="center" fontSize="4cqmin" fontWeight="black" color={DIM} textTransform="uppercase">{c.class.replace(".", "")}</Text>
          ))}
        </Flex>
      </Box>
    </Flex>
  );
};

// ── Pipeline — the in-state share, then the top three states ────────────────
const PipelineM = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  const top = [...d.states].sort((a, b) => b.count - a.count).slice(0, 3);
  const max = top[0]?.count || 1;
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Flex align="center" gap="3cqmin">
        <Logo id={d.team_id} size={14} />
        <Label color={accent}>Pipeline</Label>
      </Flex>
      <Flex align="baseline" gap="2.5cqmin">
        <Big size={26} color={accent}>{Math.round(d.in_state_pct * 100)}%</Big>
        <Label>From {d.home_state}</Label>
      </Flex>
      <Flex direction="column" gap="1.5cqmin">
        {top.map((s, i) => (
          <Flex key={s.state} align="center" gap="2cqmin" h="8cqmin">
            <Text w="10cqmin" fontSize="6cqmin" fontWeight="black" color="white">{s.state}</Text>
            <Box flex={1} h="100%" bg="rgba(255,255,255,0.05)">
              <Box h="100%" bg={withAlpha(accent, i === 0 ? 0.9 : 0.5)} style={{ width: `${(s.count / max) * 100}%` }} />
            </Box>
            <Text w="9cqmin" textAlign="right" fontSize="6cqmin" fontWeight="black" fontStyle="italic" color={i === 0 ? "white" : DIM} fontVariantNumeric="tabular-nums">{s.count}</Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

// ── Rivalry — two logos, the series between them ───────────────────────────
const RivalryM = ({ item }) => {
  const d = item.data;
  const ca = vivid(d.team_a);
  const cb = vivid(d.team_b);
  return (
    <Bleed bg={`linear-gradient(110deg, ${withAlpha(ca, 0.45)} 0%, ${withAlpha(ca, 0.08)} 49.8%, ${withAlpha(cb, 0.08)} 50.2%, ${withAlpha(cb, 0.45)} 100%)`}>
      <Flex direction="column" h="100%" p="var(--hl-pad, 3cqmin)" justify="space-between">
        <Text textAlign="center" fontSize="8cqmin" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.95} lineClamp={2}>{d.event_name}</Text>
        <Flex align="center" justify="space-between">
          <Logo id={d.team_a} size={30} />
          <Logo id={d.team_b} size={30} />
        </Flex>
        <Flex align="baseline" justify="center" gap="3cqmin">
          <Big size={22} color={d.wins_a >= d.wins_b ? "white" : DIM}>{d.wins_a}</Big>
          <Text fontSize="9cqmin" fontWeight="black" color={DIM}>–</Text>
          <Big size={22} color={d.wins_b >= d.wins_a ? "white" : DIM}>{d.wins_b}</Big>
        </Flex>
      </Flex>
    </Bleed>
  );
};

// ── The Map — only the states with programs, logos filling their squares ────
const BY_STATE = teamsData.teams.reduce((acc, t) => {
  (acc[t.state] = acc[t.state] ?? []).push(String(t.exportId).replace(/25$/, ""));
  return acc;
}, {});
const MAP_STATES = Object.keys(BY_STATE).filter((st) => GRID[st]);
const MAP_C = [Math.min(...MAP_STATES.map((st) => GRID[st][0])), Math.max(...MAP_STATES.map((st) => GRID[st][0]))];
const MAP_R = [Math.min(...MAP_STATES.map((st) => GRID[st][1])), Math.max(...MAP_STATES.map((st) => GRID[st][1]))];
const MC = 30;
const TheMapM = () => {
  const w = (MAP_C[1] - MAP_C[0] + 1) * MC;
  const h = (MAP_R[1] - MAP_R[0] + 1) * MC;
  const swac = "#A855F7";
  const meac = "#38BDF8";
  return (
    <Box position="relative" h="100%">
      <Flex position="absolute" inset={0} align="flex-end">
        <Svg w={w} h={h}>
          {MAP_STATES.map((st) => {
            const [c, r] = GRID[st];
            const ids = BY_STATE[st];
            const x = (c - MAP_C[0]) * MC;
            const y = (r - MAP_R[0]) * MC;
            const conf = ids[0].startsWith("swac") ? swac : meac;
            const n = ids.length;
            const s = n > 2 ? 14 : n > 1 ? 15 : 25;
            const pos = n === 1 ? [[15, 15]] : n === 2 ? [[8.5, 11], [21.5, 19]] : [[8.5, 9], [21.5, 9], [15, 21.5]];
            return (
              <g key={st}>
                <rect x={x + 1} y={y + 1} width={MC - 2} height={MC - 2} fill={withAlpha(conf, 0.28)} stroke={withAlpha(conf, 0.8)} strokeWidth={1} />
                {ids.map((id, k) => (
                  <image key={id} href={teamLogo(id)} x={x + pos[k][0] - s / 2} y={y + pos[k][1] - s / 2} width={s} height={s} preserveAspectRatio="xMidYMid meet" />
                ))}
              </g>
            );
          })}
        </Svg>
      </Flex>
      <Box position="absolute" left={0} top={0}>
        <Big size={13}>{teamsData.teams.length}</Big>
        <Label mt="1cqmin">Programs</Label>
      </Box>
    </Box>
  );
};

export const TEAM_FACES_MOBILE = {
  division_race: DivisionRaceM,
  defending_champs: DefendingChampsM,
  hot_streak: HotStreakM,
  title_count: TitleCountM,
  band: BandM,
  colors: ColorsM,
  home_field: HomeFieldM,
  head_coach: HeadCoachM,
  roster_dna: RosterDNAM,
  pipeline: PipelineM,
  rivalry: RivalryM,
  the_map: TheMapM,
};

// ── Lab export ───────────────────────────────────────────────────────────────
// Every face at phone tile size (the 2×2 on a ~390px phone), then one tile
// rotating through them all.

const TILE = "195px";
const items = TEAMS_MOCK_TILE.items.filter((it) => TEAM_FACES_MOBILE[it.key]);
const faceOf = (it, n) => {
  const Face = TEAM_FACES_MOBILE[it.key];
  return <Face key={`${it.key}-${n}`} item={it} />;
};

export const HomeTeamsTileMobileFacesA = () => (
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
