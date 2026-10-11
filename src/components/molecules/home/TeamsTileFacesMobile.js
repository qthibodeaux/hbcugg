import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { vivid } from "./StatsTileFaces";
import { teamLogo, teamMeta, teamShort, withAlpha } from "../../game/export/exportData";

// ─────────────────────────────────────────────────────────────────────────────
// HOME TEAMS TILE — MOBILE FACES. One mobile face per contract key, for
// the ~190px square tile in the phone 2×2. One big visual + one big number per
// face; abbreviations and last names only; no headlines or fine print.
// Sized in cqmin off LiveTile's size container. TeamsTileFaces picks these
// when the tile's variant is "mobile".
// ─────────────────────────────────────────────────────────────────────────────

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

export const TEAM_FACES_MOBILE = {
  division_race: DivisionRaceM,
  hot_streak: HotStreakM,
  band: BandM,
  home_field: HomeFieldM,
  rivalry: RivalryM,
};
