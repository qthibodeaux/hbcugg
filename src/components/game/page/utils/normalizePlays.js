// PlayByPlayPanel was written against an older, nested play schema
// (play.base.*, play.state_after.*, play.play_advanced.epa.*, play.penalties[]).
// The current game export emits flat rows instead — raw_text, quarter, down,
// epa, scoring_event, turnover — so every field the panel read resolved to
// undefined and the tab rendered empty rows.
//
// This adapts the export into the shape the panel expects. Adapter rather than
// a panel rewrite because the launch.0 taxonomy isn't settled: when the backend
// names land, this file is the only thing that has to change.

// yardline_absolute counts from the offense's own goal line (0 = own end zone,
// 100 = opponent's). Verified against raw_text: abs=17 with TSU on offense
// reads "1st and 10 at TSU17", and a drive ending in a TD closes at 100.
const sideOfField = (absolute, offenseTeam, defenseTeam) => {
  if (absolute == null) return { team: null, num: null };
  if (absolute <= 50) return { team: offenseTeam, num: absolute };
  return { team: defenseTeam, num: 100 - absolute };
};

// The export carries no penalties array, but the source text does — quote it
// rather than inventing structure. "PENALTY TSU False Start 5 yards from
// PVAMU41 to PVAMU46." -> one entry.
const PENALTY_RE = /PENALTY\s+[^.]*\./g;

const extractPenalties = (rawText) => {
  const matches = String(rawText ?? "").match(PENALTY_RE);
  return matches ? matches.map((text) => ({ text: text.trim() })) : [];
};

export const normalizePlays = (plays) =>
  (plays ?? []).map((p) => {
    const yl = sideOfField(p.yardline_absolute, p.offense_team, p.defense_team);
    const ylPost = sideOfField(p.yardline_after_absolute, p.offense_team, p.defense_team);

    const yardsGained =
      p.yardline_absolute != null && p.yardline_after_absolute != null
        ? p.yardline_after_absolute - p.yardline_absolute
        : null;

    // No first-down flag in the export — derive it from the two fields that
    // define one. Anything without a down and distance (kickoffs, PATs,
    // administrative rows) can't earn the badge, which is correct.
    const isFirstDown =
      p.down != null && p.distance != null && yardsGained != null && yardsGained >= p.distance;

    return {
      ...p,
      base: {
        raw: p.raw_text ?? "",
        // The backend's rewritten sentence ("T.Carter to D.McDaniel for 18 yards
        // (D.Franklin), 1st down.") and spot string ("MVSU 35") — rendered
        // verbatim when present (Game Page Launch.0 Batch §4b); raw_text is the
        // expand. Files generated before the rewrite carry neither.
        description: p.description ?? null,
        spot_display: p.spot?.display ?? null,
        quarter: p.quarter,
        clock: p.clock,
        down: p.down,
        distance: p.distance,
        offense_team: p.offense_team,
        defense_team: p.defense_team,
        yl_team: yl.team,
        yl_num: yl.num,
      },
      // The panel reads the post-snap yardline off the play itself rather than
      // off base — matching that rather than "fixing" it, to keep this a
      // pure adapter.
      yl_post_team: ylPost.team,
      yl_post_num: ylPost.num,
      state_after: {
        scoring_event: p.scoring_event,
        scoring_type: p.scoring_type,
        turnover: p.turnover,
        turnover_type: p.turnover_type,
        is_first_down: isFirstDown,
        yards_gained: yardsGained,
        score_home: p.score_home_after,
        score_away: p.score_away_after,
      },
      play_advanced: {
        // p.epa is already { ep_pre, ep_post, epa, ... } — exactly what the
        // panel reads as adv.epa. Pass it through; wrapping it again makes
        // adv.epa.epa an object and blows up on .toFixed().
        epa: p.epa ?? {},
        wpa: p.wpa,
      },
      penalties: extractPenalties(p.raw_text),
    };
  });
