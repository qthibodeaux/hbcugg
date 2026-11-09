import { Last3, ShareJump, BestGames, Streaks, TeamLast3, LeagueWeeks } from "./trendsYards/WeeklyPanels";
import { HeightInfo, TeamHeight } from "./trendsYards/HeightPanels";
import { DepthYac, Direction, PastSticks, SticksSplit, YardsTables, DepthLeague, DepthByDown } from "./trendsYards/YardsPanels";

export const WEEKLY_GROUP = {
  id: "weekly", label: "Week to week",
  posters: [
    { id: "last3", chip: "Last 3 games", tweet: "Who's heating up and who's cooling off", Poster: Last3 },
    { id: "share", chip: "Target share jumps", tweet: "The receivers quarterbacks suddenly trust", Poster: ShareJump },
    { id: "best", chip: "Best games", tweet: "The best receiving games of the season", Poster: BestGames },
    { id: "streaks", chip: "Streaks", tweet: "The receivers who keep doing it", Poster: Streaks },
    { id: "team", chip: "Team passing trend", tweet: "Which passing games are turning a corner", Poster: TeamLast3 },
    { id: "league", chip: "League by week", tweet: "How league passing moved week by week", Poster: LeagueWeeks },
  ],
};

export const YARDS_GROUP = {
  id: "yards", label: "How they get yards",
  posters: [
    { id: "height", chip: "Height", tweet: "Shorter receivers are winning the deep ball", Poster: HeightInfo },
    { id: "depth-yac", chip: "Depth vs after the catch", tweet: "Some win downfield, some win after the catch. Bean does both.", Poster: DepthYac },
    { id: "direction", chip: "Favorite direction", tweet: "Every top receiver has a favorite side of the field", Poster: Direction },
    { id: "sticks", chip: "Past the sticks", tweet: "Throw it past the sticks on 3rd down", Poster: PastSticks },
    { id: "sticks-split", chip: "How they converted", tweet: "Beat the sticks in the air or after the catch", Poster: SticksSplit },
    { id: "tables", chip: "Yards tables", tweet: "After the catch and down the field", Poster: YardsTables },
    { id: "team-height", chip: "Team height", tweet: "Do bigger receiver rooms throw it deeper", Poster: TeamHeight },
    { id: "depth-league", chip: "League by depth", tweet: "What each kind of throw is worth", Poster: DepthLeague },
    { id: "depth-down", chip: "Depth by down", tweet: "How far each offense throws on every down", Poster: DepthByDown },
  ],
};

export { Lanes } from "./trendsYards/YardsPanels";
