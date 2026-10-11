// ARCHIVE (2026-10-03): the full home-tile face catalog before the cut to 5
// per tile. Not imported anywhere. Mobile versions of the Teams and Players
// faces live in ../HomeTeamsTileMobileFacesA.js / ../HomePlayersTileMobileFacesA.js.
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import teamsData from "../../../../data/teams.json";
import { BigNumber, Headline, Mark, Micro, useTileVariant } from "../../../molecules/home/LiveTile";
import { vivid } from "../../../molecules/home/StatsTileFaces";
import { CELL, GRID } from "../../../molecules/home/usTileGrid";
import { teamLogo, teamMeta, teamName, teamShort, withAlpha } from "../../../game/export/exportData";

// ─────────────────────────────────────────────────────────────────────────────
// HOME TEAMS TILE — one face per item key in
// src/pages/teams/md/Home Teams Tile Fetch Contract.md.
//
// The backend picks every item and every team. Identity content (band, colors,
// stadium name, city) is joined from src/data/teams.json by team_id; everything
// else is read from the item's `data`. TEAM_FACES[item.key] is the whole API.
// ─────────────────────────────────────────────────────────────────────────────

const GOOD = "#22C55E";
const BAD = "#EF4444";
const GOLD = "#EAB308";
const INK = "rgba(255,255,255,0.88)";
const FAINT = "rgba(255,255,255,0.14)";
const DIM = "rgba(255,255,255,0.45)";

const Title = ({ children, color = DIM, ...rest }) => <Micro color={color} size={2.6} {...rest}>{children}</Micro>;
const Svg = ({ w, h, children, ...rest }) => (
  <Box as="svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" w="100%" h="100%" display="block" overflow="visible" {...rest}>
    {children}
  </Box>
);
const Logo = ({ id, x, y, s, opacity = 1 }) => (
  <image href={teamLogo(id)} x={x - s / 2} y={y - s / 2} width={s} height={s} opacity={opacity} preserveAspectRatio="xMidYMid meet" />
);
// Full school name on desktop, abbreviation on mobile.
const useSchool = () => {
  const mobile = useTileVariant() === "mobile";
  return (id) => (mobile ? teamShort(id) : teamName(id));
};
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

// ── Defending Champs — a banner hanging from the rafters ────────────────────
const DefendingChamps = ({ item }) => {
  const d = item.data;
  const school = useSchool();
  const [primary, secondary] = colorsOf(d.team_id);
  return (
    <Flex h="100%" gap="5cqmin">
      <Box w="40%" maxH="100%" aspectRatio="0.62" flexShrink={0} alignSelf="center" position="relative">
        <Svg w={186} h={300}>
          <rect x={0} y={0} width={186} height={10} fill="rgba(255,255,255,0.35)" />
          <path d="M 12 10 H 174 V 270 L 93 236 L 12 270 Z" fill={primary ?? "#333"} stroke={secondary ?? "#fff"} strokeWidth={5} />
          <path d="M 24 22 H 162 V 252 L 93 223 L 24 252 Z" fill="none" stroke={secondary ?? "#fff"} strokeWidth={1.5} strokeDasharray="5 4" opacity={0.8} />
          <Logo id={d.team_id} x={93} y={92} s={92} />
          <text x={93} y={172} fill={secondary ?? "#fff"} fontSize={40} fontWeight={900} fontStyle="italic" textAnchor="middle">{d.season}</text>
          <text x={93} y={200} fill={secondary ?? "#fff"} fontSize={15} fontWeight={900} textAnchor="middle" letterSpacing="3">{d.conference}</text>
          <text x={93} y={218} fill={secondary ?? "#fff"} fontSize={12} fontWeight={900} textAnchor="middle" letterSpacing="3">CHAMPIONS</text>
        </Svg>
      </Box>
      <Flex direction="column" justify="space-between" flex={1} minW={0}>
        <Title color={GOLD}>{item.title}</Title>
        <Box>
          <Text fontSize="7cqmin" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={1} lineClamp={2}>{school(d.team_id)}</Text>
          <Flex gap="4cqmin" mt="3cqmin" align="baseline">
            <Box>
              <BigNumber size={12}>{d.record}</BigNumber>
              <Micro size={2.2} mt="1cqmin">Overall</Micro>
            </Box>
            <Box>
              <BigNumber size={12} color={GOLD}>{d.conf_record}</BigNumber>
              <Micro size={2.2} mt="1cqmin">{d.conference}</Micro>
            </Box>
          </Flex>
        </Box>
        <Headline size={4.8} lines={3}>{item.headline}</Headline>
      </Flex>
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

// ── Title Count — one block per championship ────────────────────────────────
const TitleCount = ({ item }) => {
  const { rows, conference } = item.data;
  const max = Math.max(...rows.map((r) => r.titles));
  return (
    <Flex direction="column" h="100%" gap="2cqmin">
      <Flex justify="space-between" align="baseline">
        <Title color={GOLD}>{item.title}</Title>
        <Text fontSize="4.6cqmin" fontWeight="black" fontStyle="italic" color="white">{conference}</Text>
      </Flex>
      <Flex flex={1} minH={0} gap="2cqmin" align="flex-end">
        {rows.map((r, i) => (
          <Flex key={r.team_id} direction="column" align="center" justify="flex-end" flex={1} h="100%" gap="1cqmin" minW={0}>
            <Text fontSize="3.6cqmin" fontWeight="black" color={i === 0 ? GOLD : INK}>{r.titles}</Text>
            <Flex direction="column-reverse" w="100%" h={`${(r.titles / max) * 70}%`} gap="0.35cqmin">
              {Array.from({ length: r.titles }, (_, k) => (
                <Box key={k} flex={1} minH="1px" bg={i === 0 ? GOLD : withAlpha(vivid(r.team_id), 0.75)} borderRadius="1px" />
              ))}
            </Flex>
            <Mark logo={teamLogo(r.team_id)} label={teamShort(r.team_id)} size={6.5} />
          </Flex>
        ))}
      </Flex>
      <Headline size={4.4} lines={1}>{item.headline}</Headline>
    </Flex>
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

// ── Colors — the school colors, full bleed ──────────────────────────────────
const Colors = ({ item }) => {
  const id = item.data.team_id;
  const school = useSchool();
  const cols = colorsOf(id);
  const desc = teamMeta(id)?.wiki?.colorsDescription;
  return (
    <Flex h="100%" m="calc(-1 * var(--hl-pad, 5cqmin))" overflow="hidden">
      <Flex w="46%" flexShrink={0}>
        {cols.map((c) => (
          <Flex key={c} flex={1} bg={c} align="flex-end" justify="center" pb="3cqmin" borderRight="1px solid rgba(0,0,0,0.25)">
            <Text fontSize="2.2cqmin" fontWeight="black" color={(parseInt(c.slice(1, 3), 16) + parseInt(c.slice(3, 5), 16) + parseInt(c.slice(5, 7), 16)) / 3 > 140 ? "#0B0B0D" : "#fff"} style={{ writingMode: "vertical-rl" }} letterSpacing="0.2em">
              {c.toUpperCase()}
            </Text>
          </Flex>
        ))}
      </Flex>
      <Flex direction="column" justify="space-between" flex={1} p="var(--hl-pad, 5cqmin)" minW={0}>
        <Flex align="center" gap="3cqmin">
          <Mark logo={teamLogo(id)} label={teamShort(id)} size={14} />
          <Title>{item.title}</Title>
        </Flex>
        <Text fontSize="5.4cqmin" fontWeight="black" fontStyle="italic" color="white" lineHeight={1.15} lineClamp={5}>
          {desc ?? school(id)}
        </Text>
        <Text fontSize="3.4cqmin" fontWeight="black" color={DIM} textTransform="uppercase" letterSpacing="0.12em">{school(id)}</Text>
      </Flex>
    </Flex>
  );
};

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

// ── Head Coach — the name, and the years on a timeline ──────────────────────
const HeadCoach = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  const [first, ...rest] = String(d.coach_name).split(" ");
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Flex align="center" gap="3cqmin">
        <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={12} />
        <Title color={accent}>{item.title}</Title>
      </Flex>
      <Flex align="flex-end" gap="4cqmin">
        {d.image_url ? <Image src={d.image_url} alt="" w="24cqmin" h="30cqmin" objectFit="cover" borderRadius="md" /> : null}
        <Box minW={0}>
          <Text fontSize="5.4cqmin" fontWeight="black" color={DIM} textTransform="uppercase" letterSpacing="0.1em">{first}</Text>
          <Text fontSize="15cqmin" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.88} letterSpacing="-0.03em" lineClamp={1}>{rest.join(" ")}</Text>
        </Box>
      </Flex>
      <Flex gap="1cqmin" h="5cqmin">
        {Array.from({ length: d.seasons }, (_, i) => (
          <Flex key={i} flex={1} bg={withAlpha(accent, 0.35 + (0.6 * (i + 1)) / d.seasons)} align="center" justify="center" borderRadius="sm">
            <Text fontSize="2cqmin" fontWeight="black" color="#0B0B0D">’{String(d.first_season + i).slice(2)}</Text>
          </Flex>
        ))}
      </Flex>
      <Flex gap="6cqmin">
        <Stat label="Record" value={d.record} />
        <Stat label="Conf" value={d.conf_record} />
        {d.titles ? <Stat label="Titles" value={d.titles} /> : null}
      </Flex>
    </Flex>
  );
};

// ── Roster DNA — the class pyramid laid on its side ─────────────────────────
const CLASS_SHADES = [0.3, 0.45, 0.6, 0.8, 1];
const RosterDNA = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  const total = d.classes.reduce((s, c) => s + c.count, 0) || 1;
  const R = 15.9155;
  const dash = d.transfer_rate * 100;
  return (
    <Flex direction="column" h="100%" justify="space-between">
      <Flex align="center" gap="3cqmin">
        <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={12} />
        <Title color={accent}>{item.title}</Title>
        <Text ml="auto" fontSize="3.4cqmin" fontWeight="black" color={DIM}>{d.total_players} players</Text>
      </Flex>
      <Flex align="center" gap="5cqmin">
        <Box w="26cqmin" h="26cqmin" flexShrink={0} position="relative">
          <Svg w={36} h={36}>
            <circle cx={18} cy={18} r={R} fill="none" stroke={FAINT} strokeWidth={3.4} />
            <circle cx={18} cy={18} r={R} fill="none" stroke={accent} strokeWidth={3.4} strokeDasharray={`${dash} ${100 - dash}`} strokeDashoffset={25} />
          </Svg>
          <Flex position="absolute" inset={0} direction="column" align="center" justify="center">
            <Text fontSize="6cqmin" fontWeight="black" fontStyle="italic" color="white" lineHeight={1}>{Math.round(d.transfer_rate * 100)}%</Text>
            <Micro size={1.9}>Transfers</Micro>
          </Flex>
        </Box>
        <Headline size={6} lines={3}>{item.headline}</Headline>
      </Flex>
      <Box>
        <Flex h="10cqmin" borderRadius="md" overflow="hidden">
          {d.classes.map((c, i) => (
            <Flex key={c.class} w={`${(c.count / total) * 100}%`} bg={withAlpha(accent, CLASS_SHADES[i] ?? 1)} align="center" justify="center" borderRight="1px solid #141416">
              <Text fontSize="3.2cqmin" fontWeight="black" color="#0B0B0D">{c.count}</Text>
            </Flex>
          ))}
        </Flex>
        <Flex mt="1cqmin">
          {d.classes.map((c) => (
            <Text key={c.class} w={`${(c.count / total) * 100}%`} textAlign="center" fontSize="2.3cqmin" fontWeight="black" color={DIM} textTransform="uppercase">{c.class}</Text>
          ))}
        </Flex>
      </Box>
    </Flex>
  );
};

export { CELL, GRID } from "../../../molecules/home/usTileGrid";

// ── Pipeline — where one roster comes from ──────────────────────────────────
const Pipeline = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.team_id);
  const counts = Object.fromEntries(d.states.map((s) => [s.state, s.count]));
  const max = Math.max(...d.states.map((s) => s.count));
  return (
    <Flex h="100%" gap="4cqmin">
      <Flex direction="column" justify="space-between" w="34%" flexShrink={0}>
        <Flex align="center" gap="2cqmin">
          <Mark logo={teamLogo(d.team_id)} label={teamShort(d.team_id)} size={11} />
          <Title color={accent}>{item.title}</Title>
        </Flex>
        <Box>
          <BigNumber size={15} color={accent}>{Math.round(d.in_state_pct * 100)}%</BigNumber>
          <Micro size={2.2} mt="1cqmin">From {d.home_state}</Micro>
        </Box>
        <Headline size={4.8} lines={3}>{item.headline}</Headline>
      </Flex>
      <Box flex={1} minW={0}>
        <Svg w={11 * CELL} h={8 * CELL}>
          {Object.entries(GRID).map(([st, [c, r]]) => {
            const n = counts[st] ?? 0;
            const home = st === d.home_state;
            return (
              <g key={st}>
                <rect
                  x={c * CELL + 1.5}
                  y={r * CELL + 1.5}
                  width={CELL - 3}
                  height={CELL - 3}
                  rx={3}
                  fill={n ? withAlpha(accent, 0.15 + 0.85 * Math.sqrt(n / max)) : "rgba(255,255,255,0.05)"}
                  stroke={home ? "#fff" : "none"}
                  strokeWidth={2}
                />
                <text x={c * CELL + CELL / 2} y={r * CELL + CELL / 2 + 3.5} fontSize={9} fontWeight={900} textAnchor="middle" fill={n ? "#0B0B0D" : "rgba(255,255,255,0.25)"}>{st}</text>
              </g>
            );
          })}
        </Svg>
      </Box>
    </Flex>
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

// ── The Map — all 18 programs where they live ───────────────────────────────
const BY_STATE = teamsData.teams.reduce((acc, t) => {
  (acc[t.state] = acc[t.state] ?? []).push(String(t.exportId).replace(/25$/, ""));
  return acc;
}, {});
const MAP_COLS = [3, 10];
const MAP_ROWS = [3, 7];
const TheMap = ({ item }) => {
  const w = (MAP_COLS[1] - MAP_COLS[0] + 1) * CELL;
  const h = (MAP_ROWS[1] - MAP_ROWS[0] + 1) * CELL;
  const states = Object.entries(GRID).filter(([, [c, r]]) => c >= MAP_COLS[0] && c <= MAP_COLS[1] && r >= MAP_ROWS[0] && r <= MAP_ROWS[1]);
  const swac = "#A855F7";
  const meac = "#38BDF8";
  return (
    <Box position="relative" h="100%">
      <Svg w={w} h={h}>
        {states.map(([st, [c, r]]) => {
          const ids = BY_STATE[st] ?? [];
          const x = (c - MAP_COLS[0]) * CELL;
          const y = (r - MAP_ROWS[0]) * CELL;
          const conf = ids.length ? (ids[0].startsWith("swac") ? swac : meac) : null;
          const s = ids.length > 2 ? 11.5 : ids.length > 1 ? 14 : 22;
          return (
            <g key={st}>
              <rect x={x + 1} y={y + 1} width={CELL - 2} height={CELL - 2} rx={3} fill={conf ? withAlpha(conf, 0.22) : "rgba(255,255,255,0.04)"} stroke={conf ? withAlpha(conf, 0.6) : "none"} strokeWidth={1} />
              {ids.map((id, k) => {
                const n = ids.length;
                const cx = x + CELL / 2 + (n > 1 ? (k % 2 ? 6.5 : -6.5) : 0);
                const cy = y + CELL / 2 + (n > 2 ? (k < 2 ? -6.5 : 6.5) : 0);
                return <Logo key={id} id={id} x={n === 3 && k === 2 ? x + CELL / 2 : cx} y={cy} s={s} />;
              })}
              {!ids.length ? <text x={x + CELL / 2} y={y + CELL / 2 + 3} fontSize={7} fontWeight={900} textAnchor="middle" fill="rgba(255,255,255,0.2)">{st}</text> : null}
            </g>
          );
        })}
      </Svg>
      <Box position="absolute" left={0} top={0} maxW="44%">
        <Title>{item.title}</Title>
        <Headline size={5.4} lines={3} mt="2cqmin">{item.headline}</Headline>
        <Flex gap="3cqmin" mt="3cqmin">
          <Micro size={2.3} color={swac}>SWAC</Micro>
          <Micro size={2.3} color={meac}>MEAC</Micro>
        </Flex>
      </Box>
    </Box>
  );
};

// ── Registry ─────────────────────────────────────────────────────────────────

export const TEAM_FACES = {
  division_race: DivisionRace,
  defending_champs: DefendingChamps,
  hot_streak: HotStreak,
  title_count: TitleCount,
  band: Band,
  colors: Colors,
  home_field: HomeField,
  head_coach: HeadCoach,
  roster_dna: RosterDNA,
  pipeline: Pipeline,
  rivalry: Rivalry,
  the_map: TheMap,
};
