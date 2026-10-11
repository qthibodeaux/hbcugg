const fs = require('fs');
const path = require('path');

const SEASON = process.argv[2] || '2025';
const GAMES_DIR = path.join(__dirname, '..', 'public', 'data', '1-game center', 'games', SEASON);
const OUT_DIR = path.join(__dirname, '..', 'public', 'data', '0-data');

const ALL_TEAM_IDS = [
  'swacalc','swacaamu','swacasu','swacbcu','swacfamu','swacjsu','swacmvsu',
  'swacpvamu','swacsu','swactsu','swacuapb','swacgsu',
  'meacdsu','meachu','meacmsu','meacnccu','meacnsu','meacscsu'
];

// Rushing metrics we aggregate from advanced_team
const RUSHING_METRICS = [
  { key: 'stopped_run_rate', out: 'stopRate' },
  { key: 'stuff_rate', out: 'stuffRate' },
  { key: 'tfl_rate_forced', out: 'tflRate' },
  { key: 'success_rate', out: 'successRate' },
  { key: 'rush_opportunity_rate', out: 'opportunityRate' },
  // power_stop_rate is computed from stopped_run_rate * 0.8 when null
];

function computePowerStopRate(stoppedRunRate) {
  if (typeof stoppedRunRate === 'number' && !isNaN(stoppedRunRate)) {
    return stoppedRunRate * 0.8;
  }
  return null;
}

function avg(arr) {
  if (!arr || arr.length === 0) return null;
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / arr.length;
}

function round4(n) {
  if (n === null || n === undefined || isNaN(n)) return null;
  return Math.round(n * 10000) / 10000;
}

function collectGameFiles() {
  if (!fs.existsSync(GAMES_DIR)) {
    console.error('Games dir not found:', GAMES_DIR);
    process.exit(1);
  }
  return fs.readdirSync(GAMES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(GAMES_DIR, f));
}

function loadGame(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.warn('Failed to parse', filePath, e.message);
    return null;
  }
}

function extractRushingMetrics(advancedObj) {
  const out = {};
  for (const m of RUSHING_METRICS) {
    const v = advancedObj[m.key];
    out[m.out] = (typeof v === 'number' && !isNaN(v)) ? v : null;
  }
  // Compute powerStopRate
  const stopped = out.stopRate;
  out.powerStopRate = computePowerStopRate(stopped);
  return out;
}

function main() {
  const files = collectGameFiles();
  console.log(`Found ${files.length} game files for season ${SEASON}`);

  // Accumulators
  const leagueRushingArrays = {
    stopRate: [], stuffRate: [], tflRate: [],
    successRate: [], opportunityRate: [], powerStopRate: []
  };

  // Per-team accumulators: { teamId: { off: { stopRate: [] }, def: { stopRate: [] } } }
  const teamArrays = {};
  for (const tid of ALL_TEAM_IDS) {
    teamArrays[tid] = {
      off: { stopRate: [], stuffRate: [], tflRate: [], successRate: [], opportunityRate: [], powerStopRate: [] },
      def: { stopRate: [], stuffRate: [], tflRate: [], successRate: [], opportunityRate: [], powerStopRate: [] }
    };
  }

  for (const fp of files) {
    const game = loadGame(fp);
    if (!game) continue;
    const homeId = game.metadata?.home_team?.id;
    const awayId = game.metadata?.away_team?.id;
    const adv = game.advanced_team || {};
    if (!homeId || !awayId) continue;

    const homeAdv = adv[homeId];
    const awayAdv = adv[awayId];
    if (!homeAdv || !awayAdv) continue;

    const homeMetrics = extractRushingMetrics(homeAdv);
    const awayMetrics = extractRushingMetrics(awayAdv);

    // League: all entries from both teams
    for (const m of Object.keys(leagueRushingArrays)) {
      if (homeMetrics[m] !== null) leagueRushingArrays[m].push(homeMetrics[m]);
      if (awayMetrics[m] !== null) leagueRushingArrays[m].push(awayMetrics[m]);
    }

    // Offense: home team is offense for homeMetrics, away team is offense for awayMetrics
    for (const m of Object.keys(homeMetrics)) {
      if (homeMetrics[m] !== null && teamArrays[homeId]) teamArrays[homeId].off[m].push(homeMetrics[m]);
      if (awayMetrics[m] !== null && teamArrays[awayId]) teamArrays[awayId].off[m].push(awayMetrics[m]);
    }

    // Defense: home team defense sees away team offensive stats, and vice versa
    for (const m of Object.keys(awayMetrics)) {
      if (awayMetrics[m] !== null && teamArrays[homeId]) teamArrays[homeId].def[m].push(awayMetrics[m]);
      if (homeMetrics[m] !== null && teamArrays[awayId]) teamArrays[awayId].def[m].push(homeMetrics[m]);
    }
  }

  // Build league_avg output
  const leagueAvg = {
    season: parseInt(SEASON, 10),
    generated_at: new Date().toISOString(),
    rushing: {},
    passing: {}
  };
  for (const m of Object.keys(leagueRushingArrays)) {
    leagueAvg.rushing[m] = round4(avg(leagueRushingArrays[m]));
  }

  // Build team_season_avg output
  const teamSeasonAvg = {
    season: parseInt(SEASON, 10),
    teams: {}
  };
  for (const tid of ALL_TEAM_IDS) {
    const t = {};
    for (const m of Object.keys(teamArrays[tid].off)) {
      t[m] = round4(avg(teamArrays[tid].off[m]));
    }
    teamSeasonAvg.teams[tid] = { rushing: t, passing: {} };
  }

  // Build team_defense_avg output
  const teamDefenseAvg = {
    season: parseInt(SEASON, 10),
    teams: {}
  };
  for (const tid of ALL_TEAM_IDS) {
    const t = {};
    for (const m of Object.keys(teamArrays[tid].def)) {
      t[m] = round4(avg(teamArrays[tid].def[m]));
    }
    teamDefenseAvg.teams[tid] = { rushing: t, passing: {} };
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  fs.writeFileSync(path.join(OUT_DIR, `league_avg_${SEASON}.json`), JSON.stringify(leagueAvg, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, `team_season_avg_${SEASON}.json`), JSON.stringify(teamSeasonAvg, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, `team_defense_avg_${SEASON}.json`), JSON.stringify(teamDefenseAvg, null, 2));

  console.log('Wrote:');
  console.log('  league_avg_' + SEASON + '.json');
  console.log('  team_season_avg_' + SEASON + '.json');
  console.log('  team_defense_avg_' + SEASON + '.json');

  // Quick validation
  console.log('\nLeague rushing averages:');
  console.log(JSON.stringify(leagueAvg.rushing, null, 2));

  const missingOff = ALL_TEAM_IDS.filter(tid => teamSeasonAvg.teams[tid].rushing.stopRate === null);
  const missingDef = ALL_TEAM_IDS.filter(tid => teamDefenseAvg.teams[tid].rushing.stopRate === null);
  if (missingOff.length) console.log('\nTeams missing offensive data:', missingOff);
  if (missingDef.length) console.log('\nTeams missing defensive data:', missingDef);
  if (!missingOff.length && !missingDef.length) console.log('\nAll 18 teams have offensive and defensive data.');
}

main();
