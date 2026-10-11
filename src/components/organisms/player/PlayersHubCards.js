import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Award, Gem, Ruler, Sparkles, TrendingUp, ArrowLeftRight, Layers, Map } from "lucide-react";
import teamsData from "../../../data/teams.json";

// ─────────────────────────────────────────────────────────────────────────────
// PLAYERS HUB — CARDS
//
// Replaces the placeholder format (banner in a slot, every board dumped into
// one long listContent scroll of identical ranked rows). Two rules drive this:
//
//  1. THE PLAYER IS THE STAR. This is a discovery page — a face at real size
//     is the point, not a rank-name-number text row. Every card that names
//     people shows them.
//
//  2. EACH BOARD GETS ITS OWN VISUAL. The boards answer different questions,
//     so they should not all look like the same list:
//       Breakout       prior → now delta bars (the jump is the claim)
//       Transfer       arrival rows, impact score as the weight
//       Glory          ranked horizontal bars (a leaderboard IS a length)
//       Hidden Gems    the contrast — high impact against low visibility
//       Outliers       percentile rules against the position group
//       Position       eight rooms, one leader face each
//       Conference     division split, proportional bars
//       Archetypes     population counts, not a ranking at all
//
// Data: players_hub_2025.json via usePlayersHub. Every card renders h="100%"
// to fill its PageShell.Slot.
// ─────────────────────────────────────────────────────────────────────────────

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});
const teamOf = (id) => TEAM_BY_ID[String(id ?? "").replace(/25$/, "")] ?? null;

// A few programs carry a near-black primary that vanishes on the dark card
// ground — fall back to secondary, then the brand accent.
const luminance = (hex) => {
  const v = String(hex ?? "").replace("#", "");
  if (v.length !== 6) return 0;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b;
};
export const accentFor = (teamId) => {
  const team = teamOf(teamId);
  if (luminance(team?.colors?.primary) >= 45) return team.colors.primary;
  if (luminance(team?.colors?.secondary) >= 45) return team.colors.secondary;
  return "#A855F7";
};

const PANEL_BG = "bg.secondary";

const Panel = ({ children, ...rest }) => (
  <Flex
    direction="column"
    h="100%"
    minW={0}
    p={4}
    gap={2.5}
    bg={PANEL_BG}
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="lg"
    overflow="hidden"
    {...rest}
  >
    {children}
  </Flex>
);

const Kicker = ({ children, color = "text.muted", ...rest }) => (
  <Text fontSize="9px" fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.13em" lineClamp={1} {...rest}>
    {children}
  </Text>
);

const CardHead = ({ icon: Icon, label, accent = "#A855F7", right }) => (
  <Flex align="center" justify="space-between" gap={2} flexShrink={0}>
    <Flex align="center" gap={1.5} minW={0}>
      {Icon && <Icon size={12} color={accent} style={{ flexShrink: 0 }} />}
      <Kicker color={accent}>{label}</Kicker>
    </Flex>
    {right}
  </Flex>
);

const Num = ({ children, size = "clamp(1.4rem, 2.2vw, 1.9rem)", color = "white", ...rest }) => (
  <Text
    fontSize={size}
    fontWeight="900"
    fontStyle="italic"
    color={color}
    lineHeight={0.85}
    letterSpacing="-0.04em"
    whiteSpace="nowrap"
    fontVariantNumeric="tabular-nums"
    {...rest}
  >
    {children}
  </Text>
);

const Portrait = ({ src, size, ring = "whiteAlpha.200", alt = "" }) => (
  <Box w={size} h={size} flexShrink={0} borderRadius="md" overflow="hidden" bg="blackAlpha.500" border="1px solid" borderColor={ring}>
    {src ? <Image src={src} alt={alt} w="100%" h="100%" objectFit="cover" objectPosition="top center" /> : null}
  </Box>
);

const hrefFor = (player) => player?.profile_url ?? player?.href ?? "/players";
const fmt = (v, d = 1) => (Number.isFinite(Number(v)) ? Number(v).toFixed(d) : "—");

// A named person row — the unit this whole page is built from.
const PersonRow = ({ player, rank, metric, metricLabel, accent, onOpen, size = "30px" }) => {
  const team = teamOf(player?.school_id);
  return (
    <Flex
      align="center"
      gap={2}
      minW={0}
      cursor="pointer"
      onClick={() => onOpen(player)}
      borderRadius="md"
      px={1.5}
      py={1}
      _hover={{ bg: "whiteAlpha.100" }}
      style={{ transition: "background 0.15s" }}
    >
      {Number.isFinite(rank) && (
        <Text fontSize="9px" fontWeight="900" color="whiteAlpha.500" w="10px" flexShrink={0} fontVariantNumeric="tabular-nums">
          {rank}
        </Text>
      )}
      <Portrait src={player?.image_url} size={size} ring={`${accent}66`} alt={player?.full_name} />
      <Box minW={0} flex={1}>
        <Text fontSize="11px" fontWeight="900" color="white" lineClamp={1}>
          {player?.full_name}
        </Text>
        <Flex align="center" gap={1}>
          {team?.logo && <Image src={team.logo} alt="" w="9px" h="9px" objectFit="contain" flexShrink={0} />}
          <Kicker fontSize="8px">{player?.position ?? player?.position_group} · {team?.shortName ?? player?.school_name}</Kicker>
        </Flex>
      </Box>
      {metric != null && (
        <Box textAlign="right" flexShrink={0}>
          <Text fontSize="12px" fontWeight="900" fontStyle="italic" color={accent} lineHeight={1} fontVariantNumeric="tabular-nums">
            {metric}
          </Text>
          {metricLabel && <Kicker fontSize="7px" mt={0.5}>{metricLabel}</Kicker>}
        </Box>
      )}
    </Flex>
  );
};

// ═══ 1. SPOTLIGHT (2x2) — the page's lead, full editorial treatment ══════════
export const SpotlightHeroCard = ({ spotlight }) => {
  const navigate = useNavigate();
  const entry = spotlight?.primary;
  const player = entry?.player;
  if (!player) return null;

  const team = teamOf(player.school_id);
  const accent = accentFor(player.school_id);

  return (
    <Flex
      position="relative"
      h="100%"
      overflow="hidden"
      borderRadius="lg"
      border="1px solid"
      borderColor="whiteAlpha.100"
      cursor="pointer"
      onClick={() => navigate(hrefFor(player))}
      bg={`linear-gradient(115deg, ${accent} 0%, ${accent}A6 26%, rgba(12,12,15,0.97) 68%)`}
      _hover={{ borderColor: "whiteAlpha.300" }}
      style={{ transition: "border-color 0.18s" }}
    >
      <Text
        position="absolute"
        right="-3%"
        bottom="-14%"
        fontSize="clamp(5rem, 13vw, 11rem)"
        fontWeight="900"
        fontStyle="italic"
        color="whiteAlpha.100"
        lineHeight={0.78}
        letterSpacing="-0.05em"
        whiteSpace="nowrap"
        pointerEvents="none"
        aria-hidden="true"
      >
        {team?.shortName ?? ""}
      </Text>

      <Box position="relative" w={{ base: "40%", lg: "36%" }} flexShrink={0} overflow="hidden">
        {player.image_url && (
          <Image src={player.image_url} alt={player.full_name} position="absolute" inset={0} w="100%" h="100%" objectFit="cover" objectPosition="top center" />
        )}
        <Box position="absolute" inset={0} bg={`linear-gradient(100deg, transparent 34%, ${accent}4D 72%, rgba(12,12,15,0.96) 100%)`} />
      </Box>

      <Flex position="relative" zIndex={1} direction="column" justify="center" gap={2} flex={1} minW={0} px={5} py={5}>
        <Flex align="center" gap={2}>
          <Sparkles size={13} color="white" />
          <Kicker color="whiteAlpha.900">{entry.spotlight_type ?? "Spotlight"}</Kicker>
        </Flex>

        <Text
          fontSize="clamp(1.5rem, 3.2vw, 2.6rem)"
          fontWeight="900"
          fontStyle="italic"
          color="white"
          textTransform="uppercase"
          lineHeight={0.88}
          letterSpacing="-0.035em"
          textShadow="0 3px 0 rgba(0,0,0,0.32)"
          lineClamp={2}
        >
          {player.full_name}
        </Text>

        <Flex align="center" gap={1.5}>
          {team?.logo && <Image src={team.logo} alt="" w="16px" h="16px" objectFit="contain" />}
          <Kicker color="whiteAlpha.800">
            {player.position} · {player.school_name} · {player.class_year}
          </Kicker>
        </Flex>

        <Box w="2.4rem" h="3px" bg="white" borderRadius="full" my={1} />

        <Text fontSize={{ base: "xs", lg: "sm" }} color="whiteAlpha.900" fontWeight="bold" lineClamp={3} maxW="24rem">
          {entry.dek ?? entry.headline}
        </Text>

        <Flex align="flex-end" gap={{ base: 4, lg: 6 }} mt={2}>
          {(entry.stat_strip ?? []).slice(0, 3).map((stat, i) => (
            <Box key={stat.label}>
              <Num size={i === 0 ? "clamp(1.8rem, 3.4vw, 2.8rem)" : "clamp(1rem, 1.6vw, 1.3rem)"}>
                {fmt(stat.value, Number(stat.value) % 1 === 0 ? 0 : 1)}
              </Num>
              <Kicker color={i === 0 ? "white" : "whiteAlpha.700"} mt={1.5}>
                {stat.label}
              </Kicker>
            </Box>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};

// ═══ 2. BREAKOUT RADAR (1x2) — the jump is the claim, so show the delta ══════
export const BreakoutCard = ({ entries = [] }) => {
  const navigate = useNavigate();
  if (!entries.length) return null;
  const accent = "#48BB78";
  const open = (p) => navigate(hrefFor(p));

  return (
    <Panel>
      <CardHead icon={TrendingUp} label="Breakout Radar" accent={accent} right={<Kicker>2024 → 2025</Kicker>} />

      <Flex direction="column" gap={2} flex={1} minH={0} overflow="hidden">
        {entries.slice(0, 4).map((entry) => {
          const prior = Number(entry.prior_metrics?.production_score);
          const now = Number(entry.current_metrics?.production_score);
          const max = Math.max(prior || 0, now || 0, 1);
          return (
            <Box key={entry.player.player_id}>
              <PersonRow player={entry.player} rank={entry.rank} accent={accent} onOpen={open} size="26px" />
              {/* The two-bar delta — a rank number can't show a jump, this can. */}
              {Number.isFinite(prior) && Number.isFinite(now) && (
                <Flex direction="column" gap="3px" pl={5} pr={1.5} mt={0.5}>
                  <Flex align="center" gap={1.5}>
                    <Box h="3px" borderRadius="full" bg="whiteAlpha.300" style={{ width: `${(prior / max) * 68}%` }} />
                    <Text fontSize="7px" fontWeight="900" color="whiteAlpha.500" fontVariantNumeric="tabular-nums">
                      {fmt(prior, 0)}
                    </Text>
                  </Flex>
                  <Flex align="center" gap={1.5}>
                    <Box h="5px" borderRadius="full" bg={accent} style={{ width: `${(now / max) * 68}%` }} />
                    <Text fontSize="8px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">
                      {fmt(now, 0)}
                    </Text>
                  </Flex>
                </Flex>
              )}
            </Box>
          );
        })}
      </Flex>
    </Panel>
  );
};

// ═══ 3. TRANSFER IMPACT (1x2) — arrivals, weighted by impact ═════════════════
export const TransferImpactCard = ({ entries = [], transfersCount }) => {
  const navigate = useNavigate();
  if (!entries.length) return null;
  const accent = "#ECC94B";
  const open = (p) => navigate(hrefFor(p));

  return (
    <Panel>
      <CardHead
        icon={ArrowLeftRight}
        label="Transfer Impact"
        accent={accent}
        right={Number.isFinite(transfersCount) ? <Kicker>{transfersCount} in portal</Kicker> : null}
      />

      <Flex direction="column" gap={1} flex={1} minH={0} overflow="hidden" justify="flex-start">
        {entries.slice(0, 6).map((entry) => (
          <PersonRow
            key={entry.player.player_id}
            player={entry.player}
            rank={entry.rank}
            accent={accent}
            metric={fmt(entry.impact_score ?? entry.transfer_impact_score, 0)}
            onOpen={open}
            size="26px"
          />
        ))}
      </Flex>
    </Panel>
  );
};

// ═══ 4. GLORY LEADERS (2x1) — a leaderboard genuinely IS a length ════════════
export const GloryLeadersCard = ({ entries = [] }) => {
  const navigate = useNavigate();
  if (!entries.length) return null;
  const accent = "#E53E3E";
  const top = entries.slice(0, 5);
  const max = Math.max(...top.map((e) => Number(e.glory ?? e.score ?? 0)), 1);

  return (
    <Panel>
      <CardHead icon={Award} label="Glory Leaders" accent={accent} right={<Kicker>League-wide</Kicker>} />

      <Flex gap={3} flex={1} minH={0}>
        {top.map((entry) => {
          const value = Number(entry.glory ?? entry.score ?? 0);
          const team = teamOf(entry.player?.school_id);
          return (
            <Flex
              key={entry.player.player_id}
              direction="column"
              align="center"
              flex={1}
              minW={0}
              gap={1.5}
              cursor="pointer"
              onClick={() => navigate(hrefFor(entry.player))}
              borderRadius="md"
              p={1}
              _hover={{ bg: "whiteAlpha.100" }}
              style={{ transition: "background 0.15s" }}
            >
              <Portrait src={entry.player?.image_url} size="clamp(34px, 4vw, 46px)" ring={`${accent}66`} alt={entry.player?.full_name} />
              <Text fontSize="10px" fontWeight="900" color="white" textAlign="center" lineClamp={1} maxW="100%">
                {entry.player?.last_name ?? entry.player?.full_name}
              </Text>
              <Flex align="center" gap={1}>
                {team?.logo && <Image src={team.logo} alt="" w="9px" h="9px" objectFit="contain" />}
                <Kicker fontSize="7px">{team?.shortName}</Kicker>
              </Flex>
              {/* Vertical bar — shares width far better than a stacked row. */}
              <Box flex={1} minH="14px" w="100%" display="flex" alignItems="flex-end" justifyContent="center">
                <Box w="60%" borderRadius="sm" bg={accent} style={{ height: `${Math.max((value / max) * 100, 8)}%` }} />
              </Box>
              <Text fontSize="10px" fontWeight="900" fontStyle="italic" color="white" fontVariantNumeric="tabular-nums">
                {fmt(value, 0)}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Panel>
  );
};

// ═══ 5. HIDDEN GEMS (1x1) — the claim is a contrast, so draw the contrast ════
export const HiddenGemsCard = ({ entries = [] }) => {
  const navigate = useNavigate();
  const lead = entries[0];
  if (!lead) return null;
  const accent = "#9F7AEA";
  const impact = Number(lead.impact_score ?? 0);
  const visibility = Number(lead.visibility_score ?? 0);

  return (
    <Panel>
      <CardHead icon={Gem} label="Hidden Gems" accent={accent} right={<Kicker>{entries.length} found</Kicker>} />

      <PersonRow player={lead.player} accent={accent} onOpen={(p) => navigate(hrefFor(p))} size="38px" />

      {lead.gem_type && <Kicker color="whiteAlpha.700">{lead.gem_type}</Kicker>}

      {/* Two opposed rules: high impact, low visibility. The gap IS the point. */}
      <Box mt="auto">
        {[
          { label: "Impact", value: impact, color: accent },
          { label: "Visibility", value: visibility, color: "whiteAlpha.400" },
        ].map((row) => (
          <Box key={row.label} mb={2}>
            <Flex align="baseline" justify="space-between" mb={1}>
              <Kicker>{row.label}</Kicker>
              <Text fontSize="11px" fontWeight="900" fontStyle="italic" color="white" fontVariantNumeric="tabular-nums">
                {fmt(row.value, 0)}
              </Text>
            </Flex>
            <Box h="5px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
              <Box h="100%" borderRadius="full" bg={row.color} style={{ width: `${Math.max(Math.min(row.value, 100), 2)}%` }} />
            </Box>
          </Box>
        ))}
      </Box>
    </Panel>
  );
};

// ═══ 6. PHYSICAL OUTLIERS (1x1) — percentile rules, no chart needed ══════════
export const PhysicalOutliersCard = ({ entries = [] }) => {
  const navigate = useNavigate();
  const lead = entries[0];
  if (!lead) return null;
  const accent = "#F56565";

  return (
    <Panel>
      <CardHead icon={Ruler} label="Physical Outliers" accent={accent} right={<Kicker>{entries.length} flagged</Kicker>} />

      <PersonRow player={lead.player} accent={accent} onOpen={(p) => navigate(hrefFor(p))} size="38px" />

      <Flex gap={4} mt={1}>
        <Box>
          <Num size="1.2rem">{lead.height ?? "—"}</Num>
          <Kicker mt={1}>Height</Kicker>
        </Box>
        <Box>
          <Num size="1.2rem">{lead.weight ?? "—"}</Num>
          <Kicker mt={1}>Weight</Kicker>
        </Box>
      </Flex>

      <Box mt="auto">
        {[
          { label: "Weight pct", value: lead.percentiles?.weight_percentile },
          { label: "Height pct", value: lead.percentiles?.height_percentile },
        ].map((row) => (
          <Box key={row.label} mb={1.5}>
            <Flex align="baseline" justify="space-between" mb={1}>
              <Kicker>{row.label}</Kicker>
              <Text fontSize="10px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">
                {fmt(row.value, 0)}
              </Text>
            </Flex>
            <Box h="4px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
              <Box h="100%" borderRadius="full" bg={accent} style={{ width: `${Math.max(Number(row.value) || 0, 2)}%` }} />
            </Box>
          </Box>
        ))}
      </Box>
    </Panel>
  );
};

// ═══ 7. POSITION POWER BOARDS (2x2) — eight rooms, one leader face each ══════
export const PositionBoardsCard = ({ boards = [] }) => {
  const navigate = useNavigate();
  const live = boards.filter((b) => (b.leaders ?? []).length);
  if (!live.length) return null;
  const accent = "#38B2AC";

  return (
    <Panel>
      <CardHead icon={Layers} label="Position Power Boards" accent={accent} right={<Kicker>{live.length} rooms</Kicker>} />

      <Box
        flex={1}
        minH={0}
        display="grid"
        gridTemplateColumns={{ base: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }}
        gap={2}
      >
        {live.slice(0, 8).map((board) => {
          const leader = board.leaders[0];
          const team = teamOf(leader?.player?.school_id);
          return (
            <Flex
              key={board.board_id}
              direction="column"
              gap={1}
              p={2}
              borderRadius="md"
              bg="whiteAlpha.50"
              cursor="pointer"
              minW={0}
              onClick={() => navigate(hrefFor(leader?.player))}
              _hover={{ bg: "whiteAlpha.100" }}
              style={{ transition: "background 0.15s" }}
            >
              <Kicker color={accent} fontSize="7.5px">{board.label}</Kicker>
              <Flex align="center" gap={1.5} minW={0}>
                <Portrait src={leader?.player?.image_url} size="26px" ring={`${accent}66`} alt={leader?.player?.full_name} />
                <Box minW={0}>
                  <Text fontSize="10px" fontWeight="900" color="white" lineClamp={1}>
                    {leader?.player?.last_name ?? leader?.player?.full_name}
                  </Text>
                  <Kicker fontSize="7px">{team?.shortName}</Kicker>
                </Box>
              </Flex>
            </Flex>
          );
        })}
      </Box>
    </Panel>
  );
};

// ═══ 8. CONFERENCE TALENT MAP (1x2) — division split, proportional ═══════════
export const ConferenceMapCard = ({ groups = [] }) => {
  if (!groups.length) return null;
  const accent = "#4299E1";
  const max = Math.max(...groups.map((g) => Number(g.summary?.total_players) || 0), 1);

  return (
    <Panel>
      <CardHead icon={Map} label="Conference Talent Map" accent={accent} />

      <Flex direction="column" gap={3} flex={1} justify="center">
        {groups.map((group) => {
          const total = Number(group.summary?.total_players) || 0;
          const withStats = Number(group.summary?.players_with_stats) || 0;
          return (
            <Box key={group.group_id}>
              <Flex align="baseline" justify="space-between" gap={2} mb={1}>
                <Kicker color="whiteAlpha.800">{group.label}</Kicker>
                <Text fontSize="12px" fontWeight="900" fontStyle="italic" color="white" fontVariantNumeric="tabular-nums">
                  {total}
                </Text>
              </Flex>
              {/* Producing players nested inside the roster total — one bar
                  carries both numbers instead of two competing bars. */}
              <Box position="relative" h="7px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
                <Box position="absolute" inset={0} borderRadius="full" bg="whiteAlpha.200" style={{ width: `${(total / max) * 100}%` }} />
                <Box position="absolute" left={0} top={0} bottom={0} borderRadius="full" bg={accent} style={{ width: `${(withStats / max) * 100}%` }} />
              </Box>
              <Kicker mt={1} fontSize="7.5px">
                {withStats} producing · top room {group.summary?.top_position_group ?? "—"}
              </Kicker>
            </Box>
          );
        })}
      </Flex>
    </Panel>
  );
};

// ═══ 9. ARCHETYPE EXPLORER (1x2) — a population count, not a ranking ═════════
export const ArchetypeCard = ({ archetypes = [] }) => {
  const navigate = useNavigate();
  if (!archetypes.length) return null;
  const accent = "#38B2AC";
  const max = Math.max(...archetypes.map((a) => Number(a.count) || 0), 1);

  return (
    <Panel>
      <CardHead icon={Sparkles} label="Archetype Explorer" accent={accent} right={<Kicker>{archetypes.length} roles</Kicker>} />

      <Flex direction="column" gap={2.5} flex={1} justify="center">
        {archetypes.map((archetype) => {
          const leader = archetype.leaders?.[0];
          return (
            <Box
              key={archetype.archetype_id}
              cursor={leader ? "pointer" : "default"}
              onClick={() => leader && navigate(hrefFor(leader.player))}
              borderRadius="md"
              px={1.5}
              py={1}
              _hover={leader ? { bg: "whiteAlpha.100" } : undefined}
              style={{ transition: "background 0.15s" }}
            >
              <Flex align="center" gap={2} mb={1} minW={0}>
                {leader?.player?.image_url && (
                  <Portrait src={leader.player.image_url} size="22px" ring={`${accent}66`} alt={leader.player.full_name} />
                )}
                <Kicker color="whiteAlpha.800" flex={1}>{archetype.label}</Kicker>
                <Text fontSize="12px" fontWeight="900" fontStyle="italic" color="white" fontVariantNumeric="tabular-nums">
                  {archetype.count}
                </Text>
              </Flex>
              <Box h="4px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
                <Box h="100%" borderRadius="full" bg={accent} style={{ width: `${Math.max((Number(archetype.count) / max) * 100, 3)}%` }} />
              </Box>
            </Box>
          );
        })}
      </Flex>
    </Panel>
  );
};
