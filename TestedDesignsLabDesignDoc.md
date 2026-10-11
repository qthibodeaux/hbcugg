# Tested Designs Lab Design Doc

## 1. Why This Exists
The **Tested Designs Lab** (`/lab/tested-designs`) is the digital archive for high-fidelity UI components that were developed during the design process but were not selected for production. It preserves the "Magic" of experimental layouts, alternative data visualizations, and editorial variants that might be useful for future hubs or pages.

It ensures that "Glory-level" design work isn't lost when a specific page iteration takes a different direction.

## 2. Core Model
The page mirrors the **Component Lab** in architecture and functionality:
- **Central Registry**: Components must be explicitly registered in `src/components/organisms/test/testedDesignsRegistry.js`.
- **PageShell Integration**: All components are rendered within standard `PageShell` slots to maintain layout fidelity.
- **Gallery View**: The page renders as a vertically scrolling gallery of the registered components.

## 3. Difference from Component Lab
- **Component Lab**: Auditioning active candidates for live pages.
- **Tested Designs Lab**: Permanent preservation of high-quality "alternatives" and legacy variants.

## 4. Preservation Rules
All components added to this lab must:
- Be moved to `src/components/organisms/test/legacy/` to keep the active `test/` directory clean.
- Follow the **Named Export Only** rule.
- Use **Mock Data** derived from real sources (see `AgentDesignBible.md` section 8).
- Be registered with a unique `number` starting at **1000**.

## 5. Slot Mapping
Every entry in the registry specifies its `size` (e.g., `4x1`, `2x2`, `1x1`). The lab page uses this to wrap the component in the appropriate `PageShell.Slot`.

## 6. Metadata Contract
```javascript
{
  number: number,        // Unique ID (>= 1000)
  name: string,          // "Page Context — Component Name (Variant)"
  agent: string,         // Agent who built it (e.g. "HBCUGG")
  date: string,          // ISO date of archival
  size: string,          // PageShell slot size
  component: Component,  // Named export reference
  notes: string          // Reasoning/Value for preservation
}
```

## 7. Current Preservation List (Legacy Lab)
The following components are primary candidates for immediate preservation:
- **Command Header A/B/C**: Roster Hub editorial headers.
- **Experience Matrix**: Class/Position density grids.
- **Transfer Board**: Portal intelligence visualizations.
- **Week Central Game Card Variants A-F**: Alternative scorecard layouts.

---
*Updated: 2026-04-25 | Gemini Code Assist*