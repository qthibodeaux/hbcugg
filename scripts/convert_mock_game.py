"""
Convert a raw pipeline game export into the frontend-ready shape the Game Center reads.

The 2026 drop in `reqs/mock/` uses the wave-3 pipeline schema: `team_stats` instead of
`team_box`, a nested `game_advanced.team_advanced` instead of the flat `advanced_team`,
`individual_stats` keyed by player id instead of lists, and play rows wrapped in
`base`/`enriched`/`actions`. Every consumer in `src/` expects the flatter frontend
schema, so this maps one onto the other rather than touching eighteen components.

Two things the new schema answers that we had filed as backend asks:
  • `pass_heat_map` — a real 3x3 depth x direction grid per passer (reqs ask #7)
  • per-rusher `success_rate`, `opportunity_carries`, `stuffed_carries`, and
    `left/middle/right_attempts` (reqs ask #8)

Usage:
    python scripts/convert_mock_game.py reqs/mock/tsupvamu26.json 2026
"""

import io
import json
import os
import sys

OUT_DIR = "public/data/93-FE Docs/game-center/games"
INDEX = os.path.join(OUT_DIR, "index.json")


def iso_date(value):
    """The index is ISO throughout; this schema's metadata is MM/DD/YYYY."""
    text = str(value or "").strip()
    parts = text.split("/")
    if len(parts) == 3:
        month, day, year = parts
        return "%s-%s-%s" % (year, month.zfill(2), day.zfill(2))
    return text or None


def safe_div(a, b):
    return (a / b) if b else 0


def flatten_advanced(block):
    """team_advanced[team] is grouped into waves; every consumer wants it flat."""
    out = {}
    for group in ("plays", "situational", "turnovers", "drives", "finishing", "havoc", "rushing_model"):
        section = block.get(group) or {}
        for k, v in section.items():
            if not isinstance(v, (dict, list)):
                out[k] = v
    # The flat schema's `success_rate` is the down-distance one.
    out["success_rate"] = (block.get("plays") or {}).get("success_rate_down_distance")
    for k in ("epa_total", "epa_per_play", "wpa_total"):
        out.setdefault(k, (block.get("plays") or {}).get(k))
    return out


def convert_passing(pid, row):
    att = row.get("attempts") or 0
    yards = row.get("yards") or 0
    return {
        "player_key": pid,
        "name": row.get("name_raw"),
        "attempts": att,
        "completions": row.get("completions") or 0,
        "yards": yards,
        "touchdowns": row.get("touchdowns") or 0,
        "interceptions": row.get("interceptions") or 0,
        "sacks_taken": row.get("sacks_taken") or 0,
        "sack_yards_lost": row.get("sack_yards_lost") or 0,
        "fumbles": row.get("fumbles") or 0,
        "hurries_faced": row.get("hurries_faced") or 0,
        "completion_pct": safe_div(row.get("completions") or 0, att),
        "yards_per_attempt": safe_div(yards, att),
        "success_rate": row.get("success_rate"),
        "direction_breakdown": row.get("direction_breakdown"),
        # The real target map, at last.
        "pass_heat_map": row.get("pass_heat_map"),
    }


def convert_rushing(pid, row):
    att = row.get("attempts") or 0
    yards = row.get("yards") or 0
    return {
        "player_key": pid,
        "name": row.get("name_raw"),
        "attempts": att,
        "yards": yards,
        "touchdowns": row.get("touchdowns") or 0,
        "fumbles": row.get("fumbles") or 0,
        "yards_per_carry": safe_div(yards, att),
        "long": row.get("long"),
        "success_rate": row.get("success_rate"),
        "opportunity_rate": safe_div(row.get("opportunity_carries") or 0, att),
        "stuff_rate": safe_div(row.get("stuffed_carries") or 0, att),
        # Highlight yardage is rushing yards less LINE yards, reported per OPPORTUNITY
        # (see reqs ask #8b). `opportunity_yards` is a different quantity — the yards
        # gained on opportunity carries — and dividing it by attempts was a third thing
        # again, matching neither definition. The 2026 drop ships no per-rusher line
        # yards, so the honest export here is null; the Box Score panel counts the real
        # figure off the play-by-play instead.
        "highlight_yards_per_opportunity": None,
        "opportunity_yards": row.get("opportunity_yards"),
        "power_attempts": row.get("power_attempts") or 0,
        "power_successes": row.get("power_successes") or 0,
        "direction_breakdown": {
            side: {
                "attempts": row.get("%s_attempts" % side) or 0,
                "yards": row.get("%s_yards" % side) or 0,
            }
            for side in ("left", "middle", "right")
        },
    }


def convert_receiving(pid, row):
    tgt = row.get("targets") or 0
    rec = row.get("receptions") or 0
    yards = row.get("yards") or 0
    return {
        "player_key": pid,
        "name": row.get("name_raw"),
        "targets": tgt,
        "receptions": rec,
        "yards": yards,
        "touchdowns": row.get("touchdowns") or 0,
        "fumbles": row.get("fumbles") or 0,
        "catch_rate": safe_div(rec, tgt),
        "yards_per_reception": safe_div(yards, rec),
        "yards_per_target": safe_div(yards, tgt),
        "success_rate": row.get("success_rate"),
        "deep_targets": row.get("deep_targets") or 0,
        "deep_receptions": row.get("deep_receptions") or 0,
        "air_yards": row.get("air_yards"),
        "yac": row.get("yac"),
        "direction_breakdown": row.get("direction_breakdown"),
    }


def convert_generic(pid, row):
    out = {k: v for k, v in row.items() if k not in ("name_raw", "player_id", "team")}
    out["player_key"] = pid
    out["name"] = row.get("name_raw")
    return out


CONVERTERS = {"passing": convert_passing, "rushing": convert_rushing, "receiving": convert_receiving}


def actor_name(value):
    """Actors arrive as {name_raw, team, player_id}; consumers want the bare name."""
    if isinstance(value, dict):
        return value.get("name_raw")
    return value


def convert_play(play):
    base = play.get("base") or {}
    enriched = play.get("enriched") or {}
    derived = enriched.get("derived") or {}
    state = play.get("state_after") or {}

    actions = []
    for a in play.get("actions") or []:
        act = {"type": a.get("type"), "net_yards": a.get("net_yards")}
        for key in ("passer", "rusher", "receiver", "kicker", "returner"):
            if a.get(key) is not None:
                act[key] = actor_name(a.get(key))
        # Direction and depth are real fields in this schema — `targetDirection` and
        # `passDepth` on a pass, `direction` on a run. No text scraping, no defaults.
        direction = a.get("direction") or a.get("targetDirection")
        if direction:
            act["direction"] = direction
        if a.get("passDepth") or a.get("depth"):
            act["passDepth"] = a.get("passDepth") or a.get("depth")
        if a.get("airyards") is not None:
            act["air_yards"] = a["airyards"]
        for key in ("is_complete", "isComplete"):
            if a.get(key) is not None:
                act["isComplete"] = a[key]
        if a.get("is_tfl") is not None:
            act["is_tfl"] = a["is_tfl"]
        if a.get("pressure_detected") is not None:
            act["pressure_detected"] = a["pressure_detected"]
        actions.append(act)

    return {
        "play_id": base.get("play_id"),
        "sequence": base.get("sequence"),
        "quarter": base.get("quarter"),
        "clock": base.get("clock"),
        "down": base.get("down"),
        "distance": base.get("distance"),
        "yardline_absolute": base.get("yl_abs"),
        "offense_team": base.get("offense_team"),
        "defense_team": base.get("defense_team"),
        "play_type": base.get("play_type"),
        "raw_text": base.get("raw"),
        "no_play": bool(play.get("no_play")),
        "scoring_event": bool(play.get("scoring_event")),
        "scoring_type": play.get("scoring_type"),
        "scoring_points": play.get("scoring_points") or 0,
        "turnover": bool(derived.get("is_turnover")),
        "turnover_type": derived.get("turnover_type"),
        "yardline_after_absolute": play.get("yl_post_abs"),
        "score_home_after": state.get("score_home"),
        "score_away_after": state.get("score_away"),
        "epa": (play.get("play_advanced") or {}).get("epa"),
        "actions": actions,
    }


def convert_drive(d):
    start = d.get("start") or {}
    end = d.get("end") or {}
    return {
        "drive_id": d.get("drive_id"),
        "offense_team": d.get("offense_team"),
        "defense_team": d.get("defense_team"),
        "quarter_start": start.get("quarter"),
        "quarter_end": end.get("quarter"),
        "clock_start": start.get("clock"),
        "clock_end": end.get("clock"),
        "start_yardline_absolute": start.get("spot_absolute"),
        "end_yardline_absolute": end.get("spot_absolute"),
        "possession_obtained_by": d.get("possession_obtained_by"),
        "plays_total": d.get("plays_total"),
        "yards_net": d.get("yards_net"),
        "result": d.get("result"),
        "points": d.get("points"),
        "time_of_possession_seconds": d.get("time_of_possession_seconds"),
        "drive_efficiency_rating": d.get("drive_efficiency_rating"),
        "is_long_field_drive": d.get("is_long_field_drive"),
        "score_home_after": end.get("score_home"),
        "score_away_after": end.get("score_away"),
    }


def convert(src, season):
    raw = json.load(io.open(src, encoding="utf-8"))
    meta = raw.get("metadata") or {}
    team_ids = [meta.get("away_team"), meta.get("home_team")]

    # ── team_box ← team_stats, with the ratios the flat schema carries ───────
    team_box = {}
    for tid, s in (raw.get("team_stats") or {}).items():
        pa, ra = s.get("pass_attempts") or 0, s.get("rush_attempts") or 0
        py, ry = s.get("pass_yards") or 0, s.get("rush_yards") or 0
        box = dict(s)
        box.update({
            "pass_completion_pct": safe_div(s.get("pass_completions") or 0, pa),
            "yards_per_pass_attempt": safe_div(py, pa),
            "yards_per_carry": safe_div(ry, ra),
            "total_yards": py + ry,
        })
        team_box[tid] = box

    # ── advanced_team + offensive_advanced_metrics ← game_advanced ──────────
    advanced_team, offensive_adv, defensive_identity = {}, {}, {}
    for tid, block in ((raw.get("game_advanced") or {}).get("team_advanced") or {}).items():
        advanced_team[tid] = flatten_advanced(block)
        rush_off = dict(block.get("rush_offense") or {})
        rush_off["direction_breakdown"] = block.get("rushing_direction_efficiency")
        offensive_adv[tid] = {
            "pass_offense": block.get("pass_offense") or {},
            "rush_offense": rush_off,
            "situational": block.get("situational") or {},
        }
        defensive_identity[tid] = block.get("defensive_identity") or {}

    # ── individual_stats: id-keyed dicts → lists ────────────────────────────
    individual = {}
    for tid, cats in (raw.get("individual_stats") or {}).items():
        individual[tid] = {}
        for cat, rows in cats.items():
            conv = CONVERTERS.get(cat, convert_generic)
            individual[tid][cat] = [conv(pid, row) for pid, row in (rows or {}).items()]

    # ── production_scores: id-keyed → per-team lists ────────────────────────
    production = {tid: [] for tid in team_ids if tid}
    for tid, rows in (raw.get("production_scores") or {}).items():
        production.setdefault(tid, [])
        for pid, row in (rows or {}).items():
            score = row.get("production_score") or {}
            production[tid].append({
                "player_key": pid,
                "name": row.get("name_raw"),
                "position": row.get("position_assumed"),
                "production_total": score.get("total"),
                "components": {k: v for k, v in score.items() if k != "total"},
                "note": None,
            })

    return {
        "_schema": "frontend_ready_v3",
        "_source_game_file": os.path.basename(src),
        "metadata": meta,
        "team_box": team_box,
        "advanced_team": advanced_team,
        "offensive_advanced_metrics": offensive_adv,
        "defensive_identity": defensive_identity,
        "individual_stats": individual,
        "production_scores": production,
        "scoring_summary": raw.get("scoring_summary") or [],
        "drive_summary": [convert_drive(d) for d in (raw.get("drive_summary") or [])],
        "play_by_play": [convert_play(p) for p in (raw.get("play_by_play") or []) if (p.get("base") or {}).get("is_play")],
        "special_teams_production": raw.get("special_teams_production") or {},
        "defensive_analytics": raw.get("defensive_analytics") or {},
        "defensive_crucial_downs": raw.get("defensive_crucial_downs") or {},
        "field_position_timeline": raw.get("field_position_timeline") or [],
        "enrichment_summary": raw.get("enrichment_summary") or {},
    }


def main():
    src = sys.argv[1]
    season = int(sys.argv[2])
    stem = os.path.splitext(os.path.basename(src))[0]

    out = convert(src, season)
    dest_dir = os.path.join(OUT_DIR, str(season))
    if not os.path.isdir(dest_dir):
        os.makedirs(dest_dir)
    dest = os.path.join(dest_dir, "%s.json" % stem)
    io.open(dest, "w", encoding="utf-8", newline="\n").write(
        json.dumps(out, indent=1, ensure_ascii=False) + "\n"
    )

    meta = out["metadata"]
    entry = {
        "game_stem": stem,
        "game_id": meta.get("game_id"),
        "season": season,
        "date": iso_date(meta.get("date")),
        "home_team_id": meta.get("home_team"),
        "away_team_id": meta.get("away_team"),
        "source_file": "%s.json" % stem,
        "frontend_file": "93-FE Docs/game-center/games/%d/%s.json" % (season, stem),
        "schema": "frontend_ready_v3",
        "site": meta.get("site"),
        "home_score": (meta.get("final_score") or {}).get("home", meta.get("home_points")),
        "away_score": (meta.get("final_score") or {}).get("away", meta.get("away_points")),
    }

    # Append only. The index's existing order is load-bearing for consumers that read
    # it positionally, so never re-sort it — an earlier version of this script did,
    # and it blanked the Game Center.
    index = json.load(io.open(INDEX, encoding="utf-8"))
    index = [e for e in index if e.get("game_stem") != stem]
    index.append(entry)
    io.open(INDEX, "w", encoding="utf-8", newline="\n").write(
        json.dumps(index, indent=1, ensure_ascii=False) + "\n"
    )

    print("wrote %s" % dest)
    print("  plays: %d | drives: %d | teams: %s" % (
        len(out["play_by_play"]), len(out["drive_summary"]), list(out["team_box"].keys())))
    print("indexed %s (%s) -> /game/%s" % (entry["game_id"], entry["date"], stem))


if __name__ == "__main__":
    main()
