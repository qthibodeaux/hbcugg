import teamsData from "../../../../data/teams.json";

export const teams = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

export const v5Id = (team) => team.exportId?.replace(/25$/, "") ?? null;

export const FRAMES = ["abbrev", "fullName", "shortName", "logo", "logoCenter", "logoCollage", "player", "playerBig", "coach", "logoBig"];

export const LOGO_FILL_FRAMES = new Set(["logoBig", "logoCenter", "logoCollage"]);

export const ENTER_ANIM = {
  abbrev: "fusionFromRight",
  fullName: "fusionFadeScale",
  shortName: "fusionFromBottom",
  logo: "fusionFromTop",
  logoCenter: "fusionFadeScale",
  logoCollage: "fusionFadeScale",
  player: "fusionFromBottom",
  playerBig: "fusionFadeScale",
  coach: "fusionFromRight",
  logoBig: "fusionFadeScale",
};

export const EXIT_ANIM = {
  abbrev: "fusionToLeft",
  fullName: "fusionFadeScaleOut",
  shortName: "fusionToTop",
  logo: "fusionToBottom",
  logoCenter: "fusionFadeScaleOut",
  logoCollage: "fusionFadeScaleOut",
  player: "fusionToTop",
  playerBig: "fusionFadeScaleOut",
  coach: "fusionToLeft",
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
  /* Faces get their own drift: no rotation, and it starts at 1 so the portrait
     is never cropped tighter than the frame already crops it. */
  @keyframes kenBurnsFace {
    0%   { transform: scale(1.00) translate(-2.5%, -1.5%); }
    100% { transform: scale(1.09) translate(2.5%, 1.5%); }
  }
`;

export const compactLabel = (team) => team.bannerShort || team.shortName || team.name;

export const routeFor = (team, target) => {
  if (typeof target === "function") return target(team);
  if (target === "wiki") return `/teams/${team.id}/wiki`;
  return `/teams/${team.id}`;
};

export const withPhoto = (people) => (people ?? []).filter((p) => p?.image_url);

export const pickRandomPlayer = (topPlayers) => {
  const pool = withPhoto(topPlayers);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
};
