import { useQuery } from "@tanstack/react-query";
import { fetchOfficialsRegistry, fetchCrewRegistry } from "./fetchers";
import { toConferenceAffiliations } from "./normalizers";

export const useAllOfficials = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["officials-registry"],
    queryFn: fetchOfficialsRegistry,
    staleTime: Infinity,
    retry: false,
  });

  const officials = Array.isArray(data)
    ? data.map((o) => ({
        ...o,
        name: o.full_name ?? o.person_id,
        conference_affiliations: toConferenceAffiliations(o.assignments ?? []),
      }))
    : [];

  return { officials, isLoading, isError, error };
};

export const useAllCrews = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["official-crews"],
    queryFn: async () => {
      const [crews, refs] = await Promise.all([
        fetchCrewRegistry(),
        fetchOfficialsRegistry(),
      ]);
      return { crews, refs };
    },
    staleTime: Infinity,
    retry: false,
  });

  // officials_registry.json is an array keyed by person_id
  const refsByPersonId = (data?.refs ?? []).reduce((acc, ref) => {
    if (ref.person_id) acc[ref.person_id] = ref;
    return acc;
  }, {});

  const crews = Array.isArray(data?.crews)
    ? data.crews.map((crew) => ({
        crew_id: crew.crew_id,
        game_id: crew.games?.[0] ?? crew.crew_id,
        officials: (crew.members ?? []).map((m) => ({
          person_id: m.person_id,
          name: m.name ?? refsByPersonId[m.person_id]?.full_name ?? m.person_id,
          role: "OFFICIAL",
        })),
      }))
    : [];

  return {
    crews,
    analyticsSummary: {
      total_crews: crews.length,
      average_crew_size: crews.length
        ? (
            crews.reduce((sum, c) => sum + c.officials.length, 0) / crews.length
          ).toFixed(1)
        : 0,
      total_partnerships: crews.reduce(
        (sum, c) => sum + Math.max(0, c.officials.length - 1),
        0,
      ),
      geographic_coverage: "Multi-conference",
    },
    isLoading,
    isError,
    error,
  };
};
