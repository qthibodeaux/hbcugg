import { useQuery } from "@tanstack/react-query";
import { fetchCoachesAllYears, fetchCoachMovements } from "./fetchers";
import { useMemo } from "react";
import { _isHeadCoach, _isCoordinator, toV5TeamId } from "./normalizers";

export const useCoachingTrees = () => {
  const {
    data: coachesData,
    isLoading: cL,
    isError,
    error,
  } = useQuery({
    queryKey: ["coaches-all-years"],
    queryFn: fetchCoachesAllYears,
    staleTime: Infinity,
    retry: false,
  });
  const { data: movementsData, isLoading: mL } = useQuery({
    queryKey: ["coach-movements"],
    queryFn: fetchCoachMovements,
    staleTime: Infinity,
    retry: false,
  });

  const isLoading = cL || mL;

  // One record per unique coach with their full arc across all seasons
  const careerProgressions = useMemo(() => {
    if (!coachesData) return [];
    const byPerson = {};
    coachesData.forEach((c) => {
      if (!byPerson[c.person_id]) {
        byPerson[c.person_id] = {
          person_id: c.person_id,
          name: c.full_name,
          entries: [],
        };
      }
      byPerson[c.person_id].entries.push({
        season: c.season,
        title: c.title,
        team_id: c.team_id,
      });
    });
    return Object.values(byPerson).map((coach) => {
      const entries = coach.entries.sort((a, b) => a.season - b.season);
      const positions = [...new Set(entries.map((e) => e.title))];
      const teams = [...new Set(entries.map((e) => e.team_id))];
      const hasHC = positions.some((p) => _isHeadCoach(p));
      const hasCoord = positions.some((p) => _isCoordinator(p));
      let arc_type = "stable";
      if (hasHC && hasCoord) arc_type = "coordinator_to_head";
      else if (teams.length > 1) arc_type = "lateral";
      return { ...coach, arc: { arc_type, positions, teams } };
    });
  }, [coachesData]);

  // Pairs of coaches who shared the same team in the same season, 2+ times
  const staffRelationships = useMemo(() => {
    if (!coachesData) return [];
    const nameById = {};
    coachesData.forEach((c) => {
      nameById[c.person_id] = c.full_name;
    });
    const byTeamYear = {};
    coachesData.forEach((c) => {
      const key = `${c.team_id}_${c.season}`;
      if (!byTeamYear[key])
        byTeamYear[key] = { team_id: c.team_id, coaches: [] };
      byTeamYear[key].coaches.push(c.person_id);
    });
    const pairs = {};
    Object.values(byTeamYear).forEach(({ team_id, coaches }) => {
      for (let i = 0; i < coaches.length; i++) {
        for (let j = i + 1; j < coaches.length; j++) {
          const key = [coaches[i], coaches[j]].sort().join("__");
          if (!pairs[key])
            pairs[key] = {
              ids: [coaches[i], coaches[j]],
              years_together: 0,
              teams: new Set(),
            };
          pairs[key].years_together++;
          pairs[key].teams.add(team_id);
        }
      }
    });
    return Object.values(pairs)
      .filter((p) => p.years_together >= 2)
      .map((p) => ({
        coach1_name: nameById[p.ids[0]] ?? p.ids[0],
        coach2_name: nameById[p.ids[1]] ?? p.ids[1],
        years_together: p.years_together,
        shared_programs: [...p.teams],
      }))
      .sort((a, b) => b.years_together - a.years_together);
  }, [coachesData]);

  // Coaches who changed programs
  const programTransfers = useMemo(() => {
    if (!movementsData) return [];
    return movementsData
      .filter((m) => m.team_changed)
      .map((m) => ({
        coach_name: m.full_name,
        from_team: m.from_team_id,
        to_team: m.to_team_id,
        year: m.to_season,
        role: m.to_title,
      }));
  }, [movementsData]);

  return {
    summary: null,
    staffTrees: {},
    careerProgressions,
    staffRelationships,
    programTransfers,
    isLoading,
    isError,
    error,
  };
};

export const useAllCoachesByYear = (year) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["coaches-all-years", String(year)],
    queryFn: fetchCoachesAllYears,
    staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity
    retry: false,
  });

  const coaches = Array.isArray(data)
    ? data
        .filter((c) => String(c?.season) === String(year))
        .map((c) => ({
          ...c,
          name: c.full_name ?? c.name,
          _teamId: c.team_id,
        }))
    : [];

  return { coaches, isLoading, isError, error };
};

export const useAllCoachRows = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["coaches-all-years"],
    queryFn: fetchCoachesAllYears,
    staleTime: Infinity,
    retry: false,
  });

  const coaches = Array.isArray(data)
    ? data.map((c) => ({
        ...c,
        name: c.full_name ?? c.name,
        _teamId: c.team_id,
      }))
    : [];

  return { coaches, isLoading, isError, error };
};

export const useCoachCareer = (coachId) => {
  const {
    data: coachesData,
    isLoading: cL,
    isError,
    error,
  } = useQuery({
    queryKey: ["coaches-all-years"],
    queryFn: fetchCoachesAllYears,
    staleTime: Infinity,
    retry: false,
  });
  const { data: movementsData, isLoading: mL } = useQuery({
    queryKey: ["coach-movements"],
    queryFn: fetchCoachMovements,
    staleTime: Infinity,
    retry: false,
  });

  const seasons = useMemo(() => {
    if (!coachesData || !coachId) return [];
    return coachesData
      .filter((c) => c.person_id === coachId)
      .sort((a, b) => a.season - b.season);
  }, [coachesData, coachId]);

  const movements = useMemo(() => {
    if (!movementsData || !coachId) return [];
    return movementsData
      .filter((m) => m.person_id === coachId)
      .sort((a, b) => a.to_season - b.to_season);
  }, [movementsData, coachId]);

  // Most recent season record (for name, image, bio_url)
  const latest = useMemo(() => {
    if (!seasons.length) return null;
    return seasons[seasons.length - 1];
  }, [seasons]);

  return { seasons, movements, latest, isLoading: cL || mL, isError, error };
};

export const useTeamCoachesByYear = (exportId, year) => {
  const { coaches, isLoading, isError, error } = useAllCoachesByYear(year);
  const v5Id = toV5TeamId(exportId);
  const teamCoaches = coaches.filter((c) => c._teamId === v5Id);

  return { coaches: teamCoaches, isLoading, isError, error };
};
