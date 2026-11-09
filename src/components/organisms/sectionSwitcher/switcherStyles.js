// Mobile section-switcher hint timing, keyframes and team-grid skeleton animation.

export const PEEK_DELAY_MS = 900;

export const PEEK_DURATION_MS = 1600;

export const PEEK_CSS = `
  @keyframes sectionSwitcherPeek {
    0%   { opacity: 0; transform: scale(0.4); background-color: #FFFFFF; color: #18181B; }
    22%  { opacity: 1; transform: scale(1.3); background-color: #FFFFFF; color: #18181B; }
    50%  { opacity: 1; transform: scale(1.05); background-color: var(--peek-accent); color: #FFFFFF; }
    78%  { opacity: 1; transform: scale(1); background-color: var(--peek-accent); color: #FFFFFF; }
    100% { opacity: 0; transform: scale(0); background-color: var(--peek-accent); color: #FFFFFF; }
  }
  @keyframes sectionSwitcherChevronBounce {
    0%, 100% { transform: translateY(0); }
    20% { transform: translateY(2px); }
    40% { transform: translateY(-3px); }
    60% { transform: translateY(1px); }
    80% { transform: translateY(-1px); }
  }
`;

export const GRID_SKELETON_CSS = `
@keyframes teamGridSkeletonShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;
