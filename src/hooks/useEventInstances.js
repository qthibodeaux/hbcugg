import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "../utils/gameCenterPayloads";
import { buildEventsModel, EMPTY_EVENTS_MODEL } from "../utils/eventsModel";
import { useVenues } from "./useVenues";

export const EVENT_INSTANCES_PATH = "/data/event_instances.json";

export const useEventInstances = () => {
  const [seasonOverride, setSeasonOverride] = useState(null);
  const venues = useVenues();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["event-instances"],
    queryFn: () => fetchJson(EVENT_INSTANCES_PATH),
    staleTime: Infinity,
    retry: false,
  });

  const model = useMemo(
    () => (data ? buildEventsModel(data, { season: seasonOverride, resolveVenue: venues.resolveByName, venueForTeam: venues.venueForTeam, venueForEvent: venues.venueForEvent }) : EMPTY_EVENTS_MODEL),
    [data, seasonOverride, venues.resolveByName, venues.venueForTeam, venues.venueForEvent],
  );

  return { ...model, setSeason: (s) => setSeasonOverride(Number(s)), isLoading: isLoading || venues.isLoading, isError };
};
