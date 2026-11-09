import { SWAC, MEAC } from "../../../../data/wiki_data";
import { BadgeCheck, Users, MapPin, Trophy, Shield } from "lucide-react";

export const CHAMPIONS = {
  MEAC: { year: "2025", name: "South Carolina State", logo: "/assets/meacscsu.svg" },
  SWAC: { year: "2025", name: "Prairie View A&M", logo: "/assets/swacpvamu.svg" },
};

export const CONFERENCE_FACTS = {
  MEAC: {
    programs: "6",
    bowlWins: "6",
    format: "Single Table",
    titlePath: "Regular Season",
    commissioner: "Sonja Stills",
    postseason: "Celebration Bowl",
  },
  SWAC: {
    programs: "12",
    bowlWins: "4",
    format: "East / West",
    titlePath: "Title Game",
    commissioner: "Dr. McClelland",
    postseason: "Celebration Bowl",
  },
};

export const CONFERENCES = [SWAC, MEAC];

export const COMPACT_FACTS = {
  MEAC: [
    ["Est.", "1969", BadgeCheck],
    ["Programs", "6", Users],
    ["HQ", "Norfolk", MapPin],
    ["Bowl Wins", "6", Trophy],
    ["Commish", "Stills", Shield],
    ["Postseason", "Celebration", Trophy],
  ],
  SWAC: [
    ["Est.", "1920", BadgeCheck],
    ["Programs", "12", Users],
    ["HQ", "B'ham", MapPin],
    ["Bowl Wins", "4", Trophy],
    ["Commish", "McClelland", Shield],
    ["Postseason", "Celebration", Trophy],
  ],
};

const TEAM_ABBREVIATIONS = {
  "Alcorn State": "Alcorn",
  "Grambling State": "GSU",
  Howard: "Howard",
  "Jackson State": "JSU",
  "Morgan State": "MSU",
  "N.C. Central": "NCCU",
  "Prairie View A&M": "PVAMU",
  "S.C. State": "SCSU",
  Southern: "SU",
  "South Carolina State": "SCSU",
};

export const compactTeamName = (name) => TEAM_ABBREVIATIONS[name] || name;

export const CAROUSEL_CONFS = [SWAC, MEAC];

export const AUTO_ADVANCE_MS = 5000;

export const FLIP_MS = 700;
