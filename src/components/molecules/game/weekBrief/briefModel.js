import teamsData from "../../../../data/teams.json";
import { cleanName } from "../../../../utils/gameHelpers";
import { resolveImage, resolveImages, buildIdentityIndex, buildPerformers, buildTeamStatRows } from "../WeekCentralBriefBlocks";

export const DEFAULT_IMAGE = "/stadiums/Louis%20Crews%20Stadium.jpg";

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  const id = team.exportId.replace(/25$/, "");
  acc[id] = team;
  acc[team.exportId] = team;
  return acc;
}, {});

const normalizeTeamKey = (value) => String(value ?? "").replace(/25$/, "");

const teamMeta = (id) => TEAM_BY_ID[normalizeTeamKey(id)] ?? null;

const teamShort = (id, fallback = "TBD") => teamMeta(id)?.bannerShort ?? teamMeta(id)?.shortName ?? fallback;

const teamName = (id, fallback = "TBD") => teamMeta(id)?.name ?? fallback;

const teamLogo = (id) => teamMeta(id)?.logo ?? (id ? `/assets/${normalizeTeamKey(id)}.svg` : null);

const teamColor = (id, fallback = "#69B3E7") => teamMeta(id)?.colors?.primary ?? fallback;

const teamAccent = (id, fallback = "#FFFFFF") => teamMeta(id)?.colors?.accent ?? teamMeta(id)?.colors?.secondary ?? fallback;

const teamSecondary = (id, fallback = "#FFFFFF") => teamMeta(id)?.colors?.secondary ?? teamMeta(id)?.colors?.accent ?? fallback;

export const displayValue = (value) => (value == null || Number.isNaN(value) ? "-" : value);

export const displayText = (value, fallback = "TBD") => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

export const getLastName = (name) => {
  const value = String(name ?? "").trim();
  if (!value) return "-";
  if (value.includes(",")) return value.split(",")[0].trim();
  const parts = value.split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? value;
};

const getScore = (side, scheduleScore) => {
  const parsedScore = side?.score;
  if (Number.isFinite(Number(parsedScore))) return Number(parsedScore);
  if (Number.isFinite(Number(scheduleScore))) return Number(scheduleScore);
  return null;
};

export const buildTeams = (selectedGame, parsedGame) => {
  const parsedAway = parsedGame?.metadata?.away_team;
  const parsedHome = parsedGame?.metadata?.home_team;
  const awayId = normalizeTeamKey(parsedAway?.id ?? selectedGame?.awayId);
  const homeId = normalizeTeamKey(parsedHome?.id ?? selectedGame?.homeId);
  const awayFallback = selectedGame?.awayText ?? parsedAway?.name ?? "Away";
  const homeFallback = selectedGame?.homeText ?? parsedHome?.name ?? "Home";

  return {
    away: {
      id: awayId,
      shortName: teamShort(awayId, selectedGame?.awayText ?? awayFallback),
      name: teamName(awayId, awayFallback),
      score: getScore(parsedAway, selectedGame?.awayScore),
      logo: teamLogo(awayId),
      color: teamColor(awayId, "#E53E3E"),
      accent: teamAccent(awayId, "#FFFFFF"),
      secondary: teamSecondary(awayId, "#FFFFFF"),
    },
    home: {
      id: homeId,
      shortName: teamShort(homeId, selectedGame?.homeText ?? homeFallback),
      name: teamName(homeId, homeFallback),
      score: getScore(parsedHome, selectedGame?.homeScore),
      logo: teamLogo(homeId),
      color: teamColor(homeId, "#69B3E7"),
      accent: teamAccent(homeId, "#FFFFFF"),
      secondary: teamSecondary(homeId, "#FFFFFF"),
    },
  };
};

const topOf = (rows = [], field) => {
  const arr = Array.isArray(rows) ? rows : [];
  return [...arr].sort((a, b) => Number(b?.[field] ?? 0) - Number(a?.[field] ?? 0))[0] ?? null;
};

const byTeam = (parsedGame, teamId, group) => {
  const stats = parsedGame?.individual_stats?.[teamId]?.[group];
  return Array.isArray(stats) ? stats : [];
};

const havocScore = (player) =>
  Number(player?.tfl ?? 0) +
  Number(player?.sacks ?? 0) +
  Number(player?.passes_defended ?? 0) +
  Number(player?.interceptions ?? 0) +
  Number(player?.forced_fumbles ?? 0);

const playerCard = (player, statValue, detail, identity, teamId) => player ? ({
  playerKey: player.player_key,
  name: cleanName(player.name),
  position: player.position,
  statValue,
  detail,
  image: resolveImage(identity, player, teamId),
  images: resolveImages(identity, player, teamId),
}) : null;

const LEADER_LABELS = ["Passing Yards", "Rushing Yards", "Receiving Yards", "Havoc Leader", "Tackles"];

const buildLeaders = (parsedGame, awayId, homeId, identity) => {
  if (!parsedGame) return LEADER_LABELS.map((label) => ({ label, away: null, home: null }));

  const awayPasser = topOf(byTeam(parsedGame, awayId, "passing"), "yards");
  const homePasser = topOf(byTeam(parsedGame, homeId, "passing"), "yards");
  const awayRusher = topOf(byTeam(parsedGame, awayId, "rushing"), "yards");
  const homeRusher = topOf(byTeam(parsedGame, homeId, "rushing"), "yards");
  const awayReceiver = topOf(byTeam(parsedGame, awayId, "receiving"), "yards");
  const homeReceiver = topOf(byTeam(parsedGame, homeId, "receiving"), "yards");
  const awayHavoc = [...byTeam(parsedGame, awayId, "defense")].sort((a, b) => havocScore(b) - havocScore(a))[0];
  const homeHavoc = [...byTeam(parsedGame, homeId, "defense")].sort((a, b) => havocScore(b) - havocScore(a))[0];
  const awayTackler = topOf(byTeam(parsedGame, awayId, "defense"), "tackles");
  const homeTackler = topOf(byTeam(parsedGame, homeId, "defense"), "tackles");

  return [
    {
      label: "Passing Yards",
      away: playerCard(awayPasser, displayValue(awayPasser?.yards), `${awayPasser?.completions ?? 0}/${awayPasser?.attempts ?? 0}, ${awayPasser?.touchdowns ?? 0} TD`, identity, awayId),
      home: playerCard(homePasser, displayValue(homePasser?.yards), `${homePasser?.completions ?? 0}/${homePasser?.attempts ?? 0}, ${homePasser?.touchdowns ?? 0} TD`, identity, homeId),
    },
    {
      label: "Rushing Yards",
      away: playerCard(awayRusher, displayValue(awayRusher?.yards), `${awayRusher?.attempts ?? 0} car, ${awayRusher?.touchdowns ?? 0} TD`, identity, awayId),
      home: playerCard(homeRusher, displayValue(homeRusher?.yards), `${homeRusher?.attempts ?? 0} car, ${homeRusher?.touchdowns ?? 0} TD`, identity, homeId),
    },
    {
      label: "Receiving Yards",
      away: playerCard(awayReceiver, displayValue(awayReceiver?.yards), `${awayReceiver?.receptions ?? 0} rec, ${awayReceiver?.touchdowns ?? 0} TD`, identity, awayId),
      home: playerCard(homeReceiver, displayValue(homeReceiver?.yards), `${homeReceiver?.receptions ?? 0} rec, ${homeReceiver?.touchdowns ?? 0} TD`, identity, homeId),
    },
    {
      label: "Havoc Leader",
      away: playerCard(awayHavoc, displayValue(awayHavoc ? havocScore(awayHavoc) : null), `${awayHavoc?.tfl ?? 0} TFL, ${awayHavoc?.sacks ?? 0} SK, ${awayHavoc?.passes_defended ?? 0} PD`, identity, awayId),
      home: playerCard(homeHavoc, displayValue(homeHavoc ? havocScore(homeHavoc) : null), `${homeHavoc?.tfl ?? 0} TFL, ${homeHavoc?.sacks ?? 0} SK, ${homeHavoc?.passes_defended ?? 0} PD`, identity, homeId),
    },
    {
      label: "Tackles",
      away: playerCard(awayTackler, displayValue(awayTackler?.tackles), `${awayTackler?.solo_tackles ?? 0} solo, ${awayTackler?.tfl ?? 0} TFL`, identity, awayId),
      home: playerCard(homeTackler, displayValue(homeTackler?.tackles), `${homeTackler?.solo_tackles ?? 0} solo, ${homeTackler?.tfl ?? 0} TFL`, identity, homeId),
    },
  ];
};

const buildLineScore = (parsedGame) => {
  const sbq = parsedGame?.score_by_quarter;
  if (!sbq || !Array.isArray(sbq.labels)) return [];
  return sbq.labels.map((label, index) => ({
    period: String(label).replace(/^Q/, ""),
    away: sbq.away?.[index] ?? null,
    home: sbq.home?.[index] ?? null,
  }));
};

export const buildBriefData = ({ selectedGame, parsedGame, playerSeasons, priorPlayerSeasons, leagueAvg }) => {
  const { away, home } = buildTeams(selectedGame, parsedGame);
  const identity = parsedGame ? buildIdentityIndex(playerSeasons, priorPlayerSeasons) : null;

  return {
    label: selectedGame?.status === "final" ? "Weekly Brief" : "Schedule File",
    tag: selectedGame?.tag ?? "Game",
    away,
    home,
    lineScore: buildLineScore(parsedGame),
    performers: buildPerformers(parsedGame, identity),
    teamStats: buildTeamStatRows(parsedGame, away.id, home.id, leagueAvg),
    leaders: buildLeaders(parsedGame, away.id, home.id, identity),
    hasParsedData: !!parsedGame,
  };
};

export const formatKickoff = (value) => {
  if (!value) return "Time TBD";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return String(value);
};

export const getRecord = (raw, side) => {
  const keys = side === "away"
    ? ["away_record", "away_overall_record", "away_conference_record", "away_conf_record", "team_record"]
    : ["home_record", "home_overall_record", "home_conference_record", "home_conf_record", "opponent_record"];
  const value = keys.map((key) => raw?.[key]).find((item) => String(item ?? "").trim());
  return displayText(value, "Record TBD");
};
