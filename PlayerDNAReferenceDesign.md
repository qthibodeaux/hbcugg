# Player DNA Reference Design (site now offline)

This documents a player-scouting web app the user showed a screenshot of during the
Player Detail Page bio/stats redesign work. The site itself has since gone offline,
so this captures what it looked like and what we pulled from it before that reference
disappeared. No URL or site name was ever given — this is reconstructed only from the
screenshot shared in conversation, not verified against the live site.

## What the screenshot showed

A player search/lookup tool for soccer analytics, organized around one player at a time:

- **Top bar**: a player search box ("Search player (1,789 in 2025/26)") pre-filled with
  a result like "Kylian Mbappé (Real Madrid)", plus a separate "Team (search only)"
  dropdown. Below that, five tabs: **Player / Scatter / Scoutprint / Compare / Glossary**.
- **Player identity card**: name in bold, then a subline — club, league, season, minutes
  played (e.g. "REAL MADRID · LA LIGA · 2025/26 · 2718 MINS (30.2 x 90)") — and a small
  pill showing primary position + a confidence/usage percentage (e.g. "Forward 96%").
- **"Ranked Against" card**: a separate small panel to the right of the identity card,
  naming the comparison population explicitly — e.g. "Forward — All T5 · 2025/26 · 396
  players · 8+ nineties." This made the percentile framing self-documenting: you never
  had to guess who "average" meant.
- **"Player DNA" section** — the part that mattered most for us: a row of small stat
  tiles (Progression, Carrying, Passing, Shooting, Aerial, Hold-Up, Tempo, Defending,
  Recovery, Decision, Final Third), each tile containing:
  - a small gray uppercase label,
  - one big number, **color-coded by percentile tier** (red → orange/yellow → green),
  - a thin underline bar directly beneath the number, colored to match the number.

  Critically, the tile does **not** separate "the number" from "the quality signal" —
  there's no separate colored badge or delta pill next to a neutral white number. The
  number itself carries the signal. That is the detail our own Comparatives card was
  missing when it got called out as looking "like every other Streamlit app": we had a
  flat white bold number + gray label + a small isolated bar/badge off to the side,
  which is the shape of a generic dashboard metric widget, not a scouting stat tile.
- **"Concepts" section** below Player DNA: a second row of tabs — Passing Profile,
  Carrying Profile, Shooting & Footedness, Aerial Duels, Hold-Up Play, Decision Making,
  Final Third, Half-Spaces, Tempo Control, Defending Profile, Post-Recovery, Link-Up &
  Synergy — each presumably expanding into a detail panel. The one visible in the
  screenshot ("Passing Profile") opened into a panel with column headers like Final
  Passing / Penetration / Progression.

## What we already adapted from this into our own components

All changes below live in `src/components/organisms/player/PlayerBioBackgroundPanel.js`:

1. **Tier-colored values.** Added a `tierColor(pct)` helper (red → orange → yellow →
   light green → green, banded at 20/40/60/80th percentile) and applied it to the big
   value text and the percentile bar fill/marker in `ComparativeRow`, replacing the
   flat white number + separate gray delta pill.
2. **Heavy/mono numerals.** Values now use `fontWeight="black"`/900 + `fontFamily="mono"`
   — pulled not from this reference but from this app's own game-page "Data Room" stat
   tab (`src/components/game/page/teamstats/DataRoomTab.js`), which already had the
   "thick" typographic feel the user wanted to lean into.
3. **Percentile bar with a marker pin** (a la MockDraftable, a different reference
   raised in the same conversation) — a horizontal track showing exactly where the
   player sits on the 0–100 scale, kept alongside the text delta rather than replacing
   it, since the two communicate different things (gap in real units vs. position on
   the distribution).
4. **`CardTitle`'s accent bar now uses the team's real primary color** instead of a
   generic app-wide brand purple — not from this reference directly, but fixed in the
   same pass since it was part of why the card read as generic/templated.

## What we have NOT adapted yet (ideas still on the table)

- The **"Ranked Against" framing** — an explicit small callout naming the comparison
  population ("Defensive Backs, this roster, 2025 season, N players") the way this site
  names its cohort. Our cards currently say "Position avg" inline but don't have a
  dedicated "here's who you're being compared to" panel.
- The **tabbed "Concepts" breakdown pattern** — a second tier of detail views a user can
  drill into per stat category. Nothing in our Stats tab plan currently mirrors this,
  but it's a reasonable future shape for a "click into a stat for more detail" flow.
- The **player search / compare-by-name UI** at the top of the reference page. We have
  a Compare leaderboard planned for the Stats tab (see the Season Stats tab discussion),
  but not a global player search box.

## Why this file exists

The reference site went offline after this discussion, so there was no longer a live
page to point back to. This file is the durable record of what it looked like and which
specific design decisions in this codebase trace back to it, so future work referencing
"the Player DNA tiles" or "the Streamlit critique" has something concrete to check
against instead of relying on conversation memory alone.
