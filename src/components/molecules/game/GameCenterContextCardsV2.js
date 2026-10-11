import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { teamLogo, teamShort, withAlpha } from "../../game/export/exportData";
import { vivid } from "../../molecules/home/teamColor";

// ─────────────────────────────────────────────────────────────────────────────
// GAME CENTER HUB — CONTEXT CARDS. The 15 narrative card types from
// src/pages/game-center/mds/GameCenterHubCardsPlan.md §6, one bespoke visual
// each, all in one shell: eyebrow title, the visual, one big number, and the
// engine's first `why_reasons` line as the supporting copy. Sized in cqmin off
// the card (a size container), so any card fits the 1x1 or the 2-col slot.
// Payload shapes: Game Center Hub Design Doc §4. Lab copy: organisms/test/GameCenterContextCardsA.js.
// ─────────────────────────────────────────────────────────────────────────────

const GOOD = "#22C55E";
const BAD = "#EF4444";
const GOLD = "#EAB308";
const DIM = "rgba(255,255,255,0.5)";
const FAINT = "rgba(255,255,255,0.12)";

const Logo = ({ id, size, ...rest }) => <Image src={teamLogo(id)} alt="" w={`${size}cqmin`} h={`${size}cqmin`} objectFit="contain" flexShrink={0} {...rest} />;
const Big = ({ children, size = 18, color = "white", ...rest }) => (
  <Text fontSize={`${size}cqmin`} fontWeight="black" fontStyle="italic" color={color} lineHeight={0.88} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" lineClamp={1} {...rest}>
    {children}
  </Text>
);
const Small = ({ children, color = DIM, size = 4, ...rest }) => (
  <Text fontSize={`${size}cqmin`} fontWeight="black" color={color} textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.15} lineClamp={1} {...rest}>
    {children}
  </Text>
);
const Abbr = ({ id, size = 6, color = "white" }) => (
  <Text fontSize={`${size}cqmin`} fontWeight="black" color={color} textTransform="uppercase" lineHeight={1} lineClamp={1}>{teamShort(id)}</Text>
);

// One shell for every card: title, watermark, body, the why line.
const Shell = ({ title, why, mark, accent = "#A855F7", placeholder, children }) => (
  <Box position="relative" w="full" h="full" bg="#141416" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden" style={{ containerType: "size" }}>
    {mark ? <Logo id={mark} size={58} position="absolute" right="-10cqmin" top="-8cqmin" opacity={0.07} pointerEvents="none" /> : null}
    <Flex position="relative" direction="column" h="full" p="5cqmin" gap="3cqmin">
      <Flex align="center" gap="2cqmin">
        <Box w="1.6cqmin" h="1.6cqmin" borderRadius="full" bg={accent} flexShrink={0} />
        <Text fontSize="4.6cqmin" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.12em" lineClamp={1}>{title}</Text>
        {placeholder ? <Text ml="auto" fontSize="3cqmin" fontWeight="black" color={GOLD} letterSpacing="0.1em">MOCK</Text> : null}
      </Flex>
      <Flex direction="column" flex={1} minH={0}>{children}</Flex>
      {why ? <Text fontSize="3.8cqmin" fontWeight="bold" color="rgba(255,255,255,0.6)" lineHeight={1.3} lineClamp={2}>{why}</Text> : null}
    </Flex>
  </Box>
);

// ── 1 · Look Ahead — two schools face to face, the kickoff between them ─────
const LookAhead = ({ c }) => {
  const p = c.payload;
  return (
    <Shell title={c.title} why={c.why_reasons?.[0]} accent={vivid(p.home.team_id)}>
      <Flex flex={1} align="center" justify="space-between">
        {[p.away, p.home].map((s) => (
          <Flex key={s.team_id} direction="column" align="center" gap="2cqmin" w="36%">
            <Logo id={s.team_id} size={26} />
            <Abbr id={s.team_id} size={6} />
            <Small>{s.record}</Small>
          </Flex>
        ))}
      </Flex>
      <Flex direction="column" align="center" mt="-2cqmin">
        <Big size={9}>{p.date_label}</Big>
        <Small mt="1.5cqmin">{[p.kickoff, p.venue].filter(Boolean).join(" · ")}</Small>
      </Flex>
    </Shell>
  );
};

// ── 2 · Upcoming Stretch — the next three, opponent by opponent ─────────────
const UpcomingStretch = ({ c }) => {
  const p = c.payload;
  return (
    <Shell title={c.title} why={c.why_reasons?.[0]} mark={p.team_id} accent={vivid(p.team_id)}>
      <Flex align="center" gap="3cqmin" mb="2cqmin">
        <Logo id={p.team_id} size={13} />
        <Box>
          <Abbr id={p.team_id} size={7} />
          <Small mt="1cqmin">{p.record}</Small>
        </Box>
      </Flex>
      <Flex direction="column" flex={1} justify="space-around">
        {p.games.map((g, i) => (
          <Flex key={i} align="center" gap="3cqmin" py="1.5cqmin" borderTop="1px solid" borderColor={FAINT}>
            <Text w="16cqmin" fontSize="4cqmin" fontWeight="black" color={DIM} textTransform="uppercase">{g.date_label}</Text>
            <Text w="7cqmin" fontSize="4cqmin" fontWeight="black" color={DIM}>{g.home_away === "home" ? "vs" : "at"}</Text>
            {g.opponent.team_id ? <Logo id={g.opponent.team_id} size={7} /> : <Box w="7cqmin" />}
            <Text flex={1} minW={0} fontSize="5cqmin" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>{g.opponent.team_id ? teamShort(g.opponent.team_id) : g.opponent.short}</Text>
            {g.opponent.record ? <Small>{g.opponent.record}</Small> : null}
          </Flex>
        ))}
      </Flex>
    </Shell>
  );
};

// ── 3 · Team Form — last five, wins up / losses down off a midline ──────────
const TeamForm = ({ c }) => {
  const p = c.payload;
  const max = Math.max(...p.results.map((r) => r.margin), 1);
  return (
    <Shell title={c.title} why={p.summary ?? c.why_reasons?.[0]} mark={p.team_id} accent={vivid(p.team_id)}>
      <Flex align="center" gap="2.5cqmin" mb="2cqmin">
        <Logo id={p.team_id} size={9} />
        <Abbr id={p.team_id} size={6} />
      </Flex>
      <Flex flex={1} minH={0} direction="column">
        <Flex flex={1} align="flex-end" gap="2cqmin">
          {p.results.map((r, i) => (
            <Flex key={i} flex={1} h="100%" align="flex-end">
              {r.result === "W" ? <Box w="full" h={`${(r.margin / max) * 100}%`} minH="2cqmin" bg={GOOD} borderTopRadius="sm" /> : null}
            </Flex>
          ))}
        </Flex>
        <Box h="0.5cqmin" bg="rgba(255,255,255,0.35)" />
        <Flex flex={1} align="flex-start" gap="2cqmin">
          {p.results.map((r, i) => (
            <Flex key={i} flex={1} h="100%" direction="column" align="center">
              {r.result === "L" ? <Box w="full" h={`${(r.margin / max) * 100}%`} minH="2cqmin" bg={BAD} borderBottomRadius="sm" /> : null}
              <Text fontSize="3.6cqmin" fontWeight="black" color={r.result === "W" ? GOOD : BAD} mt="1cqmin">{r.result}{r.margin}</Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Shell>
  );
};

// ── 4 · Home Town Heroes — the homegrown share, and where they come from ────
const HomeTownHeroes = ({ c }) => {
  const p = c.payload;
  const accent = vivid(p.team_id);
  return (
    <Shell title={c.title} why={c.why_reasons?.[0]} mark={p.team_id} accent={accent}>
      <Flex align="flex-end" gap="3cqmin">
        <Big size={24} color={accent}>{Math.round(p.in_state_pct)}%</Big>
        <Box pb="1cqmin">
          <Small color="white">From {p.state ?? "home"}</Small>
          <Small mt="1cqmin">{p.in_state_count} of {p.total}</Small>
        </Box>
      </Flex>
      <Flex direction="column" gap="2cqmin" mt="auto">
        {p.hotspots.map((h, i) => (
          <Flex key={h.city} align="center" gap="2cqmin">
            <Text w="34cqmin" fontSize="4.2cqmin" fontWeight="black" color="white" lineClamp={1}>{h.city}</Text>
            <Box flex={1} h="4cqmin" bg="rgba(255,255,255,0.05)">
              <Box h="full" bg={withAlpha(accent, i === 0 ? 0.9 : 0.5)} style={{ width: `${(h.count / p.hotspots[0].count) * 100}%` }} />
            </Box>
            <Text w="6cqmin" textAlign="right" fontSize="4.2cqmin" fontWeight="black" color="white">{h.count}</Text>
          </Flex>
        ))}
      </Flex>
    </Shell>
  );
};

// ── 5 · Us vs The World — the record outside the two leagues, game by game ──
const UsVsWorld = ({ c }) => {
  const p = c.payload;
  const accent = vivid(p.team_id);
  return (
    <Shell title={c.title} why={c.why_reasons?.[0]} mark={p.team_id} accent={accent}>
      <Flex align="center" gap="3cqmin">
        <Logo id={p.team_id} size={14} />
        <Big size={20} color={accent}>{p.wins}-{p.losses}</Big>
      </Flex>
      <Flex direction="column" gap="1.5cqmin" mt="auto">
        {p.games.map((g, i) => (
          <Flex key={i} align="center" gap="2cqmin">
            <Box w="5cqmin" h="5cqmin" borderRadius="sm" bg={g.result === "W" ? GOOD : BAD} display="flex" alignItems="center" justifyContent="center">
              <Text fontSize="3.2cqmin" fontWeight="black" color="#0B0B0D">{g.result}</Text>
            </Box>
            <Text flex={1} minW={0} fontSize="4.2cqmin" fontWeight="black" color="white" lineClamp={1}>{g.opponent_name}</Text>
            <Text fontSize="4cqmin" fontWeight="black" color={DIM} fontFamily="mono">{String(g.score ?? "").replace(/^[WL]\s*/, "")}</Text>
          </Flex>
        ))}
      </Flex>
    </Shell>
  );
};

// ── 6 · Biggest Mover — the jump, rank to rank ──────────────────────────────
const BiggestMover = ({ c }) => {
  const p = c.payload;
  const up = p.to_rank < p.from_rank;
  const delta = Math.abs(p.from_rank - p.to_rank);
  return (
    <Shell title={c.title} why={c.why_reasons?.[0]} mark={p.team_id} accent={vivid(p.team_id)} placeholder={c.placeholder}>
      <Flex align="center" gap="3cqmin" flex={1}>
        <Logo id={p.team_id} size={22} />
        <Box>
          <Big size={22} color={up ? GOOD : BAD}>{up ? "▲" : "▼"}{delta}</Big>
          <Small mt="2cqmin">{p.metric_label}</Small>
        </Box>
      </Flex>
      <Flex align="center" justify="center" gap="4cqmin">
        <Big size={10} color={DIM}>#{p.from_rank}</Big>
        <Text fontSize="7cqmin" fontWeight="black" color={DIM}>→</Text>
        <Big size={12}>#{p.to_rank}</Big>
      </Flex>
    </Shell>
  );
};

// ── 7 · Streak Watch — the run, one link per game ───────────────────────────
const StreakWatch = ({ c }) => {
  const p = c.payload;
  const color = p.result === "W" ? GOOD : BAD;
  return (
    <Shell title={c.title} why={c.why_reasons?.[0]} mark={p.team_id} accent={color}>
      <Flex align="center" gap="3cqmin">
        <Logo id={p.team_id} size={14} />
        <Box>
          <Abbr id={p.team_id} size={7} />
          <Small mt="1cqmin">{p.record}</Small>
        </Box>
      </Flex>
      <Big size={36} color={color} textAlign="center" mt="auto">{p.result}{p.length}</Big>
      <Flex gap="1.5cqmin" h="7cqmin" mt="2cqmin">
        {p.recent.map((r, i) => (
          <Box key={i} flex={1} bg={r === "W" ? GOOD : BAD} opacity={0.4 + (0.6 * (i + 1)) / p.recent.length} transform="skewX(-12deg)" />
        ))}
      </Flex>
    </Shell>
  );
};

// ── 8 · Title Race — the top three, how far back each one is ────────────────
const TitleRace = ({ c }) => {
  const p = c.payload;
  const maxGb = Math.max(...p.rows.map((r) => r.games_back), 1);
  return (
    <Shell title={c.title} why={c.why_reasons?.[0]} accent={vivid(p.rows[0].team_id)}>
      <Small color="white" size={4.4}>{p.group_label}</Small>
      <Flex direction="column" flex={1} justify="space-around" mt="1cqmin">
        {p.rows.map((r, i) => (
          <Flex key={r.team_id} align="center" gap="2.5cqmin">
            <Text w="4cqmin" fontSize="4.6cqmin" fontWeight="black" color={i === 0 ? GOLD : DIM}>{i + 1}</Text>
            <Logo id={r.team_id} size={9} />
            <Box flex={1} minW={0}>
              <Flex align="baseline" justify="space-between">
                <Abbr id={r.team_id} size={5} />
                <Text fontSize="5cqmin" fontWeight="black" color="white" fontFamily="mono">{r.conference_record}</Text>
              </Flex>
              <Box h="1.6cqmin" mt="1cqmin" bg="rgba(255,255,255,0.06)">
                <Box h="full" bg={i === 0 ? GOLD : withAlpha(vivid(r.team_id), 0.7)} style={{ width: `${100 - (r.games_back / (maxGb * 2)) * 100}%` }} />
              </Box>
            </Box>
            <Text w="9cqmin" textAlign="right" fontSize="3.8cqmin" fontWeight="black" color={DIM}>{r.games_back ? `${r.games_back} GB` : "—"}</Text>
          </Flex>
        ))}
      </Flex>
    </Shell>
  );
};

// ── 9 · Bowl Path — the two leaders meeting at the bowl ─────────────────────
const BowlPath = ({ c }) => {
  const p = c.payload;
  return (
    <Shell title={c.title} why={c.why_reasons?.[0]} accent={GOLD}>
      <Flex direction="column" align="center" mb="2cqmin">
        <Text fontSize="6cqmin" fontWeight="black" fontStyle="italic" color={GOLD} textTransform="uppercase" lineHeight={1}>{p.bowl_name}</Text>
        <Small mt="1cqmin">{p.date_label} · {p.venue}</Small>
      </Flex>
      <Flex flex={1} align="center" justify="space-between">
        {[["SWAC", p.swac], ["MEAC", p.meac]].map(([conf, s]) => (
          <Flex key={conf} direction="column" align="center" gap="1.5cqmin" w="40%">
            <Small color="white">{conf}</Small>
            <Logo id={s.team_id} size={20} />
            <Abbr id={s.team_id} size={5.4} />
            <Text fontSize="4.4cqmin" fontWeight="black" color={DIM} fontFamily="mono">{s.conference_record}</Text>
          </Flex>
        ))}
      </Flex>
      <Box position="absolute" left="50%" top="55%" transform="translate(-50%, -50%)">
        <Text fontSize="6cqmin" fontWeight="black" color={DIM}>vs</Text>
      </Box>
    </Shell>
  );
};

// ── 10 · Red-Zone Edge — the TD rate inside the 20, against the league ──────
const RedZoneEdge = ({ c }) => {
  const p = c.payload;
  const accent = vivid(p.team_id);
  const R = 15.9155;
  return (
    <Shell title={c.title} why={c.why_reasons?.[0]} mark={p.team_id} accent={accent} placeholder={c.placeholder}>
      <Flex flex={1} align="center" gap="4cqmin">
        <Box h="100%" maxH="46cqmin" aspectRatio="1" position="relative" flexShrink={0}>
          <Box as="svg" viewBox="0 0 36 36" w="100%" h="100%">
            <circle cx={18} cy={18} r={R} fill="none" stroke={FAINT} strokeWidth={3.4} />
            <circle cx={18} cy={18} r={R} fill="none" stroke={accent} strokeWidth={3.4} strokeDasharray={`${p.td_rate} ${100 - p.td_rate}`} strokeDashoffset={25} />
            <circle cx={18} cy={18} r={R - 4.2} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.2} strokeDasharray={`${p.league_rate} ${100 - p.league_rate}`} strokeDashoffset={25} />
          </Box>
          <Flex position="absolute" inset={0} align="center" justify="center"><Big size={11}>{p.td_rate}%</Big></Flex>
        </Box>
        <Box>
          <Abbr id={p.team_id} size={7} />
          <Small mt="2cqmin">{p.tds} TD / {p.trips} trips</Small>
          <Small mt="1cqmin">League {p.league_rate}%</Small>
        </Box>
      </Flex>
    </Shell>
  );
};

// ── 11 · Turnover Swing — the margins, best and worst, off a zero line ──────
const TurnoverSwing = ({ c }) => {
  const p = c.payload;
  const max = Math.max(...p.rows.map((r) => Math.abs(r.margin)), 1);
  return (
    <Shell title={c.title} why={c.why_reasons?.[0]} accent={GOOD} placeholder={c.placeholder}>
      <Flex direction="column" flex={1} justify="space-around">
        {p.rows.map((r) => {
          const pos = r.margin >= 0;
          return (
            <Flex key={r.team_id} align="center" gap="2.5cqmin">
              <Logo id={r.team_id} size={9} />
              <Text w="14cqmin" fontSize="4.6cqmin" fontWeight="black" color="white" lineClamp={1}>{teamShort(r.team_id)}</Text>
              <Flex flex={1} h="6cqmin" position="relative">
                <Box position="absolute" left="50%" top="-1cqmin" bottom="-1cqmin" w="1px" bg="rgba(255,255,255,0.35)" />
                <Box position="absolute" top={0} bottom={0} bg={pos ? GOOD : BAD} style={{ width: `${(Math.abs(r.margin) / max) * 50}%`, ...(pos ? { left: "50%" } : { right: "50%" }) }} />
              </Flex>
              <Text w="8cqmin" textAlign="right" fontSize="5cqmin" fontWeight="black" fontStyle="italic" color={pos ? GOOD : BAD}>{pos ? "+" : ""}{r.margin}</Text>
            </Flex>
          );
        })}
      </Flex>
    </Shell>
  );
};

// ── 12 · Defending Champions — the banner from the rafters ──────────────────
const DefendingChamps = ({ c }) => {
  const p = c.payload;
  const color = vivid(p.team_id);
  return (
    <Shell title={c.title} why={c.why_reasons?.[0]} accent={GOLD}>
      <Flex flex={1} gap="4cqmin" minH={0}>
        <Box w="40%" flexShrink={0}>
          <Box as="svg" viewBox="0 0 186 300" w="100%" h="100%" preserveAspectRatio="xMidYMid meet">
            <rect x={0} y={0} width={186} height={10} fill="rgba(255,255,255,0.35)" />
            <path d="M 12 10 H 174 V 270 L 93 236 L 12 270 Z" fill={withAlpha(color, 0.85)} stroke={GOLD} strokeWidth={6} />
            <image href={teamLogo(p.team_id)} x={33} y={30} width={120} height={120} preserveAspectRatio="xMidYMid meet" />
            <text x={93} y={196} fill="#fff" fontSize={44} fontWeight={900} fontStyle="italic" textAnchor="middle">{p.season}</text>
          </Box>
        </Box>
        <Flex direction="column" justify="center" gap="2cqmin" minW={0}>
          <Small color={GOLD}>{p.conference} champs</Small>
          <Big size={17} color={GOLD}>{p.conference_record}</Big>
          <Small>This year {p.record}</Small>
        </Flex>
      </Flex>
    </Shell>
  );
};

// ── 13 · Home & Road — the record split down the middle ─────────────────────
const RecordSplit = ({ c }) => {
  const p = c.payload;
  const accent = vivid(p.team_id);
  return (
    <Shell title={c.title} why={c.why_reasons?.[0]} mark={p.team_id} accent={accent}>
      <Flex align="center" gap="2.5cqmin">
        <Logo id={p.team_id} size={10} />
        <Abbr id={p.team_id} size={6} />
      </Flex>
      <Grid templateColumns="1fr 1fr" flex={1} mt="2cqmin" borderRadius="md" overflow="hidden">
        {[["Home", p.home, withAlpha(accent, 0.28)], ["Road", p.road, "rgba(255,255,255,0.05)"]].map(([label, r, bg]) => (
          <Flex key={label} direction="column" align="center" justify="center" bg={bg} gap="2cqmin">
            <Small color="white">{label}</Small>
            <Big size={15}>{r}</Big>
          </Flex>
        ))}
      </Grid>
    </Shell>
  );
};

// ── 14 · Game of the Week — the matchup, the hook ───────────────────────────
const ScheduleHeadline = ({ c }) => {
  const p = c.payload;
  const final = p.away.score != null && p.home.score != null;
  return (
    <Shell title={c.title} why={p.footer ?? c.why_reasons?.[0]} accent={vivid(p.home.team_id)}>
      <Small color={GOLD}>{p.event_name ?? p.stage_label}</Small>
      <Flex flex={1} direction="column" justify="center" gap="3cqmin">
        {[p.away, p.home].map((s) => {
          const won = final && s.score === Math.max(p.away.score, p.home.score);
          return (
            <Flex key={s.team_id} align="center" gap="3cqmin">
              <Logo id={s.team_id} size={13} />
              <Box flex={1} minW={0}>
                <Abbr id={s.team_id} size={7} color={!final || won ? "white" : DIM} />
                {s.record ? <Small mt="1cqmin">{s.record}</Small> : null}
              </Box>
              {final ? <Big size={13} color={won ? "white" : DIM}>{s.score}</Big> : null}
            </Flex>
          );
        })}
      </Flex>
      <Small>{p.stage_label} · {p.date_label}</Small>
    </Shell>
  );
};

// ── 15 · Upset Watch — the winner big, the favorite it took down ────────────
const UpsetWatch = ({ c }) => {
  const p = c.payload;
  const accent = vivid(p.winner.team_id);
  return (
    <Shell title={c.title} why={p.line ?? c.why_reasons?.[0]} mark={p.winner.team_id} accent={BAD} placeholder={c.placeholder}>
      <Flex flex={1} align="center" gap="3cqmin">
        <Logo id={p.winner.team_id} size={26} />
        <Box minW={0}>
          <Abbr id={p.winner.team_id} size={8} color={accent} />
          <Small mt="1cqmin">{p.winner.record}</Small>
          <Big size={12} mt="2cqmin">{p.winner.score}-{p.loser.score}</Big>
        </Box>
      </Flex>
      <Flex align="center" gap="2cqmin">
        <Small color="white">over</Small>
        <Logo id={p.loser.team_id} size={7} opacity={0.6} />
        <Small>{teamShort(p.loser.team_id)} · {p.loser.record}</Small>
      </Flex>
    </Shell>
  );
};

export const CONTEXT_CARDS = {
  look_ahead: LookAhead,
  upcoming_stretch: UpcomingStretch,
  team_form: TeamForm,
  home_town_heroes: HomeTownHeroes,
  us_vs_world: UsVsWorld,
  biggest_mover: BiggestMover,
  streak_watch: StreakWatch,
  title_race: TitleRace,
  bowl_path: BowlPath,
  red_zone_edge: RedZoneEdge,
  turnover_swing: TurnoverSwing,
  defending_champs: DefendingChamps,
  record_split: RecordSplit,
  schedule_headline: ScheduleHeadline,
  upset_watch: UpsetWatch,
};
