import { toHavocEvents } from "./havocEvents";
import { getTeamDisplayName } from "../gameBoxScore/teamIdentity";

// Extracted from the live production panel; existing semantics are preserved.

// ─────────────────────────────────────────────────────────────────────────────
// Defense Production — the defensive counterpart to Passing/Rushing Production.
//
// Structure:
//   1. Eyebrow — team-colour dot + the school's short name
//   2. Team defense table (single row — no down split established for defense yet)
//   3. Individual defender table
//   4. Player spotlight, reacting to whichever defender is active
//
// Every field below is read directly off the export — nothing here scans
// `play_by_play` to reconstruct a stat the payload doesn't already carry. Passes
// defended, forced fumbles and QB hurries ship on `individual_stats.defense` for
// 2019-2025 and print real; the 2026 export drops all three from that block (see
// BACKEND_RESPONSE_SPEC.md §1b), so those three columns dash out on a 2026 game
// rather than being counted back out of the raw plays.
//
// The havoc spatial chart reads `havoc_events[]` off the defender's row — lane and
// yards-from-LOS are the backend's to compute (LAUNCH_0_BACKEND_NOTES.md, Game Page);
// the frontend only plots the coordinate. Empty until the field ships.
// ─────────────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════
// Real on every season: tackles, tfl, sacks, interceptions (individual_stats.defense),
// havoc_rate_forced (advanced_team, 100% populated both schemas).
// Real on 2019-2025 only, absent from 2026's individual_stats.defense entirely:
// solo_tackles, assisted_tackles, passes_defended, forced_fumbles, qb_hurries.
export const buildDefenseData = (game, teamId) => {
  const stats = game?.individual_stats?.[teamId];
  if (!stats) return null;

  const adv = game?.advanced_team?.[teamId] ?? {};
  const rows = (stats.defense ?? []).filter((r) => r.name !== "TEAM");

  const defenders = rows.map((r) => {
    const tackles = r.tackles ?? 0;
    const tfl = r.tfl ?? 0;
    const sacks = r.sacks ?? 0;
    const interceptions = r.interceptions ?? 0;
    const passesDefended = r.passes_defended ?? null;
    const forcedFumbles = r.forced_fumbles ?? null;
    const hurries = r.qb_hurries ?? null;
    // The house havoc formula: tfl + sacks + forced fumbles + passes defended +
    // interceptions. Only computed when every input is a real number for this
    // season — on 2026, forcedFumbles/passesDefended are null, so havoc is null
    // rather than a quietly wrong total missing two of its five terms.
    const havoc =
      forcedFumbles != null && passesDefended != null
        ? tfl + sacks + forcedFumbles + passesDefended + interceptions
        : null;

    return {
      key: r.player_key,
      name: r.name,
      tackles,
      soloTackles: r.solo_tackles ?? null,
      assistedTackles: r.assisted_tackles ?? null,
      tfl,
      sacks,
      interceptions,
      passesDefended,
      forcedFumbles,
      hurries,
      havoc,
      // Backend-provided, none of it shipping yet on any season — checked across
      // 31,836 defense rows, 2019-2026. Read null and dash out; nothing here is
      // reassembled from raw plays. See STATS_HUB_CARD_INVENTORY.md.
      clutchStops: r.clutch_stops ?? null,
      redZoneDisruptions: r.red_zone_disruptions ?? null,
      turnoversCreated: r.turnovers_created ?? null,
      thirdDownHavoc: r.third_down_havoc ?? null,
      havocEvents: toHavocEvents(r.havoc_events),
    };
  });

  const sumOrNull = (list, key) => (list.some((d) => d[key] == null) ? null : list.reduce((s, d) => s + d[key], 0));

  const totals = {
    tackles: defenders.reduce((s, d) => s + d.tackles, 0),
    tfl: defenders.reduce((s, d) => s + d.tfl, 0),
    sacks: defenders.reduce((s, d) => s + d.sacks, 0),
    interceptions: defenders.reduce((s, d) => s + d.interceptions, 0),
    passesDefended: sumOrNull(defenders, "passesDefended"),
    forcedFumbles: sumOrNull(defenders, "forcedFumbles"),
    havoc: sumOrNull(defenders, "havoc"),
  };

  // Table shows contributors, not the full roster — bench/special-teams-only
  // names with a single assisted tackle just add scroll. Checked against the
  // raw counts, not the possibly-null `havoc` total, so a 2026 game (PD/FF
  // missing) doesn't lose a real TFL/sack/INT guy because havoc came out null.
  const isContributor = (d) =>
    d.tackles >= 2 || d.tfl > 0 || d.sacks > 0 || d.interceptions > 0 || (d.passesDefended ?? 0) > 0 || (d.forcedFumbles ?? 0) > 0;

  return {
    meta: { displayName: getTeamDisplayName(teamId) },
    totals,
    havocRate: adv.havoc_rate_forced ?? null,
    // Tackles order the list here only as a stable base — the panel re-sorts by
    // PAR, and a defender with no production row falls to the bottom in that
    // order rather than into an arbitrary one. Not sorted on havoc: it is null
    // on any season missing PD/FF, and a key that disappears by season isn't one.
    defenders: defenders.filter(isContributor).sort((a, b) => b.tackles - a.tackles),
  };
};
