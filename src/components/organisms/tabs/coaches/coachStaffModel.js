

// Staff classification and display helpers shared by the coaching overview and cards.

export const isHeadCoach = (title = "") =>
  /head\s+(football\s+)?coach/i.test(title) && !/assistant/i.test(title);

export const isCoordinator = (title = "") => /coordinator/i.test(title);

export const getDisplayName = (coach) => coach.full_name ?? coach.name ?? "Unknown Coach";

export const getInitials = (name) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export const getYearsActive = (coach) => (Array.isArray(coach?.years_active) ? coach.years_active : []);
