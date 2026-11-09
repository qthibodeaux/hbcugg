import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { MobileBannerTeamDetail } from "../../molecules/banners/teamDetail/MobileTeamBanner";
import { BannerTeamDetail4x1 } from "../../molecules/banners/teamDetail/DesktopTeamBanner";
import { useState } from "react";
import { GAME_CENTER_DEFAULT_SEASON } from "../../molecules/game/SeasonSelector";
import { TEAMS } from "../../molecules/banners/teamDetail/bannerPresentation";

// Production version — team comes from page props, no team toggle
export const BannerTeamDetailPage = ({ team, season, setSeason }) => {
  const { isMobile } = useLayoutDensity();
  if (!team) return null;

  if (isMobile) {
    return <MobileBannerTeamDetail team={team} season={season} setSeason={setSeason} />;
  }

  return (
    <BannerTeamDetail4x1
      team={team}
      season={season}
      setSeason={setSeason}
      onPrev={() => {}}
      onNext={() => {}}
      teamIndex={0}
      teamCount={0}
      hideToggle
    />
  );
};

// Lab version — cycles through all teams internally
export const BannerTeamDetail = () => {
  const [season, setSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const [teamIndex, setTeamIndex] = useState(
    TEAMS.findIndex((t) => t.id === "mvsu")
  );

  const onPrev = () => setTeamIndex((i) => (i - 1 + TEAMS.length) % TEAMS.length);
  const onNext = () => setTeamIndex((i) => (i + 1) % TEAMS.length);

  return (
    <BannerTeamDetail4x1
      team={TEAMS[teamIndex]}
      season={season}
      setSeason={setSeason}
      onPrev={onPrev}
      onNext={onNext}
      teamIndex={teamIndex}
      teamCount={TEAMS.length}
    />
  );
};
