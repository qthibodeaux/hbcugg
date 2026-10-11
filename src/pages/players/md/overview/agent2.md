Your Bio layout looks slick! The dark theme with bright emerald neon accents (`#00E676`/`#00C853` vibe), clean typography, rounded card borders, and section headers with colored vertical accent bars give it a modern EA Sports / Next Gen Stats feel.

When transitioning to the **Overview Section of the Stats Tab**, the biggest UI trap is dumping a massive wall of numbers. To keep that same premium, digestible look without overwhelming the user, we should structure this screen into **4 logical visual zones**:

---

## Proposed Dashboard Architecture

### Zone 1: Executive KPI Strip (Top Row)

*High-level summary so a user gets the story in under 2 seconds.*

* **Hero Metric Cards:** Display `Total Production`, `PAR` (Points Above Replacement), `EPA / Play`, and `Success Rate`.
* **Visual Treatment:** Use your radial gauge component (similar to the **Glory Rating 50/100** in your header) for `Success Rate` or `Percentile` rankings (e.g., "94th Pct vs Conference").
* **Cross-Block Chips:** Compact stats like `Total Yds` | `Total TDs` | `Total Touches` neatly stacked under the primary KPIs.

---

### Zone 2: Form & Trend Bar (Middle Left)

*Shows current momentum and consistency.*

* **Sparkline / Area Chart:** Plot `rolling3_par_series` or `game_over_game_delta` with a glowing green fill under the line.
* **Trend Indicator:** A subtle pill tag showing `trend_direction` (e.g., `▲ +4.2 vs Season Avg`).
* **Floor / Ceiling Band:** A horizontal range slider visual for `PAR Floor` ➔ `PAR Median` ➔ `PAR Ceiling`. The wider the band, the more "volatile" the player; a tight band means steady consistency.
* **Boom / Bust Badges:** Small status chips showing `3 Boom Games` (Green) vs `1 Bust Game` (Red/Muted).

---

### Zone 3: Modular Production Blocks (Middle Right to Bottom Left)

*Passing / Rushing / Receiving breakdown — dynamically renders only active blocks for the position.*

Instead of 30 bare text lines, chunk them into **Interactive Modular Cards**:

* **Header Row:** Tabbed or modular header displaying `{block}_production` vs `{block}_replacement_baseline`.
* **Primary Counting Grid:** Big bold stats (`pass_yds`, `pass_td`, `int`) paired with smaller contextual rates (`comp_pct`, `ypc`, `ypr`).
* **Explosive Play Bar:** A stacked progress bar or horizontal meter for big plays:
* e.g., `20+ Yds` | `40+ Yds` | `First Downs`.


* **Red-Zone Impact Callout:** Highlight `rush_att_inside_5` and `rush_td_inside_5` with a subtle red/gold highlight ring or tag.

---

### Zone 4: Signature Moments & Share (Bottom Right Grid)

*Contextual narrative and team impact.*

* **Signature Moments Spotlight (Card Stack):** A small carousel or selectable highlight list showing card-style chips:
* `Best Game` (e.g., *Wk 4 vs Jackson St — 340 Yds, 4 TD*)
* `Game-Winning Drives` (Badge with count)
* `Rivalry Game` / `Ranked Opponent` indicators.


* **Role & Share Donut Chart / Progress Rings:**
* `Snap Share` (e.g., 88% Ring)
* `Share of Team Production` (Progress Bar)
* `Share of Team Yards / TDs` (Segmented Bar)



---

## Quick Mockup Grid Layout

```
+-----------------------------------------------------------------------------------+
| [KPI 1: Total Prod]   [KPI 2: PAR]   [KPI 3: EPA/Play]   [KPI 4: Success Rate %]  |
+----------------------------------------------------+------------------------------+
| FORM & TREND                                       | SHARE & TEAM ROLE            |
| [Line Chart: rolling3_par_series]                  | [Donut Ring: Snap Share 88%] |
| Floor ▇▇▇▇▇[===Median===]▇▇▇▇ Ceiling               | [Bar: Team Yards Share 34%]  |
+----------------------------------------------------+------------------------------+
| MODULAR PRODUCTION (Passing / Rushing)             | SIGNATURE MOMENTS            |
| 3,120 YDS | 28 TD | 6 INT                          | ★ Best Game: Wk 4 (34 PAR)   |
| [Bar: 20+ Yd Passes (18) | 40+ Yd Passes (5)]       | ⚡ 2 Game-Winning Drives      |
+----------------------------------------------------+------------------------------+

```

## UI Design Details to Match Your Style

1. **Card Headers:** Use the exact same green vertical accent bar (`| GAME SPOTLIGHT`) as seen in your Bio tab for section headers like `| FORM & TREND` or `| PRODUCTION`.
2. **Data Tables:** When listing deep sub-stats (`dropbacks`, `sacks_taken`, `sack_yds_lost`), use muted gray text for labels and crisp white numbers, separated by subtle horizontal borders.
3. **Interactive Toggle:** Include a subtle top-right toggle switch on the Overview tab to flip between **Total Season** vs **Per-Game Averages**.

Would you like to drill into the exact layout structure or component code for one specific zone—like the **Form & Consistency** panel or the **Production Cards**?