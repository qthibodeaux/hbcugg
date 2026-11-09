import { PHYSICAL_POSITION_LIST } from "./rosterHubConfig";

// Extracted from the live roster hub. Existing calculations and layouts preserved.

export const readableTextColor = (hexColor) => {
  const hex = hexColor?.replace("#", "");
  if (!hex || hex.length < 6) return "#FFFFFF";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? "#070708" : "#FFFFFF";
};

export const getTeamCompactLabel = (team) => {
  if (team?.short) return team.short;
  if (!team?.label) return "";
  return team.label
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();
};

export const inchesToFtIn = (inches) => {
  if (!inches) return "—";
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
};

export const aggregateDivision = (teamIds, teamsMap) => {
  const modules = teamIds.map((id) => teamsMap[id]).filter(Boolean);
  if (!modules.length) return null;

  const totalPlayers = modules.reduce(
    (s, m) => s + (m.composition?.total_players ?? 0),
    0,
  );

  // class distribution
  const classMap = {};
  modules.forEach((m) => {
    (m.composition?.class_distribution ?? []).forEach((c) => {
      if (!classMap[c.class]) classMap[c.class] = { class: c.class, count: 0 };
      classMap[c.class].count += c.count;
    });
  });
  const classDist = Object.values(classMap).map((c) => ({
    ...c,
    pct: totalPlayers > 0 ? +((c.count / totalPlayers) * 100).toFixed(1) : 0,
  }));

  // experience — weighted avg
  const wAvg = (key, subKey) => {
    let wSum = 0,
      wTot = 0;
    modules.forEach((m) => {
      const w = m.composition?.total_players ?? 0;
      wSum += (m[key]?.[subKey] ?? 0) * w;
      wTot += w;
    });
    return wTot > 0 ? +(wSum / wTot).toFixed(1) : 0;
  };

  // physical
  const physGroups = {};
  modules.forEach((m) => {
    Object.entries(m.physical?.by_position_group ?? {}).forEach(([g, s]) => {
      if (!physGroups[g]) physGroups[g] = { hSum: 0, wSum: 0, cnt: 0 };
      const cnt = s.count ?? 1;
      if (s.height_avg) {
        physGroups[g].hSum += s.height_avg * cnt;
        physGroups[g].cnt += cnt;
      }
      if (s.weight_avg) physGroups[g].wSum += s.weight_avg * cnt;
    });
  });

  // geographic
  const stateMap = {},
    hotMap = {};
  let inStateCnt = 0,
    totalHome = 0,
    distSum = 0,
    distCnt = 0;
  const tierAcc = {};
  modules.forEach((m) => {
    const geo = m.geographic ?? {};
    inStateCnt += geo.in_state_count ?? 0;
    totalHome += geo.total_with_hometown ?? 0;
    if (geo.avg_recruiting_distance_miles) {
      distSum +=
        geo.avg_recruiting_distance_miles * (geo.total_with_hometown ?? 1);
      distCnt += geo.total_with_hometown ?? 1;
    }
    (geo.state_distribution ?? []).forEach((s) => {
      stateMap[s.state] = (stateMap[s.state] ?? 0) + s.count;
    });
    (geo.hotspots ?? []).forEach((h) => {
      hotMap[h.city] = (hotMap[h.city] ?? 0) + h.count;
    });
    Object.entries(geo.distance_tier_breakdown ?? {}).forEach(([k, v]) => {
      tierAcc[k] = (tierAcc[k] ?? 0) + v;
    });
  });

  const stateDist = Object.entries(stateMap)
    .map(([state, count]) => ({
      state,
      count,
      pct: totalHome > 0 ? +((count / totalHome) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const hotspots = Object.entries(hotMap)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // transfers
  const tierMap = {};
  let xferCount = 0;
  modules.forEach((m) => {
    xferCount += m.transfers?.transfer_count ?? 0;
    (m.transfers?.tier_breakdown ?? []).forEach((t) => {
      tierMap[t.tier] = (tierMap[t.tier] ?? 0) + t.count;
    });
  });
  const tierBreakdown = Object.entries(tierMap)
    .map(([tier, count]) => ({
      tier,
      count,
      pct: xferCount > 0 ? +((count / xferCount) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    composition: { total_players: totalPlayers, class_distribution: classDist },
    experience: {
      upperclass_pct: wAvg("experience", "upperclass_pct"),
      veteran_pct: wAvg("experience", "veteran_pct"),
    },
    physical: {
      overall: {
        height_avg: modules
          .filter((m) => m.physical?.overall?.height_avg)
          .reduce(
            (s, m, _, a) => s + m.physical.overall.height_avg / a.length,
            0,
          ),
        weight_avg: modules
          .filter((m) => m.physical?.overall?.weight_avg)
          .reduce(
            (s, m, _, a) => s + m.physical.overall.weight_avg / a.length,
            0,
          ),
      },
      by_position_group: Object.fromEntries(
        Object.entries(physGroups).map(([g, d]) => [
          g,
          {
            height_avg: d.cnt > 0 ? d.hSum / d.cnt : 0,
            weight_avg: d.cnt > 0 ? d.wSum / d.cnt : 0,
            count: d.cnt,
          },
        ]),
      ),
    },
    geographic: {
      in_state_pct:
        totalHome > 0 ? +((inStateCnt / totalHome) * 100).toFixed(1) : 0,
      avg_recruiting_distance_miles:
        distCnt > 0 ? Math.round(distSum / distCnt) : 0,
      distance_tier_breakdown: tierAcc,
      state_distribution: stateDist,
      hotspots,
    },
    transfers: {
      transfer_count: xferCount,
      transfer_rate:
        totalPlayers > 0 ? +((xferCount / totalPlayers) * 100).toFixed(1) : 0,
      tier_breakdown: tierBreakdown,
    },
  };
};

export const computePositionRange = (teamIds, teamsMap, metricKey) => {
  const stats = {};
  PHYSICAL_POSITION_LIST.forEach((pos) => {
    const values = teamIds
      .map((id) => teamsMap?.[id]?.physical?.by_position_group?.[pos]?.[metricKey])
      .filter((v) => Number.isFinite(v) && v > 0);
    stats[pos] = values.length ? { min: Math.min(...values), max: Math.max(...values) } : null;
  });
  return stats;
};

export const computePlayerPositionRange = (players, teamIds, playerField) => {
  const idSet = new Set(teamIds);
  const stats = {};
  PHYSICAL_POSITION_LIST.forEach((pos) => {
    const values = (players ?? [])
      .filter((p) => p.position_group === pos && idSet.has(p.team_id) && Number.isFinite(p[playerField]) && p[playerField] > 0)
      .map((p) => p[playerField]);
    stats[pos] = values.length ? { min: Math.min(...values), max: Math.max(...values) } : null;
  });
  return stats;
};
