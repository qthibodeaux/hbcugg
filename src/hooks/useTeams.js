import { useQuery } from "@tanstack/react-query";
import teamsData from "../data/teams.json";

const fetchTeams = async () => {
  // Simulating async fetch - replace with actual API call later
  return new Promise((resolve) => {
    setTimeout(() => resolve(teamsData.teams), 100);
  });
};

export const useTeams = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
  });
};

export const useTeam = (teamId) => {
  return useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const teams = await fetchTeams();
      return teams.find((team) => team.id === teamId);
    },
    enabled: !!teamId,
  });
};
