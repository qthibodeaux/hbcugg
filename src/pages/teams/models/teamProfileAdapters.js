import { TEAM_BY_ID } from "../../../utils/teamScheduleModel";

// Existing team-profile mapping/layout extracted without behavior changes.

const buildRecordFallback = (team) => ({
  overall: "--",
  conference: `${team?.conference || "Conference"} season record pending`,
  rank: `${team?.conference || "HBCU"}${team?.division ? ` ${team.division}` : ""}`,
});

const isSpringGame = (game) => {
  const haystack = [
    game?.game_id,
    game?.opponent_name,
    game?.opponent_short_name,
    game?.tag,
    game?.game_label,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /spring game|spring-game|purple\s*&\s*gold|maroon\s*&\s*gray/.test(haystack);
};

const externalOpponent = (game) => {
  const known = game?.opponent_id ? TEAM_BY_ID[game.opponent_id] : null;
  if (known) {
    return {
      name: known.name,
      shortName: known.bannerShort || known.shortName || known.name,
      mascot: known.mascot,
      logo: known.logo || game?.opponent_logo,
      colors: known.colors,
      v5Id: known.exportId?.replace(/25$/, "") ?? null,
    };
  }
  return {
    name: game?.opponent_name,
    shortName: game?.opponent_short_name || game?.opponent_name,
    mascot: game?.opponent_mascot,
    logo: game?.opponent_logo,
    colors: { primary: "#2D3748" },
  };
};

export const mapRecord = (team, record) => {
  if (!record) return buildRecordFallback(team);
  return {
    ...record,
    rank: record.division_rank,
    display: record.overall,
  };
};

export const mapNextGame = (game) => {
  if (!game || game.next_game_available === false || isSpringGame(game)) return null;
  return {
    ...game,
    opponentTeam: externalOpponent(game),
    opponentName: game.opponent_name,
    opponentShort: game.opponent_short_name,
    gameName: game.tag,
  };
};

export const mapReviewGame = (game) => {
  if (!game) return null;
  return {
    ...game,
    opponentTeam: externalOpponent(game),
    opponentName: game.opponent_name,
    opponentShort: game.opponent_name,
    headline: game.review_headline || game.game_label,
  };
};

export const mapPlayer = (player) => {
  if (!player) return null;
  return {
    name: player.full_name,
    position: player.position,
    classYear: player.class_year,
    par: player.primary_stat?.value ?? player.stat_strip?.[0]?.value,
    gamesPlayed: player.stat_strip?.find((item) => item.label === "Games")?.value,
    image: player.image_url,
    rank: player.rank_label || player.spotlight_label,
  };
};

const normalizeName = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

const findCoachImage = (coach, coachRows, teamV5Id) => {
  if (!coach || coach.image_url) return coach?.image_url || null;
  const byId = coachRows.find((row) => row.person_id === coach.coach_id && row.image_url);
  if (byId?.image_url) return byId.image_url;

  const coachName = normalizeName(coach.name);
  const byName = coachRows
    .filter((row) => row._teamId === teamV5Id && normalizeName(row.full_name || row.name) === coachName && row.image_url)
    .sort((a, b) => Number(b.season || 0) - Number(a.season || 0))[0];

  return byName?.image_url || null;
};

export const mapCoach = (coach, coachRows, teamV5Id) => {
  if (!coach) return null;
  return {
    name: coach.name,
    title: coach.title,
    image: coach.image_url || findCoachImage(coach, coachRows, teamV5Id),
    record: coach.tenure_year ? `Y${coach.tenure_year}` : "--",
    sub: coach.stock_label || "Head coach",
  };
};

export const mapTopStat = (team, topStat) => ({
  label: topStat?.label || "Top Stat",
  value: topStat?.value ?? "--",
  sub: topStat?.sub || "Pipeline stat pending",
  accent: team?.colors?.secondary || "#F56565",
});

const venueLabel = (venue) => venue?.venue_label ?? venue?.stadium_name ?? null;

export const mapHubKpiStats = (header) => ({
  par: header?.avg_par,
  rosterSize: header?.roster_count,
  transfers: header?.transfer_rate != null ? `${header.transfer_rate}%` : undefined,
  transferCount: header?.transfer_count,
  veterans: header?.upperclass_pct != null ? `${Math.round(header.upperclass_pct)}%` : undefined,
});

export const mapHubRecord = (conferenceRecord) =>
  conferenceRecord
    ? {
        overall: conferenceRecord.overall_label,
        conference_wins: conferenceRecord.conference_wins,
        conference_losses: conferenceRecord.conference_losses,
        rank: conferenceRecord.division_rank,
        display: conferenceRecord.overall_label,
      }
    : null;

export const mapHubLast5 = (last5) =>
  (last5 ?? []).map((g) => ({
    ...g,
    game_id: g.game_path_id,
    opponent_name: g.opponent_short,
    score_opp: g.score_opponent,
  }));

export const mapHubReviewGame = (previousGame) => {
  if (!previousGame) return null;
  return {
    ...previousGame,
    opponentTeam: externalOpponent(previousGame),
    opponentName: previousGame.opponent_name,
    opponentShort: previousGame.opponent_name,
    venue: venueLabel(previousGame.venue),
    route: previousGame.game_path_id ? `/game/${previousGame.game_path_id}` : null,
  };
};

export const mapHubNextGame = (nextGame) => {
  if (!nextGame || isSpringGame(nextGame)) return null;
  return {
    ...nextGame,
    opponentTeam: externalOpponent(nextGame),
    opponentName: nextGame.opponent_name,
    opponentShort: nextGame.opponent_short_name,
    gameName: nextGame.tag,
    venue: venueLabel(nextGame.venue),
    // Both teams among the 18 → the preview page (Team Profile contract).
    route: nextGame.preview_path_id ? `/game/preview/${nextGame.preview_path_id}` : null,
  };
};

export const mapHubSeasonSummary = (seasonSummary) =>
  seasonSummary
    ? {
        record: seasonSummary.record,
        conference_record: seasonSummary.conference_record,
        division_finish: seasonSummary.division_finish,
      }
    : null;

export const mapHubCoachCarousel = (coachCarousel) =>
  (coachCarousel ?? []).map((coach) => {
    const metric = coach.metric;
    const signed = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(3)}`;
    return {
      name: coach.name,
      role: coach.role,
      image: coach.image_url,
      statValue: metric ? (metric.display ?? signed(metric.value)) : coach.tenure_year ? `Y${coach.tenure_year}` : "--",
      statLabel: metric ? metric.label : "TENURE",
      delta: metric
        ? { direction: metric.is_improvement ? "up" : "down", value: metric.scope }
        : null,
    };
  });

export const mapHubUnitCarousel = (unitCarousel) =>
  (unitCarousel?.slides ?? []).map((slide) => ({
    key: slide.unit,
    label: slide.label,
    metrics: (slide.metrics ?? []).map((m) => ({
      key: m.key,
      label: m.label,
      value: m.value,
      display: m.display ?? null,
      conference_rank: m.rank,
      conference_size: m.total,
    })),
  }));

export const mapHubTopStat = (team, topStat) =>
  topStat
    ? {
        label: topStat.label,
        value: topStat.display ?? (Number.isInteger(topStat.value) ? topStat.value : Number(topStat.value).toFixed(1)),
        sub: `#${topStat.rank} of ${topStat.total}`,
        accent: team?.colors?.secondary || "#F56565",
      }
    : null;

export const mapHubStarImpact = (star, imageUrl) => {
  if (!star) return null;
  const prefix = star.from_game?.home_away === "away" ? "@" : "VS";
  const week = star.from_game?.week != null ? `WEEK ${star.from_game.week} ` : "";
  return {
    player: {
      name: star.full_name,
      position: star.position,
      classYear: star.class_year,
      par: star.par_per_game,
      image: star.image_url ?? imageUrl ?? null,
      rank: null,
      profileUrl: star.profile_url ?? null,
    },
    gameContext: `LAST GAME: ${week}${prefix} ${(star.from_game?.opponent_name ?? "").toUpperCase()}`,
    keyStats: (star.stat_line ?? []).map((s) => ({ label: s.label, value: s.value })),
  };
};
