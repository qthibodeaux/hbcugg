import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { getStats } from "./bannerModel";
import { MobileTeamScheduleBannerA } from "./MobileTeamScheduleBanner";
import { DesktopTeamScheduleBannerA } from "./DesktopTeamScheduleBanner";

// Production density router for the accepted A banner; props and season-stat behavior are unchanged.

export const TeamScheduleBannerA = ({
  team,
  selectedId,
  onChange,
  seasonGames = [],
}) => {
  const { isMobile } = useLayoutDensity();
  const stats = getStats(team, seasonGames);

  return isMobile
    ? <MobileTeamScheduleBannerA team={team} selectedId={selectedId} onChange={onChange} stats={stats} />
    : <DesktopTeamScheduleBannerA team={team} selectedId={selectedId} onChange={onChange} stats={stats} />;
};
