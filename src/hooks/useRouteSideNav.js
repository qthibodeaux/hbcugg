import { useLocation } from "react-router-dom";
import { useVenues } from "./useVenues";
import { useMemo } from "react";
import { buildRouteSideNav } from "./routeSideNav/buildRouteSideNav";

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useRouteSideNav = (navigate) => {
  const { pathname, search } = useLocation();
  // Only the Stadiums section reads this; the query is cached forever so
  // every other route pays nothing beyond the first fetch.
  const venues = useVenues();

  return useMemo(() => buildRouteSideNav({ pathname, search, navigate, venues }), [pathname, search, navigate, venues]);
};

export default useRouteSideNav;
