import { fmtSigned, TileMobile, Empty, Body, Rotator, TileTitle, WideRow, WideLogo, WideStat, Mark, hfs, Context, fmtMetric, tfs, BRAND } from "./TilePrimitives";
import { useContext, useMemo, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

const adv = (r, k) => {
  const v = r?.advanced?.offense?.[k];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
};

const PROFILE_STATS = [
  { id: "record", label: null, value: (r) => r.record?.pct, text: (r) => r.record?.record ?? "—" },
  { id: "adj_epa", label: "Adj EPA / Play", value: (r) => adv(r, "adj_epa_per_play"), text: (r) => fmtSigned(adv(r, "adj_epa_per_play"), 2) },
  { id: "epa", label: "EPA / Play", value: (r) => adv(r, "epa_per_play"), text: (r) => fmtSigned(adv(r, "epa_per_play"), 2) },
  { id: "expl", label: "Explosive Rate", value: (r) => adv(r, "explosive_rate"), text: (r) => (adv(r, "explosive_rate") != null ? `${Math.round(adv(r, "explosive_rate") * 100)}%` : "—") },
  { id: "sr", label: "Success Rate", value: (r) => adv(r, "success_rate"), text: (r) => (adv(r, "success_rate") != null ? `${Math.round(adv(r, "success_rate") * 100)}%` : "—") },
  { id: "rating", label: "Team Rating", value: (r) => r.rating, text: (r) => r.rating_display ?? fmtSigned(r.rating, 3) },
];

export const ProfileBody = ({ hub, season }) => {
  const mobile = useContext(TileMobile);
  const slides = useMemo(() => {
    const rows = Object.values(hub.teams ?? {})
      .map((t) => ({ team: t, row: t.seasons?.[season] ?? null }))
      .filter((x) => x.row);
    return PROFILE_STATS.map((stat) => {
      const leader = rows
        .filter((x) => Number.isFinite(stat.value(x.row)))
        .sort((a, b) => stat.value(b.row) - stat.value(a.row))[0];
      return leader ? { stat, team: leader.team, row: leader.row } : null;
    }).filter(Boolean);
  }, [hub.teams, season]);
  const [i, setI] = useState(0);
  if (!slides.length) return <Empty>No season on file</Empty>;
  const { stat, team, row } = slides[i % slides.length];
  return (
    <Body
      cycle={i}
      live={slides.length > 1}
      top={
        <>
          <Rotator count={slides.length} onTick={() => setI((v) => (v + 1) % slides.length)} />
          <TileTitle>Leader</TileTitle>

        </>
      }
    >
      {mobile ? (
        <WideRow><WideLogo team={team.identity} size="2.9rem" /><WideStat value={stat.text(row)} label={stat.label} size="2.1rem" /></WideRow>
      ) : (
      <Box position="relative" flex={1} minH="36cqmin" minW={0}>
        <Flex position="absolute" inset={0} align="center" justify="center" opacity={0.2} pointerEvents="none">
          <Mark logo={team.identity.logo} label={team.identity.short} size={46} />
        </Flex>
        <Flex position="relative" direction="column" align="center" justify="center" h="100%" minW={0} textAlign="center">
          <Text fontSize={hfs(stat.id === "record" ? 16 : 14)} fontWeight="black" fontStyle="italic" color="white" lineHeight={0.9} letterSpacing="-0.05em" fontVariantNumeric="tabular-nums" lineClamp={1} textShadow="0 0 2cqmin rgba(0,0,0,0.8)">
            {stat.text(row)}
          </Text>
          {stat.label && <Context mt="1cqmin" color="rgba(255,255,255,0.8)" textAlign="center">{stat.label}</Context>}
        </Flex>
      </Box>
      )}
    </Body>
  );
};

export const BoardBody = ({ hub, season }) => {
  const mobile = useContext(TileMobile);
  const slides = useMemo(() => {
    const rows = Object.values(hub.teams ?? {})
      .map((t) => ({ t, s: t.seasons?.[season] }))
      .filter((x) => x.s);
    const columns = [
      { key: "rating", label: "Team Rating", value: (x) => x.s.rating, text: (x) => x.s.rating_display ?? fmtSigned(x.s.rating, 3), good: true },
      ...(hub.levers ?? []).slice(0, 5).map((l) => ({
        key: l.field,
        label: l.short,
        value: (x) => x.s.metrics?.[l.field],
        text: (x) => fmtMetric(x.s.metrics?.[l.field], l.unit),
        good: l.good,
      })),
    ];
    return columns
      .map((c) => {
        const leader = rows
          .filter((x) => Number.isFinite(c.value(x)))
          .sort((a, b) => (c.good ? c.value(b) - c.value(a) : c.value(a) - c.value(b)))[0];
        return leader ? { column: c, ...leader } : null;
      })
      .filter(Boolean);
  }, [hub.teams, hub.levers, season]);
  const [i, setI] = useState(0);
  if (!slides.length) return <Empty>No season on file</Empty>;
  const { column, t, s: row } = slides[i % slides.length];
  return (
    <Body
      cycle={i}
      live={slides.length > 1}
      top={
        <>
          <Rotator count={slides.length} onTick={() => setI((v) => (v + 1) % slides.length)} />
          <TileTitle>Rankings</TileTitle>
        </>
      }
    >
      {mobile ? (
        <WideRow><WideLogo team={t.identity} size="2.9rem" /><WideStat value={column.text({ t, s: row })} label={`#1 · ${column.label}`} size="2.1rem" /></WideRow>
      ) : (
      <Box position="relative" flex={1} minH="36cqmin" minW={0}>
        <Flex position="absolute" inset={0} align="center" justify="center" opacity={0.2} pointerEvents="none">
          <Mark logo={t.identity.logo} label={t.identity.short} size={46} />
        </Flex>
        <Flex position="relative" direction="column" align="center" justify="center" h="100%" minW={0} textAlign="center">
          <Text fontSize={hfs(14)} fontWeight="black" fontStyle="italic" color="white" lineHeight={0.9} letterSpacing="-0.05em" fontVariantNumeric="tabular-nums" lineClamp={1} textShadow="0 0 2cqmin rgba(0,0,0,0.8)">
            {column.text({ t, s: row })}
          </Text>
          <Context mt="1cqmin" color="rgba(255,255,255,0.8)" textAlign="center">{column.label}</Context>
          {!mobile && <Text fontSize={tfs(5)} fontWeight="black" fontStyle="italic" color={BRAND} lineHeight={1} mt="1cqmin" fontVariantNumeric="tabular-nums">#1</Text>}
        </Flex>
      </Box>
      )}
    </Body>
  );
};
