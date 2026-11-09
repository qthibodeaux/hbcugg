export const DATA = {
  jsu: {
    meta: {
        id: "jsu",
        name: "JACKSON STATE — DEFENSE",
        colors: { primary: "#002147", accent: "#4A90D9" }
    },
    advanced: {
        havoc_rate_forced: 0.132,
        stuff_rate: 0.231,
        success_rate: 0.333,
        success_rate_early_down: 0.387,
        success_rate_late_down: 0.200,
        third_down_allowed_pct: 0.5238, // Added literal conversion rate allowed
        red_zone_td_rate: 0.40,
        epa_per_play: 0.012
    },
    top: {
        scrimmage: 85, 
        stopRate: 0.667, 
        havocTotal: 14, 
        havocBreakdown: "rush 6 · pass 8",
        turnoversTotal: 3,
        turnoverBreakdown: "1 INT · 2 FR/FF"
    },
    players: [
        { name: "R. Pulliam", tkl: 10.5, tfl: 0.5, sck: 0, pd: 1, ff: 0, havoc: 2 },
        { name: "K. Sallis", tkl: 9.0, tfl: 0, sck: 0, pd: 0, ff: 1, havoc: 1 },
        { name: "S. Hawkins", tkl: 7.0, tfl: 0, sck: 0, pd: 0, ff: 0, havoc: 1 },
        { name: "A. Taylor", tkl: 4.0, tfl: 2.0, sck: 0, pd: 0, ff: 0, havoc: 4 },
        { name: "J. Williams", tkl: 3.5, tfl: 1.0, sck: 0, pd: 0, ff: 1, havoc: 2 },
    ]
  },
  pvamu: {
    meta: {
        id: "pvamu",
        name: "PRAIRIE VIEW — DEFENSE",
        colors: { primary: "#4B0082", accent: "#FFB81C" }
    },
    advanced: {
        havoc_rate_forced: 0.167,
        stuff_rate: 0.196,
        success_rate: 0.333,
        success_rate_early_down: 0.264,
        success_rate_late_down: 0.500,
        third_down_allowed_pct: 0.200, // Added literal conversion rate allowed
        red_zone_td_rate: 0.75,
        epa_per_play: 0.134
    },
    top: {
        scrimmage: 45, 
        stopRate: 0.667, 
        havocTotal: 7, 
        havocBreakdown: "rush 4 · pass 3",
        turnoversTotal: 2,
        turnoverBreakdown: "1 INT · 1 FR"
    },
    players: [
        { name: "D. Starling", tkl: 6.0, tfl: 1.0, sck: 0.5, pd: 0, ff: 0, havoc: 2 },
        { name: "K. Parker", tkl: 5.0, tfl: 1.0, sck: 0, pd: 0, ff: 0, havoc: 1 },
        { name: "T. Randle", tkl: 4.0, tfl: 0, sck: 0, pd: 1, ff: 0, havoc: 1 },
        { name: "K. Amao", tkl: 3.5, tfl: 0.5, sck: 0, pd: 0, ff: 0, havoc: 1 },
        { name: "S. Roberts", tkl: 1.5, tfl: 0, sck: 0, pd: 0, ff: 0, havoc: 2 },
    ]
  }
};
