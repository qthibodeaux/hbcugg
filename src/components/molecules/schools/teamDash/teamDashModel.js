

// Spotlight formatting and retained public data adapters; no change to statistical meanings.

export const splitName = (name = "Featured Player") => {
  const parts = String(name).trim().split(/\s+/);
  if (parts.length <= 1) return [parts[0] || "Featured", "Player"];
  return [parts.slice(0, -1).join(" "), parts[parts.length - 1]];
};

export const asNumber = (value, digits = 1) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return n >= 100 ? Math.round(n).toLocaleString() : n.toFixed(digits);
};

export const buildSpotlightPlayer = (teamAnalytics, playerRows = []) => {
  const top = teamAnalytics?.top_3_performers?.[0];
  if (!top) return null;
  const row = playerRows.find((p) => p.player_key === top.player_key || p.person_id === top.person_id);

  return {
    name: top.name_display || row?.full_name || row?.name_display,
    position: top.position || row?.position,
    classYear: top.class_year || row?.class_year,
    par: top.par,
    gamesPlayed: top.games_played,
    image: row?.image_url || null,
    rank: "#1 Overall PAR",
  };
};

export const buildHeadCoach = (coaches = []) => {
  const headCoach = coaches.find((coach) => /head\s+(football\s+)?coach/i.test(coach?.title || "") && !/assistant/i.test(coach?.title || ""));
  if (!headCoach) return null;
  return {
    name: headCoach.name || headCoach.full_name,
    title: headCoach.title,
    record: "--",
    sub: "Career record pending",
  };
};
