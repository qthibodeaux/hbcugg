import { toRosterHubTeamId, normalizeRosterHubYear, asArray, byPositionOrder, byClassOrder, getCountByClass, classifyRoster, round } from "./rosterPresentation";

// Roster hub rollup adapter; legacy source and fallback contracts are preserved.

export const buildTeamRosterHubModel = ({ team, hub, year }) => {
  const rosterTeamId = toRosterHubTeamId(team?.exportId);
  const teamData = rosterTeamId ? hub?.teams?.[rosterTeamId] ?? null : null;

  if (!team || !teamData) {
    return {
      team,
      teamData: null,
      rosterTeamId,
      year: normalizeRosterHubYear(year),
      hasData: false,
    };
  }

  const composition = teamData.composition ?? {};
  const experience = teamData.experience ?? {};
  const physical = teamData.physical ?? {};
  const geographic = teamData.geographic ?? {};
  const transfers = teamData.transfers ?? {};

  const positionDistribution = asArray(composition.position_distribution)
    .slice()
    .sort(byPositionOrder);
  const classDistribution = asArray(composition.class_distribution).length
    ? asArray(composition.class_distribution).slice().sort(byClassOrder)
    : asArray(experience.pyramid).slice().sort(byClassOrder);
  const positionExperience = Object.entries(experience.by_position_group ?? {})
    .map(([group, payload]) => ({
      group,
      total: payload?.total ?? 0,
      breakdown: asArray(payload?.breakdown).slice().sort(byClassOrder),
    }))
    .sort(byPositionOrder);
  const physicalGroups = Object.entries(physical.by_position_group ?? {})
    .map(([group, payload]) => ({ group, ...payload }))
    .sort(byPositionOrder);
  const sizeVsConference = Object.entries(physical.size_vs_conference ?? {})
    .map(([group, payload]) => ({ group, ...payload }))
    .sort(byPositionOrder);
  const stateDistribution = asArray(geographic.state_distribution);
  const hotspots = asArray(geographic.hotspots);
  const transferTiers = asArray(transfers.tier_breakdown);
  const transferPositionImpact = asArray(transfers.position_impact)
    .slice()
    .sort((a, b) => (b.transfer_rate ?? 0) - (a.transfer_rate ?? 0));

  const totalPlayers = composition.total_players ?? physical.overall?.count ?? 0;
  const freshmenCount = getCountByClass(classDistribution, "Fr.");
  const veteranPct = experience.veteran_pct ?? null;
  const upperclassPct = experience.upperclass_pct ?? composition.upperclass_pct ?? null;
  const transferCount = transfers.transfer_count ?? 0;
  const transferRate = transfers.transfer_rate ?? null;
  const avgHeight = physical.overall?.height_avg ?? null;
  const avgWeight = physical.overall?.weight_avg ?? null;
  const inStatePct = geographic.in_state_pct ?? null;
  const avgDistance = geographic.avg_recruiting_distance_miles ?? null;

  return {
    team,
    teamData,
    rosterTeamId,
    year: normalizeRosterHubYear(year),
    hasData: true,
    identity: classifyRoster({ totalPlayers, veteranPct, transferRate }),
    composition: {
      ...composition,
      totalPlayers,
      positionDistribution,
      classDistribution,
      upperclassPct,
      underclassPct: composition.underclass_pct ?? null,
    },
    experience: {
      ...experience,
      upperclassPct,
      veteranPct,
      positionExperience,
    },
    physical: {
      ...physical,
      overall: physical.overall ?? {},
      groups: physicalGroups,
      sizeVsConference,
      avgHeight,
      avgWeight,
    },
    geographic: {
      ...geographic,
      stateDistribution,
      hotspots,
      inStatePct,
      avgDistance,
    },
    transfers: {
      ...transfers,
      transferCount,
      transferRate,
      tierBreakdown: transferTiers,
      positionImpact: transferPositionImpact,
    },
    kpis: {
      totalPlayers,
      freshmenCount,
      newAdditions: freshmenCount + transferCount,
      upperclassPct: round(upperclassPct, 1),
      veteranPct: round(veteranPct, 1),
      transferCount,
      transferRate: round(transferRate, 1),
      avgHeight: round(avgHeight, 1),
      avgWeight: round(avgWeight, 0),
      inStatePct: round(inStatePct, 1),
      avgDistance: round(avgDistance, 0),
    },
  };
};
