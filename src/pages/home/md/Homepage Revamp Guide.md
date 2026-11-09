# Homepage revamp handoff

Prepared by Codex on November 7, 2026.

Keep `/` easy to read from top to bottom. Someone opening `Home.js` should be able to see which sections make up the page, in what order, and where to go to change each one. Give each section a clear owner for its rendering, data and interactions.

## Where the work belongs

| Layer | Responsibility | Example |
|---|---|---|
| Route page | PageShell and section order, route decisions, and status that affects the whole page | `src/pages/Home.js` |
| Homepage section | Compose a meaningful block, call its data hook, and show its own loading, empty or error state | `HomeHero.js`, `GloryTeamOfWeek.js` |
| View or component | Render a tile, card or control from props. Own local UI state such as an open sheet or a failed photo. | `LiveTile.js`, `PlayersTileFaces.js` |
| Data access | Read existing React Query hooks and shared keys. Add a section hook when queries or sources need coordination. | `useHomeGamesCollage.js`, `home/hero/tileQueries.js` |
| Pure model | Normalize payloads, order items, resolve IDs and build links when those operations warrant their own boundary | `home/hero/faceLinks.js`, `gameCenterPayloads.js` |

Follow the PageShell slot and sizing rules in the design bible. The current home hero uses its own responsive tile grid. Keep tile-specific layout inside the section and give the page ownership of how that section fits into the overall layout. Reuse existing layout, navigation, tile and team identity primitives where their contracts fit.

Put a helper beside its section when that section is its only consumer. Use a shared utility when there is a shared domain rule or a second real consumer. Keep small helpers beside the component they explain. A split earns its place when it gives a responsibility a clear home, isolates a layout variant, or removes duplication. Around 200–300 lines is a useful review prompt for a UI file that mixes concerns. Cohesive components and data registries can be longer. Avoid both a second monolith under `components/` and a chain of files that only pass props through.

The cleanup already provides a model. `HomeHero` composes the hero and coordinates the view. `hero/tileQueries.js` owns the tile loaders, `hero/faceLinks.js` owns click destinations, and Players tile faces are grouped by purpose under `playerFaces/`. Apply the same approach to a new section. For example, a new team directory can own its grid and loading state, reuse the existing teams hook, and keep a small sort beside the grid. Extract a separate team card if it has meaningful behavior or reuse.

## Give each section a small ownership map

For each section being added or replaced, record the source, the component that renders it, the places that use it, and its variants. This can be a small table in the revamp notes. Update it when a shared change affects a second surface.

| Example | Data and shared behavior | Variant ownership |
|---|---|---|
| Players tile | Existing payload, rotation and item identity determine which face is shown. The hero resolves the destination for that face. | Desktop and mobile render their own layouts from the same item. Photo fallback and team identity follow the same rules. |
| Games tile | Existing hub and collage sources supply game identity, results, preview status and editorial copy. | The hero owns tile placement. Games plates own the differences in content density and layout. |

Share the data rules and navigation across desktop, compact and phone where they have the same meaning. Use responsive props for spacing and type changes. Give a variant its own view when the hierarchy or interaction changes substantially. Check every consumer before changing a shared primitive. For example, adjust phone card spacing in the phone view and change the meaning of a score in the shared model.

## Preserve the data contracts

- Use the existing home tile fetch contracts and `src/data/teams.json` for local names, abbreviations, colors and logos. Read the existing hook and model before creating another lookup or requesting the same payload under a second query key.
- Let the published payload determine its editorial selection, ordering, ranks and copy. Keep transport fallbacks, prior-season data and lab fixtures distinguishable. Document what a section shows when a file is missing, empty or late. Keep the rest of the page usable when one section is unavailable.
- Use shared football context when a section needs a current season or week. Preserve query keys, cache behavior and link destinations through structural changes. If the design deliberately changes one of those, record the change in the handoff.
- Follow the repo’s `useEffect` ban. Use React Query for fetching, render-derived values for transformations, event handlers for interactions and `useMountEffect` for genuine one-time external sync.

## Build and review one section at a time

1. Trace `/` from `App.js` and list the live sections, shared dependencies and files you plan to touch. Check the working tree and cleanup inventory before editing. Coordinate shared-file changes with their active owner.
2. Prototype new components in `/lab/components` and review whole-page composition in `/lab/pages`. Use the repo’s lab registration rules and representative published fixtures, including loading, empty and failure examples where relevant.
3. Promote one section at a time using real props and existing hooks. If the revamp replaces an old section, trace its route, imports, re-exports and lab registrations before marking it for archive review. Record the review date, reviewer and usage in the cleanup inventory.
4. Run scoped lint and check the normal `/` route in the existing dev preview. Check desktop, compact and phone widths, tile and CTA destinations, rotation and reduced motion, keyboard focus, missing images, and missing data. Spot-check any other route that shares a changed primitive. The normal `npm run build` also syncs data, so use the repo’s frontend-only checks when validating code in isolation.
5. In the handoff, list the changed sections, which files own their data and rendering, any intentional behavior changes, archive candidates, and what was verified in the browser.

## Repo references

- Workspace rules, Component Lab workflow and encoding. [AGENTS.md](../../../../AGENTS.md)
- PageShell, page architecture, responsive density and lab verification. [Agent Design Bible](../../../../AgentDesignBible.md)
- Cleanup history and current review ownership. [Cleanup map](../../../../CLEANUP_MAP.md) · [Cleanup inventory](../../../../CLEANUP_INVENTORY.md)
- Published homepage tile contracts. [Stats](../../stats/md/Home%20Stats%20Tile%20Fetch%20Contract.md) · [Teams](../../teams/md/Home%20Teams%20Tile%20Fetch%20Contract.md) · [Players](../../players/md/Home%20Players%20Tile%20Fetch%20Contract.md)
