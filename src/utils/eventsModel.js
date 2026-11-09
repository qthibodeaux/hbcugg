import { buildClassicEditions, buildEventOccurrences, labelForType } from "./events/eventOccurrences";

export { teamForEvent, familyOf, labelForType, formatEventDate } from "./events/eventOccurrences";

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const buildEventsModel = (raw, { season, today = todayIso(), resolveVenue = null, venueForTeam = null, venueForEvent = null } = {}) => {
  const rows = Array.isArray(raw) ? raw : [];
  const seasons = [...new Set(rows.map((r) => r.season))].sort((a, b) => b - a);
  const activeSeason = season ?? seasons.find((s) => String(s) === today.slice(0, 4)) ?? seasons[0] ?? null;

  const occurrences = buildEventOccurrences(rows, { resolveVenue, venueForTeam });

  const seasonOccurrences = occurrences.filter((o) => o.season === activeSeason);
  const upcoming = seasonOccurrences.filter((o) => o.date >= today);
  const homecomings = seasonOccurrences.filter((o) => o.isHomecoming);

  const classics = buildClassicEditions(occurrences, { activeSeason, today, venueForEvent });

  const themeCounts = seasonOccurrences
    .filter((o) => o.family === "theme" && !o.isHomecoming)
    .reduce((acc, o) => { acc[o.typeId] = (acc[o.typeId] ?? 0) + 1; return acc; }, {});
  const themes = Object.entries(themeCounts)
    .map(([typeId, count]) => ({ typeId, label: labelForType(typeId), count }))
    .sort((a, b) => b.count - a.count);
  const colorOuts = seasonOccurrences.filter((o) => o.typeId === "color_out");

  const nextUp = upcoming[0] ?? null;

  return {
    seasons,
    season: activeSeason,
    occurrences,
    seasonOccurrences,
    upcoming,
    homecomings,
    classics,
    themes,
    colorOuts,
    stats: {
      eventsThisSeason: seasonOccurrences.length,
      classicsThisSeason: seasonOccurrences.filter((o) => o.family === "classic" || o.family === "postseason").length,
      homecomingsThisSeason: homecomings.length,
      nextUp,
    },
  };
};

export const EMPTY_EVENTS_MODEL = buildEventsModel([]);
