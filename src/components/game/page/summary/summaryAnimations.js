
// Existing implementation extracted from GameSummaryTabV2.

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════
export const ANIMATION_STYLES = `
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(1.5rem); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes growBar {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  @keyframes drawLine {
    from { stroke-dashoffset: 2000; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes rotateTick {
    0%, 100% { opacity: 1; }
  }
  @keyframes scoreTick {
    from { opacity: 0; transform: translateY(-0.4em); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .score-tick {
    animation: scoreTick 0.34s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @media (prefers-reduced-motion: reduce) {
    .score-tick { animation: none !important; }
  }
  @keyframes rotateSweep {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  .rotate-sweep {
    transform-origin: left center;
    transform: scaleX(0);
  }
  /* A bar crossing the screen on a loop is exactly what this setting is for — the
     rotation still runs, it just stops advertising how long is left. */
  @media (prefers-reduced-motion: reduce) {
    .rotate-sweep { animation: none !important; opacity: 0; }
  }
  .animate-slide-in {
    animation: slideInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }
  .animate-bar {
    animation: growBar 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
    transform-origin: left center;
    transform: scaleX(0);
  }
  .animate-draw {
    stroke-dasharray: 2000;
    stroke-dashoffset: 2000;
    animation: drawLine 2.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
  }
  .animate-fade {
    animation: fadeIn 0.8s ease-out forwards;
    opacity: 0;
  }
`;
