import { Grid, Text, Flex, Box } from "@chakra-ui/react";
import { fgOf, DATA, Dumbbell, InfoPoster, one, epa, Line, Logo, lastName, tab, pct, int, teamShortName, caps } from "../kit";
import { BigLogo, Columns, Giant, Hero, Waffle } from "../infoParts";
import { teamFillColors } from "../../../../game/export/exportData";
import { Card as Panel, NumberTile } from "../../dlinePosters/PosterPrimitives";
import { Bars, Cols, teamOf } from "./Primitives";

// ── Then and now: a tall dumbbell column beside the league, then the wall of who left ──

export const ThenNowInfo = ({ pal, innerRef }) => {
  const fg = fgOf(pal);
  const seasons = DATA.league_seasons;
  const alcorn = teamOf("swacalc"), bcu = teamOf("swacbcu"), asu = teamOf("swacasu");
  const gone = DATA.top15_fate.filter((r) => r.status === "not on a 2026 roster").length;
  return (
    <InfoPoster pal={pal} innerRef={innerRef} title="Who got better" accent="through the air">
      <Cols t="minmax(0,1.5fr) minmax(0,1fr)">
        <Panel pal={pal} kicker="Pass yards per game, 2025 to 2026">
          <Dumbbell pal={pal} rows={[...DATA.team_yoy].sort((a, b) => b.chg_ypg - a.chg_ypg)} name={() => undefined} a={(r) => r.ypg_25} b={(r) => r.ypg_26} fmt={one} aLabel="2025" bLabel="2026" rowH={48} whoW="170px" />
        </Panel>
        <Flex direction="column" gap="2px">
          <Panel pal={pal} kicker="League · EPA per attempt"><Line pal={pal} rows={seasons} y={(r) => r.epa} yFmt={(v) => v.toFixed(2)} xLabelOf={(r) => String(r.season).slice(2)} w={465} h={170} /></Panel>
          <Panel pal={pal} kicker="League · Yards per attempt"><Line pal={pal} rows={seasons} y={(r) => r.ypa} yFmt={(v) => v.toFixed(1)} xLabelOf={(r) => String(r.season).slice(2)} w={465} h={170} /></Panel>
          <NumberTile pal={pal} value={epa(alcorn.epa_26)} ink={pal.up} title="Alcorn: EPA per pass" text={`Up from ${alcorn.epa_25.toFixed(2)}, the best of either season.`} />
          <NumberTile pal={pal} value={epa(bcu.epa_26)} ink={pal.down} title="B-CU: EPA per pass" text={`Down from ${bcu.epa_25.toFixed(2)}.`} />
          <NumberTile pal={pal} value={epa(asu.epa_26)} ink={pal.down} title="Bama State: the biggest fall" text={`The best of 2025 at ${asu.epa_25.toFixed(2)}, now below zero.`} />
        </Flex>
      </Cols>
      <Cols t="minmax(0,1.5fr) minmax(0,1fr)">
        <Panel pal={pal} kicker="2025's top 15">
          <Grid templateColumns="repeat(5, minmax(0,1fr))" gap="6px">
            {DATA.top15_fate.map((r) => {
              const out = r.ypg_26 == null;
              return (
                <Flex key={r.name} direction="column" align="center" textAlign="center" py="12px" px="4px" minW={0} bg={out ? fg(0.04) : pal.bg} opacity={out ? 0.62 : 1} borderTop={`4px solid ${out ? pal.down : pal.up}`}>
                  <Logo id={r.id_25} size={36} />
                  <Text mt="6px" fontSize="14px" fontWeight="950" lineHeight={1.05} textTransform="uppercase" whiteSpace="nowrap" textDecoration={out ? "line-through" : undefined}>{lastName(r.name)}</Text>
                  <Text mt="4px" fontSize="19px" fontWeight="950" color={out ? pal.down : pal.up} {...tab}>{one(r.ypg_25)}</Text>
                  <Text fontSize="12px" color={fg(0.6)} {...caps}>{out ? "Gone" : `Now ${one(r.ypg_26)}`}</Text>
                </Flex>
              );
            })}
          </Grid>
        </Panel>
        <Panel pal={pal} kicker="Who replaced them">
          {DATA.replaced.map((r) => (
            <Grid key={r.id} templateColumns="30px minmax(0,1fr) 14px minmax(0,1fr) 44px" columnGap="6px" alignItems="center" h="30px" borderBottom={`1px solid ${fg(0.06)}`}>
              <Logo id={r.id} size={24} />
              <Text fontSize="13px" fontWeight="800" color={fg(0.6)} textTransform="uppercase" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{lastName(r.top_25)}</Text>
              <Text fontSize="13px" color={fg(0.4)}>→</Text>
              <Text fontSize="14px" fontWeight="900" textTransform="uppercase" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{lastName(r.top_26)}</Text>
              <Text fontSize="16px" fontWeight="950" textAlign="right" color={pal.orange} {...tab}>{one(r.ypg_26)}</Text>
            </Grid>
          ))}
        </Panel>
      </Cols>
    </InfoPoster>
  );
};

// ── New faces: a waffle, one split bar, every team as a column, transfer tickets ──

const TIER_SHADES = [1, 0.75, 0.55, 0.3, 0.4, 0.2];

const Extreme = ({ pal, id, share, kicker }) => (
  <Hero pal={pal} tone={teamFillColors(id)} kicker={kicker} align="flex-start">
    <Flex align="center" gap="14px"><Box bg="rgba(255,255,255,0.92)" p="4px"><BigLogo id={id} size={44} /></Box><Giant size={84}>{pct(share)}</Giant></Flex>
    <Text fontSize="20px" mt="10px" {...caps}>{teamShortName(id)}</Text>
  </Hero>
);

export const NewFacesInfo = ({ pal, innerRef }) => {
  const fg = fgOf(pal);
  const FY = DATA.first_year;
  const rgb = String(pal.brand).replace("#", "").match(/../g).map((h) => parseInt(h, 16)).join(",");
  const total = FY.tiers.reduce((a, t) => a + t.yards, 0);
  const hi = FY.teams[0], lo = FY.teams[FY.teams.length - 1];
  return (
    <InfoPoster pal={pal} innerRef={innerRef} title="Did the portal" accent="build this league">
      <Cols t="minmax(0,1fr) minmax(0,1.5fr)">
        <Hero pal={pal} tone="ink" align="center">
          <Waffle share={FY.yards / FY.of} on={pal.brand} off={`rgba(${pal.fg === "255,255,255" ? "17,17,20" : "255,255,255"}, 0.14)`} size={32} />
          <Giant size={104} mt="18px">{pct(FY.yards / FY.of)}</Giant>
          <Text fontSize="17px" textAlign="center" mt="8px" {...caps}>Of all receiving yards came from first year transfers</Text>
        </Hero>
        <Flex direction="column" gap="2px">
          <Panel pal={pal} kicker="Where they came from" flex={1}>
            <Flex h="96px" columnGap="2px">
              {FY.tiers.map((t, i) => {
                const strong = TIER_SHADES[i] > 0.5;
                const wide = t.yards / total > 0.1;
                return (
                  <Flex key={t.tier} direction="column" align="center" justify="center" minW={0} style={{ flex: t.yards / total, background: `rgba(${rgb}, ${TIER_SHADES[i]})`, color: strong ? "#FFFFFF" : pal.ink }}>
                    <Text fontSize={wide ? "20px" : "13px"} fontWeight="950" textTransform="uppercase" lineHeight={1} whiteSpace="nowrap">{t.tier}</Text>
                    <Text fontSize={wide ? "18px" : "12px"} fontWeight="800" {...tab}>{int(t.yards)}</Text>
                  </Flex>
                );
              })}
            </Flex>
          </Panel>
          <Cols t="repeat(2, minmax(0,1fr))" flex={1}>
            <Extreme pal={pal} id={hi.id} share={hi.share} kicker="The most" />
            <Extreme pal={pal} id={lo.id} share={lo.share} kicker="The least" />
          </Cols>
        </Flex>
      </Cols>
      <Panel pal={pal} kicker="Share of each team's receiving yards from first year transfers">
        <Columns pal={pal} rows={FY.teams} get={(r) => r.share} fmt={pct} h={230} logo={40} />
      </Panel>
      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="2px">
        {FY.top.filter((r) => r.from).slice(0, 9).map((r) => (
          <Grid key={r.name} templateColumns="minmax(0,1fr) auto" columnGap="10px" alignItems="center" bg={pal.panel} px="18px" py="14px" borderLeft={`4px solid ${pal.brand}`}>
            <Box minW={0}>
              <Text fontSize="19px" fontWeight="950" lineHeight={1.05} textTransform="uppercase" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{r.name}</Text>
              <Flex align="center" gap="6px" mt="6px" minW={0}>
                <Text fontSize="13px" color={fg(0.6)} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" {...caps}>{r.from} →</Text>
                <Logo id={r.id} size={24} />
              </Flex>
            </Box>
            <Text fontSize="32px" fontWeight="950" fontStyle="italic" color={pal.orange} {...tab}>{one(r.ypg)}</Text>
          </Grid>
        ))}
      </Grid>
      <Cols t="repeat(2, minmax(0,1fr))">
        <Panel pal={pal} kicker="Top freshmen, yards per game"><Bars pal={pal} rows={DATA.young_fr.slice(0, 6)} get={(r) => r.ypg} fmt={one} /></Panel>
        <Panel pal={pal} kicker="Top sophomores, yards per game"><Bars pal={pal} rows={DATA.young_so.slice(0, 6)} get={(r) => r.ypg} fmt={one} /></Panel>
      </Cols>
    </InfoPoster>
  );
};
