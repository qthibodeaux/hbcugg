/**
 * coachesHubModel.js
 * 
 * Domain logic for the Coaches Hub ecosystem.
 * Handles sorting, filtering, and summary derivations for:
 * - Stability
 * - Movement
 * - Pipeline
 * - Style/Aggression
 * - Stock/Trends
 */

/**
 * Returns the most stable schools based on continuity score and HC tenure.
 */
export const getMostStableSchools = (schools = [], limit = 5) => {
  return [...schools]
    .sort((a, b) => {
      const scoreA = a.stability?.continuity_score || 0;
      const scoreB = b.stability?.continuity_score || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (b.head_coach?.tenure_year || 0) - (a.head_coach?.tenure_year || 0);
    })
    .slice(0, limit);
};

/**
 * Returns schools with the most volatility (high turnover, low continuity).
 */
export const getMostVolatileSchools = (schools = [], limit = 5) => {
  return [...schools]
    .sort((a, b) => {
      const scoreA = a.stability?.continuity_score || 1;
      const scoreB = b.stability?.continuity_score || 1;
      return scoreA - scoreB;
    })
    .slice(0, limit);
};

/**
 * Derives a movement summary from the school payloads.
 */
export const getMovementSummary = (schools = []) => {
  return schools.reduce((acc, school) => {
    const move = school.movement || {};
    acc.totalDepartures += move.departures || 0;
    acc.totalHires += move.hires || 0;
    acc.internalPromotions += move.internal_promotions || 0;
    acc.externalHires += move.external_hires || 0;
    return acc;
  }, { totalDepartures: 0, totalHires: 0, internalPromotions: 0, externalHires: 0 });
};

/**
 * Ranks schools by their pipeline/export influence.
 */
export const getTopPipelineSchools = (schools = [], limit = 5) => {
  return [...schools]
    .sort((a, b) => (b.pipeline?.staff_export_count || 0) - (a.pipeline?.staff_export_count || 0))
    .slice(0, limit);
};

/**
 * Groups schools by their stock label.
 */
export const getCoachStockGroups = (schools = []) => {
  const groups = {
    "Rising": [],
    "Stable": [],
    "New Era": [],
    "Under Pressure": [],
    "Rebuild": []
  };

  schools.forEach(s => {
    const label = s.stock?.label;
    if (groups[label]) groups[label].push(s);
  });

  return groups;
};

/**
 * Returns aggression/style leaders.
 */
export const getAggressionLeaders = (schools = [], category = 'offense', metric = 'tempo_score') => {
  return [...schools]
    .filter(s => s.style?.[category]?.[metric] !== undefined)
    .sort((a, b) => b.style[category][metric] - a.style[category][metric]);
};

/**
 * Summarizes geographic pipeline data.
 */
export const getRegionalPipelineSummary = (schools = []) => {
  const regions = {};
  schools.forEach(s => {
    const ties = s.pipeline?.regional_ties || [];
    ties.forEach(region => {
      regions[region] = (regions[region] || 0) + 1;
    });
  });
  return Object.entries(regions)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
};
