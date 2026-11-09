

export const DEFAULT_ACCENT = "#E53E3E";

export const SIDE_NAV_SKELETON_CSS = `
@keyframes sideNavSkeletonShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
/* Team block. Normal: logo (switcher beside it) over the full name and the
   conference · division line. Narrow sidebar: just the logo and switcher. */
.snv-team-head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas: "logo switch" "name name";
  row-gap: 0.6rem;
  column-gap: 0.75rem;
}
.snv-team-logo { grid-area: logo; }
.snv-team-name { grid-area: name; }
.snv-team-switch { grid-area: switch; justify-self: end; align-self: start; }
@container (max-width: 205px) {
  .snv-team-head { grid-template-areas: "logo switch"; }
  .snv-team-name { display: none; }
}
`;

export const NEUTRAL_ACCENT = "#2D3748";

export const venueInitials = (name) =>
  String(name ?? "")
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w) && !/^(at|of|the|and)$/i.test(w))
    .map((w) => w[0].toUpperCase())
    .join("")
    .slice(0, 3);
