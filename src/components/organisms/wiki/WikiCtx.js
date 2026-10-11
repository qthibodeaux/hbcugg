import React from 'react';

// ─── BLUEPRINT FALLBACK ───────────────────────────────────────────────────────
// This is the fallback used when live data is unavailable or still loading.
const wikiDataFallback = {
  id: "pending",
  name: "[[SCHOOL_NAME_PENDING]]",
  shortName: "[[SHORT_NAME_PENDING]]",
  bannerShort: "[[BANNER_PENDING]]",
  mascot: "[[MASCOT_PENDING]]",
  motto: "[[MOTTO_PENDING]]",
  founded: null,
  enrollment: null,
  conference: "SWAC",
  division: "[[DIV_PENDING]]",
  athleticDirector: "[[AD_PENDING]]",
  website: "#",
  colors: { primary: "#111111", secondary: "#333333", accent: "#FFFFFF" },
  colorsDescription: "[[COLORS_DESCRIPTION_PENDING]]",
  logo: "/assets/placeholder.svg",
  location: {
    city: "[[CITY_PENDING]]", state: "[[STATE_PENDING]]",
    campusNickname: "[[NICKNAME_PENDING]]",
    campusType: "[[TYPE_PENDING]]",
    landmarkSpots: [],
  },
  stadium: {
    name: "[[STADIUM_PENDING]]",
    capacity: null,
    surface: "[[SURFACE_PENDING]]",
    built: null,
    recordAttendance: null,
    notableFeature: "[[FEATURE_PENDING]]",
    photo: null,
  },
  marching_band: {
    bandName: "[[BAND_NAME_PENDING]]",
    bandNickname: "[[BAND_NICKNAME_PENDING]]",
    founded: null,
    size: null,
    signatureSelection: "[[SIGNATURE_PENDING]]",
    danceTeamName: "[[DANCE_TEAM_PENDING]]",
    flagLineName: "[[FLAG_LINE_PENDING]]",
    drumMajorStyle: "[[STYLE_PENDING]]",
    specialEntrance: "[[ENTRANCE_PENDING]]",
    philosophy: "[[PHILOSOPHY_PENDING]]",
    tracks: [],
  },
  gameday: {
    traditionTitle: "[[TRADITION_PENDING]]",
    teamWalk: {
      name: "[[WALK_PENDING]]",
      description: "[[WALK_DESC_PENDING]]",
    },
    tailgateCulture: {
      name: "[[TAILGATE_PENDING]]",
      description: "[[TAILGATE_DESC_PENDING]]",
      signatureFood: "[[FOOD_PENDING]]",
    },
    signatureChants: [],
    fightSong: "[[FIGHT_SONG_PENDING]]",
  },
  athletics: {
    conferenceChampionships: [],
    nationalChampionships: [],
    nflDraftPicks: null,
    hallOfFamers: [],
    retiredNumbers: [],
    rivalries: [],
  },
  history: {
    briefHistory: "[[BRIEF_HISTORY_PENDING]]",
    famousFirsts: [],
    historicMilestones: [],
    notableAlumni: [],
    funFacts: [],
  },
  social: {
    teamHandles: {
      instagram: { handle: "@pending", followers: null },
      twitter: { handle: "@pending", followers: null },
      facebook: { handle: "pending", followers: null },
      tiktok: { handle: null, followers: null },
      youtube: { handle: null, followers: null },
    },
    influencers: {
      instagram: [],
      twitter: [],
      facebook: [],
      tiktok: [],
      youtube: []
    }
  },
  alumniRoster: [],
};

const WikiCtx = React.createContext(wikiDataFallback);

export { WikiCtx, wikiDataFallback };

