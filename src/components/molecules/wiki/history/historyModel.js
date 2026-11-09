// Shared history/rivalry lookup and timeline geometry. Existing dwell ranges and
// first-year/range parsing are preserved for desktop and mobile presentations.
import teamsData from "../../../../data/teams.json";
import { TITLE_PATH_BUCKETS } from "../../../../data/wiki_data";

const TEAMS = teamsData.teams;

const TEAM_BY_ID = Object.fromEntries(TEAMS.map((team) => [team.id, team]));

export const getTeamLabel = (team) => team?.bannerShort ?? team?.shortName ?? team?.name ?? "TBD";

export const resolveRivalryTeams = (rivalry) => ({
  ...rivalry,
  a: TEAM_BY_ID[rivalry.teamA],
  b: TEAM_BY_ID[rivalry.teamB],
});

export const readableTextColor = (hexColor) => {
  const hex = hexColor?.replace("#", "");
  if (!hex || hex.length < 6) return "#FFFFFF";

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.58 ? "#070708" : "#FFFFFF";
};

export const RIVALRY_TILE_COUNT = 8;

export const MOBILE_RIVALRY_TILE_COUNT = 6;

const RIVALRY_MIN_DWELL_MS = 7000;

const RIVALRY_MAX_DWELL_MS = 25000;

export const randomRivalryDwell = () =>
  RIVALRY_MIN_DWELL_MS + Math.floor(Math.random() * (RIVALRY_MAX_DWELL_MS - RIVALRY_MIN_DWELL_MS + 1));

export const createInitialRivalryTiles = (count) =>
  Array.from({ length: count }, (_, slot) => ({
    slot,
    rivalryIndex: slot,
    version: 0,
  }));

const TIMELINE_MIN_DWELL_MS = 7000;

const TIMELINE_MAX_DWELL_MS = 25000;

const parseRangeYears = (range) => {
  const match = String(range).match(/(\d{4}).*?(\d{4})/);
  return match ? [Number(match[1]), Number(match[2])] : [null, null];
};

export const parseFirstYear = (yearLike) => {
  const match = String(yearLike).match(/\d{4}/);
  return match ? Number(match[0]) : null;
};

const TITLE_PATH_YEAR_BOUNDS = TITLE_PATH_BUCKETS.reduce(
  (bounds, bucket) => {
    const [start, end] = parseRangeYears(bucket.range);
    return {
      min: Math.min(bounds.min, start),
      max: Math.max(bounds.max, end),
    };
  },
  { min: Infinity, max: -Infinity },
);

export const eventTimelinePosition = (yearLike) => {
  const year = parseFirstYear(yearLike);
  const { min, max } = TITLE_PATH_YEAR_BOUNDS;
  if (year == null || max === min) return 50;
  return ((year - min) / (max - min)) * 100;
};

export const TITLE_PATH_SEGMENTS = TITLE_PATH_BUCKETS.map((bucket, index) => {
  const [start] = parseRangeYears(bucket.range);
  const left = eventTimelinePosition(String(start));
  const nextBucket = TITLE_PATH_BUCKETS[index + 1];
  const right = nextBucket ? eventTimelinePosition(String(parseRangeYears(nextBucket.range)[0])) : 100;
  return { id: bucket.id, tone: bucket.tone, left, width: right - left };
});

export const randomTimelineDwell = () =>
  TIMELINE_MIN_DWELL_MS + Math.floor(Math.random() * (TIMELINE_MAX_DWELL_MS - TIMELINE_MIN_DWELL_MS + 1));

export const ALL_TIMELINE_EVENTS = TITLE_PATH_BUCKETS.flatMap((bucket) =>
  bucket.events.map((event) => ({ ...event, bucketId: bucket.id, bucketTitle: bucket.title, bucketRange: bucket.range })),
);
