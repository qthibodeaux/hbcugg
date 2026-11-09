// Shared export palette API, formerly hosted by WeekRecapExport.
// Keep these exact keys and CSS-variable names aligned with existing posters.


export const PALETTES = {
  light: { bg: "#E9E9EE", panel: "#F7F7F9", ink: "#111114", fg: "17,17,20", gold: "#3A5A40", orange: "#3A5A40", teal: "#0E7C86", up: "#15803D", down: "#DC2626", brand: "#7E22CE", shadow: 0.2 },
  night: { bg: "#0B0B0D", panel: "#141416", ink: "#FFFFFF", fg: "255,255,255", gold: "#5A9F68", orange: "#5A9F68", teal: "#22B3BE", up: "#68D391", down: "#FC8181", brand: "#A855F7", shadow: 0.7 },
};

export const paletteOf = (scheme) => PALETTES[scheme] ?? PALETTES.night;

export const posterVars = (scheme) => {
  const c = paletteOf(scheme);
  return {
    "--rc-bg": c.bg, "--rc-panel": c.panel, "--rc-ink": c.ink, "--rc-fg": c.fg, "--rc-gold": c.gold, "--rc-teal": c.teal,
    "--rc-up": c.up, "--rc-down": c.down, "--rc-brand": c.brand, "--rc-shadow": c.shadow,
  };
};
