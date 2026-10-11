import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { BigNumber, Headline, Mark, Micro, useTileVariant } from "./LiveTile";
import { vivid } from "./StatsTileFaces";
import { TEAM_FACES_MOBILE } from "./TeamsTileFacesMobile";
import { teamLogo, teamMeta, teamShort, withAlpha } from "../../game/export/exportData";

// ─────────────────────────────────────────────────────────────────────────────
// HOME TEAMS TILE — one face per item key in
// src/pages/teams/md/Home Teams Tile Fetch Contract.md.
//
// The backend picks every item and every team. Identity content (band, colors,
// stadium name, city) is joined from src/data/teams.json by team_id; everything
// else is read from the item's `data`. TEAM_FACES[item.key] is the whole API.
// ─────────────────────────────────────────────────────────────────────────────

const GOLD = "#EAB308";
const INK = "rgba(255,255,255,0.88)";
const FAINT = "rgba(255,255,255,0.14)";
const DIM = "rgba(255,255,255,0.45)";

const Title = ({ children, color = DIM, ...rest }) => <Micro color={color} size={2.6} {...rest}>{children}</Micro>;
const colorsOf = (id) => {
  const c = teamMeta(id)?.colors ?? {};
  return [c.primary, c.secondary, c.accent].filter(Boolean);
};
const shortDate = (iso) => {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// ── Division Race — lanes on a track, the leader closest to the line ────────
const DivisionRace = ({ item }) => {
  const { rows, games_total: total, group_label: label } = item.data;
  return (
    <Flex direction="column" h="100%" gap="2cqmin">
      <Flex justify="space-between" align="baseline">
        <Title>{item.title}</Title>
        <Text fontSize="4.6cqmin" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase">{label}</Text>
      </Flex>
      <Flex direction="column" flex={1} minH={0} justify="space-between" position="relative">
        <Box position="absolute" right="11cqmin" top={0} bottom={0} w="0.6cqmin" bg="repeating-linear-gradient(180deg, #fff 0 1.5cqmin, transparent 1.5cqmin 3cqmin)" opacity={0.5} />
        {rows.map((r, i) => {
          const pct = total ? r.conf_wins / total : 0;
          const accent = vivid(r.team_id);
          return (
            <Flex key={r.team_id} align="center" flex={1} minH={0} borderBottom="1px dashed" borderColor={FAINT} position="relative">
              <Box position="absolute" left={0} right="11cqmin" top="50%" h="0.5cqmin" bg={withAlpha(accent, i === 0 ? 0.7 : 0.25)} style={{ width: `calc((100% - 11cqmin) * ${pct})` }} />
              <Box position="absolute" style={{ left: `calc((100% - 11cqmin) * ${pct} - 3cqmin)` }}>
                <Mark logo={teamLogo(r.team_id)} label={teamShort(r.team_id)} size={i === 0 ? 8 : 6} />
              </Box>
              <Text ml="auto" w="10cqmin" textAlign="right" fontSize="3cqmin" fontWeight="black" color={i === 0 ? "white" : DIM} fontVariantNumeric="tabular-nums">
                {r.conf_wins}-{r.conf_losses}
              </Text>
            </Flex>
          );
        })}
      </Flex>
      <Headline size={4.4} lines={1}>{item.headline}</Headline>
    </Flex>
  );
};

// ── Hot Streak — the run, link by link ──────────────────────────────────────
const HotStreak = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  return (
    <Box position="relative" h="100%" overflow="hidden">
      <Text position="absolute" right="-2cqmin" top="-10cqmin" fontSize="78cqmin" fontWeight="black" fontStyle="italic" lineHeight={1} color={withAlpha(accent, 0.16)} letterSpacing="-0.06em" pointerEvents="none">
        {d.streak}
      </Text>
      <Flex position="relative" direction="column" h="100%" justify="space-between">
        <Flex align="center" gap="3cqmin">
          <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={16} />
          <Box>
            <Title color={accent}>{item.title}</Title>
            <Text fontSize="5cqmin" fontWeight="black" color="white" mt="1cqmin">{d.record}</Text>
          </Box>
        </Flex>
        <Headline size={7} lines={2}>{item.headline}</Headline>
        <Flex gap="1.4cqmin" h="11cqmin">
          {Array.from({ length: d.streak }, (_, i) => (
            <Flex key={i} flex={1} align="center" justify="center" bg={accent} borderRadius="md" transform={`skewX(-12deg)`} opacity={0.55 + (0.45 * (i + 1)) / d.streak}>
              <Text fontSize="5cqmin" fontWeight="black" color="#0B0B0D" transform="skewX(12deg)">W</Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};

// ── The Band — the name across a music staff in the school's colors ─────────
const Band = ({ item }) => {
  const id = item.data.team_id;
  const band = teamMeta(id)?.wiki?.marching_band ?? {};
  const [primary, secondary] = colorsOf(id);
  return (
    <Box position="relative" h="100%" m="calc(-1 * var(--hl-pad, 5cqmin))" p="var(--hl-pad, 5cqmin)" overflow="hidden" bg={`linear-gradient(135deg, ${withAlpha(primary, 0.55)} 0%, #141416 70%)`}>
      <Flex position="absolute" left={0} right={0} top="34%" h="34%" direction="column" justify="space-between" pointerEvents="none">
        {[0, 1, 2, 3, 4].map((k) => (
          <Box key={k} h="0.35cqmin" bg={withAlpha(secondary ?? "#ffffff", 0.35)} />
        ))}
      </Flex>
      <Flex position="relative" direction="column" h="100%" justify="space-between">
        <Flex align="center" gap="3cqmin">
          <Mark logo={teamLogo(id)} label={teamShort(id)} size={12} />
          <Title color={INK}>{item.title} · {teamShort(id)}</Title>
        </Flex>
        <Box>
          <Text fontSize="11cqmin" fontWeight="black" fontStyle="italic" textTransform="uppercase" color="white" lineHeight={0.92} letterSpacing="-0.02em" lineClamp={3}>
            {band.bandName ?? "—"}
          </Text>
          {band.signatureSelection ? (
            <Text fontSize="5cqmin" fontWeight="black" color={lumColor(secondary)} mt="2cqmin" fontStyle="italic">“{band.signatureSelection}”</Text>
          ) : null}
        </Box>
        <Flex gap="6cqmin">
          {band.founded ? <Stat label="Since" value={band.founded} /> : null}
          {band.size ? <Stat label="Members" value={band.size} /> : null}
          {band.bandNickname ? <Stat label="Known as" value={band.bandNickname} /> : null}
        </Flex>
      </Flex>
    </Box>
  );
};
const lumColor = (hex) => (hex && hex.toUpperCase() !== "#FFFFFF" ? hex : "#FFFFFF");
const Stat = ({ label, value }) => (
  <Box>
    <Text fontSize="6cqmin" fontWeight="black" fontStyle="italic" color="white" lineHeight={1}>{value}</Text>
    <Micro size={2.2} mt="1cqmin">{label}</Micro>
  </Box>
);

// ── Home Field — the stadium, and how hard it is to win there ───────────────
const HomeField = ({ item }) => {
  const d = item.data;
  const meta = teamMeta(d.team_id) ?? {};
  const stadium = meta.wiki?.stadium?.name ?? meta.stadium;
  const accent = vivid(d.team_id);
  return (
    <Box position="relative" h="100%" m="calc(-1 * var(--hl-pad, 5cqmin))" overflow="hidden">
      {d.image_url ? (
        <Image src={d.image_url} alt="" position="absolute" inset={0} w="100%" h="100%" objectFit="cover" opacity={0.55} onError={(e) => { e.currentTarget.style.display = "none"; }} />
      ) : (
        <Box position="absolute" inset={0} bg={`repeating-linear-gradient(90deg, rgba(34,197,94,0.10) 0 8%, rgba(34,197,94,0.05) 8% 16%)`} />
      )}
      <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(20,20,22,0.2) 0%, rgba(20,20,22,0.95) 78%)" />
      <Flex position="relative" direction="column" h="100%" justify="space-between" p="var(--hl-pad, 5cqmin)">
        <Flex justify="space-between" align="flex-start">
          <Title color={INK}>{item.title}</Title>
          <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={14} />
        </Flex>
        <Box>
          <Text fontSize="8cqmin" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.95} lineClamp={2} textShadow="0 2px 14px rgba(0,0,0,0.8)">{stadium}</Text>
          <Flex gap="6cqmin" mt="3cqmin" align="flex-end">
            <Box>
              <BigNumber size={13} color={accent}>{d.home_wins}-{d.home_losses}</BigNumber>
              <Micro size={2.2} mt="1cqmin">At home</Micro>
            </Box>
            {meta.stadiumCapacity ? <Stat label="Capacity" value={Number(meta.stadiumCapacity).toLocaleString()} /> : null}
            {meta.wiki?.stadium?.built ? <Stat label="Opened" value={meta.wiki.stadium.built} /> : null}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

// ── Rivalry — two programs, face to face ────────────────────────────────────
const Rivalry = ({ item }) => {
  const d = item.data;
  const ca = vivid(d.team_a);
  const cb = vivid(d.team_b);
  return (
    <Box position="relative" h="100%" m="calc(-1 * var(--hl-pad, 5cqmin))" overflow="hidden">
      <Box position="absolute" inset={0} bg={`linear-gradient(110deg, ${withAlpha(ca, 0.35)} 0%, ${withAlpha(ca, 0.08)} 49.8%, ${withAlpha(cb, 0.08)} 50.2%, ${withAlpha(cb, 0.35)} 100%)`} />
      <Flex position="relative" direction="column" h="100%" p="var(--hl-pad, 5cqmin)" justify="space-between">
        <Box textAlign="center">
          <Title>{item.title}</Title>
          <Text fontSize="6.4cqmin" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={1} mt="1cqmin" lineClamp={1}>{d.event_name}</Text>
        </Box>
        <Flex align="center" justify="space-between">
          <Mark logo={teamLogo(d.team_a)} label={teamShort(d.team_a)} size={26} />
          <Flex align="baseline" gap="3cqmin">
            <BigNumber size={20} color={d.wins_a >= d.wins_b ? "white" : DIM}>{d.wins_a}</BigNumber>
            <Text fontSize="7cqmin" fontWeight="black" color={DIM}>–</Text>
            <BigNumber size={20} color={d.wins_b >= d.wins_a ? "white" : DIM}>{d.wins_b}</BigNumber>
          </Flex>
          <Mark logo={teamLogo(d.team_b)} label={teamShort(d.team_b)} size={26} />
        </Flex>
        <Flex justify="space-between" align="flex-end" gap="4cqmin">
          {d.last_meeting ? (
            <Box>
              <Text fontSize="4.4cqmin" fontWeight="black" color="white">{d.last_meeting.a_score}–{d.last_meeting.b_score}</Text>
              <Micro size={2.1}>{shortDate(d.last_meeting.date)}</Micro>
            </Box>
          ) : <Box />}
          {d.next_meeting ? (
            <Box textAlign="right">
              <Text fontSize="4.4cqmin" fontWeight="black" color={GOLD}>{shortDate(d.next_meeting.date)}</Text>
              {d.next_meeting.venue ? <Micro size={2.1}>{d.next_meeting.venue}</Micro> : null}
            </Box>
          ) : null}
        </Flex>
      </Flex>
    </Box>
  );
};

// ── Registry ─────────────────────────────────────────────────────────────────

export const TEAM_FACES = {
  division_race: DivisionRace,
  hot_streak: HotStreak,
  band: Band,
  home_field: HomeField,
  rivalry: Rivalry,
};

// rotation → items → faces. Items are matched by index so one key (a
// division race) can appear more than once.
export const teamFacesFor = (payload) => {
  const items = payload?.items ?? [];
  const pool = [...items];
  return (payload?.rotation ?? [])
    .map((k) => {
      const i = pool.findIndex((x) => x.key === k);
      return i >= 0 ? pool.splice(i, 1)[0] : null;
    })
    .filter((it) => it && TEAM_FACES[it.key])
    .map((it, n) => <TeamFace key={`${it.key}-${n}`} item={it} />);
};

// The tile's variant picks the face: mobile tiles get their own versions.
const TeamFace = ({ item }) => {
  const mobile = useTileVariant() === "mobile";
  const Face = (mobile && TEAM_FACES_MOBILE[item.key]) || TEAM_FACES[item.key];
  return <Face item={item} />;
};
