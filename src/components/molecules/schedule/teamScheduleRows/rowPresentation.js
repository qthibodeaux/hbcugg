

// Shared schedule date, week, matchup, tag and venue display rules.

export const fmtDateParts = (value) => {
  if (!value) return { month: "TBD", day: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const [month, day] = String(value).split(/\s+/);
    return { month: month ?? "TBD", day: day ?? "" };
  }
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }),
    day: date.toLocaleDateString("en-US", { day: "numeric" }),
  };
};

const getWeekFromStem = (stem) => {
  const match = String(stem ?? "").match(/^W(\d+)/i);
  return match ? Number(match[1]) : null;
};

export const getWeekFromGame = (game) => {
  if (game.week) return Number(game.week);
  return getWeekFromStem(game.parsed_game_stem);
};

export const getGameLabel = (game, opponent) => {
  const raw = game.game_name ?? game.event_name ?? game.classic_name ?? game.stage_label ?? "";
  if (raw) return raw;
  if (game.bowl_game) return "Bowl Game";
  if (game.conf_game) return game.home_away === "away" ? "Road Conference" : "Conference";
  return opponent ? "HBCU Matchup" : "Schedule File";
};

export const getTag = (game, opponent) => {
  if (game.bowl_game) return "BOWL";
  if (game.conf_game && opponent?.conference === "SWAC" && opponent?.division) return `SWAC ${opponent.division}`;
  if (game.conf_game) return opponent?.conference ?? "CONF";
  return "NON-CONF";
};

export const getVenueDetails = (game) => {
  const source = game.location ?? game.site ?? game.venue_city ?? "";
  const stadium = game.stadium ?? "";
  const match = String(stadium).match(/^(.*?)\s*\((.*?)\)\s*$/);

  if (match) {
    return {
      city: source || match[1],
      stadium: match[2],
    };
  }

  return {
    city: source || (game.home_away === "away" ? "Away" : "Home"),
    stadium: stadium || (game.home_away === "away" ? "Road game" : "Home game"),
  };
};
