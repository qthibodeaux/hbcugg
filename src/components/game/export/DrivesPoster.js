import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Poster, PosterTitle, PosterBanner, CARD_BG, HAIRLINE, WIDE_W, WIDE_H } from "./PosterChrome";
import { buildHeader, buildBiggestPlays, teamAccent, teamLogo, teamShort, teamName, teamMeta, withAlpha, teamFillColors, contrast, signed1, signed2, asNum, DASH } from "./exportData";
import { ChainsMovedCard, SeriesResultsCard } from "../page/summary/SeriesCards";
import { DriveFieldStrip } from "../page/drives/DriveFieldStrip";
import { toDriveRow } from "../../../utils/gameSummary/driveRows";
import { getColorScheme } from "../../../theme/colorScheme";

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE 2 — DRIVES & SITUATIONS
// ═══════════════════════════════════════════════════════════════════════════════
// The two series bars (`series_summary`), then every drive (`drive_summary`) in two team
// columns, then the offense EPA breakdown and the biggest plays (best left, worst right).

const Card = ({ children, ...props }) => (
  <Box bg={CARD_BG} boxShadow="var(--gg-poster-shadow)" borderRadius="1rem" border="0.0625rem solid" borderColor={HAIRLINE} px="1.5rem" py="1rem" {...props}>
    {children}
  </Box>
);

// Three small cards side by side: EPA (dropback, run, offense), success rate (pass, run,
// total) and explosive plays (plays, yards). Away team on top, home below. The card's title
// shares a line with the column heads, so each card is three short lines.
const TrioCard = ({ title, accent, cols, rows }) => {
  const template = `minmax(0, 1fr) repeat(${cols.length}, 3.25rem)`;
  return (
    <Card px="1rem" py="0.5rem">
      <Grid templateColumns={template} columnGap="0.25rem" alignItems="end" pb="0.25rem" borderBottom="0.0625rem solid" borderColor="rgba(var(--gg-fg), calc(0.1 + var(--gg-line-boost, 0)))">
        <Flex align="center" gap="0.5rem" minW={0}>
          <Box w="0.4375rem" h="0.4375rem" bg={accent} borderRadius="full" flexShrink={0} />
          <Text fontSize="0.75rem" fontWeight="950" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap" color="rgba(var(--gg-fg), calc(0.7 + var(--gg-faint-boost, 0)))">{title}</Text>
        </Flex>
        {cols.map((c) => (
          <Text key={c.label} textAlign="center" fontSize="0.625rem" fontWeight="900" textTransform="uppercase" letterSpacing="0.06em" whiteSpace="nowrap"
            color="rgba(var(--gg-fg), calc(0.45 + var(--gg-faint-boost, 0)))">{c.label}</Text>
        ))}
      </Grid>
      {rows.map((r, i) => (
        <Grid key={r.id} templateColumns={template} columnGap="0.25rem" alignItems="center" py="0.1875rem" borderTop={i ? "0.0625rem solid" : "none"} borderColor="rgba(var(--gg-fg), calc(0.08 + var(--gg-line-boost, 0)))">
          <Flex align="center" gap="0.5rem" minW={0}>
            <Image src={teamLogo(r.id)} alt="" w="1.25rem" h="1.25rem" objectFit="contain" />
            <Text fontSize="0.9375rem" fontWeight="950" textTransform="uppercase" whiteSpace="nowrap">{teamShort(r.id)}</Text>
          </Flex>
          {cols.map((c) => {
            const v = c.get(r.id);
            return (
              <Text key={c.label} textAlign="center" fontSize={c.strong ? "1.0625rem" : "0.9375rem"} fontWeight={c.strong ? "950" : "900"} fontFamily="mono"
                color={v == null ? "rgba(var(--gg-fg), calc(0.4 + var(--gg-faint-boost, 0)))" : c.signed ? (v >= 0 ? "var(--gg-pos)" : "var(--gg-neg)") : "var(--gg-ink)"}>
                {v == null ? DASH : c.fmt(v)}
              </Text>
            );
          })}
        </Grid>
      ))}
    </Card>
  );
};

const OffenseTrio = ({ game, awayId, homeId, accent }) => {
  const rows = [{ id: awayId }, { id: homeId }];
  const pass = (t) => game?.passing_splits?.[t]?.total;
  const rush = (t) => game?.rushing_splits?.[t]?.total;
  const adv = (t) => game?.advanced_team?.[t];
  const rate = (v) => `${Math.round(v * 100)}%`;
  const count = (v) => String(v);
  return (
    <Grid templateColumns="minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)" gap="0.875rem" alignItems="stretch">
      <TrioCard title="EPA" accent={accent} rows={rows} cols={[
        { label: "Dropback", get: (t) => asNum(pass(t)?.epa_total), fmt: signed1 },
        { label: "Run", get: (t) => asNum(rush(t)?.epa_total), fmt: signed1 },
        { label: "Offense", get: (t) => asNum(adv(t)?.epa_total), fmt: signed1, signed: true, strong: true },
      ]} />
      <TrioCard title="Success rate" accent={accent} rows={rows} cols={[
        { label: "Pass", get: (t) => asNum(pass(t)?.success_rate), fmt: rate },
        { label: "Run", get: (t) => asNum(rush(t)?.success_rate), fmt: rate },
        { label: "Total", get: (t) => asNum(adv(t)?.success_rate), fmt: rate, strong: true },
      ]} />
      {/* Explosive yards aren't on the game file yet (Backend Notes 2026-11-08, item 2); the column dashes until they are. */}
      <TrioCard title="Explosive plays" accent={accent} rows={rows} cols={[
        { label: "Plays", get: (t) => asNum(adv(t)?.explosive_plays), fmt: count, strong: true },
        { label: "Yards", get: (t) => asNum(adv(t)?.explosive_yards), fmt: count, strong: true },
      ]} />
    </Grid>
  );
};

// Half width: the rank, then a short meta line (team, quarter and clock, down) over the play
// itself, which gets the full width; the EPA chip on the right.
const PlayColumn = ({ title, plays, positive }) => (
  <Box>
    <Text fontSize="0.75rem" fontWeight="950" color={positive ? "var(--gg-pos)" : "var(--gg-neg)"} textTransform="uppercase" letterSpacing="0.14em" pb="0.375rem" borderBottom="0.0625rem solid" borderColor="rgba(var(--gg-fg), calc(0.08 + var(--gg-line-boost, 0)))">{title}</Text>
    {plays.length === 0 && (
      <Text py="0.75rem" fontSize="0.75rem" fontWeight="800" color="rgba(var(--gg-fg), calc(0.3 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.14em">No biggest plays data on file</Text>
    )}
    {plays.map((p, i) => (
      <Grid key={p.play_id ?? i} templateColumns="1.125rem minmax(0, 1fr) 3.625rem" columnGap="0.625rem" alignItems="center" py="0.5rem" borderBottom="0.0625rem solid" borderColor="rgba(var(--gg-fg), calc(0.06 + var(--gg-line-boost, 0)))">
        <Text fontSize="1.0625rem" fontWeight="950" fontStyle="italic" color="rgba(var(--gg-fg), calc(0.6 + var(--gg-faint-boost, 0)))">{i + 1}</Text>
        <Box minW={0}>
          <Text fontSize="0.6875rem" fontWeight="900" color="rgba(var(--gg-fg), calc(0.55 + var(--gg-faint-boost, 0)))" whiteSpace="nowrap" letterSpacing="0.04em">
            {teamShort(p.team_id)} · {p.period === "OT" ? "OT" : `Q${p.quarter} ${p.clock}`} · {p.down != null ? `${p.down}${["st", "nd", "rd", "th"][Math.min(p.down, 4) - 1]} & ${p.distance ?? DASH}` : DASH}
          </Text>
          <Text fontSize="0.8125rem" fontWeight="700" lineHeight={1.3} mt="0.125rem" lineClamp={2}>{p.description ?? DASH}</Text>
        </Box>
        <Flex justify="flex-end">
          <Box px="0.5rem" py="0.125rem" borderRadius="0.25rem" bg={positive ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}>
            <Text fontSize="0.875rem" fontWeight="950" fontFamily="mono">{signed2(p.epa)}</Text>
          </Box>
        </Flex>
      </Grid>
    ))}
  </Box>
);

// Every drive, one column per team (away left, home right), in game order, one line each (see
// DriveRow), with the same field strip the Drives tab draws.
// The result block is one solid color with bold white type, in the series results colors.
const RESULT_FILL = {
  TD: "#1F7A3F", FG: "#0E7C86", Punt: "#CC5500",
  INT: "#E53E3E", FUMB: "#E53E3E", Downs: "#E53E3E", MissedFG: "#E53E3E", BlockedFG: "#E53E3E", "BLK PUNT": "#E53E3E",
  INT_TD: "#991B1B", FUMB_TD: "#991B1B", SAFETY: "#991B1B", PUNT_RET_TD: "#991B1B", BLK_PUNT_TD: "#991B1B", BLK_FG_TD: "#991B1B", FG_RET_TD: "#991B1B",
};
const scoreInk = (fill) => (contrast(fill, "#FFFFFF") >= contrast(fill, "#0B0B0D") ? "#FFFFFF" : "#0B0B0D");

// The score after the drive: two number boxes, away on the left and home on the right. The team
// ahead is in its own color, the other in white.
const ScoreBoxes = ({ d, awayId, homeId, size = SIZE.tall }) => {
  if (d.awayScore == null || d.homeScore == null) return <Box />;
  const box = (id, pts, ahead) => {
    const fill = ahead ? teamFillColors(id).fill : "#FFFFFF";
    return (
      <Flex w={size.boxW} h={size.boxH} align="center" justify="center" style={{ background: fill, color: ahead ? scoreInk(fill) : "#0B0B0D" }}>
        <Text fontSize={size.score} fontWeight="950" lineHeight={1} fontFamily="mono">{pts}</Text>
      </Flex>
    );
  };
  return <Flex gap="0.125rem">{box(awayId, d.awayScore, d.awayScore > d.homeScore)}{box(homeId, d.homeScore, d.homeScore > d.awayScore)}</Flex>;
};

// Quarters alternate so each reads as its own band: Q2 and Q4 carry a tint of the column team's
// secondary color; Q1, Q3 and overtime stay plain.
// Light mode: a stronger tint, and a near white secondary (J State, AAMU, Valley) falls back to
// the primary, since white on a white card shows nothing.
const SECONDARY_QUARTERS = new Set(["Q2", "Q4"]);
const isNearWhite = (hex) => contrast(hex, "#FFFFFF") < 1.4;
const quarterTint = (id, quarter) => {
  if (!SECONDARY_QUARTERS.has(quarter)) return "transparent";
  const colors = teamMeta(id)?.colors ?? {};
  if (getColorScheme() !== "light") return colors.secondary ? withAlpha(colors.secondary, 0.14) : "transparent";
  const hex = colors.secondary && !isNearWhite(colors.secondary) ? colors.secondary : colors.primary;
  return hex ? withAlpha(hex, 0.22) : "transparent";
};

// One line per drive: a narrow block of numbers on the left, two short rows (when and the
// result; plays and yards and EPA) plus the score, and the field strip taking the rest, about 60%.
// SIZE.tall is the 1100 poster. The 16:9 frame (DrivesWidePoster) uses `wide` when the rows
// have room and `wideTight` when a long game squeezes them; there the rows stretch to fill the
// frame, so the strip takes the row's height instead of a fixed one.
const SIZE = {
  tall: { cols: "5.5rem 3rem 2.875rem minmax(0, 1fr)", gap: "0.3125rem", text: "0.6875rem", line: "1rem", pill: "1rem", pillText: "0.625rem", pillTextLong: "0.5rem", boxW: "1.375rem", boxH: "2.25rem", score: "0.8125rem", strip: "2.25rem", dim: 0.55, unit: 0.5, py: "0.25rem", stack: "0.125rem" },
  wide: { cols: "10.5rem 5.5rem 5rem minmax(0, 1fr)", gap: "0.75rem", text: "1.3125rem", line: "1.625rem", pill: "1.5rem", pillText: "1rem", pillTextLong: "0.8125rem", boxW: "2.25rem", boxH: "2.75rem", score: "1.3125rem", strip: "100%", dim: 0.85, unit: 0.7, py: "0.375rem", stack: "0.25rem" },
  // 13 to 15 drives a side: a step down from `wide` so two lines still have room to breathe.
  wideMid: { cols: "9rem 5rem 4.5rem minmax(0, 1fr)", gap: "0.625rem", text: "1.0625rem", line: "1.25rem", pill: "1.125rem", pillText: "0.875rem", pillTextLong: "0.75rem", boxW: "2rem", boxH: "2.375rem", score: "1.125rem", strip: "100%", dim: 0.85, unit: 0.7, py: "0.3125rem", stack: "0.1875rem" },
  wideTight: { cols: "8.25rem 4.5rem 4.25rem minmax(0, 1fr)", gap: "0.5rem", text: "1rem", line: "1.1875rem", pill: "1.1875rem", pillText: "0.8125rem", pillTextLong: "0.6875rem", boxW: "1.875rem", boxH: "2.125rem", score: "1rem", strip: "100%", dim: 0.85, unit: 0.7, py: "0.125rem", stack: "0.125rem" },
};

const DriveRow = ({ d, awayId, homeId, size = SIZE.tall }) => {
  const small = { fontSize: size.text, fontWeight: "900", fontFamily: "mono", lineHeight: size.line, whiteSpace: "nowrap" };
  const fill = size.strip === "100%";
  return (
  <Grid templateColumns={size.cols} columnGap={size.gap} alignItems="center" py={size.py} mx="-1.125rem" pl="1.125rem" pr="0" h={fill ? "100%" : undefined} minH={0}
    borderTop="0.0625rem solid" borderColor="rgba(var(--gg-fg), calc(0.08 + var(--gg-line-boost, 0)))" bg={quarterTint(d.team === "home" ? homeId : awayId, d.quarter)}>
    <Box>
      <Text {...small} color={`rgba(var(--gg-fg), calc(${size.dim} + var(--gg-faint-boost, 0)))`}>{d.quarter} {d.startTime}</Text>
      <Text {...small}>{d.plays ?? DASH}<Text as="span" color={`rgba(var(--gg-fg), calc(${size.unit} + var(--gg-faint-boost, 0)))`}> PL</Text> · {d.yards ?? DASH}<Text as="span" color={`rgba(var(--gg-fg), calc(${size.unit} + var(--gg-faint-boost, 0)))`}> YD</Text></Text>
    </Box>
    <Flex direction="column" gap={size.stack}>
      <Flex h={size.pill} align="center" justify="center" style={{ background: RESULT_FILL[d.result] ?? "#3F3F46" }}>
        <Text fontSize={String(d.resultLabel).length > 5 ? size.pillTextLong : size.pillText} fontWeight="950" color="#FFFFFF" textTransform="uppercase" lineHeight={1} whiteSpace="nowrap">{d.resultLabel}</Text>
      </Flex>
      <Text {...small} textAlign="center" color={d.epa == null ? "rgba(var(--gg-fg), calc(0.4 + var(--gg-faint-boost, 0)))" : d.epa >= 0 ? "var(--gg-pos)" : "var(--gg-neg)"}>{d.epa == null ? DASH : signed1(d.epa)}</Text>
    </Flex>
    <ScoreBoxes d={d} awayId={awayId} homeId={homeId} size={size} />
    <Box h={fill ? "100%" : undefined} minH={0}>
      <DriveFieldStrip startYard={d.startYard ?? 0} endYard={d.endYard ?? 0} plays={d.plays ?? 1} team={d.team}
        awayColor={teamAccent(awayId)} homeColor={teamAccent(homeId)} awayLabel={teamShort(awayId)} homeLabel={teamShort(homeId)} height={size.strip} />
    </Box>
  </Grid>
  );
};

const DriveColumns = ({ game, awayId, homeId }) => {
  const rows = (Array.isArray(game?.drive_summary) ? game.drive_summary : []).map((d) => toDriveRow(d, awayId, homeId));
  return (
    <Grid templateColumns="minmax(0, 1fr) minmax(0, 1fr)" gap="0.875rem" alignItems="start">
      {[["away", awayId], ["home", homeId]].map(([side, id]) => {
        const mine = rows.filter((d) => d.team === side);
        return (
          <Card key={side} px="1.125rem">
            <Flex align="center" gap="0.625rem" pb="0.625rem" borderBottom="0.1875rem solid" borderColor={teamAccent(id)}>
              <Image src={teamLogo(id)} alt="" w="1.75rem" h="1.75rem" objectFit="contain" />
              <Text fontSize="1.25rem" fontWeight="950" textTransform="uppercase" letterSpacing="-0.01em" flex={1} lineClamp={1}>{teamName(id)}</Text>
              <Text fontSize="0.75rem" fontWeight="900" color="rgba(var(--gg-fg), calc(0.5 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.14em">{mine.length} drives</Text>
            </Flex>
            {mine.length === 0 && (
              <Text py="0.875rem" fontSize="0.75rem" fontWeight="800" color="rgba(var(--gg-fg), calc(0.3 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.14em">No drive data on file</Text>
            )}
            {mine.map((d, i) => <DriveRow key={i} d={d} awayId={awayId} homeId={homeId} />)}
          </Card>
        );
      })}
    </Grid>
  );
};

export const DrivesPoster = ({ game, innerRef }) => {
  const header = buildHeader(game);
  const accent = teamAccent(header.winnerId ?? header.homeId);
  const biggest = buildBiggestPlays(game);

  return (
    <Poster innerRef={innerRef}>
      <PosterTitle kicker={[header.weekLabel, "Drives & Situations"].filter(Boolean).join(" · ")} title={`${teamShort(header.awayId)} vs ${teamShort(header.homeId)}`} accent={accent} />
      <PosterBanner header={header} />

      <Flex direction="column" gap="0.875rem">
        {/* The two series cards side by side in one short row, as the Summary tab draws them. */}
        <Grid templateColumns="minmax(0, 1fr) minmax(0, 1fr)" gap="0.875rem" alignItems="stretch">
          <ChainsMovedCard seriesSummary={game?.series_summary} awayId={header.awayId} homeId={header.homeId} accent={accent} poster />
          <SeriesResultsCard seriesSummary={game?.series_summary} awayId={header.awayId} homeId={header.homeId} accent={accent} poster />
        </Grid>

        <DriveColumns game={game} awayId={header.awayId} homeId={header.homeId} />

        <OffenseTrio game={game} awayId={header.awayId} homeId={header.homeId} accent={accent} />

        {/* The biggest plays by EPA, the best three on the left and the worst three on the right. */}
        <Grid templateColumns="minmax(0, 1fr) minmax(0, 1fr)" gap="0.875rem" alignItems="stretch">
          <Card px="1.125rem"><PlayColumn title="Top 3 plays by EPA" plays={biggest.positive} positive /></Card>
          <Card px="1.125rem"><PlayColumn title="Bottom 3 plays by EPA" plays={biggest.negative} positive={false} /></Card>
        </Grid>
      </Flex>

    </Poster>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE 2 · 16:9 — the header and the drive chart only, on a 1920 x 1080 frame
// ═══════════════════════════════════════════════════════════════════════════════
// The two team columns fill the frame under the title and scoreboard. Both columns share one
// row count (the longer side's drives), so rows line up across and stretch to the space left;
// a long game switches to the tighter row type so the two lines of numbers still fit.

export const DrivesWidePoster = ({ game, innerRef }) => {
  const header = buildHeader(game);
  const { awayId, homeId } = header;
  const rows = (Array.isArray(game?.drive_summary) ? game.drive_summary : []).map((d) => toDriveRow(d, awayId, homeId));
  const sides = [["away", awayId], ["home", homeId]].map(([side, id]) => ({ side, id, mine: rows.filter((d) => d.team === side) }));
  const n = Math.max(1, ...sides.map((x) => x.mine.length));
  const size = n > 15 ? SIZE.wideTight : n > 12 ? SIZE.wideMid : SIZE.wide;

  return (
    <Poster innerRef={innerRef} w={WIDE_W} h={WIDE_H} display="flex" flexDirection="column">
      <PosterBanner header={header} label="Drives" />
      <Grid templateColumns="minmax(0, 1fr) minmax(0, 1fr)" gap="1.125rem" flex="1" minH={0} mt="0.25rem">
        {sides.map(({ side, id, mine }) => (
          <Card key={side} px="1.125rem" display="flex" flexDirection="column" minH={0}>
            <Flex align="center" gap="0.75rem" pb="0.625rem" borderBottom="0.1875rem solid" borderColor={teamAccent(id)} flexShrink={0}>
              <Image src={teamLogo(id)} alt="" w="2rem" h="2rem" objectFit="contain" />
              <Text fontSize="1.375rem" fontWeight="950" textTransform="uppercase" letterSpacing="-0.01em" flex={1} lineClamp={1}>{teamName(id)}</Text>
              <Text fontSize="0.8125rem" fontWeight="900" color="rgba(var(--gg-fg), calc(0.5 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.14em">{mine.length} drives</Text>
            </Flex>
            {mine.length === 0 ? (
              <Text py="0.875rem" fontSize="0.8125rem" fontWeight="800" color="rgba(var(--gg-fg), calc(0.3 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.14em">No drive data on file</Text>
            ) : (
              <Grid templateRows={`repeat(${n}, minmax(0, 1fr))`} flex="1" minH={0}>
                {mine.map((d, i) => <DriveRow key={i} d={d} awayId={awayId} homeId={homeId} size={size} />)}
              </Grid>
            )}
          </Card>
        ))}
      </Grid>
    </Poster>
  );
};
