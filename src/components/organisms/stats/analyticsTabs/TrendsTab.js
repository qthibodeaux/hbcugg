import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { Kicker, Section } from "./AnalyticsPrimitives";
import { useMemo, useState } from "react";
import { trendMetricGroups, trendMetric, trendField, buildTrendRows, fmtTrend } from "../../../../pages/analytics/trendSeries";
import { useTeamAnalyticsGames } from "../../../../hooks/useTeamAnalyticsData";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";
import { readableTeamColor } from "../../../../utils/teamColor";

// Existing implementation extracted along responsibility boundaries.

const TREND_LEAGUE = "var(--gg-text-muted)";

const TREND_CONF = "var(--gg-text-muted)";

const MAX_TREND_TEAMS = 5;

const Select = ({ label, value, onChange, children }) => (
  <Box flex="1" minW="9rem">
    <Kicker mb={1}>{label}</Kicker>
    <Box as="select" value={value} onChange={(e) => onChange(e.target.value)}
      bg="line" color="text.primary" fontSize="11px" fontWeight="700" borderRadius="md" px={2} py={1.5}
      border="1px solid" borderColor="line.strong" w="100%">
      {children}
    </Box>
  </Box>
);

const Check = ({ on, onToggle, color, children }) => (
  <Flex as="button" onClick={onToggle} align="center" gap={2} px={2.5} py={1.5} borderRadius="md"
    bg={on ? "line" : "transparent"} border="1px solid" borderColor={on ? "line.strong" : "line"}
    _hover={{ bg: "line" }} flexShrink={0}>
    <Box w="10px" h="2px" borderRadius="full" bg={on ? color : "line.strong"} />
    <Kicker color={on ? "text.primary" : "text.muted"}>{children}</Kicker>
  </Flex>
);

export const TrendsTab = ({ hub, teamId, season, games = [] }) => {
  const groups = useMemo(() => trendMetricGroups(hub), [hub]);
  const [metricKey, setMetricKey] = useState("rating");
  const [side, setSide] = useState("offense");
  const [mode, setMode] = useState("season");
  const [showLeague, setShowLeague] = useState(true);
  const [showConf, setShowConf] = useState(false);
  // The picked list is the whole truth — the sidebar's team only seeds it.
  // Switching teams over there brings that team onto the chart (derived
  // during render, no effect), but any team can then be taken off again as
  // long as one is left.
  const [picked, setPicked] = useState([teamId]);
  const [seeded, setSeeded] = useState(teamId);
  if (seeded !== teamId) {
    setSeeded(teamId);
    setPicked((list) => (list.includes(teamId) ? list : [teamId, ...list].slice(0, MAX_TREND_TEAMS)));
  }

  const teamIds = picked.slice(0, MAX_TREND_TEAMS);
  const teams = teamIds.map((id) => hub.teams?.[id]?.identity).filter(Boolean);
  const metric = trendMetric(hub, metricKey);
  const field = trendField(metricKey, side);
  const conference = teams[0]?.conference ?? null;

  const seasonGames = useTeamAnalyticsGames(season).teams;
  const rows = useMemo(
    () => buildTrendRows(hub, { teams, field, mode, season, seasonGames, conference: showConf ? conference : null }),
    [hub, teams, field, mode, season, seasonGames, showConf, conference],
  );

  const all = Object.values(hub.teams ?? {}).map((t) => t.identity).sort((a, b) => a.name.localeCompare(b.name));
  const toggleTeam = (id) => {
    setPicked((list) => {
      if (!list.includes(id)) return [...list, id].slice(-MAX_TREND_TEAMS);
      // Never leave the chart with nothing on it.
      return list.length > 1 ? list.filter((x) => x !== id) : list;
    });
  };

  return (
    <Flex direction="column" gap={4}>
      <Section
        title={`${metric.label}${metric.sideless ? "" : ` · ${side === "defense" ? "Defense" : "Offense"}`}`}
        right={<Kicker color="text.muted">{mode === "week" ? `${season} · game by game` : "By season"}</Kicker>}
      >
        <Flex gap={3} wrap="wrap" align="flex-end">
          <Select label="Metric" value={metricKey} onChange={setMetricKey}>
            {groups.map((g) => (
              <optgroup key={g.label} label={g.label} style={{ background: "var(--gg-bg-secondary)" }}>
                {g.options.map((o) => (
                  <option key={o.key} value={o.key} style={{ background: "var(--gg-bg-secondary)" }}>{o.label}</option>
                ))}
              </optgroup>
            ))}
          </Select>
          <Select label="Side" value={metric.sideless ? "" : side} onChange={setSide}>
            {metric.sideless ? (
              <option value="">Team</option>
            ) : (
              <>
                <option value="offense" style={{ background: "var(--gg-bg-secondary)" }}>Offense</option>
                <option value="defense" style={{ background: "var(--gg-bg-secondary)" }}>Defense</option>
              </>
            )}
          </Select>
          <Select label="Timeline" value={mode} onChange={setMode}>
            <option value="season" style={{ background: "var(--gg-bg-secondary)" }}>Season to season</option>
            <option value="week" style={{ background: "var(--gg-bg-secondary)" }}>Game by game ({season})</option>
          </Select>
          <Flex gap={2} pb={0.5}>
            <Check on={showLeague} onToggle={() => setShowLeague((v) => !v)} color={TREND_LEAGUE}>League avg</Check>
            <Check on={showConf} onToggle={() => setShowConf((v) => !v)} color={TREND_CONF}>{conference ?? "Conf"} avg</Check>
          </Flex>
        </Flex>

        <Box w="100%" h={{ base: "260px", md: "360px" }} mt={4}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="var(--gg-line)" />
              <XAxis dataKey="x" tick={{ fill: "var(--gg-text-secondary)", fontSize: 10, fontWeight: 800 }} tickLine={false} axisLine={{ stroke: "var(--gg-line-strong)" }} />
              <YAxis
                width={50} domain={["auto", "auto"]} tickLine={false} axisLine={false}
                tick={{ fill: "var(--gg-text-muted)", fontSize: 10, fontWeight: 800 }}
                tickFormatter={(v) => fmtTrend(v, metric.unit)}
              />
              <Tooltip
                formatter={(v, name) => [fmtTrend(v, metric.unit), name]}
                contentStyle={{ background: "var(--gg-bg-secondary)", border: "1px solid var(--gg-line-strong)", borderRadius: 8, fontSize: 11, fontWeight: 800 }}
                labelStyle={{ color: "var(--gg-text-secondary)", fontSize: 10, fontWeight: 900 }}
                itemStyle={{ color: "var(--gg-text-primary)" }}
              />
              {showLeague && (
                <Line type="linear" dataKey="__league" name="League" stroke={TREND_LEAGUE} strokeDasharray="5 5" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              )}
              {showConf && (
                <Line type="linear" dataKey="__conference" name={`${conference ?? "Conf"} avg`} stroke={TREND_CONF} strokeDasharray="2 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              )}
              {teams.map((t) => {
                // A black primary is invisible as a line here — see utils/teamColor.
                const stroke = readableTeamColor(t);
                return (
                  <Line key={t.id} type="linear" dataKey={t.id} name={t.short} stroke={stroke}
                    strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: stroke }} connectNulls isAnimationActive={false} />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Flex gap={4} wrap="wrap" mt={2}>
          {teams.map((t) => (
            <Flex key={t.id} align="center" gap={1.5}>
              <Box w="12px" h="3px" borderRadius="full" bg={readableTeamColor(t)} />
              <Kicker color="text.secondary">{t.short}</Kicker>
            </Flex>
          ))}
        </Flex>
      </Section>

      <Section title="Compare" right={<Kicker color="text.muted">{teamIds.length} of {MAX_TREND_TEAMS}</Kicker>}>
        <Flex gap={1.5} wrap="wrap">
          {all.map((t) => {
            const on = teamIds.includes(t.id);
            const last = on && teamIds.length === 1;
            return (
              <Flex key={t.id} as="button" onClick={() => toggleTeam(t.id)} align="center" gap={1.5} px={2.5} py={1.5} borderRadius="md"
                title={last ? "The chart needs at least one team" : undefined}
                cursor={last ? "default" : "pointer"}
                bg={on ? t.primary ?? "brand.500" : "line.subtle"} border="1px solid"
                borderColor={on ? t.secondary ?? "line.strong" : "line"}
                _hover={{ bg: on ? t.primary ?? "brand.500" : "line" }} flexShrink={0}>
                {t.logo && <Image src={t.logo} alt="" w="14px" h="14px" objectFit="contain" />}
                <Text fontSize="10px" fontWeight="900" color={on ? "white" : "text.secondary"}>{t.short}</Text>
              </Flex>
            );
          })}
        </Flex>
      </Section>

      <Section title="The numbers" right={<Kicker color="text.muted">{metric.label}</Kicker>}>
        <Box overflowX="auto">
          <Box as="table" w="100%" style={{ borderCollapse: "collapse" }}>
            <Box as="thead">
              <Box as="tr">
                <Box as="th" textAlign="left" pb={2} borderBottom="1px solid" borderColor="line">
                  <Kicker color="text.muted">{mode === "week" ? "Game" : "Season"}</Kicker>
                </Box>
                {teams.map((t) => (
                  <Box as="th" key={t.id} textAlign="right" pb={2} pl={3} borderBottom="1px solid" borderColor="line">
                    <Kicker color={readableTeamColor(t)}>{t.short}</Kicker>
                  </Box>
                ))}
                {showLeague && (
                  <Box as="th" textAlign="right" pb={2} pl={3} borderBottom="1px solid" borderColor="line">
                    <Kicker color="text.muted">League</Kicker>
                  </Box>
                )}
                {showConf && (
                  <Box as="th" textAlign="right" pb={2} pl={3} borderBottom="1px solid" borderColor="line">
                    <Kicker color="text.muted">{conference ?? "Conf"}</Kicker>
                  </Box>
                )}
              </Box>
            </Box>
            <Box as="tbody">
              {rows.map((r) => (
                <Box as="tr" key={r.x}>
                  <Box as="td" py={1.5} borderBottom="1px solid" borderColor="line.subtle">
                    <Text fontSize="11px" fontWeight="900" color="text.primary" fontVariantNumeric="tabular-nums">{r.x}</Text>
                  </Box>
                  {teams.map((t) => (
                    <Box as="td" key={t.id} textAlign="right" pl={3} py={1.5} borderBottom="1px solid" borderColor="line.subtle">
                      <Text fontSize="11px" fontWeight="800" color="text.primary" fontVariantNumeric="tabular-nums">
                        {fmtTrend(r[t.id], metric.unit)}
                      </Text>
                    </Box>
                  ))}
                  {showLeague && (
                    <Box as="td" textAlign="right" pl={3} py={1.5} borderBottom="1px solid" borderColor="line.subtle">
                      <Text fontSize="11px" fontWeight="800" color="text.muted" fontVariantNumeric="tabular-nums">
                        {fmtTrend(r.__league, metric.unit)}
                      </Text>
                    </Box>
                  )}
                  {showConf && (
                    <Box as="td" textAlign="right" pl={3} py={1.5} borderBottom="1px solid" borderColor="line.subtle">
                      <Text fontSize="11px" fontWeight="800" color="text.muted" fontVariantNumeric="tabular-nums">
                        {fmtTrend(r.__conference, metric.unit)}
                      </Text>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Section>
    </Flex>
  );
};
