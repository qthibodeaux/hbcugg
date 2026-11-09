import { SWAC, MEAC } from "../../../../data/wiki_data";
import teamsData from "../../../../data/teams.json";

export const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export const STATE_IDS = {
  Alabama: "01",
  Arkansas: "05",
  Delaware: "10",
  "D.C.": "11",
  Florida: "12",
  Louisiana: "22",
  Maryland: "24",
  Mississippi: "28",
  "North Carolina": "37",
  "South Carolina": "45",
  Texas: "48",
  Virginia: "51",
};

const STATE_NAME_ALIASES = {
  "District of Columbia": "D.C.",
};

export const CITY_COORDS = {
  Lorman: [-91.0501, 31.8204],
  Normal: [-86.5686, 34.7834],
  Jackson: [-90.1848, 32.2988],
  Birmingham: [-86.8025, 33.5186],
  "New Orleans": [-90.0715, 29.9511],
  Houston: [-95.3698, 29.7604],
  "Baton Rouge": [-91.1871, 30.4515],
  "Little Rock": [-92.2896, 34.7465],
  "Daytona Beach": [-81.0228, 29.2108],
  Tallahassee: [-84.2807, 30.4383],
  Montgomery: [-86.3, 32.3668],
  "Itta Bena": [-90.3198, 33.4951],
  "Prairie View": [-95.9877, 30.0933],
  "Pine Bluff": [-92.0032, 34.2284],
  Grambling: [-92.714, 32.5277],
  Washington: [-77.0369, 38.9072],
  "Washington D.C.": [-77.0369, 38.9072],
  Baltimore: [-76.6122, 39.2904],
  Norfolk: [-76.2859, 36.8508],
  Richmond: [-77.436, 37.5407],
  Durham: [-78.8986, 35.994],
  Orangeburg: [-80.8556, 33.4918],
  Dover: [-75.5244, 39.1582],
  Raleigh: [-78.6382, 35.7796],
};

export const CONFERENCES = [SWAC, MEAC];

export const REGION_IDS = new Set(Object.values(STATE_IDS));

export const SCHOOL_MARKERS = teamsData.teams.map((team) => ({
  id: team.id,
  shortName: team.shortName,
  conference: team.conference,
  primary: team.colors.primary,
  secondary: team.colors.secondary,
  coordinates: CITY_COORDS[team.city] || [-86.5, 34.1],
}));

export const STATE_ABBREVIATIONS = {
  Alabama: "AL",
  Arkansas: "AR",
  Delaware: "DE",
  "D.C.": "DC",
  Florida: "FL",
  Louisiana: "LA",
  Maryland: "MD",
  Mississippi: "MS",
  "North Carolina": "NC",
  "South Carolina": "SC",
  Texas: "TX",
  Virginia: "VA",
};

export const STATE_LIST = CONFERENCES.flatMap((conf) =>
  conf.states.map((name) => ({
    name,
    abbr: STATE_ABBREVIATIONS[name] || name,
    stateId: STATE_IDS[name],
    conf,
  })),
);

export const SCHOOLS_BY_STATE_ABBR = teamsData.teams.reduce((acc, team) => {
  const key = team.state;
  if (!acc[key]) acc[key] = [];
  acc[key].push(team);
  return acc;
}, {});

export const averageCoords = (coordsList) => {
  if (!coordsList.length) return [-86.5, 34.1];
  const sum = coordsList.reduce((acc, [lon, lat]) => [acc[0] + lon, acc[1] + lat], [0, 0]);
  return [sum[0] / coordsList.length, sum[1] / coordsList.length];
};

export const stateConference = (geo, conferenceStateIds) => {
  const geoId = String(geo.id).padStart(2, "0");
  const geoName = STATE_NAME_ALIASES[geo.properties?.name] || geo.properties?.name;

  return CONFERENCES.find((conf) => {
    const ids = conferenceStateIds[conf.key];
    return ids.has(geoId) || conf.states.includes(geoName);
  });
};

export const DEFAULT_STATE_MAP_SCALE = 5500;

export const STATE_MAP_SCALE_OVERRIDES = {
  DE: 16000,
  DC: 55000,
};
