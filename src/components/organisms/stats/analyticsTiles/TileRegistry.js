import { CalendarDays, Shield, BarChart3, Map, Swords, Grid3x3, TrendingUp, BookOpen } from "lucide-react";
import { WeekBody } from "./WeekTile";
import { ProfileBody, BoardBody } from "./ProfileBoardTiles";
import { MapBody } from "./MapTile";
import { MatchupBody } from "./MatchupTile";
import { LabBody, TrendsBody } from "./RatingTrendsTiles";
import { GlossaryBody } from "./GlossaryTile";
import { TEAM_ANALYTICS_TABS } from "../../../../pages/analytics/teamAnalyticsTabs";

const TILE_PARTS = {
  week: { icon: CalendarDays, Body: WeekBody, rotateMs: 7000, transition: "slide" },
  profile: { icon: Shield, Body: ProfileBody, rotateMs: 9000, transition: "flip" },
  board: { icon: BarChart3, Body: BoardBody, rotateMs: 5500, transition: "push" },
  map: { icon: Map, Body: MapBody, rotateMs: 10000, transition: "fade" },
  matchup: { icon: Swords, Body: MatchupBody, rotateMs: 9000, transition: "flip" },
  lab: { icon: Grid3x3, Body: LabBody, rotateMs: 6500, transition: "peek" },
  trends: { icon: TrendingUp, Body: TrendsBody, rotateMs: 8000, transition: "slide" },
  glossary: { icon: BookOpen, Body: GlossaryBody, rotateMs: 12000, transition: "zoom" },
};

export const TILES = TEAM_ANALYTICS_TABS.map((t) => ({ ...t, ...TILE_PARTS[t.id] }));
