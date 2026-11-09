

// Net-success-rate labels and team bar colors. Dark chromatic primaries keep their hue.

export const OVERSTATED = "#F6AD55";

export const net = (v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(3)}`;

const hexToRgb = (hex) => {
  const h = String(hex ?? "").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) };
};

const rgbToHsl = ({ r, g, b }) => {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === R ? ((G - B) / d + (G < B ? 6 : 0))
      : max === G ? (B - R) / d + 2
        : (R - G) / d + 4;
  return { h: h / 6, s, l };
};

const hslToHex = ({ h, s, l }) => {
  const f = (n) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(v * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const MIN_L = 0.34;

export const barColor = (primary, secondary) => {
  const rgb = hexToRgb(primary);
  if (!rgb) return "#6B7280";
  const hsl = rgbToHsl(rgb);
  if (hsl.l >= MIN_L) return primary;

  // Achromatic and dark — the primary carries no hue to preserve, so use the
  // school's secondary when it has one bright enough to read.
  if (hsl.s < 0.12) {
    const alt = hexToRgb(secondary);
    if (alt) {
      const altHsl = rgbToHsl(alt);
      if (altHsl.l >= 0.3 && altHsl.s >= 0.2) return secondary;
    }
    return "#8A8A8F";
  }

  return hslToHex({ ...hsl, l: MIN_L });
};
