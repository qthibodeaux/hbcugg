Updated todo list

The Bio tab looks incredible. The dark mode combined with the mono-spaced typography, the subtle team-color overlays, and the data density without feeling cluttered is top-tier. 

Given the wealth of stats you want to display for the **Overview** tab, we should stick to the `PageShell` grid system. The goal here is to provide a "dashboard" view where a user can grok the player's season at a glance, before they dive into the game logs or trend tabs.

Here is a blueprint for how we can visualize this rich dataset, fitting your existing design philosophy:

### 1. The Apex Row (KPIs & Efficiency) - `PageShell.Slot cols={4}`
Instead of overwhelming them with passing/rushing yards right away, lead with **Impact**.
*   **Total PAR & Production (1x1):** A large, bold number for `par` (Production Above Replacement) next to `total_production`, with a subtle line underneath indicating the `replacement_baseline`.
*   **Total Yardage & Touchdowns (1x1):** `yds_from_scrimmage` and `total_td` as the primary metrics, with `total_touches` as muted secondary text. 
*   **Efficiency Rating (1x1):** `epa_per_play` prominently displayed. If it's a QB, break it into a mini-split of `epa_passing` vs. `epa_rushing`. Add a small green/red trend arrow indicating if they are positive or negative vs average.
*   **Market Share "Dial" (1x1):** A circular gauge (just like the Glory Rating) showing `share_of_team_production`. Inside the ring: "34%". Underneath: "Share of Offense".

### 2. The Production Engine (Primary Stats) - `PageShell.Slot cols={2} rows={2}`
This is where the modular blocks (`Passing`, `Rushing`, `Receiving`) live. Render only what the player does.
*   **The Passing/Rushing Matrix:** A dark card with a crisp `1px solid whiteAlpha.100` border. 
    *   **Top half:** A minimalist table or grid. E.g., `COMP/ATT`, `YDS`, `TD`, `INT`, `SACKS`.
    *   **Bottom half (Advanced):** Use progress bars or colored tags for `comp_pct`, `20plus_completions`, `yds_per_att`.
    *   *Design detail:* Add a small left-border accent bar (using `team.colors.primary`) to denote the active block type.

### 3. Form & Consistency (The "Floor/Ceiling" Card) - `PageShell.Slot cols={2} rows={1}`
This translates advanced analytics into a visual story.
*   **The Consistency Bullet Graph:** Visualize `par_floor`, `par_median`, and `par_ceiling` on a single horizontal axis. A muted track represents the floor-to-ceiling range, with a bright team-color dot marking the median.
*   **Boom vs. Bust:** Two side-by-side metric boxes. `boom_game_count` (neon green text) vs `bust_game_count` (muted gray or red text). 
*   **Recent Form:** A tiny 5-bar sparkline for `last5_avg_par` with a `trend_direction` indicator (e.g., "+2.4 in last 3").

### 4. Signature Moments (The "Trophy Case") - `PageShell.Slot cols={2} rows={1}`
Instead of listing games like a spreadsheet, treat `best_game`, `game_winning_drives`, or `standout_play` like awards.
*   **Game Tickets:** Render 2 or 3 mini "tickets" inside this card. 
*   Each ticket shows the opponent logo (washed out in the background), the `result` (W/L badge), the `game_date`, and the context (`BEST GAME: 38 PAR`, or `GAME-WINNING DRIVE`).
*   This borrows the visual language from your "GAME SPOTLIGHT" block on the Bio tab but acts as a highlight reel.

### 5. Comparatives (Peer Context) - `PageShell.Slot cols={2} rows={1}`
*   **Horizontal Percentile Bars:** Just like your "COMPARATIVES" block in the Bio tab.
*   List key stats (`Conference Rank`, `PAR Percentile`) with a horizontal gauge. "93rd pct" aligned to the right. 

---

### Suggested Execution Strategy for the Component Lab
1.  **`StatsApexRow`**: Build the 4x1 KPI strip first to establish the anchor.
2.  **`ProductionMatrixCard`**: Build a highly reusable module that accepts a schema (e.g., if you pass it the "Passing" schema, it maps the counting stats automatically into a 2x3 grid).
3.  **`ConsistencyBullet`**: Create a custom visual component in Chakra for the Floor/Median/Ceiling metric—it will be one of the prettiest pieces of data viz on the site.

Let me know which quadrant you want to tackle first in the Component Lab and I can start writing out the strict React/Chakra v3 Chakra components!