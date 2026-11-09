import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { PROFILE_PARTS, JUMP_MARGIN, BRAND, PANEL, POSITIVE, NEGATIVE, OFF_TONE, DEF_TONE, fmtRate } from "./teamProfile/profilePresentation";
import { useJumpSections } from "../../game/page/mobile/useJumpSections";
import { useState } from "react";
import { useTeamProfileViewModel } from "./teamProfile/useTeamProfileViewModel";
import { Section, SectionFlush, Kicker, Radar } from "./analyticsTabs/AnalyticsPrimitives";
import { Text, Flex, Box, Image, Grid } from "@chakra-ui/react";
import { ProfileJumpHeader } from "./teamProfile/ProfileJumpHeader";
import { Kpi, SplitHead, SplitRow, MetricRule } from "./teamProfile/ProfilePrimitives";
import { fmtMatchup } from "../../../pages/analytics/matchupMetrics";
import { fmtProfile, PROFILE_ADVANCED } from "../../../pages/analytics/teamProfileMetrics";
import { LeaderCard, ImpactRow } from "./teamProfile/ProfilePlayers";
import { TeamProfilePhasesPassingCopy } from "./TeamProfilePhasesPassingCopy";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

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

  const { tape, bases, hubRanks, advTable, teamAnalytics, teamUsage, roster, photoBy, maps, passingLeaders, rushingLeaders, schedule } = useTeamProfileViewModel({ hub, season, teamId, row });

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
