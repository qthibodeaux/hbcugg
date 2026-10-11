import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "../utils/gameCenterPayloads";
import { buildVenuesModel, EMPTY_VENUES_MODEL } from "../utils/venuesModel";

export const VENUES_PATH = "/data/venues.json";

export const useVenues = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["venues"],
    queryFn: () => fetchJson(VENUES_PATH),
    staleTime: Infinity,
    retry: false,
  });
  // One stable object per data load, so consumers can list it as a memo dep.
  return useMemo(
    () => ({ ...(data ? buildVenuesModel(data) : EMPTY_VENUES_MODEL), isLoading, isError }),
    [data, isLoading, isError],
  );
};
