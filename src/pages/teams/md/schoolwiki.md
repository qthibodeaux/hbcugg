# School Wiki — Design Document

**Route:** `/teams/:teamId/wiki` and `/schools/:teamId/wiki` (same component, both wired in `App.js`)
**File:** `src/pages/teams/SchoolWikiDetailPage.js` — reads `team.wiki` from `teams.json` via `useTeam(teamId)` and renders it through `src/components/organisms/wiki/WikiVariantGrid.js`. No separate `wiki.json` fetch (an earlier version did; that's been removed).
**Last updated:** 2026-08-26 — confirmed working on desktop and mobile. No dedicated mobile render tree exists for this page (unlike the Schools Hub, Conference Wiki Hub, and Roster Hub, which all use a separate mobile component) — it relies entirely on `PageShell.Slot`'s own responsive stacking, and that's sufficient here.

---

## 1. Page Identity & Philosophy

- **Page Name:** School Wiki / Heritage Hub
- **Primary User Job:** Immerse in the deep history, cultural significance, and unique identity of an HBCU program beyond the current season's stats.
- **Character:** Digital Museum. Editorial-heavy but visually punctuated. It should feel like a premium coffee-table book or a high-end physical program.
- **Tone:** Reverent, informative, and proud. It highlights "The Why" behind the school's traditions.

---

## 2. Page Sections & Content Strategy

The School Wiki is driven by a deep institutional dataset found in `teamexample.json`.

### A. The Bedrock (Institutional DNA)
- **Origin Narrative:** Foundation date, land-grant status, and the "Founding Mission."
- **Institutional Identity:** The Motto (with translation), School Colors (and their symbolic meaning), and Campus Nicknames (e.g., "The Reservation").
- **Landmark Map:** A visual grid of "Sacred Spots" on campus (e.g., Ceremonial Gates, Memorial Chapels).

### B. The Ensemble (Program Identity)
- **Editorial Section Name:** Instead of a generic "Sonic Profile", each school gets a tailored heading based on their band's identity (e.g., "The Sonic Boom of the South", "The Sounds of Dyn-O-Mite", "The Marching 101").
- **Sonic Signature:** Detailed breakdown of the signature fanfare, drum major style, and special entrance.
- **The Royal Court:** Sections for the Dance Team and Flag Line, treated with the same prestige as the athletic roster.

### C. The Rituals (Gameday Culture)
- **The Procession:** Team entry traditions (e.g., The Brave Walk).
- **Tailgate Philosophy:** Highlighting the "Family Reunion" atmosphere and signature cuisine (e.g., smoked turkey legs, fried catfish).
- **The Soundtrack:** Fighting songs, Alma Maters, and student-section chants.

### D. The Bloodline (Athletic & Civic Legacy)
- **The Pantheon:** A curated list of "Notable Alumni" categorized by field (Athletics, Literature, Civil Rights).
- **The Championship Wall:** A historical timeline of conference and national titles.
- **Rivalry Matrix:** Deep-dives into Classics (e.g., The Soul Bowl), highlighting the trophies and the "Why" behind the rivalry.

---

## 3. Data Inventory Requirements

To power this experience, the `teams.json` (or a supplementary `school_wiki_data.json`) must provide:

| Section | Keys Needed | Data Types |
|---------|-------------|------------|
| **Foundation** | `founded`, `motto`, `mottoTranslation`, `campusNickname`, `landmarkSpots` | String, Array |
| **Branding** | `colorsDescription`, `logo`, `secondaryLogo`, `socialHandles` | Object, String |
| **Ensemble** | `bandName`, `bandNickname`, `signatureSelection`, `danceTeamName`, `philosophy` | String, Object |
| **Rituals** | `teamWalk`, `tailgateCulture`, `signatureChants` | Object, Array |
| **Legacy** | `nationalChampionships`, `conferenceChampionships`, `notableAlumni`, `rivalries` | Array, Object |

---

## 4. Visual Layout (PageShell Integration)

Using the 4-column `PageShell` grid to create an editorial flow:

- **Banner (cols=4):** High-impact heritage photography with institutional title.
- **DNA Card (cols=1, rows=2):** Vertical sidebar containing the Seal, Motto, and Foundation stats.
- **Ensemble Feature (cols=2, rows=2):** Large central feature with the tailored Band heading.
- **Stadium/Landmark Card (cols=1, rows=1):** Quick stats on the physical home of the program.
- **History Rail (cols=4, rows=1):** Horizontal scrolling component for the "Panethon" of alumni.

---

## 5. Critical Implementation Note: Schema Matching & Field Mapping

**The School Wiki page and all its components require that every field be present under the exact key and nesting as defined in the reference schema (see `teamexample.json` and `WikiCtx.js`).**

### Common Pitfall: Fields Not Displaying

- If a field such as `motto`, `campusNickname`, or `bandName` is present in `teams.json` but not nested under the correct path (e.g., `wiki.motto`, `wiki.location.campusNickname`, `wiki.marching_band.bandName`), the UI will display a placeholder or fallback value (e.g., `[[MOTTO_PENDING]]`, `[[NICKNAME_PENDING]]`).
- The rendering logic does **not** search for fields by name or attempt to resolve alternate structures. It only reads the exact expected path.
- This means that even if the data exists, it will not display unless it matches the schema exactly.

### Example (ASU Case)

If Alabama State's motto is at the top level or under a different key, it will not display:

```json
// INCORRECT (will not display)
{
	"motto": "The Truth Shall Make You Free"
}

// CORRECT (will display)
{
	"wiki": {
		"motto": "The Truth Shall Make You Free"
	}
}
```

### Band Data Example

```json
{
  "wiki": {
    "marching_band": {
      "bandName": "Sounds of Dyn-O-Mite",
      "bandNickname": "SOD",
      "signatureSelection": "Dyn-O-Mite",
      "danceTeamName": "Detonators",
      "flagLineName": "Golden Girls"
    }
  }
}
```

## 4. Data Fetching Strategy (Live)

No network fetch — `teams.json` is bundled, not a `public/data/` request. `useTeam(teamId)` (`src/hooks/useTeams.js`) reads the matching entry from that bundled array and hands `team.wiki` straight to `WikiVariantGrid`. `useSWACRoster`/`useTeamAnalytics` (originally proposed here for a "Royal Court"/"Championship Wall" cross-reference to current rosters/records) are not used anywhere in the live component tree — every card in §5 below reads only from `team.wiki`.

## 5. Page Structure (Live — `WikiVariantGrid.js`)

The slot map below is what actually shipped — bigger and more granular than the original 6-slot plan above:

| Slot | Component |
|---|---|
| `cols=4` | `WikiHeroBanner` |
| `cols=2, rows=2` | `IdentityCard` |
| `cols=1, rows=2` | `QuickFactsCard` |
| `cols=1, rows=2` | `StadiumCard` |
| `cols=4` | `BandShowcaseCard` |
| `cols=4` | `TraditionsBanner` |
| `cols=1` | `RivalryCard` |
| `cols=2` | `HistoryTimelineCard` |
| `cols=1` | `NotableAlumniCard` |
| `cols=4` | `FootballLegacyCard` |
| `cols=1` | `FunFactsCard` |
| `cols=2` | `SocialInfluencerCard` |
| `cols=1` | `BrandingCard` |

// INCORRECT
{
	"wiki": {
		"band": { "bandName": "Mighty Marching Hornets" }
	}
}

// CORRECT
{
	"wiki": {
		"marching_band": { "bandName": "Mighty Marching Hornets" }
	}
}
```

**All field names and nesting must match the schema exactly for the School Wiki page to render them.**

---

## 6. Mobile Design (2026-08-30 pass)

Follows the section-wide rules recorded in [Team Hub Design Doc.md](./Team%20Hub%20Design%20Doc.md#mobile-design-2026-08-30-pass):
no `PageShell` on mobile, square corners, edge-to-edge, no padding, `rem` not `px`.

- **`MobileWikiHeroBanner`** (`WikiHeroBanner.js`) — three stacked tiers: title,
  section switcher, KPI strip. Built on Pattern C, the mobile banner standard.
- **`WikiVariantGrid`** — a local `Slot` wrapper adds `mobileCols` / `mobileRows` props
  so the slot map can be re-flowed for phone width without touching desktop.
  `QuickFactsCard` and `StadiumCard` are `mobileCols={2} mobileRows={1}`, stacking as
  two rows **to the right of** `IdentityCard` rather than becoming full-width rows.

### Known gap

**The School Wiki page still renders inside `PageShell` on mobile.** Every other page in
this section has had the shell removed. This one has not — the banner and the slot map
were adapted, but the outer shell remains, so the page is still subject to PageShell's
forced `autoRows` row height. Flagged 2026-08-30; not yet fixed.

---

*Last updated: 2026-08-30*
