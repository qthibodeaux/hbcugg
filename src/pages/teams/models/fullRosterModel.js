export const buildFullRoster = ({ enrichedPlayers, players, teamRosterId, year }) => {
  const enrichedByPerson = new Map(
    enrichedPlayers
      .filter((player) => player.person_id)
      .map((player) => [player.person_id, player]),
  );

  return players
    .filter((player) => (player.team_id ?? player._teamId) === teamRosterId)
    .map((player) => {
      const enriched = year === 2025 ? enrichedByPerson.get(player.person_id) : null;
      return enriched
        ? {
            ...player,
            name_display: enriched.name_display,
            player_key: enriched.player_key,
            par: enriched.par,
            games_played: enriched.games_played,
            total_production: enriched.total_production,
            avg_production: enriched.avg_production,
            season_components: enriched.season_components,
          }
        : player;
    });
};
