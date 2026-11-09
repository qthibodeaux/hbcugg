import { pickAccent, buildModel } from "./statsOverview/overviewModel";
import { Flex, Text, Grid, Box } from "@chakra-ui/react";
import { TYPE, SECTION_GAP, PANEL_BG, PANEL_BORDER, Panel, SectionHead, ROW_GAP, StatNum, POSITIVE, NEGATIVE, StatLabel } from "./statsOverview/OverviewPrimitives";
import { SnapshotCard } from "./statsOverview/SnapshotCard";
import { ProductionBlock, GameRange } from "./statsOverview/ProductionRange";
import { MetricRow, Sparkline, MomentRow } from "./statsOverview/OverviewTracks";
import { Star, TrendingDown, Flame } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
export const PlayerStatsOverview = ({ player, teamMeta, positionPeers = [], primary, secondary }) => {
  const base = primary ?? teamMeta?.colors?.primary ?? "#4B0082";
  const accent = pickAccent(base, secondary ?? teamMeta?.colors?.secondary);
  const m = buildModel(player, positionPeers, teamMeta);

  if (!m.rows.length && !m.totalProduction) {
    return (
      <Flex align="center" justify="center" minH="12rem">
        <Text fontSize={TYPE.title} fontWeight="900" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.06em">
          No production data for this season
        </Text>
      </Flex>
    );
  }

  const scaleMax = Math.max(...m.blocks.map((b) => b.production), 1) * 1.15;
  const lead = m.blocks[0];

  // MOCK - share/role fields do not exist in any data source yet.
  const role = [
    { label: "Team Production", pct: 71, value: "71%" },
    { label: "Dropback Share", pct: 84, value: "84%" },
    { label: "Snap Share", pct: 91, value: "91%" },
  ];

  return (
    <Flex direction="column" gap={SECTION_GAP}>
      {/* ── SEASON SNAPSHOT ── */}
      <Grid templateColumns={{ base: "1fr", lg: "repeat(3, minmax(0, 1fr))" }} gap={2}>
        <SnapshotCard
          base={base}
          accent={accent}
          hero={m.totalProduction.toFixed(1)}
          heroLabel="Total Production"
          metrics={m.blocks.slice(0, 3).map((b) => ({
            label: `${b.label} Prod`,
            value: b.production.toFixed(1),
            pct: m.totalProduction ? (b.production / m.totalProduction) * 100 : 0,
          }))}
        />
        <SnapshotCard
          base={base}
          accent={accent}
          hero={m.parPerGame.toFixed(1)}
          heroLabel="PAR per game"
          metrics={[
            { label: "Season PAR", value: m.par.toFixed(1), pct: m.parPercentile ?? 50 },
            { label: "Replacement", value: m.replacement.toFixed(1), pct: m.totalProduction ? (m.replacement / m.totalProduction) * 100 : 0 },
            { label: "Prod / Game", value: m.avgProduction.toFixed(1), pct: m.prodPercentile ?? 50 },
          ]}
        />
        <SnapshotCard base={base} accent={accent} hero={`${role[0].pct}%`} heroLabel="of team production" metrics={role.slice(1)} />
      </Grid>

      {/* ── PRODUCTION BLOCKS ── */}
      <Box bg={PANEL_BG} border="1px solid" borderColor={PANEL_BORDER} borderRadius="md" overflow="hidden">
        {m.blocks.map((b, i) => (
          <ProductionBlock key={b.key} block={b} scaleMax={scaleMax} accent={accent} isFirst={i === 0} />
        ))}
      </Box>

      {/* ── PERFORMANCE PROFILE + ROLE ── */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={SECTION_GAP}>
        <Panel>
          <SectionHead accent={accent}>Performance Profile</SectionHead>
          <MetricRow
            label="PAR / Game"
            display={`${m.parPerGame >= 0 ? "+" : ""}${m.parPerGame.toFixed(1)}`}
            amount={m.parPerGame}
            accent={accent}
            min={Math.min(-8, m.parPerGame * 1.2)}
            max={Math.max(24, m.parPerGame * 1.25)}
            baseline={0}
          />
          <MetricRow
            label="Production / Game"
            display={m.avgProduction.toFixed(1)}
            amount={m.avgProduction}
            accent={accent}
            min={0}
            max={Math.max(30, m.avgProduction * 1.3)}
            baseline={m.replacement / Math.max(1, m.gamesPlayed)}
          />
          {lead && (
            <MetricRow
              label={`${lead.label} Production`}
              display={lead.production.toFixed(1)}
              amount={lead.production}
              accent={accent}
              min={0}
              max={scaleMax}
              baseline={lead.replacement}
              mb={0}
            />
          )}
        </Panel>

        <Panel>
          <SectionHead accent={accent}>Role</SectionHead>
          {role.map((r, i) => (
            <MetricRow
              key={r.label}
              label={r.label}
              display={r.value}
              amount={r.pct}
              accent={accent}
              min={0}
              max={100}
              mb={i === role.length - 1 ? 0 : ROW_GAP}
            />
          ))}
        </Panel>
      </Grid>

      {/* ── FORM + GAME RANGE ── */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={SECTION_GAP}>
        <Panel>
          <SectionHead
            accent={accent}
            right={<StatNum color={m.form.delta >= 0 ? POSITIVE : NEGATIVE}>{m.form.delta >= 0 ? "+" : ""}{m.form.pct}%</StatNum>}
          >
            Form
          </SectionHead>
          <Flex gap={5}>
            <Box>
              <StatNum>{m.form.last3.toFixed(1)}</StatNum>
              <StatLabel mt={0.5}>Last 3 PAR</StatLabel>
            </Box>
            <Box>
              <StatNum>{m.form.last5.toFixed(1)}</StatNum>
              <StatLabel mt={0.5}>Last 5 PAR</StatLabel>
            </Box>
          </Flex>
          <Sparkline series={m.form.rolling} accent={accent} />
          <Flex justify="space-between" gap={1}>
            {m.rows.map((g, i) => (
              <StatLabel key={`${g.opp}-${i}`} color="whiteAlpha.400">{g.opp}</StatLabel>
            ))}
          </Flex>
        </Panel>

        <Panel>
          <SectionHead accent={accent}>Game Range</SectionHead>
          <GameRange range={m.range} rows={m.rows} accent={accent} gamesPlayed={m.gamesPlayed} />
        </Panel>
      </Grid>

      {/* ── SIGNATURE MOMENTS ── */}
      <Box>
        <SectionHead accent={accent}>Signature Moments</SectionHead>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, minmax(0, 1fr))" }} gap={2}>
          <MomentRow icon={Star} tone={POSITIVE} label="Best Game" game={m.best} value={m.best ? `${m.best.total.toFixed(1)}` : "—"} />
          <MomentRow icon={TrendingDown} tone={NEGATIVE} label="Worst Game" game={m.worst} value={m.worst ? `${m.worst.total.toFixed(1)}` : "—"} />
          <MomentRow icon={Flame} tone={accent} label="Most Recent" game={m.rows[m.rows.length - 1]} value={m.rows.length ? `${m.rows[m.rows.length - 1].total.toFixed(1)}` : "—"} />
        </Grid>
      </Box>
    </Flex>
  );
};

export default PlayerStatsOverview;

export { pickAccent, percentileOf, buildModel } from "./statsOverview/overviewModel";
