import { toRosterHubTeamId, normalizeRosterHubYear, asArray, byPositionOrder, byClassOrder, VETERAN_CLASSES, getCountByClass, weightedAverage, round, classifyRoster } from "./rosterPresentation";

// Roster hub per-team document adapter with same-team/same-season supplementation.

export const buildTeamRosterHubModelFromDoc = ({ team, doc, hub, year }) => {
  if (!team || !doc) {
    return { team, teamData: null, rosterTeamId: toRosterHubTeamId(team?.exportId), year: normalizeRosterHubYear(year), hasData: false };
  }

  const positionDistribution = asArray(doc.composition?.position_distribution).slice().sort(byPositionOrder);
  const classDistribution = asArray(doc.composition?.class_distribution).slice().sort(byClassOrder);
  const totalPlayers = doc.roster_size ?? 0;
  const upperclassPct = doc.composition?.upperclass_pct ?? null;
  const veteranPct = classDistribution
    .filter((item) => VETERAN_CLASSES.includes(item.class))
    .reduce((sum, item) => sum + (item.pct ?? 0), 0) || null;
  const freshmenCount = getCountByClass(classDistribution, "Fr.");

  const positionExperience = Object.entries(doc.experience_by_room ?? {})
    .map(([group, payload]) => ({
      group,
      total: payload?.total ?? 0,
      breakdown: asArray(payload?.breakdown).slice().sort(byClassOrder),
    }))
    .sort(byPositionOrder);

  const physicalGroups = Object.entries(doc.frame_profile?.by_position_group ?? {})
    .map(([group, payload]) => ({ group, ...payload }))
    .sort(byPositionOrder);
  // frame_profile's LINE/BOX/SKILL tiers are the backend's own body-type
  // grouping — pass them straight through instead of re-deriving buckets
  // client-side. Membership differs from the old client-side guess (QB
  // lands in SKILL here, not BOX) because this is the backend's call to
  // make, not the frontend's.
  const TIER_LABELS = { LINE: "Line", BOX: "Box", SKILL: "Skill", SPECIALIST: "Specialist" };
  const tierOrder = ["LINE", "BOX", "SKILL", "SPECIALIST"];
  const physicalTiers = tierOrder
    .filter((key) => doc.frame_profile?.[key])
    .map((key) => ({ key, label: TIER_LABELS[key], ...doc.frame_profile[key] }));
  const avgHeight = weightedAverage(physicalGroups, "height_avg");
  const avgWeight = weightedAverage(physicalGroups, "weight_avg");

  const players = asArray(doc.players).map((p) => ({ ...p, team_id: doc.team_id }));
  // Only supplement from the same team and season. An explicit empty array
  // remains authoritative; omitted fields may use the published season rollup.
  const matchingTeam = doc.team_id === toRosterHubTeamId(team.exportId);
  const matchingSeason = Number(doc.season) === Number(year) && Number(hub?.year) === Number(year);
  const supplement = matchingTeam && matchingSeason ? hub?.teams?.[doc.team_id] : null;
  const geographic = { ...supplement?.geographic, ...doc.geographic };
  const transfers = { ...supplement?.transfers, ...doc.transfers };
  const stateDistribution = asArray(geographic.state_distribution);
  const transferCount = transfers.transfer_count ?? players.filter((p) => p.is_transfer).length;
  const transferRate = transfers.transfer_rate ?? (totalPlayers ? (transferCount / totalPlayers) * 100 : null);
  // §3.2 sends raw counts on tier_breakdown[] / position_impact[], not the
  // pct/transfer_rate the cards render — compute both here, once, rather
  // than have RosterTransferCard guess at `?? 0` and draw an empty bar.
  const transferTiers = asArray(transfers.tier_breakdown).map((item) => ({
    ...item,
    pct: transferCount ? round((item.count / transferCount) * 100, 1) : 0,
  }));
  const transferPositionImpact = asArray(transfers.position_impact)
    .map((item) => ({
      ...item,
      transfer_rate: item.total_players ? round((item.transfer_count / item.total_players) * 100, 1) : 0,
    }))
    .sort((a, b) => b.transfer_rate - a.transfer_rate);
  const inStatePct = geographic.in_state_pct ?? null;
  const avgDistance = geographic.avg_recruiting_distance_miles ?? null;

  return {
    team,
    teamData: doc,
    rosterTeamId: doc.team_id,
    year: normalizeRosterHubYear(year),
    hasData: true,
    identity: classifyRoster({ totalPlayers, veteranPct, transferRate }),
    players,
    composition: {
      totalPlayers,
      positionDistribution,
      classDistribution,
      upperclassPct,
      underclassPct: upperclassPct != null ? round(100 - upperclassPct, 1) : null,
    },
    experience: {
      upperclassPct,
      veteranPct,
      positionExperience,
    },
    physical: {
      overall: { height_avg: avgHeight, weight_avg: avgWeight, count: totalPlayers },
      groups: physicalGroups,
      tiers: physicalTiers,
      sizeVsConference: [],
      avgHeight,
      avgWeight,
    },
    geographic: { stateDistribution, hotspots: asArray(geographic.hotspots), inStatePct, avgDistance },
    transfers: {
      transferCount,
      transferRate,
      sourceCoverage: transfers.source_coverage ?? null,
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
