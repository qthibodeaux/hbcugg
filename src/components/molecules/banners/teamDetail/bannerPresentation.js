import { GAME_CENTER_SEASONS } from "../../game/SeasonSelector";
import teamsData from "../../../../data/teams.json";

// Team-detail banner season scope, team inventory and display-name selection.

export const SEASONS = GAME_CENTER_SEASONS;

export const TEAMS = teamsData.teams;

export const getBannerName = (team) => team.bannerName ?? team.name;
