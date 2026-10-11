import { Box } from "@chakra-ui/react";
import { DriveSummaryTable } from "../summary/GameSummaryTabV2";

// Drives tab — the drive summary table, moved off the bottom of the Summary
// tab (2026-09-20) into its own section. Renders in the page's list region,
// so it is as tall as the game's drive count.
export const DrivesTab = ({ driveSummary, awayId, homeId }) => (
  <Box w="full">
    <DriveSummaryTable driveSummary={driveSummary} awayId={awayId} homeId={homeId} />
  </Box>
);

export default DrivesTab;
