import { DlineTeamsPoster, DlineSituationalPoster, DlinePlayersPoster } from "./dlinePosters/DlinePosterLayouts";

export const DLINE_POSTERS = [
  { id: "teams", chip: "Teams", Poster: DlineTeamsPoster },
  { id: "situational", chip: "Situational", Poster: DlineSituationalPoster },
  { id: "players", chip: "Players", Poster: DlinePlayersPoster },
];

export { POSTER_W } from "./dlinePosters/posterModel";

export { DlineTeamsPoster, DlineSituationalPoster, DlinePlayersPoster } from "./dlinePosters/DlinePosterLayouts";
