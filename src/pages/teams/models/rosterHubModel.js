import { GAME_CENTER_SEASONS } from "../../../components/molecules/game/SeasonSelector";

// Single shared launch.0 year scope — see GAME_CENTER_SEASONS.
export const ROSTER_HUB_YEARS = GAME_CENTER_SEASONS;
export const DEFAULT_ROSTER_HUB_YEAR = 2025;

const POSITION_ORDER = ["QB", "RB", "WR", "WR_TE", "TE", "OL", "DL", "LB", "DB", "ST", "Unknown"];
const CLASS_ORDER = ["Fr.", "So.", "Jr.", "Sr.", "Gr.", "Unknown"];

export const normalizeRosterHubYear = (year) => {
  const numericYear = Number(year);
  return ROSTER_HUB_YEARS.includes(numericYear) ? numericYear : DEFAULT_ROSTER_HUB_YEAR;
};

export const toRosterHubTeamId = (exportId) => exportId?.replace(/25$/, "") ?? null;

const byPositionOrder = (a, b) => {
  const aIndex = POSITION_ORDER.indexOf(a.group);
  const bIndex = POSITION_ORDER.indexOf(b.group);
  return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
};

const byClassOrder = (a, b) => {
  const aIndex = CLASS_ORDER.indexOf(a.class);
  const bIndex = CLASS_ORDER.indexOf(b.class);
  return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const round = (value, digits = 0) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const factor = 10 ** digits;
  return Math.round(number * factor) / factor;
};

const classifyRoster = ({ totalPlayers, veteranPct, transferRate }) => {
  if (transferRate >= 40) return "Portal-driven build";
  if (veteranPct >= 40) return "Veteran core";
  if (totalPlayers >= 115) return "Deep roster room";
  if (veteranPct < 25) return "Youth movement";
  return "Balanced construction";
};

const getCountByClass = (classDistribution, classKey) =>
  classDistribution.find((item) => item.class === classKey)?.count ?? 0;

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

const VETERAN_CLASSES = ["Sr.", "Gr."];

const weightedAverage = (items, field) => {
  const totals = items.reduce(
    (acc, item) => {
      const value = Number(item[field]);
      const count = Number(item.count);
      if (!Number.isFinite(value) || !Number.isFinite(count) || count <= 0) return acc;
      return { value: acc.value + value * count, count: acc.count + count };
    },
    { value: 0, count: 0 },
  );
  return totals.count ? totals.value / totals.count : null;
};

// One-team, one-document roster hub — BACKEND_RESPONSE_SPEC.md §3.2, built
// against reqs/mock/roster_hub_pvamu_2025.json. Produces the exact same
// model contract as buildTeamRosterHubModel above so every RosterHub* card
// renders unmodified. geographic and transfers now ship for real in this
// mock (they didn't in the first demo file) — the cards fall back to their
// "not available" state only if a future team/season's doc omits them.
export const buildTeamRosterHubModelFromDoc = ({ team, doc, year }) => {
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
  // §3.2 now ships transfers/geographic as real team-level aggregates
  // (computed from the same players[] in the same pass, so they can't
  // drift) — prefer them over re-deriving from players[] client-side.
  const geographic = doc.geographic ?? {};
  const transfers = doc.transfers ?? {};
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
    geographic: { stateDistribution, hotspots: [], inStatePct, avgDistance },
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
