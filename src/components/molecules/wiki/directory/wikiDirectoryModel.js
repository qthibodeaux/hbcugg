// Wiki directory uses school metadata; the Schools directory has its own
// current-player/coaching feed. Similar animation does not imply identical data.
import teamsData from "../../../../data/teams.json";

export const teams = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

export const FRAMES = ["abbrev", "fullName", "logo", "player", "logoBig"];

export const ENTER_ANIM = {
  abbrev: "fusionFromRight",
  fullName: "fusionFadeScale",
  logo: "fusionFromTop",
  player: "fusionFromBottom",
  logoBig: "fusionFadeScale",
};

export const EXIT_ANIM = {
  abbrev: "fusionToLeft",
  fullName: "fusionFadeScaleOut",
  logo: "fusionToBottom",
  player: "fusionToTop",
  logoBig: "fusionFadeScaleOut",
};

export const EXIT_DURATION = 350;

export const KEN_BURNS_DURATION = 8000;

export const COLOR_TREATMENTS = [
  () => ({ filter: "none", opacity: 0.9 }),
  () => ({ filter: "saturate(1.8) contrast(1.1)", opacity: 0.85 }),
  () => ({ filter: "brightness(2) saturate(0)", opacity: 0.15 }),
  () => ({ filter: "grayscale(0.6) sepia(0.4) saturate(1.4)", opacity: 0.75 }),
  () => ({ filter: "contrast(1.6) saturate(1.3)", opacity: 0.8 }),
];

export const STATIC_CSS = `
  @keyframes fusionFromRight    { from { opacity:0; transform:translateX(28px);  } to { opacity:1; transform:translateX(0);  } }
  @keyframes fusionToLeft       { from { opacity:1; transform:translateX(0);     } to { opacity:0; transform:translateX(-20px); } }
  @keyframes fusionFadeScale    { from { opacity:0; transform:scale(0.94);       } to { opacity:1; transform:scale(1);       } }
  @keyframes fusionFadeScaleOut { from { opacity:1; transform:scale(1);          } to { opacity:0; transform:scale(0.94);   } }
  @keyframes fusionFromTop      { from { opacity:0; transform:translateY(-22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fusionToBottom     { from { opacity:1; transform:translateY(0);     } to { opacity:0; transform:translateY(16px);  } }
  @keyframes fusionFromBottom   { from { opacity:0; transform:translateY(22px);  } to { opacity:1; transform:translateY(0); } }
  @keyframes fusionToTop        { from { opacity:1; transform:translateY(0);     } to { opacity:0; transform:translateY(-16px); } }
  @keyframes kenBurns {
    0%   { transform: scale(1.34) translate(-5%, -5%) rotate(-3deg); }
    100% { transform: scale(1.52) translate(5%, 5%) rotate(3deg); }
  }
`;

export const compactLabel = (team) => team.bannerShort || team.shortName || team.name;
