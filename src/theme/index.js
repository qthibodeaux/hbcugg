import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50:  { value: "#FAF5FF" },
          100: { value: "#F3E8FF" },
          200: { value: "#E9D5FF" },
          300: { value: "#D8B4FE" },
          400: { value: "#C084FC" },
          500: { value: "#A855F7" },
          600: { value: "#9333EA" },
          700: { value: "#7E22CE" },
          800: { value: "#6B21A8" },
          900: { value: "#581C87" },
        },
        // Light / Night — values live in src/theme/palette.css and swap with
        // data-theme on <html>. Anything on these tokens flips on its own.
        bg: {
          primary:   { value: "var(--gg-bg-primary)" },
          secondary: { value: "var(--gg-bg-secondary)" },
          card:      { value: "var(--gg-bg-card)" },
          raised:    { value: "var(--gg-bg-raised)" },
        },
        text: {
          primary:   { value: "var(--gg-text-primary)" },
          secondary: { value: "var(--gg-text-secondary)" },
          muted:     { value: "var(--gg-text-muted)" },
          ink:       { value: "var(--gg-ink)" },
        },
        line: {
          subtle: { value: "var(--gg-line-subtle)" },
          DEFAULT: { value: "var(--gg-line)" },
          strong: { value: "var(--gg-line-strong)" },
          hover:  { value: "var(--gg-hover)" },
          track:  { value: "var(--gg-track)" },
        },
      },
      fonts: {
        heading: { value: "Inter, system-ui, sans-serif" },
        body:    { value: "Inter, system-ui, sans-serif" },
      },
    },

    semanticTokens: {
      colors: {
        "chakra-body-bg":   { value: "{colors.bg.primary}" },
        "chakra-body-text": { value: "{colors.text.primary}" },
      },
    },

    // ── Text Styles ───────────────────────────────────────────────────────────
    // Usage: <Text textStyle="kicker" color="text.muted">LABEL</Text>
    // Do not override fontWeight / letterSpacing inline — use the style as-is.
    // For clamp() font sizes, Chakra passes the value through as raw CSS.
    textStyles: {

      // Full-bleed banner headline — large italic block title
      // Use: banner h1, page hero headline
      bannerHeadline: {
        value: {
          fontWeight: "900",
          fontStyle:  "italic",
          textTransform: "uppercase",
          letterSpacing: "-0.04em",
          lineHeight: "0.92",
          fontSize: "clamp(2rem, 5.5vw, 6rem)",
        },
      },

      // Background watermark word — huge ghost text, always opacity 0.05
      // Use: <Text textStyle="bannerGhost" opacity={0.05} position="absolute">GLORY</Text>
      bannerGhost: {
        value: {
          fontWeight: "900",
          fontStyle:  "italic",
          textTransform: "uppercase",
          letterSpacing: "-0.05em",
          lineHeight: "1",
          fontSize: "clamp(80px, 16vw, 180px)",
        },
      },

      // Hero stat number — the single biggest number on a card
      // Use: score, record, top KPI value
      heroStat: {
        value: {
          fontWeight: "900",
          fontStyle:  "italic",
          letterSpacing: "-0.03em",
          lineHeight: "1",
          fontSize: "clamp(2rem, 4vw, 4rem)",
        },
      },

      // Section / card kicker — tiny all-caps label above a title
      // Use: "SPOTLIGHT", "WEEK 9", "SWAC WEST"
      kicker: {
        value: {
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          lineHeight: "1",
          fontSize: "9px",
        },
      },

      // Panel label — slightly larger than kicker, used in banner right panels
      // Use: year label, control panel headings
      panelLabel: {
        value: {
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "0.22em",
          lineHeight: "1",
          fontSize: "8px",
        },
      },

      // Editorial / ticker subtext — the line under the banner headline
      // Use: responsive, stays small even on large screens
      editorial: {
        value: {
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          lineHeight: "1",
          fontSize: "clamp(7px, 0.9vw, 9px)",
        },
      },

      // Card title — primary label inside a card or slot
      // Use: "Game of the Week", "SWAC West Top 3"
      cardTitle: {
        value: {
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          lineHeight: "1.1",
          fontSize: "11px",
        },
      },

      // Stat label — small value descriptor beneath a hero stat
      // Use: "OVERALL", "CONF RECORD", "HOME"
      statLabel: {
        value: {
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          lineHeight: "1",
          fontSize: "9px",
        },
      },

      // Body secondary — readable prose, descriptions, detail lines
      // Use: game detail text, card descriptions
      bodySecondary: {
        value: {
          fontWeight: "400",
          letterSpacing: "0",
          lineHeight: "1.5",
          fontSize: "12px",
        },
      },

      // Pill / button label — inside filter pills, small buttons, tags
      // Use: "CONF", "BOWL", "GO", season pills
      pill: {
        value: {
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          lineHeight: "1",
          fontSize: "9px",
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
