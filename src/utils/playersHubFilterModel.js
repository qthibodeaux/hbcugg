import { TEAM_BY_EXPORT } from "./playersHubPresentation";

// Existing per-view search/filter rules; historical search semantics preserved.
export const filterPlayersHub = ({ view, statPlayers, rosterPlayers, histPlayers, conf, pos, cls, search }) => {
    const searchLower = search.toLowerCase();
    if (view === "stats") {
      let list = statPlayers;
      if (conf !== "all")
        list = list.filter((p) => TEAM_BY_EXPORT[p.team]?.conference === conf);
      if (pos !== "all") list = list.filter((p) => p.position_group === pos);
      if (cls !== "all") list = list.filter((p) => p.class_year === cls);
      if (search)
        list = list.filter(
          (p) =>
            (p.name_display ?? "").toLowerCase().includes(searchLower) ||
            (p.position ?? "").toLowerCase().includes(searchLower) ||
            (TEAM_BY_EXPORT[p.team]?.shortName ?? "")
              .toLowerCase()
              .includes(searchLower),
        );
      return [...list].sort((a, b) => (b.par ?? 0) - (a.par ?? 0));
    }
    if (view === "roster") {
      let list = rosterPlayers;
      if (conf !== "all")
        list = list.filter(
          (p) => TEAM_BY_EXPORT[p.team_id]?.conference === conf,
        );
      if (pos !== "all") list = list.filter((p) => p.position_group === pos);
      if (cls !== "all") list = list.filter((p) => p.class_year === cls);
      if (search)
        list = list.filter(
          (p) =>
            (p.full_name ?? "").toLowerCase().includes(searchLower) ||
            (p.position_abbr ?? "").toLowerCase().includes(searchLower) ||
            (TEAM_BY_EXPORT[p.team_id]?.shortName ?? "")
              .toLowerCase()
              .includes(searchLower),
        );
      return list;
    }
    let list = histPlayers;
    if (conf !== "all")
      list = list.filter((p) => TEAM_BY_EXPORT[p._teamId]?.conference === conf);
    if (pos !== "all")
      list = list.filter((p) => (p.position ?? p.position_abbr) === pos);
    if (cls !== "all")
      list = list.filter((p) => (p.class_year ?? p.year_in_school) === cls);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };
