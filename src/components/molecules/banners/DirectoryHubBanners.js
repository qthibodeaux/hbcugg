import { useState } from "react";
import { GAME_CENTER_DEFAULT_SEASON } from "../game/SeasonSelector";
import { BannerShell, SeasonPicker, FilterPills } from "./HubBannerPrimitives";

export const BannerGamesHub = ({ season: extSeason, setSeason: extSetSeason } = {}) => {
  const [intSeason, setIntSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const season    = extSeason    !== undefined ? extSeason    : intSeason;
  const setSeason = extSetSeason !== undefined ? extSetSeason : setIntSeason;
  return (
    <BannerShell
      ghost="GAMES"
      title="GAMES HUB"
      editorial="EVERY SNAP. EVERY SCORE."
      tickerLines={["MATCHUPS · SCORES · ANALYSIS", "ALL GAMES · ALL SEASONS", "SWAC & MEAC"]}
    >
      <SeasonPicker season={season} setSeason={setSeason} />
    </BannerShell>
  );
};

export const BannerCoachesHub = ({ season: extSeason, setSeason: extSetSeason } = {}) => {
  const [intSeason, setIntSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const season    = extSeason    !== undefined ? extSeason    : intSeason;
  const setSeason = extSetSeason !== undefined ? extSetSeason : setIntSeason;
  return (
    <BannerShell
      ghost="COACHES"
      title="COACHES HUB"
      editorial="THE MEN BUILDING THESE PROGRAMS"
      tickerLines={["STAFF · COACHING TREES", "HEAD COACHES · COORDINATORS", "SWAC & MEAC"]}
    >
      <SeasonPicker season={season} setSeason={setSeason} />
    </BannerShell>
  );
};

export const BannerOfficialsHub = () => {
  const [conf, setConf] = useState("all");
  const CONFS = [
    { id: "all",  label: "All" },
    { id: "swac", label: "SWAC" },
    { id: "meac", label: "MEAC" },
  ];
  return (
    <BannerShell
      ghost="OFFICIALS"
      title="OFFICIALS HUB"
      editorial="THE CREWS CALLING THE GAME"
      tickerLines={["CREWS · ASSIGNMENTS", "OFFICIALS DATABASE", "SWAC & MEAC"]}
    >
      <FilterPills label="Conference" options={CONFS} active={conf} setActive={setConf} />
    </BannerShell>
  );
};
