import teamsData from "../../../../data/teams.json";

// Canonical team selector identities and existing season-record display derivation.

export const TEAM_LIST = teamsData.teams.map(t => ({
  id: t.exportId.replace(/25$/, ''),
  exportId: t.exportId,
  short: t.bannerShort ?? t.shortName,
  label: t.name,
  primary: t.colors.primary,
  secondary: t.colors.secondary,
  conference: t.conference,
  division: t.division,
  logo: t.logo,
})).sort((a, b) => a.label.localeCompare(b.label));

export const getStats = (team, seasonGames) => {
  const secondary = team?.colors?.secondary ?? '#FFFFFF';
  const completed   = seasonGames.filter(g => g.result);
  const wins        = completed.filter(g => g.result === 'W').length;
  const losses      = completed.filter(g => g.result === 'L').length;
  const confWins    = completed.filter(g => g.conf_game && g.result === 'W').length;
  const confLosses  = completed.filter(g => g.conf_game && g.result === 'L').length;
  const homeWins    = completed.filter(g => g.home_away === 'home' && g.result === 'W').length;
  const homeLosses  = completed.filter(g => g.home_away === 'home' && g.result === 'L').length;
  const awayWins    = completed.filter(g => g.home_away === 'away' && g.result === 'W').length;
  const awayLosses  = completed.filter(g => g.home_away === 'away' && g.result === 'L').length;
  const pf          = completed.reduce((s, g) => s + Number(g.score_team ?? 0), 0);
  const pa          = completed.reduce((s, g) => s + Number(g.score_opp  ?? 0), 0);

  return [
    { label: 'Overall',     value: `${wins}–${losses}`,         accent: secondary },
    { label: 'Conference',  value: `${confWins}–${confLosses}`                    },
    { label: 'Home',        value: `${homeWins}–${homeLosses}`                    },
    { label: 'Away',        value: `${awayWins}–${awayLosses}`                    },
    { label: 'Pts For',     value: pf > 0 ? pf : '—'                             },
    { label: 'Pts Against', value: pa > 0 ? pa : '—'                             },
  ];
};
