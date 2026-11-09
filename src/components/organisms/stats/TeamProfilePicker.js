import { useMemo } from "react";
import { headlineStats } from "./profilePicker/pickerPresentation";
import { MobilePicker } from "./profilePicker/MobileTeamProfilePicker";
import { DesktopTeamProfilePicker } from "./profilePicker/DesktopTeamProfilePicker";

export const TeamProfilePicker = ({ hub, season, teamId, onChange, mobile = false }) => {
  const teams = useMemo(
    () =>
      Object.values(hub.teams ?? {})
        .map((t) => t.identity)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [hub.teams],
  );
  const team = teamId ? hub.teams?.[teamId] : null;
  const row = team?.seasons?.[season] ?? null;
  const stats = useMemo(() => headlineStats(hub, row, season), [hub, row, season]);
  const primary = team?.identity?.primary ?? "#FFFFFF";

  if (mobile) {
    return <MobilePicker teams={teams} team={team} teamId={teamId} row={row} stats={stats} season={season} onChange={onChange} />;
  }

  return (
    <DesktopTeamProfilePicker teamId={teamId} onChange={onChange} teams={teams} team={team} primary={primary} season={season} row={row} stats={stats} />
  );
};

export default TeamProfilePicker;
