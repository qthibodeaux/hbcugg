import { Text, Box, Grid } from "@chakra-ui/react";
import { tab } from "./leaderboardPresentation";
import { downWords, playWords, swingOf, pctOf } from "./articleModel";
import { teamShortName } from "../../../game/export/exportData";

// Editorial leaderboard play tables, win-chance chart and directional grids.

export const SectionHead = ({ pal, children, mt = "22px" }) => (
  <Text mt={mt} pb="7px" mb="4px" fontSize="14px" fontWeight="900" color={pal.brand} textTransform="uppercase" letterSpacing="0.12em" borderBottom={`3px solid ${pal.brand}`}>{children}</Text>
);

export const PlayTable = ({ pal, list, plays }) => {
  const fg = (a) => `rgba(${pal.fg}, ${a})`;
  const cols = `34px 74px 90px minmax(0,1fr) ${list.swing ? "118px" : "48px 54px"}`;
  return (
    <Box>
      <SectionHead pal={pal}>{list.title}</SectionHead>
      {plays.map((p) => {
        const made = p.scoring_play ? "TD" : p.first_down ? "1ST" : null;
        return (
          <Grid key={p.play_id} templateColumns={cols} columnGap="10px" alignItems="center" minH="36px" py="4px" borderBottom={`1px solid ${fg(0.1)}`}>
            <Text fontSize="14px" fontWeight="900" color={fg(0.55)} {...tab}>Q{p.quarter}</Text>
            <Text fontSize="15px" fontWeight="900" whiteSpace="nowrap" {...tab}>{p.down ? downWords(p) : "—"}</Text>
            <Text fontSize="14px" fontWeight="700" color={fg(0.6)} whiteSpace="nowrap" {...tab}>{p.spot?.display}</Text>
            <Text fontSize="15px" fontWeight="600" lineHeight={1.25}>{playWords(p)}</Text>
            {list.swing ? (
              <Text fontSize="16px" fontWeight="950" textAlign="right" whiteSpace="nowrap" color={swingOf(p) >= 0 ? pal.up : pal.down} {...tab}>{pctOf(p.wp_pre)} → {pctOf(p.wp_after)}</Text>
            ) : (
              <>
                <Text fontSize="17px" fontWeight="950" textAlign="right" {...tab}>{p.yards_gained}</Text>
                <Text fontSize="13px" fontWeight="900" textAlign="right" color={made ? pal.up : pal.down} letterSpacing="0.04em">{made ?? "NO"}</Text>
              </>
            )}
          </Grid>
        );
      })}
    </Box>
  );
};

export const WinChart = ({ pal, game, r, plays, ink }) => {
  const fg = (a) => `rgba(${pal.fg}, ${a})`;
  const line = game?.win_probability?.timeline ?? [];
  if (line.length < 2) return null;
  const isHome = (game.home_team?.team_id ?? game.home_team) === r.team_id;
  const W = 724, H = 230, T = 26, B = 28, L = 40, R = 12;
  const wpOf = (pt) => (isHome ? pt.wp_home : 1 - pt.wp_home);
  const x = (i) => L + (i / (line.length - 1)) * (W - L - R);
  const y = (v) => T + (1 - v) * (H - T - B);
  const at = Object.fromEntries(line.map((pt, i) => [pt.sequence, i]));
  const mine = plays.filter((p) => at[p.sequence] != null);
  const best = [...mine].sort((a, b) => swingOf(b) - swingOf(a))[0];
  const quarters = line.reduce((acc, pt, i) => (acc.length && acc[acc.length - 1].label === pt.period_label ? acc : [...acc, { label: pt.period_label, i }]), []);
  const bi = best ? at[best.sequence] : null;
  const labelLeft = bi != null && bi > line.length * 0.6;
  return (
    <Box>
      <SectionHead pal={pal}>{teamShortName(r.team_id)}'s chance to win</SectionHead>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={fg(v === 0.5 ? 0.3 : 0.1)} strokeWidth="1" strokeDasharray={v === 0.5 ? "4 4" : undefined} />
            <text x={L - 8} y={y(v) + 5} textAnchor="end" fontSize="13" fontWeight="800" fill={fg(0.55)}>{Math.round(v * 100)}%</text>
          </g>
        ))}
        {quarters.map((q) => (
          <g key={q.label}>
            <line x1={x(q.i)} x2={x(q.i)} y1={T} y2={H - B} stroke={fg(0.1)} strokeWidth="1" />
            <text x={x(q.i) + 4} y={H - 10} fontSize="13" fontWeight="800" fill={fg(0.55)}>{q.label}</text>
          </g>
        ))}
        <polyline points={line.map((pt, i) => `${x(i)},${y(wpOf(pt))}`).join(" ")} fill="none" stroke={pal.ink} strokeWidth="2.5" strokeLinejoin="round" />
        {mine.map((p) => <circle key={p.play_id} cx={x(at[p.sequence])} cy={y(wpOf(line[at[p.sequence]]))} r="3.5" fill={ink} opacity="0.85" />)}
        {best && (
          <g>
            <circle cx={x(bi)} cy={y(wpOf(line[bi]))} r="9" fill={pal.brand} stroke={pal.panel} strokeWidth="3" />
            <text x={x(bi) + (labelLeft ? -15 : 15)} y={y(wpOf(line[bi])) + (wpOf(line[bi]) > 0.8 ? 26 : -12)} textAnchor={labelLeft ? "end" : "start"} fontSize="15" fontWeight="900" fill={pal.brand}>
              {pctOf(best.wp_pre)} → {pctOf(best.wp_after)}
            </text>
          </g>
        )}
      </svg>
    </Box>
  );
};

export const Directions = ({ pal, role, line }) => {
  const fg = (a) => `rgba(${pal.fg}, ${a})`;
  const d = line?.direction_breakdown;
  if (!d) return null;
  const DIRS = [["left", "Left"], ["middle", "Mid"], ["right", "Right"]];
  const cell = { bg: fg(0.07), py: "7px", textAlign: "center" };
  if (role === "rushing") {
    return (
      <Box>
        <SectionHead pal={pal}>Where the carries went</SectionHead>
        <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="2px" mt="8px">
          {DIRS.map(([k, label]) => (
            <Box key={k} {...cell}>
              <Text fontSize="12px" fontWeight="900" color={fg(0.55)} textTransform="uppercase">{label}</Text>
              <Text fontSize="24px" fontWeight="950" lineHeight={1.1} {...tab}>{d[k]?.yards ?? 0}</Text>
              <Text fontSize="12px" fontWeight="800" color={fg(0.6)} {...tab}>{d[k]?.attempts ?? 0} car</Text>
            </Box>
          ))}
        </Grid>
      </Box>
    );
  }
  const passing = role === "passing";
  return (
    <Box>
      <SectionHead pal={pal}>{passing ? "Where the throws went" : "Where the targets came"}</SectionHead>
      <Grid templateColumns="52px repeat(3, minmax(0,1fr))" gap="2px" mt="8px" alignItems="center">
        <Box />
        {DIRS.map(([k, label]) => <Text key={k} fontSize="11px" fontWeight="900" color={fg(0.55)} textAlign="center" textTransform="uppercase">{label}</Text>)}
        {[["deep", "Deep"], ["medium", "Med"], ["short", "Short"]].map(([depth, label]) => (
          <Box key={depth} display="contents">
            <Text fontSize="12px" fontWeight="900" color={fg(0.6)} textTransform="uppercase">{label}</Text>
            {DIRS.map(([k]) => {
              const c = d[depth]?.[k] ?? {};
              const made = passing ? c.completions : c.receptions;
              const tried = passing ? c.attempts : c.targets;
              return (
                <Box key={k} {...cell}>
                  <Text fontSize="17px" fontWeight="950" lineHeight={1.05} {...tab}>{c.yards ?? 0}</Text>
                  <Text fontSize="11px" fontWeight="800" color={fg(0.6)} {...tab}>{made ?? 0}/{tried ?? 0}</Text>
                </Box>
              );
            })}
          </Box>
        ))}
      </Grid>
    </Box>
  );
};
