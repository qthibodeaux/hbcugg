# School Wiki Page — Data Inventory
**Last updated:** 2026-05-02  
**Purpose:** Master reference for every data field the School Wiki page needs, section by section.  
**Schema source:** `teamexample.json` (Alcorn State — reference implementation)

---

## Stadium Photos
**Placeholder:** `public/stadiums/Louis Crews Stadium.jpg` — used for all schools until real photo acquired.

| School | Photo File | Status |
|--------|-----------|--------|
| Alcorn State | `Spinks-Casem Stadium.jpg` | ✅ Have |
| AAMU | `Louis Crews Stadium.jpg` | ✅ Have (this IS their stadium) |
| ASU | — | ❌ Need |
| BCU | — | ❌ Need |
| FAMU | — | ❌ Need |
| JSU | — | ❌ Need |
| MVSU | — | ❌ Need |
| PVAMU | — | ❌ Need |
| Southern | — | ❌ Need |
| TSU (SWAC) | — | ❌ Need |
| UAPB | — | ❌ Need |
| Grambling | — | ❌ Need |
| DSU | — | ❌ Need |
| Howard | — | ❌ Need |
| Morgan State | — | ❌ Need |
| NCCU | — | ❌ Need |
| Norfolk State | — | ❌ Need |
| SCSU | — | ❌ Need |

---

## Section-by-Section Data Requirements

---

### 1. 4×1 HERO BANNER
**Status:** ✅ Exists — `BannerTeamDetailPage`. Reuse as-is.

| Field | Source | Status |
|-------|--------|--------|
| `name` | `teams.json` | ✅ |
| `shortName` | `teams.json` | ✅ |
| `colors.primary/secondary` | `teams.json` | ✅ |
| `logo` | `/assets/{exportId-without-25}.svg` | ✅ |
| `founded` | `teamexample.json` schema | ✅ |
| `enrollment` | `teamexample.json` schema | ✅ |
| `athletics.conferenceChampionships.length` | `teamexample.json` schema | ✅ |
| `location.city`, `state` | `teamexample.json` schema | ✅ |

---

### 2. 2×2 IDENTITY CARD
**Concept:** Team abbreviation large, mascot name, brief history blurb, link to school site. Large logo bleeds out of card right side. Background = `colors.primary`, text = `colors.secondary` + white.

| Field | Source | Status |
|-------|--------|--------|
| `bannerShort` | `teamexample.json` schema | ✅ Need in all 18 teams |
| `mascot` | `teams.json` | ✅ |
| `history.briefHistory` | `teamexample.json` schema | ✅ Need in all 18 teams |
| `motto` | `teamexample.json` schema | ✅ Need in all 18 teams |
| `website` | `teamexample.json` schema | ✅ Need in all 18 teams |
| `logo` | `/assets/` SVGs | ✅ All 18 exist |
| `colors.primary/secondary` | `teams.json` | ✅ |

---

### 3. 1×2 QUICK FACTS
**Concept:** White-on-dark icon + label grid. ~6 facts. Clean, scannable.

| Field | Source | Status |
|-------|--------|--------|
| `founded` | `teamexample.json` schema | ✅ Need in all 18 |
| `enrollment` | `teamexample.json` schema | ✅ Need in all 18 |
| `conference` | `teams.json` | ✅ |
| `division` | `teams.json` | ✅ |
| `location.campusType` | `teamexample.json` schema | ✅ Need in all 18 |
| `location.campusNickname` | `teamexample.json` schema | ✅ Need in all 18 |
| `location.city`, `state` | `teamexample.json` schema | ✅ Need in all 18 |
| `athletics.nflDraftPicks` | `teamexample.json` schema | ✅ Need in all 18 |
| `athletics.conferenceChampionships.length` | `teamexample.json` schema | ✅ Need in all 18 |

---

### 4. 1×2 STADIUM CARD
**Concept:** Stadium photo top half, stat row bottom. Photo degrades to color gradient until real photo acquired.

| Field | Source | Status |
|-------|--------|--------|
| `stadium.name` | `teamexample.json` schema | ✅ Need in all 18 |
| `stadium.capacity` | `teamexample.json` schema | ✅ Need in all 18 |
| `stadium.surface` | `teamexample.json` schema | ✅ Need in all 18 |
| `stadium.built` | `teamexample.json` schema | ✅ Need in all 18 |
| `stadium.recordAttendance` | `teamexample.json` schema | ⚠️ Need in all 18 |
| `stadium.notableFeature` | `teamexample.json` schema | ✅ Need in all 18 |
| Stadium photo | `public/stadiums/` | ⚠️ 2 of 18 — use `Louis Crews Stadium.jpg` as placeholder |

---

### 5. 2×1 SONIC PROFILE (Band Section)
**Concept:** Band name huge with waveform visual decoration. Stats on right. No audio player yet — data + visual only.

| Field | Source | Status |
|-------|--------|--------|
| `sonic_profile.bandName` | `teamexample.json` schema | ✅ Need in all 18 |
| `sonic_profile.bandNickname` | `teamexample.json` schema | ✅ Need in all 18 |
| `sonic_profile.founded` | `teamexample.json` schema | ✅ Need in all 18 |
| `sonic_profile.size` | `teamexample.json` schema | ✅ Need in all 18 |
| `sonic_profile.signatureSelection` | `teamexample.json` schema | ✅ Need in all 18 |
| `sonic_profile.danceTeamName` | `teamexample.json` schema | ✅ Need in all 18 |
| `sonic_profile.flagLineName` | `teamexample.json` schema | ✅ Need in all 18 |
| `sonic_profile.drumMajorStyle` | `teamexample.json` schema | ✅ Need in all 18 |
| `sonic_profile.specialEntrance` | `teamexample.json` schema | ✅ Need in all 18 |
| `sonic_profile.philosophy` | `teamexample.json` schema | ✅ Need in all 18 |

---

### 6. 2×1 TRADITIONS
**Concept:** Team walk + tailgate culture side-by-side. Fight song name. Signature chant with lyrics snippet.

| Field | Source | Status |
|-------|--------|--------|
| `gameday.traditionTitle` | `teamexample.json` schema | ✅ Need in all 18 |
| `gameday.teamWalk.name` | `teamexample.json` schema | ✅ Need in all 18 |
| `gameday.teamWalk.description` | `teamexample.json` schema | ✅ Need in all 18 |
| `gameday.tailgateCulture.name` | `teamexample.json` schema | ✅ Need in all 18 |
| `gameday.tailgateCulture.description` | `teamexample.json` schema | ✅ Need in all 18 |
| `gameday.tailgateCulture.signatureFood` | `teamexample.json` schema | ✅ Need in all 18 |
| `gameday.signatureChants[0]` | `teamexample.json` schema | ✅ Need in all 18 |
| `gameday.fightSong` | `teamexample.json` schema | ✅ Need in all 18 |

---

### 7. 1×1 RIVALRY CAROUSEL
**Concept:** Auto-rotating carousel. Each slide = two school logos facing each other, game name, series record string.

| Field | Source | Status |
|-------|--------|--------|
| `athletics.rivalries[].gameName` | `teamexample.json` schema | ✅ Need in all 18 |
| `athletics.rivalries[].teamId` | `teamexample.json` schema | ✅ Need in all 18 |
| `athletics.rivalries[].trophy` | `teamexample.json` schema | ✅ Need in all 18 |
| `athletics.rivalries[].seriesRecord` | ❌ **NOT IN SCHEMA** | ❌ Need to add |
| `athletics.rivalries[].meetings` | ❌ **NOT IN SCHEMA** | ❌ Need to add |
| `athletics.rivalries[].lastResult` | ❌ **NOT IN SCHEMA** | ❌ Need to add |
| `athletics.rivalries[].leadingTeam` | ❌ **NOT IN SCHEMA** | ❌ Need to add |
| Rival school logo | `/assets/{rivalId}.svg` | ✅ All 18 logos exist |

**Schema addition needed:**
```json
"rivalries": [
  {
    "teamId": "jackson_state",
    "gameName": "The Soul Bowl",
    "trophy": "Soul Bowl Trophy",
    "meetings": 92,
    "leadingTeam": "jackson_state",
    "seriesRecord": "51-40-1",
    "lastResult": { "year": 2024, "winner": "jackson_state", "score": "28-14" }
  }
]
```

---

### 8. 2×1 FAMOUS FIRSTS TIMELINE
**Concept:** Horizontal numbered timeline. Each entry = number bubble + short text.

| Field | Source | Status |
|-------|--------|--------|
| `history.famousFirsts[]` | `teamexample.json` schema | ✅ Need in all 18 |
| Years for each First | ❌ **NOT IN SCHEMA** | ⚠️ Optional — works without years |

**Recommended schema enhancement:**
```json
"famousFirsts": [
  { "text": "First black land-grant institution in the nation.", "year": 1871 },
  { "text": "Hiram R. Revels became first African American U.S. Senator.", "year": 1870 }
]
```

---

### 9. 1×1 NOTABLE ALUMNI
**Concept:** 3 cards — name, field badge (Athletics/Literature/Civil Rights/Politics), achievement. Colored initial block if no photo.

| Field | Source | Status |
|-------|--------|--------|
| `history.notableAlumni[].name` | `teamexample.json` schema | ✅ Need in all 18 |
| `history.notableAlumni[].field` | `teamexample.json` schema | ✅ Need in all 18 |
| `history.notableAlumni[].achievement` | `teamexample.json` schema | ✅ Need in all 18 |
| Alumni photo | Player image_url (if active player) | ⚠️ Partial — historical figures have no photo |

---

### 10. 1×1 FUN FACTS
**Concept:** Numbered list, clean typographic treatment.

| Field | Source | Status |
|-------|--------|--------|
| `history.funFacts[]` | `teamexample.json` schema | ✅ Need in all 18 |

---

### 11. 2×1 SOCIAL & INFLUENCER
**Concept:** Left = social handles. Right = featured alumni/influencer quote + impact score.

| Field | Source | Status |
|-------|--------|--------|
| `branding.socialHandles.twitter` | `teamexample.json` schema | ✅ Need in all 18 |
| `branding.socialHandles.instagram` | `teamexample.json` schema | ✅ Need in all 18 |
| `branding.socialHandles.youtube` | `teamexample.json` schema | ✅ Need in all 18 |
| Featured influencer name | ❌ **NOT IN SCHEMA** | ❌ Need to add |
| Influencer quote | ❌ **NOT IN SCHEMA** | ❌ Need to add |
| Influencer handle | ❌ **NOT IN SCHEMA** | ❌ Need to add |

**Recommended schema addition:**
```json
"featured_voice": {
  "name": "Steve McNair",
  "handle": "@McNair9Legacy",
  "quote": "Alcorn made me who I am.",
  "role": "NFL MVP · Hall of Famer"
}
```

---

### 12. 1×1 BRANDING & COLORS
**Concept:** Color swatches with hex + name. Logo display. Colors description text.

| Field | Source | Status |
|-------|--------|--------|
| `branding.colors.primary` | `teamexample.json` schema / `teams.json` | ✅ All 18 |
| `branding.colors.secondary` | `teamexample.json` schema / `teams.json` | ✅ All 18 |
| `branding.colors.accent` | `teamexample.json` schema | ⚠️ Need in all 18 |
| `branding.colorsDescription` | `teamexample.json` schema | ✅ Need in all 18 |
| `logo` | `/assets/` SVGs | ✅ All 18 |
| Primary color name (e.g. "Purple") | ❌ **NOT IN SCHEMA** | ❌ Need to add |
| Secondary color name (e.g. "Gold") | ❌ **NOT IN SCHEMA** | ❌ Need to add |

---

### 13. 4×1 FOOTBALL LEGACY BANNER
**Concept:** Full-width dark section. Conference championships as year pills. Retired numbers. NFL Draft picks. Hall of Famers. Primary rivalry call-out.

| Field | Source | Status |
|-------|--------|--------|
| `athletics.conferenceChampionships[]` | `teamexample.json` schema | ✅ Need in all 18 |
| `athletics.nationalChampionships[]` | `teamexample.json` schema | ✅ Need in all 18 |
| `athletics.nflDraftPicks` | `teamexample.json` schema | ✅ Need in all 18 |
| `athletics.hallOfFamers[]` | `teamexample.json` schema | ✅ Need in all 18 |
| `athletics.retiredNumbers[]` | `teamexample.json` schema | ✅ Need in all 18 |
| `athletics.rivalries[0].gameName` | `teamexample.json` schema | ✅ |

---

## Summary: What We Need to Source

### Schema Gaps (need to add fields to all 18 team records)
| Gap | Affects | Priority |
|-----|---------|----------|
| `rivalry.seriesRecord`, `meetings`, `leadingTeam`, `lastResult` | Rivalry Carousel | P1 |
| `branding.colors.primaryName`, `secondaryName` | Branding card | P2 |
| `featured_voice` (influencer quote per school) | Social section | P2 |
| `famousFirsts` with years | Timeline | P3 |

### Content Gaps (data doesn't exist yet for all 18 teams)
| Gap | Affects | Priority |
|-----|---------|----------|
| `teamexample.json`-schema records for all 18 teams | Everything | P0 — blocks all sections |
| Stadium photos (16 of 18 missing) | Stadium card | P1 — placeholder covers it |
| Alumni photos for historical figures | Alumni section | P2 — initial blocks cover it |

### P0 Priority: Populate the full schema for all 18 teams
The single biggest unlock. Once all 18 teams have `teamexample.json`-schema records, every section except rivalry records and stadium photos works immediately.
