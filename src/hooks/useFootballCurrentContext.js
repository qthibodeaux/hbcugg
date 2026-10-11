import { useQuery } from "@tanstack/react-query";
import { GAME_CENTER_DEFAULT_SEASON } from "../components/molecules/game/SeasonSelector";
import { FE_DOCS_BASE } from "../utils/gameCenterPayloads";

export const FOOTBALL_CURRENT_CONTEXT_PATH = `${FE_DOCS_BASE}/shared/football_current_context.json`;

const fetchFootballCurrentContext = async () => {
  const res = await fetch(FOOTBALL_CURRENT_CONTEXT_PATH);
  if (!res.ok) throw new Error(`Failed to load ${FOOTBALL_CURRENT_CONTEXT_PATH}`);
  return res.json();
};

export const useFootballCurrentContext = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["football-current-context"],
    queryFn: fetchFootballCurrentContext,
    staleTime: Infinity,
    retry: false,
  });

  const currentSeason = Number(data?.current_season) || GAME_CENTER_DEFAULT_SEASON;
  const currentWeek = Number.isFinite(Number(data?.current_week)) ? Number(data.current_week) : null;
  const defaultWeek = Number.isFinite(Number(data?.default_week)) ? Number(data.default_week) : null;

  return {
    context: data ?? null,
    currentSeason,
    currentWeek,
    defaultWeek,
    phase: data?.phase ?? "unknown",
    label: data?.label ?? `${currentSeason} football`,
    isLoading,
    isError,
    error,
  };
};
