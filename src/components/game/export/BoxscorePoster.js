import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Poster, PosterTitle, PosterBanner, PosterSection, CARD_BG, HAIRLINE, Head, Shaded, shadeVsLeague } from "./PosterChrome";
import {
  buildHeader, buildBoxscore, leagueEntry, teamAccent, teamLogo, teamShort, teamName,
  shortName, num, rate1, signed1, signed2, pct0, DASH, ZONE_DEPTHS, CALL_ZONE_DEPTHS, ZONE_LANES, zoneCell,
} from "./exportData";
import { PASS_ZONE_YPA_SCALE, heatAccent, heatFill } from "../page/boxscore/ProductionPrimitives";
import { getTeamColor, getTeamSecondary } from "../../organisms/test/QGameBoxScore";
import { PRODUCTION_NEGATIVE, PRODUCTION_UNITS, gameProductionBounds, productionFill, productionScale } from "../../../utils/productionBars";

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGES 3 & 4 — BOXSCORE, one per team
// ═══════════════════════════════════════════════════════════════════════════════
// Passing (stat tiles beside the lead passer's zone grid), rushing, receiving.
// Every cell is a field on the player row; production is the unit's own
// component. SR and EPA cells tint against the league's team-level line.

const Card = ({ children, ...props }) => (
  <Box bg={CARD_BG} borderRadius="16px" border="1px solid" borderColor={HAIRLINE} px="24px" py="16px" {...props}>
    {children}
  </Box>
);

const Name = ({ children, total }) => (
  <Text fontSize={total ? "15px" : "17px"} fontWeight="950" textTransform="uppercase" letterSpacing="-0.01em" color={total ? "rgba(255,255,255,0.6)" : "white"} lineClamp={1}>
    {children}
  </Text>
);

const Cell = ({ children, align = "right", dim }) => (
  <Text textAlign={align} fontSize="16px" fontWeight="900" fontFamily="mono" whiteSpace="nowrap" color={dim ? "rgba(255,255,255,0.5)" : "white"}>
    {children}
  </Text>
);

/**
 * Production score with its bar — the game page's bar, at print size. The scale
 * is the whole game's (utils/productionBars.js), shared with the page, so a 22.4
 * fills the track and a 9.2 reads under half on both. Negatives grow left from
 * the zero mark in red; the mark is drawn only when the game has a negative.
 */
const Production = ({ value, scale, accent }) => {
  const fill = productionFill(value, scale);
  if (!fill) return <Cell dim>{DASH}</Cell>;
  return (
    <Flex align="center" gap="8px" minW={0}>
      <Text w="46px" textAlign="right" fontSize="16px" fontWeight="950" fontFamily="mono" color={fill.negative ? PRODUCTION_NEGATIVE : "white"} flexShrink={0}>
        {value.toFixed(1)}
      </Text>
      <Box position="relative" flex="1" h="8px">
        <Box position="absolute" inset={0} bg="rgba(255,255,255,0.08)" borderRadius="full" overflow="hidden">
          <Box position="absolute" top={0} bottom={0} borderRadius="full" bg={fill.negative ? PRODUCTION_NEGATIVE : accent} style={{ left: `${fill.leftPct}%`, width: `${fill.widthPct}%` }} />
        </Box>
        {scale.hasNegative && (
          <Box position="absolute" top="-5px" bottom="-5px" w="2px" bg="rgba(255,255,255,0.7)" borderRadius="full" style={{ left: `calc(${scale.zeroPct}% - 1px)` }} />
        )}
      </Box>
    </Flex>
  );
};

const Table = ({ columns, rows, total, accent, rowKey, gap = "14px" }) => {
  const template = columns.map((c) => c.w).join(" ");
  const line = (r, isTotal) => (
    <Grid key={isTotal ? "total" : rowKey(r)} templateColumns={template} columnGap={gap} alignItems="center" py="8px" borderBottom="1px solid" borderColor="rgba(255,255,255,0.05)" bg={isTotal ? "rgba(255,255,255,0.04)" : "transparent"} px="8px" mx="-8px" borderRadius={isTotal ? "6px" : 0}>
      {columns.map((c) => (
        <Box key={c.key} minW={0}>{c.render(r, isTotal)}</Box>
      ))}
    </Grid>
  );
  return (
    <Box>
      <Grid templateColumns={template} columnGap={gap} alignItems="end" pb="6px" borderBottom="1px solid" borderColor="rgba(255,255,255,0.1)">
        {columns.map((c) => (
          <Head key={c.key} align={c.align ?? "right"} sub={c.sub}>{c.label}</Head>
        ))}
      </Grid>
      {rows.length === 0 && (
        <Text py="12px" fontSize="12px" fontWeight="800" color="rgba(255,255,255,0.3)" textTransform="uppercase" letterSpacing="0.14em">No rows</Text>
      )}
      {rows.map((r) => line(r, false))}
      {total && line(total, true)}
    </Box>
  );
};

/**
 * The lead passer's zone grid — depth rows, lane columns, C/A + yards per cell.
 * Heat is the page's: same team heat colour, same fixed yds/att scale, same
 * neutral cell under two attempts (heatFill in ProductionPrimitives).
 */
const ZoneGrid = ({ grid, heat, byCall = false }) => {
  const depths = byCall ? CALL_ZONE_DEPTHS : ZONE_DEPTHS;
  return (
    <Box>
      <Grid templateColumns="64px repeat(3, minmax(0, 1fr))" gap="8px" alignItems="center">
        <Box />
        {ZONE_LANES.map((l) => (
          <Text key={l.key} textAlign="center" fontSize="12px" fontWeight="900" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.14em">{l.label}</Text>
        ))}
        {depths.map((d) => (
          <Box key={d.key} display="contents">
            <Box>
              <Text fontSize="12px" fontWeight="900" color="rgba(255,255,255,0.6)" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.1}>{d.label}</Text>
              {d.range && <Text fontSize="10px" fontWeight="700" color="rgba(255,255,255,0.3)">{d.range}</Text>}
            </Box>
            {ZONE_LANES.map((l) => {
              const c = zoneCell(grid, d.key, l.key);
              const empty = !c || c.attempts === 0;
              const fill = heatFill(c?.attempts ? c.yards / c.attempts : 0, c?.attempts ?? 0, PASS_ZONE_YPA_SCALE, heat);
              return (
                <Flex key={l.key} direction="column" align="center" justify="center" h="72px" borderRadius="8px" bg={empty ? "rgba(255,255,255,0.03)" : fill.bg} border="1px solid" borderColor={empty ? "rgba(255,255,255,0.06)" : fill.border}>
                  {!empty && (
                    <>
                      <Text fontSize="22px" fontWeight="950" lineHeight={1.1}>{c.completions}/{c.attempts}</Text>
                      <Text fontSize="12px" fontWeight="700" color="rgba(255,255,255,0.6)" lineHeight={1.2} mt="2px">{c.yards}y</Text>
                    </>
                  )}
                </Flex>
              );
            })}
          </Box>
        ))}
      </Grid>
      {/* Throws the crew left unplaceable — counted, never spread into cells. */}
      {(grid?.uncharted?.attempts ?? 0) > 0 && (
        <Text mt="10px" fontSize="12px" fontWeight="900" color="rgba(255,255,255,0.5)" textTransform="uppercase" letterSpacing="0.1em">
          {grid.uncharted.attempts} not charted
        </Text>
      )}
    </Box>
  );
};

export const BoxscorePoster = ({ game, leagueAvg, teamId, innerRef }) => {
  const header = buildHeader(game);
  const isHome = teamId === header.homeId;
  const oppId = isHome ? header.awayId : header.homeId;
  const accent = teamAccent(teamId);
  const box = buildBoxscore(game, teamId);

  const passSR = leagueEntry(leagueAvg, "passing_splits.total.success_rate");
  const passEPA = leagueEntry(leagueAvg, "passing_splits.total.epa_per_play");
  const rushSR = leagueEntry(leagueAvg, "rushing_splits.total.success_rate");
  const rushEPA = leagueEntry(leagueAvg, "rushing_splits.total.epa_per_play");
  const recvSR = leagueEntry(leagueAvg, "individual_stats.receiving.success_rate");
  const recvEPA = leagueEntry(leagueAvg, "individual_stats.receiving.epa_per_target");

  // One production scale for the whole game — the same one the page uses.
  const prodScale = productionScale(gameProductionBounds(game?.production_scores));
  // The Passing card shows one quarterback: the top performer by passing production
  // (ties and missing ratings fall back to the order the file gives). The zone
  // grid beside the tiles is that same passer's.
  // The QB who played the game: most attempts, production only to break a tie.
  // (By production alone a 0/1 backup at 0.1 beat a 28-attempt starter at -5.8.)
  const lead = [...box.passers].sort((a, b) => (b.attempts ?? 0) - (a.attempts ?? 0) || (b.production ?? -Infinity) - (a.production ?? -Infinity))[0] ?? null;

  // Passing stats sit in tiles, four to a row, so the zone grid gets 2/5 of the card.
  const passTiles = (r) => [
    { key: "ca", label: "C/A", value: `${r.completions ?? DASH}/${r.attempts ?? DASH}` },
    { key: "yds", label: "Yds", value: num(r.yards) },
    { key: "td", label: "TD", value: num(r.touchdowns) },
    { key: "int", label: "INT", value: num(r.interceptions) },
    { key: "sr", label: "SR%", value: pct0(r.sr), shade: shadeVsLeague(r.sr, passSR) },
    { key: "epa", label: "EPA", value: signed1(r.epa) },
    { key: "epadb", label: "EPA/DB", value: signed2(r.epaPer), shade: shadeVsLeague(r.epaPer, passEPA) },
    { key: "prod", label: PRODUCTION_UNITS.passing.label, production: true },
  ];

  const rushCols = [
    { key: "name", label: "Rushing", align: "left", w: "minmax(0, 1.3fr)", render: (r, t) => <Name total={t}>{t ? "Team Total" : shortName(r.name)}</Name> },
    { key: "ay", label: "Att-Yds", w: "78px", render: (r) => <Cell>{r.attempts ?? DASH}-{r.yards ?? DASH}</Cell> },
    { key: "ypc", label: "YPC", w: "52px", render: (r) => <Cell>{rate1(r.ypc)}</Cell> },
    { key: "sr", label: "SR%", w: "74px", render: (r) => <Shaded value={pct0(r.sr)} shade={shadeVsLeague(r.sr, rushSR)} /> },
    { key: "epa", label: "EPA", w: "62px", render: (r) => <Cell>{signed1(r.epa)}</Cell> },
    { key: "epaatt", label: "EPA/Att", w: "82px", render: (r) => <Shaded value={signed2(r.epaPer)} shade={shadeVsLeague(r.epaPer, rushEPA)} /> },
    { key: "ly", label: "LY/C", w: "62px", render: (r) => <Cell>{rate1(r.lineYards)}</Cell> },
    { key: "hl", label: "Hlt/Opp", w: "70px", render: (r) => <Cell>{rate1(r.highlight)}</Cell> },
    { key: "expl", label: "Expl", w: "46px", render: (r) => <Cell>{num(r.explosive)}</Cell> },
    { key: "prod", label: PRODUCTION_UNITS.rushing.label, align: "left", w: "140px", render: (r, t) => (t ? null : <Production value={r.production} scale={prodScale} accent={accent} />) },
  ];

  const recvCols = [
    { key: "name", label: "Receiving", align: "left", w: "minmax(0, 1fr)", render: (r, t) => <Name total={t}>{t ? "Team Total" : shortName(r.name)}</Name> },
    { key: "try", label: "Tgt/Rec/Yds", w: "130px", render: (r) => <Cell>{r.targets ?? DASH}/{r.receptions ?? DASH}/{r.yards ?? DASH}</Cell> },
    { key: "ypr", label: "Yds/Rec", w: "90px", render: (r) => <Cell>{rate1(r.ypr)}</Cell> },
    { key: "expl", label: "Expl", w: "64px", render: (r) => <Cell>{num(r.explosive)}</Cell> },
    { key: "sr", label: "SR%", w: "90px", render: (r) => <Shaded value={pct0(r.sr)} shade={shadeVsLeague(r.sr, recvSR)} /> },
    { key: "epa", label: "EPA", w: "80px", render: (r) => <Cell>{signed1(r.epa)}</Cell> },
    { key: "epatgt", label: "EPA/Tgt", w: "96px", render: (r) => <Shaded value={signed2(r.epaPer)} shade={shadeVsLeague(r.epaPer, recvEPA)} /> },
    { key: "prod", label: PRODUCTION_UNITS.receiving.label, align: "left", w: "170px", render: (r, t) => (t ? null : <Production value={r.production} scale={prodScale} accent={accent} />) },
  ];

  return (
    <Poster innerRef={innerRef}>
      <PosterTitle
        kicker={[header.weekLabel, "Boxscore"].filter(Boolean).join(" · ")}
        title={`${teamName(teamId)} ${isHome ? "vs" : "@"} ${teamShort(oppId)}`}
        accent={accent}
      />
      <PosterBanner header={header} />

      <Flex direction="column" gap="14px">
        <Card>
          <PosterSection
            title="Passing"
            accent={accent}
            mb="0"
            right={
              <Flex align="center" gap="6px">
                <Image src={teamLogo(teamId)} alt="" w="18px" h="18px" objectFit="contain" />
                <Text fontSize="12px" fontWeight="900" letterSpacing="0.12em" color="rgba(255,255,255,0.6)">{teamShort(teamId)}</Text>
              </Flex>
            }
          >
            <Grid templateColumns="minmax(0, 3fr) minmax(0, 2fr)" columnGap="28px" alignItems="start">
              <Flex direction="column" gap="14px">
                {box.passers.length === 0 && (
                  <Text py="12px" fontSize="12px" fontWeight="800" color="rgba(255,255,255,0.3)" textTransform="uppercase" letterSpacing="0.14em">No rows</Text>
                )}
                {(lead ? [lead] : []).map((r) => (
                  <Box key={r.key}>
                    <Name>{shortName(r.name)}</Name>
                    <Grid templateColumns="repeat(4, minmax(0, 1fr))" gap="8px" mt="8px">
                      {passTiles(r).map((t) => (
                        <Box key={t.key} bg={t.shade ?? "rgba(255,255,255,0.04)"} borderRadius="8px" px="12px" py="8px" minW={0}>
                          <Text fontSize="11px" fontWeight="900" color="rgba(255,255,255,0.5)" textTransform="uppercase" letterSpacing="0.12em" lineHeight={1.1}>{t.label}</Text>
                          {t.production ? (
                            <Box mt="6px"><Production value={r.production} scale={prodScale} accent={accent} /></Box>
                          ) : (
                            <Text fontSize="22px" fontWeight="950" fontFamily="mono" lineHeight={1.2} mt="2px" whiteSpace="nowrap">{t.value}</Text>
                          )}
                        </Box>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </Flex>
              <ZoneGrid grid={lead?.grid ?? null} byCall={!!lead?.gridByCall} heat={heatAccent(getTeamColor(teamId), getTeamSecondary(teamId))} />
            </Grid>
          </PosterSection>
        </Card>

        <Card>
          <PosterSection title="Rushing" accent={accent} mb="0">
            <Table columns={rushCols} rows={box.rushers} total={box.rushTeam} accent={accent} rowKey={(r) => r.key} />
          </PosterSection>
        </Card>

        <Card>
          <PosterSection title="Receiving" accent={accent} mb="0">
            <Table columns={recvCols} rows={box.receivers} total={box.recvTeam} accent={accent} rowKey={(r) => r.key} />
          </PosterSection>
        </Card>
      </Flex>

    </Poster>
  );
};
