import { GROUP_DEFS, teamLabel, TEAM_BY_ID, POWER_METRIC, ACCENT } from "./standingsData";
import { standingsCompare } from "./standingsModel";

// Published standings-race adaptation and existing context/power/matrix fallbacks.

export const buildContextItems = (groups) => {
  const orderedGroups = GROUP_DEFS.map((def) => groups[def.id]).filter(Boolean);
  const played = orderedGroups.reduce((sum, group) => sum + (group.completedGames ?? 0), 0);
  const remaining = orderedGroups.reduce((sum, group) => sum + (group.remainingGames ?? 0), 0);
  const allRows = orderedGroups.flatMap((group) => group.rows ?? []);
  const items = [];

  // Closest race - the gap between first and second in whichever division is
  // tightest. Needs at least two teams with a game played to mean anything.
  const contested = orderedGroups.filter((group) => (group.rows?.length ?? 0) > 1 && (group.completedGames ?? 0) > 0);
  if (contested.length > 0) {
    const closest = [...contested].sort((a, b) => {
      const aGap = (a.rows[0]?.cw ?? 0) - (a.rows[1]?.cw ?? 0);
      const bGap = (b.rows[0]?.cw ?? 0) - (b.rows[1]?.cw ?? 0);
      return aGap - bGap;
    })[0];
    const gap = (closest.rows[0]?.cw ?? 0) - (closest.rows[1]?.cw ?? 0);
    items.push({
      label: "Closest Race",
      value: gap === 0 ? "TIED" : String(gap),
      sub: gap === 0 ? `${closest.label} is level at the top` : `${gap === 1 ? "game" : "games"} separate the top two in ${closest.label}`,
      accent: closest.accent,
    });
  }

  // Unbeaten in conference play - interesting early, self-retiring later.
  const unbeaten = allRows.filter((row) => (row.cl ?? 0) === 0 && (row.cw ?? 0) > 0);
  if (unbeaten.length > 0) {
    items.push({
      label: "Unbeaten",
      value: String(unbeaten.length),
      sub: unbeaten.length === 1
        ? `${teamLabel(TEAM_BY_ID[unbeaten[0].id])} is perfect in conference play`
        : "teams still perfect in conference play",
      accent: "#F4811F",
    });
  }

  if (played > 0) {
    items.push({
      label: "Conference Games",
      value: String(played),
      sub: "played across all three divisions",
      accent: "brand.400",
    });
  }

  if (remaining > 0) {
    items.push({
      label: "Still To Play",
      value: String(remaining),
      sub: "conference games left on the slate",
      accent: "#F56565",
    });
  }

  return items;
};

export const rankByPowerMetric = (rows) =>
  rows
    // A board where every team sits at 0 is noise, not a ranking. Before any
    // game is played there is nothing to rank, and the card says so.
    .filter((row) => (row.w ?? 0) + (row.l ?? 0) > 0)
    .sort((a, b) => (b[POWER_METRIC.key] ?? 0) - (a[POWER_METRIC.key] ?? 0) || standingsCompare(a, b));

const getStandingsRows = (groupPayload) => {
  if (Array.isArray(groupPayload)) return groupPayload;
  if (Array.isArray(groupPayload?.standings)) return groupPayload.standings;
  if (Array.isArray(groupPayload?.rows)) return groupPayload.rows;
  return [];
};

const mapFinishMatrix = (groupPayload, sourceRows) => {
  const matrixRows = Array.isArray(groupPayload?.finish_matrix) ? groupPayload.finish_matrix : [];
  const usableMatrixRows = matrixRows.filter((row) => TEAM_BY_ID[row.team_id]);

  if (!usableMatrixRows.length) {
    return sourceRows.map((row, index) => ({
      teamId: row.team_id,
      values: sourceRows.map((_, slot) => (slot === index ? 100 : 0)),
      counts: sourceRows.map((_, slot) => (slot === index ? 1 : 0)),
    }));
  }

  // Rows read top-down by the chance to finish first; ties fall to the next slot.
  const byFinish = (a, b) => {
    for (let i = 0; i < Math.max(a.values.length, b.values.length); i += 1) {
      const d = Number(b.values[i] ?? 0) - Number(a.values[i] ?? 0);
      if (d !== 0) return d;
    }
    return 0;
  };

  return usableMatrixRows.map((row) => {
    const values = Array.isArray(row.values)
      ? row.values
      : sourceRows.map((_, slot) => (slot === Number(row.current_rank ?? 0) - 1 ? 100 : 0));
    const counts = Array.isArray(row.counts)
      ? row.counts
      : values.map((value) => (value > 0 ? 1 : 0));

    return {
      teamId: row.team_id,
      values,
      counts,
      // Wins out → wins the division, whatever anyone else does. The backend's
      // flag off its scenario run (Backend Notes 2026-10-19 §3); never worked out here.
      controlsDestiny: row.controls_destiny === true,
      // The same row as it stood a week ago (Backend Notes 2026-10-25 §2);
      // null until the backend ships it, and the arrows simply don't draw.
      prevValues: Array.isArray(row.values_prev_week) ? row.values_prev_week : null,
    };
  }).sort(byFinish);
};

export const modelFromStandingsRace = (payload) => {
  const groups = GROUP_DEFS.reduce((acc, def) => {
    const groupPayload = payload?.groups?.[def.id.replace("-", "_")];
    const sourceRows = getStandingsRows(groupPayload).filter((row) => TEAM_BY_ID[row.team_id]);

    acc[def.id] = {
      ...def,
      accent: ACCENT[def.id],
      completedGames: Number(groupPayload?.completed_games ?? sourceRows.reduce((sum, row) => sum + Number(row.conf_wins ?? 0) + Number(row.conf_losses ?? 0), 0)),
      remainingGames: Number(groupPayload?.remaining_games ?? 0),
      scenarioCount: Number(groupPayload?.scenario_count ?? 1),
      finishMatrix: mapFinishMatrix(groupPayload, sourceRows),
      rows: sourceRows.map((row) => ({
        id: row.team_id,
        w: Number(row.wins ?? 0),
        l: Number(row.losses ?? 0),
        cw: Number(row.conf_wins ?? 0),
        cl: Number(row.conf_losses ?? 0),
        pct: Number(row.win_pct ?? 0),
        cpct: Number(row.conf_win_pct ?? 0),
        // The backend's point_diff when it ships one; scored minus allowed until then.
        diff: row.point_diff != null ? Number(row.point_diff) : Number(row.points_for ?? 0) - Number(row.points_against ?? 0),
        // row.last5/recent_form/form: whichever field name the backend ships first.
        // None exist in the export today — this always falls through to dashes
        // until the backend adds one. See BACKEND_PIPELINE_TODO.md.
        last5: row.last5 ?? row.recent_form ?? row.form ?? "-----",
        // tiebreaker_status ("resolved_by_available_rules" etc.) is an internal
        // pipeline note, not a W/L streak — never show it as one.
        streak: row.streak ?? "-",
        rank: row.rank,
        record: row.record,
        conferenceRecord: row.conference_record,
        tiebreakerStatus: row.tiebreaker_status,
        confOpp: [],
        form: [],
      })),
    };
    return acc;
  }, {});
  const rows = Object.values(groups).flatMap((group) => group.rows);
  return {
    games: [],
    rows,
    groups,
    contextItems: buildContextItems(groups),
    powerRows: rankByPowerMetric(rows),
  };
};
