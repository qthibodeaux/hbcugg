# School Wiki Visual Wireframe & Layout Spec

This wireframe utilizes the **PageShell 4-column grid system**. The layout is designed to flow like a digital museum, moving from the "Foundation" to the "Living Culture" and finally the "Eternal Legacy."

## 1. Grid Composition (Desktop)

```txt
| [1] BANNER: Heritage Feature (Cols: 4)                                     |
|----------------------------------------------------------------------------|
| [2] DNA Sidebar     | [3] THE ENSEMBLE: Institutional Persona (Cols: 3)    |
| (Cols: 1, Rows: 2)  | (2x2 Grid with high-impact editorial visuals)        |
| - Seal & Motto      |                                                      |
| - Foundation Stats  |                                                      |
| - Campus Nickname   |                                                      |
|---------------------|------------------------------------------------------|
|                     | [4] RITUALS & GESTURES (Cols: 3)                      |
|                     | (Horizontal 3-card layout: Procession | Tailgate | Song)|
|----------------------------------------------------------------------------|
| [6] DIGITAL PULSE (Cols: 2)      | [7] CULTURE CATALYST (Cols: 2)           |
| (Social Media Hub / Feed Matrix) | (Influencer of the Week / Video Spot)    |
|----------------------------------------------------------------------------|
| [5] THE PANTHEON: Alumni Heritage Rail (Cols: 4)                           |
| (Horizontal scrolling rail of legacy cards)                                |
```

---

## 2. Component Specifications

### [1] Heritage Banner (4x1)
- **Visual:** High-contrast, monochromatic or duotone image of the campus or a historic moment.
- **Content:** Large serif typography for the school name + Mascot.
- **Detail:** Overlay a subtle "Heritage Seal" watermark in the primary team color.

### [2] DNA Sidebar (1x2)
- **Style:** "Museum Placard" aesthetic. Dark, low-opacity background with a thick left-accent bar.
- **Key Display:** The University Seal (SVG) at the top.
- **Motto:** Rendered in italicized serif with the `mottoTranslation` underneath in a smaller muted font.
- **Campus Nickname:** Large, bold "nicknames" like "THE RESERVATION" in all-caps tracking.

### [3] The Ensemble: "The Persona" (3x2)
- **Dynamic Title:** Uses the school's specific band name (e.g., "SONIC BOOM").
- **Visuals:** High-action shots of the Band, Drum Major, and Dance Team.
- **Composition:** 
    - **Large Image:** 2/3rds of the width showing the full band formation.
    - **Detail Card:** 1/3rd showing the Drum Major style and `signatureSelection`.
- **Interactivity:** A "Listen" icon next to the Signature Selection (future-ready for audio).

### [4] Rituals & Gestures (3x1 Strip)
- **Layout:** Three distinct 1x1 cards.
- **Card A (Procession):** Vertical text "THE WALK" with a description of the team's entrance.
- **Card B (Tailgate):** "THE FLAVOR" focusing on `signatureFood` and the atmosphere.
- **Card C (Soundtrack):** Titles of the Fight Song and Alma Mater.

### [5] The Pantheon (4x1 Rail)
- **Style:** Circular headshots of Alumni (e.g., Steve McNair, Alex Haley) with a "Trading Card" feel.
- **Hover State:** Reveals their `achievement` and `field` (e.g., "Literature", "Civil Rights").
- **Coloring:** Uses the primary team color as a glow effect behind the avatars.

---

## 3. Responsive Adaptations (Mobile)

- **Grid Collapse:** 4-column shifts to 1-column.
- **Sequence:** Banner -> DNA Sidebar (as header) -> Ensemble Feature -> Rituals List -> Pantheon Rail.
- **Component Change:** The Pantheon Rail maintains its horizontal scroll behavior even on mobile to save vertical space.
