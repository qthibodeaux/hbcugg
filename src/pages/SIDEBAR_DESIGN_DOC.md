# Sidebar Design System & Specification

**Project**: HBCU GridIron Glory  
**Component**: `SideNav.js` / `useRouteSideNav.js`

---

## 1. Visual Philosophy (The "Classic" Style)
The sidebar returns to the high-contrast, structural aesthetic established in the original designs (`old sidebar.jpg`).

### Core Aesthetic
- **Background**: `bg.secondary` (#141416) with a subtle `whiteAlpha.100` border on the right.
- **Top Context Block**: A "Big Boss" button showing the current Hub (e.g., GAME CENTER) or Team (e.g., ALABAMA A&M).
  - Uses team primary color with a `33` hex suffix (20% opacity) for a background gradient.
  - Large, bold uppercase typography.
- **Nav Items**:
  - **Standard**: Bold uppercase headlines, `text.secondary` color, subtle hover state.
  - **Active**: White text (`text.primary`), bold font, and a **2px thick solid left border** in the accent color (team primary or Hub color).
  - **Indented**: Smaller font (`xs`), dimmer color, and increased left padding (34px) for sub-items like Players or Game details.

---

## 2. Technical Architecture: URL-to-Button Mapper

### Principle: URL as Source of Truth
The sidebar is a deterministic function: `window.location` -> `List of Buttons`. 
- No Context Providers.
- No Manual Registration.
- Purely declarative.

### The Parser (`parseUrl`)
Breaks the pathname into semantic parts:
- `hubId`: The broad context (e.g., `game-center`, `schools`).
- `sectionId`: The active primary navigation item (e.g., `week`, `roster`).
- `entityId`: Specific item context (e.g., `gameId`, `playerId`, `teamId`).

### The Injections
The list starts with a static set of buttons for each hub. We then "inject" contextual items based on the `entityId`:
- **Game Detail**: If on a specific game URL, inject the game-style score box immediately under the "WEEK CENTRAL" or "GAMES" button.
- **Player Detail**: If on a player URL while in a team context, inject the Player button (indented) under the "ROSTER" button.

---

## 3. Interaction & States

### Tab Sync via Query Params
For pages with internal view switching (Stats, Coaches, etc.), we avoid complex `useState` in the page and instead use `?tab=...`.
- Sidebar buttons update the URL search params.
- Page reads the param to show the correct content.
- sidebar uses the param to set the `active` state.

### Item Types
1. **Button**: Standard link. Supports icons.
2. **Game**: Specialized card showing teams and scores.
3. **TeamHubSwitcher**: Specialized block for switching between the 18 programs in a team context.

---

## 4. Hierarchy Structure

```
[HUB HEADER BUTTON]
─────────────────
STANDARD BUTTON 
STANDARD BUTTON (Active)
|  INDENTED SUB-BUTTON
STANDARD BUTTON
```

---

## 5. Implementation Roadmap
- [ ] Restore visual styles in `SideNav.js` matching `old sidebar.jpg`.
- [ ] Consolidate all parsing logic in `useRouteSideNav.js`.
- [ ] Remove all remaining logic from `MainLayout` / `SideNavContext`.
