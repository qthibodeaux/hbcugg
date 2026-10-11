import { useMemo, useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Section, SectionFlush, Kicker, Radar } from "./TeamAnalyticsTabs";
import { ChevronDown } from "lucide-react";
import { BottomSheet } from "../BottomSheet";
import { BANNER_STRIP_BG } from "../BannerControls";
import { useJumpSections } from "../../game/page/mobile/useJumpSections";
import { TeamProfilePhasesPassingCopy } from "./TeamProfilePhasesPassingCopy";
import { matchupTable, fmtMatchup } from "../../../pages/analytics/matchupMetrics";
import {
  PROFILE_ADVANCED,
  profileAdvancedFrom,
  passGridFrom,
  passTargetsFrom,
  rushLanesFrom,
  havocZonesFrom,
  fmtProfile,
} from "../../../pages/analytics/teamProfileMetrics";
import { useTopPlayersByTeam, useGamesIndex, usePlayerAnalytics } from "../../../hooks/useSWACData";
import { useTeamAnalyticsSpatial, useTeamAnalyticsUsage } from "../../../hooks/useTeamAnalyticsData";
import { nameSlug, teamSlug } from "../../../utils/headshots";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

// ─────────────────────────────────────────────────────────────────────────────
// TEAM PROFILE
//
// The stat-heavy one. CFBD's inventory, GOP's two good ideas (leaders with
// faces, the offense/defense radars), our design language and our spatial
// maps — the 3x3 pass grid, the 1x3 rush lanes and the havoc map we built for
// players, now aggregated to a team-season.
//
// Everything is bound to the season in the banner control.
//
// All backend since 2026-10-04 (stats/team-analytics/): the ten rate metrics
// and team rating (hub), the EPA family and advanced table (advanced), the
// three maps and their faces (spatial), players, leaders and per-game
// production (player_usage). Roster composition is still the 2025 roster file.
// ─────────────────────────────────────────────────────────────────────────────

const PANEL = "bg.secondary";
const POSITIVE = "#48BB78";
const NEGATIVE = "#F6AD55";
const BRAND = "#A855F7";
const OFF_TONE = "#ECC94B";
const DEF_TONE = "#4299E1";

const fmtRate = (v, unit) => (!Number.isFinite(v) ? "—" : unit === "pct" ? `${(v * 100).toFixed(1)}%` : v.toFixed(2));

const RankChip = ({ rank, total = 18 }) => {
  if (!Number.isFinite(rank)) return null;
  const good = rank <= total / 2;
  const strength = Math.min(1, Math.abs(rank - (total + 1) / 2) / ((total - 1) / 2));
  const alpha = (0.14 + strength * 0.4).toFixed(2);
  return (
    <Box px={1.5} py={0.5} borderRadius="sm" bg={good ? `rgba(34,197,94,${alpha})` : `rgba(168,85,247,${alpha})`} flexShrink={0}>
      <Text fontSize="9px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">#{rank}</Text>
    </Box>
  );
};

// A percentile fill behind a value — the house way of making a table read as
// a heat map before you read a single number.
const pctFill = (pct, tone) => {
  if (!Number.isFinite(pct)) return "transparent";
  const strength = Math.min(1, Math.abs(pct - 50) / 50);
  const alpha = (0.1 + strength * 0.38).toFixed(2);
  return pct >= 50 ? `rgba(72,187,120,${alpha})` : `rgba(${tone === "def" ? "66,153,225" : "246,173,85"},${alpha})`;
};

const Kpi = ({ label, value, rank, total, tone = "white", sub }) => (
  <Box bg="rgba(255,255,255,0.04)" borderRadius="md" p={3} minW={0}>
    <Kicker color="whiteAlpha.500">{label}</Kicker>
    <Flex align="baseline" gap={2} mt={1.5} minW={0}>
      <Text
        fontSize="clamp(1.15rem, 2.4vw, 1.9rem)" fontWeight="900" fontStyle="italic" color={tone}
        lineHeight={0.9} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" lineClamp={1}
      >
        {value}
      </Text>
      <RankChip rank={rank} total={total} />
    </Flex>
    {sub && <Kicker color="whiteAlpha.400" mt={1.5}>{sub}</Kicker>}
  </Box>
);

// ── One row of an offense-vs-defense table ──────────────────────────────────
const SplitRow = ({ label, offValue, defValue, offPct, defPct, offRank, defRank, total }) => (
  <Flex align="center" gap={2} py={1.5} borderBottom="1px solid" borderColor="whiteAlpha.50">
    <Text flex="1" minW={0} fontSize="11px" fontWeight="700" color="whiteAlpha.800" lineClamp={1}>{label}</Text>
    <Flex w="38%" minW={0} gap={2}>
      <Flex flex="1" align="center" justify="space-between" gap={1.5} px={2} py={1} borderRadius="sm" bg={pctFill(offPct, "off")} minW={0}>
        <Text fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{offValue}</Text>
        <RankChip rank={offRank} total={total} />
      </Flex>
      <Flex flex="1" align="center" justify="space-between" gap={1.5} px={2} py={1} borderRadius="sm" bg={pctFill(defPct, "def")} minW={0}>
        <Text fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{defValue}</Text>
        <RankChip rank={defRank} total={total} />
      </Flex>
    </Flex>
  </Flex>
);

const SplitHead = () => (
  <Flex align="center" gap={2} pb={1.5} borderBottom="1px solid" borderColor="whiteAlpha.100">
    <Box flex="1" />
    <Flex w="38%" gap={2}>
      <Box flex="1" textAlign="center"><Kicker color={OFF_TONE}>Offense</Kicker></Box>
      <Box flex="1" textAlign="center"><Kicker color={DEF_TONE}>Defense</Kicker></Box>
    </Flex>
  </Flex>
);

// ── The percentile rule the unit sections are built from ────────────────────
const MetricRule = ({ label, value, unit, percentile, leagueValue, blurb }) => {
  const tone = percentile == null ? "whiteAlpha.400" : percentile >= 60 ? POSITIVE : percentile <= 40 ? NEGATIVE : "whiteAlpha.500";
  return (
    <Box>
      <Flex align="baseline" justify="space-between" gap={2} mb={1}>
        <Text fontSize="11px" fontWeight="700" color="whiteAlpha.800" lineClamp={1} title={blurb}>{label}</Text>
        <Flex align="baseline" gap={2} flexShrink={0}>
          <Text fontSize="12px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{fmtRate(value, unit)}</Text>
          <Text fontSize="9px" fontWeight="900" color={tone} fontVariantNumeric="tabular-nums" w="26px" textAlign="right">
            {percentile == null ? "—" : `${percentile}%`}
          </Text>
        </Flex>
      </Flex>
      <Box position="relative" h="5px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
        <Box h="100%" borderRadius="full" bg={tone} style={{ width: `${Math.max(percentile ?? 0, 2)}%` }} />
      </Box>
      {Number.isFinite(leagueValue) && <Kicker mt={1} color="whiteAlpha.400">Lg {fmtRate(leagueValue, unit)}</Kicker>}
    </Box>
  );
};


// "Anthony Reagan Jr" labels as "Reagan" — the suffix is noise at 7px, and the
// surname is the only part that fits under a square that small.
const SUFFIXES = new Set(["jr", "sr", "ii", "iii", "iv", "v"]);
const PARTICLES = new Set(["van", "von", "de", "del", "della", "da", "di", "la", "le", "st", "st."]);
const surnameOf = (name) => {
  const parts = String(name ?? "").split(/\s+/).filter(Boolean);
  while (parts.length > 1 && SUFFIXES.has(parts[parts.length - 1].replace(/\./g, "").toLowerCase())) parts.pop();
  const last = parts[parts.length - 1] ?? "";
  const before = (parts[parts.length - 2] ?? "").toLowerCase();
  return PARTICLES.has(before) ? `${parts[parts.length - 2]} ${last}` : last;
};

const initialsOf = (name) =>
  String(name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

// ── Leaders, with faces ─────────────────────────────────────────────────────
const LeaderCard = ({ slot, player, photo, primary, secondary, square = false }) => (
  <Flex direction="column" align="center" textAlign="center" flex="1" minW={0}>
    <Kicker color={secondary ?? BRAND}>{slot}</Kicker>
    <Box mt={2} w="clamp(3.4rem, 7vw, 5rem)" h="clamp(3.4rem, 7vw, 5rem)" borderRadius={square ? "0.6rem" : "full"} overflow="hidden" border="2px solid" borderColor={primary} bg="rgba(255,255,255,0.05)" position="relative">
      {photo ? (
        <Image src={photo} alt="" w="100%" h="100%" objectFit="cover" objectPosition="top center" />
      ) : (
        <Flex align="center" justify="center" h="100%">
          <Text fontSize="1.1rem" fontWeight="900" color="whiteAlpha.500">{(player?.name_display ?? "?").slice(0, 1)}</Text>
        </Flex>
      )}
    </Box>
    <Text fontSize="12px" fontWeight="900" color="white" mt={2} lineClamp={2}>{player?.name_display ?? "—"}</Text>
    <Kicker color="whiteAlpha.400" mt={1}>{player?.position ?? ""}</Kicker>
    <Text fontSize="clamp(0.95rem, 1.8vw, 1.3rem)" fontWeight="900" fontStyle="italic" color="white" mt={1.5} lineHeight={0.9} fontVariantNumeric="tabular-nums">
      {Number.isFinite(player?.par) ? player.par.toFixed(1) : "—"}
    </Text>
    <Kicker color="whiteAlpha.400" mt={1}>PAR · {player?.games_played ?? "—"} games</Kicker>
  </Flex>
);

// ── Player impact, expandable ───────────────────────────────────────────────
const ImpactRow = ({ player, open, onToggle, primary, maxPar }) => {
  const games = player.games ?? [];
  const maxGame = Math.max(1, ...games.map((g) => Math.abs(g.total ?? 0)));
  return (
    <Box borderBottom="1px solid" borderColor="whiteAlpha.50">
      <Flex as="button" onClick={onToggle} w="100%" align="center" gap={3} py={2} textAlign="left" _hover={{ bg: "whiteAlpha.50" }}>
        <Text w="14px" flexShrink={0} fontSize="10px" fontWeight="900" color="whiteAlpha.400">{open ? "−" : "+"}</Text>
        <Text flex="1" minW={0} fontSize="11px" fontWeight="900" color="white" lineClamp={1}>{player.name_display}</Text>
        <Kicker w="2.6rem" flexShrink={0} color="whiteAlpha.500">{player.position ?? player.position_group}</Kicker>
        <Box w="22%" minW="3rem" flexShrink={0}>
          <Box h="6px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
            <Box h="100%" borderRadius="full" bg={primary} style={{ width: `${Math.max(2, (player.par / maxPar) * 100)}%` }} />
          </Box>
        </Box>
        <Text w="3rem" flexShrink={0} textAlign="right" fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">
          {Number.isFinite(player.par) ? player.par.toFixed(1) : "—"}
        </Text>
        <Text w="2.2rem" flexShrink={0} textAlign="right" fontSize="10px" fontWeight="800" color="whiteAlpha.600" fontVariantNumeric="tabular-nums">
          {player.games_played ?? "—"}
        </Text>
      </Flex>
      {open && (
        <Box pb={3} pl={7} pr={2}>
          <Kicker color="whiteAlpha.400" mb={2}>Production by game</Kicker>
          <Flex align="flex-end" gap={1.5} h="52px">
            {games.map((g) => (
              <Flex key={g.game_id} direction="column" justify="flex-end" flex="1" minW={0} h="100%" title={`${g.game_id} · ${(g.total ?? 0).toFixed(2)}`}>
                <Box borderRadius="sm" bg={primary} opacity={0.85} style={{ height: `${Math.max(3, (Math.abs(g.total ?? 0) / maxGame) * 100)}%` }} />
              </Flex>
            ))}
          </Flex>
          <Flex gap={4} mt={2} wrap="wrap">
            {Object.entries(player.season_components ?? {}).map(([k, v]) => (
              <Flex key={k} align="baseline" gap={1.5}>
                <Kicker color="whiteAlpha.400">{k.replace("_production", "")}</Kicker>
                <Text fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{Number(v).toFixed(1)}</Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
};

// ═════════════════════════════════════════════════════════════════════════════

// ── Mobile jump header ──────────────────────────────────────────────────────
// The game page's pattern: a sticky bar naming the part on screen; tap it for
// the sheet of every part, the one on screen lit.
const PROFILE_PARTS = [
  { id: "overview", label: "Overview" },
  { id: "profiles", label: "Offense & Defense" },
  { id: "leaders", label: "Leaders" },
  { id: "efficiency", label: "Efficiency" },
  { id: "phases", label: "Phases" },
  { id: "units", label: "Units" },
  { id: "impact", label: "Player Impact" },
  { id: "results", label: "Results & Roster" },
];
const JUMP_MARGIN = "calc(var(--app-header-height) + 2.8rem)";
const JUMP_ACCENT = "#A855F7";

const ProfileJumpHeader = ({ current, onJump, team }) => {
  const [open, setOpen] = useState(false);
  const part = PROFILE_PARTS.find((p) => p.id === current) ?? PROFILE_PARTS[0];
  return (
    <>
      <Flex position="sticky" top="var(--app-header-height)" zIndex={20} align="stretch" justify="space-between" bg={BANNER_STRIP_BG} borderBottom="1px solid" borderColor="whiteAlpha.100" minH="2.6rem">
        <Flex as="button" type="button" onClick={() => setOpen(true)} align="center" gap="0.45rem" pl="0.75rem" pr="1.5rem" minW={0}
          bg={`linear-gradient(110deg, ${JUMP_ACCENT} 0%, ${BANNER_STRIP_BG} 100%)`} borderBottomRightRadius="1.75rem">
          <Text fontSize="0.68rem" fontWeight="black" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.08em" flexShrink={0}>Profile</Text>
          <Text fontSize="0.68rem" fontWeight="black" color="whiteAlpha.600">/</Text>
          <Text fontSize="0.8rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.04em" lineClamp={1}>{part.label}</Text>
          <ChevronDown size={15} color="white" style={{ flexShrink: 0 }} />
        </Flex>
        <Flex align="center" gap="0.4rem" px="0.75rem" flexShrink={0}>
          {team.logo && <Image src={team.logo} alt="" w="1.2rem" h="1.2rem" objectFit="contain" />}
          <Text fontSize="0.78rem" fontWeight="black" color="white" textTransform="uppercase">{team.short}</Text>
        </Flex>
      </Flex>
      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Jump to">
        <Flex direction="column" py="0.4rem">
          {PROFILE_PARTS.map((p) => {
            const on = p.id === part.id;
            return (
              <Box key={p.id} as="button" type="button" onClick={() => { setOpen(false); onJump(p.id); }} w="full" textAlign="left" px="1rem" py="0.85rem"
                bg={on ? "whiteAlpha.100" : "transparent"} borderLeft="3px solid" borderColor={on ? JUMP_ACCENT : "transparent"}>
                <Text fontSize="0.85rem" fontWeight="black" color={on ? "white" : "whiteAlpha.700"} textTransform="uppercase" letterSpacing="0.04em">{p.label}</Text>
              </Box>
            );
          })}
        </Flex>
      </BottomSheet>
    </>
  );
};

export const ProfileTab = ({ hub, season, teamId }) => {
  const { isMobile } = useLayoutDensity();
  const jumpIds = isMobile ? PROFILE_PARTS.map((p) => p.id) : [];
  const { current, refs, jump } = useJumpSections(jumpIds);
  // Mobile: each block is a jump target. Desktop: nothing.
  const jp = (id) => (isMobile ? { ref: refs[id], "data-jump": id, style: { scrollMarginTop: JUMP_MARGIN } } : {});
  const G = isMobile ? 0 : 4;
  const team = hub.teams?.[teamId];
  const row = team?.seasons?.[season];

  const [openPlayer, setOpenPlayer] = useState(null);
  const [allPlayers, setAllPlayers] = useState(false);

  const tape = useMemo(() => matchupTable(hub, season), [hub, season]);

  // The ten real base metrics, and each team's rank on both sides of them.
  const bases = useMemo(
    () => [...new Set((hub.units ?? []).filter((u) => u.available).flatMap((u) => u.metrics))],
    [hub.units],
  );
  const hubRanks = useMemo(() => {
    const map = {};
    bases.forEach((m) => {
      ["o", "d"].forEach((side) => {
        const field = `${side}_${m}`;
        const sorted = Object.values(hub.teams ?? {})
          .map((t) => ({ id: t.identity.id, p: t.seasons?.[season]?.percentiles?.[field] }))
          .filter((x) => Number.isFinite(x.p))
          .sort((a, b) => b.p - a.p);
        map[field] = Object.fromEntries(sorted.map((x, i) => [x.id, i + 1]));
      });
    });
    return map;
  }, [hub.teams, season, bases]);

  // The backend's advanced block and its ranks (1 = best), for this team.
  const advTable = useMemo(() => {
    const { values, ranks } = profileAdvancedFrom(row?.advanced);
    const total = Object.values(hub.teams ?? {}).filter((t) => t.seasons?.[season]?.advanced).length;
    return { values: { [teamId]: values }, ranks: Object.fromEntries(Object.entries(ranks).map(([k, r]) => [k, { [teamId]: r }])), total };
  }, [hub.teams, season, teamId, row?.advanced]);

  // Spatial maps — null for a side/season the feed couldn't place.
  const spatial = useTeamAnalyticsSpatial(season);
  const usage = useTeamAnalyticsUsage(season);
  const teamSpatial = spatial.teams[teamId] ?? null;

  const { byTeamId, photoByKey } = useTopPlayersByTeam();
  const { games } = useGamesIndex();
  const { teamAnalytics } = usePlayerAnalytics();

  // Everyone with production this season, from player_usage_{season}.json.
  const teamUsage = usage.teams[teamId] ?? null;
  const roster = useMemo(
    () =>
      (teamUsage?.players ?? [])
        .filter((p) => Number.isFinite(p.production_total))
        .map((p) => ({
          player_key: p.player_key ?? p.person_id,
          person_id: p.person_id,
          name_display: p.name,
          position: p.position,
          image_url: p.image_url ?? null,
          par: p.production_total,
          games_played: p.games_played,
          usage: p.usage ?? null,
          games: (p.game_log ?? []).map((g) => ({ game_id: g.schedule_game_id, total: g.production })),
        }))
        .sort((a, b) => b.par - a.par),
    [teamUsage],
  );
  const photoBy = useMemo(() => {
    const map = {};
    (byTeamId?.[teamId] ?? []).forEach((p) => { if (p.person_id) map[p.person_id] = p.image_url; });
    return map;
  }, [byTeamId, teamId]);

  // ── Faces ──────────────────────────────────────────────────────────────
  // Every face is a real player the backend named: the pass grid's top three
  // per cell, the leader rails' top three per list. Photo: the backend's
  // image_url first, then the headshot index.
  const facePhoto = (p) =>
    p.image_url ??
    photoByKey?.[p.person_id] ??
    photoByKey?.[`${teamSlug(teamId)}:${nameSlug(p.name)}`] ??
    null;

  const faceOf = (p, title) => ({
    id: p.person_id ?? p.player_key ?? p.name,
    name: p.name ?? "",
    surname: p.last_name ?? surnameOf(p.name),
    initials: initialsOf(p.name),
    position: p.position ?? "",
    photo: facePhoto(p),
    title: title ?? p.name,
  });

  const maps = useMemo(
    () => ({
      passOff: passGridFrom(teamSpatial?.offense),
      passDef: passGridFrom(teamSpatial?.defense),
      rushOff: rushLanesFrom(teamSpatial?.offense),
      rushDef: rushLanesFrom(teamSpatial?.defense),
      havoc: havocZonesFrom(teamSpatial?.defense),
      targetsOff: passTargetsFrom(teamSpatial?.offense, (p) => faceOf(p)),
      targetsDef: passTargetsFrom(teamSpatial?.defense, (p) => faceOf(p)),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teamSpatial, photoByKey, teamId],
  );

  // Leader rails — the backend's top three per list, with its counting line.
  const leadersOf = (key) =>
    (teamUsage?.leaders?.[key] ?? []).map((l) => faceOf(l, [l.name, l.value_display && `${l.value_display} ${String(l.value_label ?? "").toLowerCase()}`, l.line].filter(Boolean).join(" · ")));
  const passingLeaders = { offense: leadersOf("passing"), defense: leadersOf("pass_defense") };
  // The lane rollup names no players, so the lanes carry no faces; the rail does.
  const rushingLeaders = {
    offense: { left: [], middle: [], right: [], rail: leadersOf("rushing") },
    defense: { left: [], middle: [], right: [], rail: leadersOf("run_defense") },
  };

  const schedule = useMemo(
    () =>
      (games ?? [])
        .filter((g) => String(g.season) === String(season) && (g.home_team_id === teamId || g.away_team_id === teamId))
        .sort((a, b) => String(a.date).localeCompare(String(b.date))),
    [games, season, teamId],
  );

  if (!row || !team) {
    return <Section title="Team Profile"><Text fontSize="sm" color="whiteAlpha.600">No data for this team in {season}.</Text></Section>;
  }

  const primary = team.identity.primary ?? BRAND;
  const secondary = team.identity.secondary ?? "#E9D5FF";
  const vals = tape.values[teamId] ?? {};
  const adv = advTable.values[teamId] ?? {};
  const lg = hub.league?.[season]?.metrics ?? {};
  const live = (hub.units ?? []).filter((u) => u.available);
  const gaps = (hub.units ?? []).filter((u) => !u.available);

  const offAxes = bases.map((m) => ({ key: m, label: hub.metrics[m]?.short ?? m, value: row.percentiles?.[`o_${m}`] }));
  const defAxes = bases.map((m) => ({ key: m, label: hub.metrics[m]?.short ?? m, value: row.percentiles?.[`d_${m}`] }));

  // Leaders: the backend's #1 per list, as the roster row (PAR = season production).
  const leaderFor = (slot) => {
    const key = { Passing: "passing", Rushing: "rushing", Receiving: "receiving" }[slot];
    const top = teamUsage?.leaders?.[key]?.[0];
    return top ? roster.find((p) => p.person_id === top.person_id) ?? null : null;
  };

  const impact = allPlayers ? roster : roster.slice(0, 8);
  const maxPar = Math.max(1, ...roster.map((p) => p.par ?? 0));
  const rosterMeta = teamAnalytics?.[teamId] ?? null;

  return (
    <SectionFlush.Provider value={isMobile}>
    {isMobile && <ProfileJumpHeader current={current} onJump={jump} team={team.identity} />}
    <Flex direction="column" gap={G}>
      {/* ── Identity ───────────────────────────────────────────────────── */}
      <Box {...jp("overview")} position="relative" overflow="hidden" bg={PANEL} border="1px solid" borderColor="whiteAlpha.100" borderRadius={isMobile ? 0 : "lg"} borderLeft="4px solid" borderLeftColor={primary} p={{ base: 4, md: 5 }}>
        {team.identity.logo && (
          <Image src={team.identity.logo} alt="" position="absolute" right="-3rem" top="-2.5rem" w="15rem" h="15rem" objectFit="contain" opacity={0.08} pointerEvents="none" />
        )}
        <Flex align="center" gap={4} position="relative" minW={0}>
          {team.identity.logo && <Image src={team.identity.logo} alt="" w="clamp(3rem, 6vw, 4.5rem)" h="clamp(3rem, 6vw, 4.5rem)" objectFit="contain" flexShrink={0} />}
          <Box minW={0}>
            <Text fontSize="clamp(1.5rem, 4vw, 3.2rem)" fontWeight="900" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.04em" lineHeight={0.88} color="white" lineClamp={2}>
              {team.identity.name}
            </Text>
            <Flex align="center" gap={2} mt={2} wrap="wrap">
              <Kicker color={primary}>{team.identity.conference}{team.identity.division ? ` · ${team.identity.division}` : ""}</Kicker>
              <Kicker color="whiteAlpha.500">{season}</Kicker>
              {row.record?.streak && <Kicker color="whiteAlpha.500">Streak {row.record.streak}</Kicker>}
              {row.record?.last5 && <Kicker color="whiteAlpha.500">Last 5 {row.record.last5}</Kicker>}
            </Flex>
          </Box>
        </Flex>

        <Grid templateColumns={{ base: "repeat(2, minmax(0,1fr))", md: "repeat(5, minmax(0,1fr))" }} gap={3} mt={4} position="relative">
          <Kpi label="Record" value={row.record?.record ?? "—"} sub={row.record?.conference_record ? `${row.record.conference_record} conference` : null} />
          <Kpi label="Team Rating" value={row.rating_display ?? fmtMatchup(row.rating, "num2", true)} rank={row.rating_rank} total={18} tone={row.rating >= 0 ? POSITIVE : NEGATIVE} />
          <Kpi label="Offense EPA / Play" value={fmtMatchup(vals.o_epa, "num2", true)} rank={tape.ranks.o_epa?.[teamId]} total={tape.total} />
          <Kpi label="Defense EPA / Play" value={fmtMatchup(vals.d_epa, "num2", true)} rank={tape.ranks.d_epa?.[teamId]} total={tape.total} />
          <Kpi label="Points / Opportunity" value={fmtProfile(adv.o_points_per_opp, "num2")} rank={advTable.ranks.o_points_per_opp?.[teamId]} total={advTable.total} />
        </Grid>
      </Box>

      {/* ── The two radars ─────────────────────────────────────────────── */}
      {/* Mobile: side by side, flush, short titles. */}
      <Flex {...jp("profiles")} gap={isMobile ? "1px" : 4} direction={isMobile ? "row" : { base: "column", lg: "row" }} align="stretch">
        <Section title={isMobile ? "Offense" : `${season} Offensive Profile`} flex="1" minW={0} right={isMobile ? null : <Kicker color={OFF_TONE}>Percentile</Kicker>} {...(isMobile ? { borderRadius: 0, p: "0.6rem" } : {})}>
          <Radar axes={offAxes} series={[{ label: team.identity.short, color: primary, values: offAxes.map((a) => a.value) }]} size={isMobile ? 190 : 260} compact={isMobile} />
        </Section>
        <Section title={isMobile ? "Defense" : `${season} Defensive Profile`} flex="1" minW={0} right={isMobile ? null : <Kicker color={DEF_TONE}>Percentile</Kicker>} {...(isMobile ? { borderRadius: 0, p: "0.6rem" } : {})}>
          <Radar axes={defAxes} series={[{ label: team.identity.short, color: secondary, values: defAxes.map((a) => a.value) }]} size={isMobile ? 190 : 260} compact={isMobile} />
        </Section>
      </Flex>

      {/* ── Leaders ────────────────────────────────────────────────────── */}
      <Section {...jp("leaders")} title={`${season} Leaders`} right={<Kicker color="whiteAlpha.500">Production above replacement</Kicker>}>
        <Flex gap={4} wrap="wrap">
          {["Passing", "Rushing", "Receiving"].map((slot) => {
            const p = leaderFor(slot);
            return <LeaderCard key={slot} slot={slot} player={p} photo={p ? (p.image_url ?? photoBy[p.person_id] ?? null) : null} primary={primary} secondary={secondary} square={isMobile} />;
          })}
        </Flex>
      </Section>

      {/* ── Efficiency, offense against defense ────────────────────────── */}
      <Flex {...jp("efficiency")} gap={G} direction={{ base: "column", xl: "row" }} align="stretch">
        <Section title="Team efficiency" flex="1" minW={0} right={<Kicker color="whiteAlpha.500">Rank of 18</Kicker>}>
          <SplitHead />
          {["rushing", "passing"].map((family) => (
            <Box key={family} mt={3}>
              <Kicker color="whiteAlpha.400" mb={1}>{family}</Kicker>
              {bases.filter((m) => hub.metrics[m]?.family === family).map((m) => (
                <SplitRow
                  key={m}
                  label={hub.metrics[m]?.label ?? m}
                  offValue={fmtRate(row.metrics?.[`o_${m}`], hub.metrics[m]?.unit)}
                  defValue={fmtRate(row.metrics?.[`d_${m}`], hub.metrics[m]?.unit)}
                  offPct={row.percentiles?.[`o_${m}`]}
                  defPct={row.percentiles?.[`d_${m}`]}
                  offRank={hubRanks[`o_${m}`]?.[teamId]}
                  defRank={hubRanks[`d_${m}`]?.[teamId]}
                  total={18}
                />
              ))}
            </Box>
          ))}
        </Section>

        <Section title="Advanced efficiency" flex="1" minW={0}>
          <SplitHead />
          <Box mt={2}>
            {PROFILE_ADVANCED.map((def) => (
              <SplitRow
                key={def.key}
                label={def.label}
                offValue={fmtProfile(adv[`o_${def.key}`], def.unit)}
                defValue={fmtProfile(adv[`d_${def.key}`], def.unit)}
                offRank={advTable.ranks[`o_${def.key}`]?.[teamId]}
                defRank={advTable.ranks[`d_${def.key}`]?.[teamId]}
                total={advTable.total}
              />
            ))}
          </Box>
        </Section>
      </Flex>

      {/* ── The phases — every stat we hold, grouped the way a team is
             actually discussed. Sits below the two efficiency tables. ─── */}
      <Box {...jp("phases")}>
      <TeamProfilePhasesPassingCopy season={season} teamId={teamId} row={row} vals={vals} adv={adv} maps={maps}
        tapeRanks={tape.ranks} advRanks={advTable.ranks} hubRanks={hubRanks} passingLeaders={passingLeaders} rushingLeaders={rushingLeaders}
        teamColors={{ primary, secondary }} />
      </Box>

      {/* ── Units — the taxonomy is the content ────────────────────────── */}
      <Grid {...jp("units")} templateColumns={{ base: "1fr", md: "repeat(2, minmax(0,1fr))" }} gap={G}>
        {live.map((unit) => (
          <Section key={unit.id} title={unit.label} right={<Kicker color={unit.side === "defense" ? DEF_TONE : OFF_TONE}>{unit.side}</Kicker>}>
            <Flex direction="column" gap={3}>
              {unit.metrics.map((m) => {
                const field = `${unit.side === "defense" ? "d" : "o"}_${m}`;
                return (
                  <MetricRule
                    key={field}
                    label={hub.metrics[m]?.label ?? m}
                    blurb={hub.metrics[m]?.blurb}
                    unit={hub.metrics[m]?.unit}
                    value={row.metrics?.[field]}
                    percentile={row.percentiles?.[field]}
                    leagueValue={lg[field]}
                  />
                );
              })}
            </Flex>
          </Section>
        ))}
        {gaps.map((unit) => (
          <Section key={unit.id} title={unit.label} right={<Kicker color={NEGATIVE}>No data</Kicker>}>
            <Flex align="flex-start" gap={2}>
              <AlertTriangle size={13} color={NEGATIVE} style={{ flexShrink: 0, marginTop: 2 }} />
              <Text fontSize="11px" color="whiteAlpha.600" lineHeight={1.5}>{unit.gap}</Text>
            </Flex>
          </Section>
        ))}
      </Grid>

      {/* ── Player impact ──────────────────────────────────────────────── */}
      <Section
        {...jp("impact")}
        title="Player impact"
        right={
          <Flex align="center" gap={2}>
            <Kicker color="whiteAlpha.500">{roster.length} players</Kicker>
            {roster.length > 8 && (
              <Box as="button" onClick={() => setAllPlayers((v) => !v)} px={2.5} py={1} borderRadius="md" bg="whiteAlpha.100"
                fontSize="9px" fontWeight="900" color="whiteAlpha.700" textTransform="uppercase" _hover={{ bg: "whiteAlpha.200" }}>
                {allPlayers ? "Show top 8" : "View all"}
              </Box>
            )}
          </Flex>
        }
      >
        {impact.length === 0 ? (
          <Text fontSize="sm" color="whiteAlpha.500" fontStyle="italic">No player production on file for this team.</Text>
        ) : (
          <>
            <Flex align="center" gap={3} pb={1.5} borderBottom="1px solid" borderColor="whiteAlpha.100">
              <Box w="14px" flexShrink={0} />
              <Kicker flex="1" color="whiteAlpha.500">Player</Kicker>
              <Kicker w="2.6rem" flexShrink={0} color="whiteAlpha.500">Pos</Kicker>
              <Box w="22%" minW="3rem" flexShrink={0} />
              <Kicker w="3rem" flexShrink={0} textAlign="right" color="whiteAlpha.500">PAR</Kicker>
              <Kicker w="2.2rem" flexShrink={0} textAlign="right" color="whiteAlpha.500">G</Kicker>
            </Flex>
            {impact.map((p) => (
              <ImpactRow
                key={p.player_key}
                player={p}
                primary={primary}
                maxPar={maxPar}
                open={openPlayer === p.player_key}
                onToggle={() => setOpenPlayer((v) => (v === p.player_key ? null : p.player_key))}
              />
            ))}
          </>
        )}
      </Section>

      {/* ── Schedule & roster ──────────────────────────────────────────── */}
      <Flex {...jp("results")} gap={G} direction={{ base: "column", xl: "row" }} align="stretch">
        <Section title={`${season} results`} flex="1.4" minW={0} right={<Kicker color="whiteAlpha.500">{schedule.length} games</Kicker>}>
          {schedule.length === 0 ? (
            <Text fontSize="sm" color="whiteAlpha.500" fontStyle="italic">No parsed games for this team in {season}.</Text>
          ) : (
            schedule.map((g) => {
              const home = g.home_team_id === teamId;
              const us = home ? g.home_score : g.away_score;
              const them = home ? g.away_score : g.home_score;
              const oppId = home ? g.away_team_id : g.home_team_id;
              const opp = hub.teams?.[oppId]?.identity;
              const won = us > them;
              const played = Number.isFinite(us) && Number.isFinite(them);
              return (
                <Flex key={g.game_stem} as={Link} to={`/game/${g.game_stem}`} align="center" gap={3} py={2}
                  borderBottom="1px solid" borderColor="whiteAlpha.50" color="text.primary" _hover={{ bg: "whiteAlpha.50" }}>
                  <Text w="5rem" flexShrink={0} fontSize="10px" fontWeight="900" color="whiteAlpha.500" fontVariantNumeric="tabular-nums">{g.date}</Text>
                  <Kicker w="1.6rem" flexShrink={0} color="whiteAlpha.400">{home ? "vs" : "at"}</Kicker>
                  {opp?.logo && <Image src={opp.logo} alt="" w="18px" h="18px" objectFit="contain" flexShrink={0} />}
                  <Text flex="1" minW={0} fontSize="11px" fontWeight="800" color="whiteAlpha.800" lineClamp={1}>{opp?.name ?? oppId}</Text>
                  {played ? (
                    <>
                      <Box px={1.5} py={0.5} borderRadius="sm" bg={won ? "rgba(72,187,120,0.22)" : "rgba(246,173,85,0.18)"} flexShrink={0}>
                        <Text fontSize="9px" fontWeight="900" color={won ? POSITIVE : NEGATIVE}>{won ? "W" : "L"}</Text>
                      </Box>
                      <Text w="3.4rem" flexShrink={0} textAlign="right" fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">
                        {us}–{them}
                      </Text>
                    </>
                  ) : (
                    <Kicker color="whiteAlpha.400">Upcoming</Kicker>
                  )}
                </Flex>
              );
            })
          )}
        </Section>

        <Section title="Roster composition" flex="1" minW={0} right={<Kicker color="whiteAlpha.500">2025 roster</Kicker>}>
          {!rosterMeta ? (
            <Text fontSize="sm" color="whiteAlpha.500" fontStyle="italic">No roster analytics on file.</Text>
          ) : (
            <>
              <Grid templateColumns="repeat(3, minmax(0,1fr))" gap={3}>
                <Kpi label="Roster" value={rosterMeta.roster_size ?? "—"} />
                <Kpi label="Transfers" value={rosterMeta.transfer_count ?? "—"} sub={Number.isFinite(rosterMeta.transfer_rate) ? `${(rosterMeta.transfer_rate * 100).toFixed(1)}% of roster` : null} />
                <Kpi label="Avg PAR" value={Number.isFinite(rosterMeta.avg_par) ? rosterMeta.avg_par.toFixed(2) : "—"} />
              </Grid>
              <Kicker color="whiteAlpha.400" mt={4} mb={2}>Class distribution</Kicker>
              {Object.entries(rosterMeta.class_distribution ?? {})
                .sort((a, b) => b[1] - a[1])
                .map(([cls, n]) => {
                  const max = Math.max(...Object.values(rosterMeta.class_distribution));
                  return (
                    <Flex key={cls} align="center" gap={2} py={1}>
                      <Kicker w="3.2rem" flexShrink={0} color="whiteAlpha.600">{cls}</Kicker>
                      <Box flex="1" h="6px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden" minW={0}>
                        <Box h="100%" borderRadius="full" bg={primary} style={{ width: `${(n / max) * 100}%` }} />
                      </Box>
                      <Text w="1.8rem" textAlign="right" fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{n}</Text>
                    </Flex>
                  );
                })}
            </>
          )}
        </Section>
      </Flex>
    </Flex>
    </SectionFlush.Provider>
  );
};

export default ProfileTab;
