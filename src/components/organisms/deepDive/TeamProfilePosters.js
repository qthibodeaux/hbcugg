import { TeamPosterYours, TeamPosterMine } from "./teamProfilePosters/TeamPosters";
import { PlayersPosterYours, PlayersPosterMine } from "./teamProfilePosters/PlayerPosters";
import { ContextPoster } from "./teamProfilePosters/ContextPoster";

export const TEAM_PROFILE_POSTERS = [
  { id: "team-yours", chip: "Team · yours", Poster: TeamPosterYours },
  { id: "team-mine", chip: "Team · mine", Poster: TeamPosterMine },
  { id: "players-yours", chip: "Players · yours", Poster: PlayersPosterYours },
  { id: "players-mine", chip: "Players · mine", Poster: PlayersPosterMine },
  { id: "context", chip: "Context", Poster: ContextPoster },
];

export { POSTER_W } from "./teamProfilePosters/posterPresentation";

export { TeamPosterYours, TeamPosterMine } from "./teamProfilePosters/TeamPosters";

export { PlayersPosterYours, PlayersPosterMine } from "./teamProfilePosters/PlayerPosters";

export { ContextPoster } from "./teamProfilePosters/ContextPoster";
