import { cleanTeamId, sum, div } from "./numbers";

export const deriveFromDrives = (game, teamId) => {
  const drives = game?.drive_summary ?? [];
  const cleanId = cleanTeamId(teamId);

  const offDrives = drives.filter((d) => cleanTeamId(d.offense_team) === cleanId);
  const defDrives = drives.filter((d) => cleanTeamId(d.defense_team) === cleanId);

  const scoringDrives = offDrives.filter((d) => (d.points ?? 0) > 0).length;
  const tdDrives = offDrives.filter((d) => d.result === "TD").length;
  const fgDrives = offDrives.filter((d) => d.result === "FG").length;
  const puntDrives = offDrives.filter((d) => d.result === "Punt").length;
  const turnoverDrives = offDrives.filter((d) => ["INT", "Fumble", "Safety"].includes(d.result)).length;
  const downsDrives = offDrives.filter((d) => d.result === "Downs").length;
  const threeAndOuts = offDrives.filter((d) => (d.plays_total ?? 0) <= 3 && d.result === "Punt").length;
  const sustainedDrives = offDrives.filter((d) => (d.plays_total ?? 0) >= 8).length;

  const totalPlays = sum(offDrives.map((d) => d.plays_total));
  const totalYards = sum(offDrives.map((d) => d.yards_net));
  const totalPoints = sum(offDrives.map((d) => d.points));

  // Time of possession (approximate from clock strings)
  let topSeconds = 0;
  offDrives.forEach((d) => {
    const start = d.clock_start;
    const end = d.clock_end;
    if (start && end && typeof start === "string" && typeof end === "string") {
      const [sm, ss] = start.split(":").map(Number);
      const [em, es] = end.split(":").map(Number);
      if (!Number.isNaN(sm) && !Number.isNaN(ss) && !Number.isNaN(em) && !Number.isNaN(es)) {
        const startSec = sm * 60 + ss;
        const endSec = em * 60 + es;
        if (d.quarter_start === d.quarter_end && endSec <= startSec) {
          topSeconds += startSec - endSec;
        }
      }
    }
  });

  // Defensive drive stats
  const defStopsPunt = defDrives.filter((d) => d.result === "Punt").length;
  const defStopsTurnover = defDrives.filter((d) => ["INT", "Fumble", "Safety"].includes(d.result)).length;
  const defStopsDowns = defDrives.filter((d) => d.result === "Downs").length;
  const defAllowedTD = defDrives.filter((d) => d.result === "TD").length;
  const defAllowedFG = defDrives.filter((d) => d.result === "FG").length;
  const defThreeAndOutsForced = defDrives.filter((d) => (d.plays_total ?? 0) <= 3 && d.result === "Punt").length;

  return {
    scoringDrives,
    scoringDriveRate: div(scoringDrives, offDrives.length),
    tdDriveRate: div(tdDrives, offDrives.length),
    fgDriveRate: div(fgDrives, offDrives.length),
    puntDriveRate: div(puntDrives, offDrives.length),
    turnoverDriveRate: div(turnoverDrives, offDrives.length),
    downsDriveRate: div(downsDrives, offDrives.length),
    threeAndOutRate: div(threeAndOuts, offDrives.length),
    sustainedDriveRate: div(sustainedDrives, offDrives.length),
    playsPerDrive: div(totalPlays, offDrives.length),
    yardsPerDrive: div(totalYards, offDrives.length),
    pointsPerDrive: div(totalPoints, offDrives.length),
    timeOfPossessionSeconds: topSeconds,
    timeOfPossession: topSeconds > 0 ? `${Math.floor(topSeconds / 60)}:${String(topSeconds % 60).padStart(2, "0")}` : "—",
    drivesOffense: offDrives.length,
    drivesFaced: defDrives.length,
    defStopsPunt,
    defStopsTurnover,
    defStopsDowns,
    defAllowedTD,
    defAllowedFG,
    defThreeAndOutsForced,
  };
};
