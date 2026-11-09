import { Text, Box, Flex, Image } from "@chakra-ui/react";
import { createContext, useContext } from "react";
import { SectionEyebrow } from "../../../atoms/SectionEyebrow";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RadarShape, Tooltip } from "recharts";

// Existing implementation extracted along responsibility boundaries.

export const PANEL_BG = "bg.secondary";

export const POSITIVE = "#48BB78";

export const NEGATIVE = "#F6AD55";

export const fmt = (value, unit) =>
  !Number.isFinite(value) ? "—" : unit === "pct" ? `${(value * 100).toFixed(1)}%` : value.toFixed(2);

export const Kicker = ({ children, color = "text.muted", ...rest }) => (
  <Text fontSize="9px" fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.13em" lineClamp={1} {...rest}>
    {children}
  </Text>
);

export const SectionFlush = createContext(false);

export const Section = ({ title, right, children, ...rest }) => {
  const flush = useContext(SectionFlush);
  const shape = flush
    ? { borderRadius: 0, border: "none", borderBottom: "1px solid", borderColor: "line", p: "0.75rem" }
    : { border: "1px solid", borderColor: "line", borderRadius: "lg", p: 4 };
  return (
    <Box bg={PANEL_BG} {...shape} {...rest}>
      <SectionEyebrow rightContent={right} dotColor="var(--chakra-colors-brand-500)">{title}</SectionEyebrow>
      {children}
    </Box>
  );
};

const TeamChip = ({ team, active, onClick }) => (
  <Flex
    as="button" onClick={onClick} align="center" gap={1.5} px={2.5} py={1.5} borderRadius="md"
    bg={active ? "brand.500" : "line.subtle"} border="1px solid"
    borderColor={active ? "brand.500" : "line"}
    _hover={{ bg: active ? "brand.500" : "line" }} style={{ transition: "all 0.15s" }} flexShrink={0}
  >
    {team.logo && <Image src={team.logo} alt="" w="14px" h="14px" objectFit="contain" />}
    <Text fontSize="10px" fontWeight="900" color={active ? "white" : "text.secondary"}>{team.short}</Text>
  </Flex>
);

export const TeamPicker = ({ teams, value, onChange, label = "Team" }) => (
  <Box>
    <Kicker mb={2}>{label}</Kicker>
    <Flex gap={1.5} wrap="wrap">
      {Object.values(teams).map((t) => (
        <TeamChip key={t.identity.id} team={t.identity} active={value === t.identity.id} onClick={() => onChange(t.identity.id)} />
      ))}
    </Flex>
  </Box>
);

export const Radar = ({ axes, series, size = 210, compact = false }) => {
  const data = axes.map((a, i) => {
    const row = { axis: a.label };
    series.forEach((sr, si) => {
      row[`s${si}`] = Number.isFinite(sr.values[i]) ? sr.values[i] : 0;
    });
    return row;
  });
  return (
    <Box w="100%">
      {series.length > 1 && (
        <Flex justify="center" gap={4} mb={1}>
          {series.map((sr) => (
            <Flex key={sr.label} align="center" gap={1.5}>
              <Box w="10px" h="3px" borderRadius="full" bg={sr.color} />
              <Kicker color="text.muted">{sr.label}</Kicker>
            </Flex>
          ))}
        </Flex>
      )}
      <Box w="100%" h={`${size}px`}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius={compact ? "62%" : "68%"} margin={compact ? { top: 4, right: 4, bottom: 4, left: 4 } : { top: 8, right: 8, bottom: 8, left: 8 }}>
            <PolarGrid stroke="var(--gg-line-strong)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: compact ? "var(--gg-text-secondary)" : "var(--gg-text-secondary)", fontSize: compact ? "0.62rem" : 9, fontWeight: 800 }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            {series.map((sr, si) => (
              <RadarShape
                key={sr.label}
                name={sr.label}
                dataKey={`s${si}`}
                stroke={sr.color}
                fill={sr.color}
                fillOpacity={0.22}
                strokeWidth={2}
                isAnimationActive={false}
              />
            ))}
            <Tooltip
              cursor={false}
              formatter={(v) => `${Math.round(v)}th`}
              contentStyle={{
                background: "var(--gg-bg-secondary)",
                border: "1px solid var(--gg-line-strong)",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 800,
              }}
              labelStyle={{ color: "var(--gg-text-secondary)", fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}
              itemStyle={{ color: "var(--gg-text-primary)" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export const RankChip = ({ rank, total }) => {
  if (!Number.isFinite(rank)) return null;
  const good = rank <= total / 2;
  const strength = Math.min(1, Math.abs(rank - (total + 1) / 2) / ((total - 1) / 2));
  const alpha = (0.14 + strength * 0.4).toFixed(2);
  return (
    <Box px={1.5} py={0.5} borderRadius="sm" bg={good ? `rgba(34,197,94,${alpha})` : `rgba(168,85,247,${alpha})`} flexShrink={0}>
      <Text fontSize="9px" fontWeight="900" color="text.primary" fontVariantNumeric="tabular-nums">#{rank}</Text>
    </Box>
  );
};

export const buildRanks = (hub, season, fields) => {
  const map = {};
  fields.forEach((f) => {
    const sorted = Object.values(hub.teams ?? {})
      .map((t) => ({ id: t.identity.id, p: t.seasons?.[season]?.percentiles?.[f] }))
      .filter((x) => Number.isFinite(x.p))
      .sort((a, b) => b.p - a.p);
    map[f] = Object.fromEntries(sorted.map((x, i) => [x.id, i + 1]));
  });
  return map;
};
