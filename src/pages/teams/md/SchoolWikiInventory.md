# School Wiki — Data Inventory & Schema Spec

This document defines the data required for each of the 18 HBCU programs to power the **Digital Museum / School Wiki** experience.

---

## 1. Core Identity (Institutional)
These fields establish the "Heritage" of the university.

| Key | Description | Example |
|-----|-------------|---------|
| `motto` | Formal school motto. | "Where Knowledge and Character Meet" |
| `mottoTranslation` | English translation if motto is Latin. | "To Greatness Through Knowledge" |
| `founded` | Year of establishment. | 1871 |
| `enrollment` | Approximate student body size. | 3700 |
| `campusNickname` | The popular name for the campus. | "The Reservation", "The Hill", "The Yard" |
| `landmarkSpots` | 3-5 iconic physical locations on campus. | ["Oakland Memorial Chapel", "Golden Class Gate"] |
| `coordinates` | Lat/Long for mapping components. | `{ "lat": 31.87, "lng": -91.13 }` |

---

## 2. Branding (Visual DNA)
Used for creating the "Atmosphere" of the page sections.

| Key | Description | Example |
|-----|-------------|---------|
| `colorsDescription` | The symbolic narrative of the school colors. | "Purple and Gold represents royal heritage..." |
| `helmetLogo` | Path to SVG of the football helmet. | "/assets/alcorn_helmet.svg" |
| `secondaryLogo` | Path to an alternate/heritage mark. | "/assets/alcorn_brave_head.svg" |
| `socialHandles` | Official handles for Twitter/Insta/YT. | `{ "twitter": "@AlcornSports" }` |

---

## 3. The Ensemble (Band & Culture)
Crucial for the "Signature" section of each page.

| Key | Description | Example |
|-----|-------------|---------|
| `bandName` | Official name of the marching band. | "Sounds of Dyn-O-Mite" |
| `bandNickname` | Short/popular name. | "SOD" |
| `signatureSelection` | The iconic song fans wait for. | "Fanfare", "The Horse", "Get Ready" |
| `danceTeamName` | The auxiliary dance squad. | "Golden Girls" |
| `flagLineName` | The auxiliary flag squad. | "Purple Flashers" |
| `drumMajorStyle` | Description of the DM's flair. | "High-stepping, acrobatic" |
| `specialEntrance` | How they take the field. | "The SOD Run-On" |

---

## 4. Gameday Rituals
The cultural touchpoints outside of the game clock.

| Key | Description | Example |
|-----|-------------|---------|
| `teamWalk` | Name/desc of the arrival walk. | `{ "name": "Brave Walk", "desc": "..." }` |
| `tailgateCulture` | Narrative of the parking lot scene. | `{ "name": "Reservation Tailgate", "cuisine": ["Turkey Legs"] }` |
| `signatureChants` | Call-and-response lyrics + cues. | `[{ "name": "Drive for Six", "cue": "First Down" }]` |
| `fightSong` | Title of the upbeat battle march. | "Alcorn Ode" |
| `almaMater` | Title of the formal school hymn. | "Beneath the Shade of Giant Trees" |

---

## 5. Heritage & Pantheon
The lists that populate the "Championship Wall" and "History Rail."

| Key | Description | Example |
|-----|-------------|---------|
| `famousFirsts` | 3 key institutional achievements. | ["First black land-grant institution"] |
| `notableAlumni` | Array of legends with fields and achievements. | `[{ "name": "Alex Haley", "field": "Literature" }]` |
| `championships` | Grouped arrays for visibility. | `{ "national": [1984], "conference": [2014, 2015] }` |
| `rivalries` | Deep-dive into classic matchups. | `[{ "opponentId": "jsu", "classicName": "The Soul Bowl" }]` |

---

## 6. Implementation Notes
- **Source:** Initially mapped in `src/pages/teams/md/teamexample.json`.
- **Production:** Will be merged into `src/data/teams.json` once data is collected for all 18 teams.
- **Null Handling:** If a field like `mottoTranslation` is missing, the UI should gracefully omit the sub-label rather than showing an empty string.
