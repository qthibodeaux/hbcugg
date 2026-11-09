export const n = (v) => (v == null || Number.isNaN(Number(v)) ? null : Number(v));

export const div = (a, b) => (n(b) ? n(a) / n(b) : null);

export const sum = (arr) => arr.reduce((acc, v) => acc + (n(v) ?? 0), 0);

export const cleanTeamId = (id) => String(id ?? "").replace(/25$/, "");
