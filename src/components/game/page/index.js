// ─── Shared primitives ────────────────────────────────────────────────────────
export { SectionShell } from "./panels/SectionShell";
export { DualStatRow } from "./panels/DualStatRow";
export { StubPanel } from "./panels/StubPanel";

// ─── Utils ────────────────────────────────────────────────────────────────────
export { getTeamLabel, getTeamColor, getTeamLogoSrc } from "./utils/teamHelpers";
export { normalizeDrives } from "./utils/normalizeDrives";
export { normalizePlays } from "./utils/normalizePlays";

// ─── Summary tab panels ───────────────────────────────────────────────────────
export { TeamMetricsPanel } from "./summary/TeamMetricsPanel";
export { GameLeadersPanel } from "./summary/GameLeadersPanel";
export { TeamStatsPanel } from "./summary/TeamStatsPanel";
export { GameInfoPanel } from "./summary/GameInfoPanel";
export { DrivesPanel } from "./summary/DrivesPanel";
export { GloryMVPPanel } from "./summary/GloryMVPPanel";
export { GameProductionComparison } from "./summary/GameProductionComparison";
export { SummaryTab } from "./summary/SummaryTab";

// ─── Other tabs ───────────────────────────────────────────────────────────────
export { BoxScoreTab } from "./boxscore/BoxScoreTab";
export { DataRoomTab } from "./teamstats/DataRoomTab";
export { PlayByPlayTab } from "./pbp/PlayByPlayTab";

// ─── Page shell ───────────────────────────────────────────────────────────────
export { GamePageShell } from "./GamePageShell";
