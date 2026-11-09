import { TileConfig, Rotator, SlideStage, Mark, TileMobile, Empty, POS, NEG, WideLogo, WideNum, WideLabel, hfs, Context } from "./TilePrimitives";
import { Flex, Box, Text } from "@chakra-ui/react";
import { useContext, useMemo, useState } from "react";
import { matchupTable, MATCHUP_FIELDS } from "../../../../pages/analytics/matchupMetrics";

const MATCHUP_TILE_STATS = [
  { key: "net_epa", label: "EPA / Play" },
  { key: "o_success", label: "Success Rate" },
  { key: "net_epa_drive", label: "EPA / Drive" },
  { key: "net_fp", label: "Field Position" },
];

const MATCHUP_POOL_SIZE = 4;

const fmtDiff = (v, unit) => {
  if (!Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : v < 0 ? "-" : "";
  const mag = Math.abs(v);
  if (unit === "pct") return `${sign}${(mag * 100).toFixed(1)}%`;
  if (unit === "num1" || unit === "fp") return `${sign}${mag.toFixed(1)}`;
  return `${sign}${mag.toFixed(2)}`;
};

const Band = ({ transition, baseMs, count, onTick, cycle, flex = 1, divider = false, wide = false, children }) => (
  <TileConfig.Provider value={{ rotateMs: baseMs, transition }}>
    <Flex
      direction="column" flex={flex} minH={0} minW={0} position="relative"
      {...(divider ? (wide ? { borderLeft: "1px solid" } : { borderTop: "1px solid" }) : {})} borderColor="whiteAlpha.200"
    >
      <Rotator count={count} onTick={onTick} baseMs={baseMs} />
      <SlideStage cycle={cycle}>{children}</SlideStage>
    </Flex>
  </TileConfig.Provider>
);

const TeamFace = ({ team, side }) => (
  <Flex position="relative" flex={1} minH={0} align="center" justify="center" overflow="hidden">
    <Box
      position="absolute" opacity={0.16} pointerEvents="none"
      {...(side === "top" ? { left: "-9cqmin", top: "-7cqmin" } : { right: "-9cqmin", bottom: "-7cqmin" })}
    >
      <Mark logo={team.identity.logo} label={team.identity.short} size={30} />
    </Box>
    <Box position="relative">
      <Mark logo={team.identity.logo} label={team.identity.short} size={11} />
    </Box>
  </Flex>
);

export const MatchupBody = ({ hub, season }) => {
  const mobile = useContext(TileMobile);
  // Random on load: a fresh four every time the strip mounts.
  const pool = useMemo(() => {
    const rows = Object.values(hub.teams ?? {}).filter((t) => t.seasons?.[season]);
    for (let i = rows.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [rows[i], rows[j]] = [rows[j], rows[i]];
    }
    return rows.slice(0, MATCHUP_POOL_SIZE);
  }, [hub.teams, season]);
  const tape = useMemo(() => matchupTable(hub, season), [hub, season]);

  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(1);
  const [stat, setStat] = useState(0);

  if (pool.length < 2) return <Empty>No season on file</Empty>;

  const n = pool.length;
  const a = pool[top % n];
  // The bottom band runs its own clock but never lands on the team up top.
  const b = pool[bottom % n === top % n ? (bottom + 1) % n : bottom % n];
  const st = MATCHUP_TILE_STATS[stat % MATCHUP_TILE_STATS.length];

  const unit = MATCHUP_FIELDS[st.key]?.unit;
  const va = tape.values[a.identity.id]?.[st.key];
  const vb = tape.values[b.identity.id]?.[st.key];
  const diff = Number.isFinite(va) && Number.isFinite(vb) ? va - vb : undefined;
  // Raw sign, from the top team's point of view; colour says who is better.
  const better = MATCHUP_FIELDS[st.key]?.high ? diff > 0 : diff < 0;
  const tone = !Number.isFinite(diff) || diff === 0 ? "rgba(255,255,255,0.75)" : better ? POS : NEG;

  // Wide: the three bands sit side by side — team, the gap, team.
  if (mobile) {
    return (
      <Flex flex={1} minH={0} minW={0} h="100%">
        <Band wide transition="push" baseMs={6000} count={n} cycle={top} flex={0.8} onTick={() => setTop((v) => (v + 1) % n)}>
          <Flex flex={1} align="center" justify="center"><WideLogo team={a.identity} size="2.5rem" /></Flex>
        </Band>
        <Band wide divider transition="flip" baseMs={9000} flex={1.4} count={MATCHUP_TILE_STATS.length} cycle={stat} onTick={() => setStat((v) => (v + 1) % MATCHUP_TILE_STATS.length)}>
          <Flex direction="column" flex={1} align="center" justify="center" gap="0.3rem" minW={0} px="0.3rem">
            <WideNum key={`${a.identity.id}-${b.identity.id}-${st.key}`} className="ta-tile-val" color={tone} size="1.7rem">{fmtDiff(diff, unit)}</WideNum>
            <WideLabel textAlign="center">{st.label}</WideLabel>
          </Flex>
        </Band>
        <Band wide divider transition="cube" baseMs={7500} count={n} cycle={bottom} flex={0.8} onTick={() => setBottom((v) => (v + 1) % n)}>
          <Flex flex={1} align="center" justify="center"><WideLogo team={b.identity} size="2.5rem" /></Flex>
        </Band>
      </Flex>
    );
  }

  return (
    <Flex direction="column" flex={1} minH={0} minW={0}>
      <Band transition="push" baseMs={6000} count={n} cycle={top} onTick={() => setTop((v) => (v + 1) % n)}>
        <TeamFace team={a} side="top" />
      </Band>

      <Band
        transition="flip" baseMs={9000} flex={1.15} divider
        count={MATCHUP_TILE_STATS.length} cycle={stat}
        onTick={() => setStat((v) => (v + 1) % MATCHUP_TILE_STATS.length)}
      >
        <Flex direction="column" flex={1} minH={0} align="center" justify="center" textAlign="center" px="1cqmin">
          <Text
            key={`${a.identity.id}-${b.identity.id}-${st.key}`}
            className="ta-tile-val"
            fontSize={hfs(10.5)} fontWeight="black" fontStyle="italic" color={tone}
            lineHeight={0.9} letterSpacing="-0.05em" fontVariantNumeric="tabular-nums" lineClamp={1}
          >
            {fmtDiff(diff, unit)}
          </Text>
          <Context mt="1cqmin" color="rgba(255,255,255,0.7)" textAlign="center">{st.label}{mobile ? "" : " diff"}</Context>
        </Flex>
      </Band>

      <Band transition="cube" baseMs={7500} divider count={n} cycle={bottom} onTick={() => setBottom((v) => (v + 1) % n)}>
        <TeamFace team={b} side="bottom" />
      </Band>
    </Flex>
  );
};
