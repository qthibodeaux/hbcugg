import { Grid, Box, Text, Flex } from "@chakra-ui/react";
import { fgOf, DATA, InfoPoster, Logo, Scatter, one, lastName, pct, epa, int, Who, teamShortName, caps } from "../kit";
import { Columns, FieldBands, Giant, HeatMatrix, HeightLadder, Hero, MiniSlope, Ring, StackedTeams } from "../infoParts";
import { Lanes } from "../groupTrendsYards";
import { teamFillColors } from "../../../../game/export/exportData";
import { Card as Panel, NumberTile } from "../../dlinePosters/PosterPrimitives";
import { Bars, Cols, teamOf } from "./Primitives";

// ── How they get yards: a height ladder, a field from above, giant split numbers ──

const LADDER_STATS = [
  ["Deep catch rate", DATA.height_deep, (r) => r.catch, pct],
  ["Deep yds per target", DATA.height_deep, (r) => r.ypt, one],
  ["Deep share", DATA.height_all, (r) => r.deep_share, pct],
];

export const YardsInfo = ({ pal, innerRef }) => {
  const bean = DATA.yac_per[0], deep = DATA.deep_threats[0], runner = DATA.yac_total[1];
  const depths = ["deep", "medium", "short"].map((d) => DATA.league_depth.find((r) => r.depth === d));
  return (
    <InfoPoster pal={pal} innerRef={innerRef} title="How they get" accent="their yards">
      <Cols t="minmax(0,1.9fr) minmax(0,1fr)">
        <Panel pal={pal} kicker="By listed height">
          <HeightLadder pal={pal} groups={DATA.height_all.map((b) => b.bucket)} stats={LADDER_STATS} />
        </Panel>
        <Flex direction="column" gap="2px">
          <Hero pal={pal} tone={{ fill: pal.up, ink: "#FFFFFF" }} kicker="Thrown past the sticks on 3rd down" flex={1} justify="center">
            <Giant size={92}>44.8%</Giant>
            <Text fontSize="16px" mt="8px" {...caps}>Converted</Text>
          </Hero>
          <Hero pal={pal} tone={{ fill: pal.down, ink: "#FFFFFF" }} kicker="Thrown short of the sticks" flex={1} justify="center">
            <Giant size={92}>27.6%</Giant>
            <Text fontSize="16px" mt="8px" {...caps}>Converted</Text>
          </Hero>
        </Flex>
      </Cols>
      <Cols t="minmax(0,1.2fr) minmax(0,1fr)">
        <Panel pal={pal} kicker="The league, by how far it's thrown">
          <FieldBands pal={pal} rows={depths} stats={[["Comp", (r) => pct(r.comp)], ["Yds / att", (r) => one(r.ypa)], ["EPA", (r) => epa(r.epa)]]} />
        </Panel>
        <Panel pal={pal} kicker="Favorite side of the field">
          <Flex direction="column" gap="10px">
            {DATA.direction.slice(0, 4).map((r) => (
              <Box key={r.name}>
                <Box mb="4px"><Who pal={pal} id={r.id} name={r.name} size={24} font="15px" /></Box>
                <Lanes pal={pal} r={r} h={62} />
              </Box>
            ))}
          </Flex>
        </Panel>
      </Cols>
      <Cols t="repeat(3, minmax(0,1fr))">
        <NumberTile pal={pal} value={one(bean.yac)} ink={pal.brand} title={`${lastName(bean.name)}: after the catch`} text={`Yards per catch, on ${bean.adot.toFixed(1)} yards of target depth.`} />
        <NumberTile pal={pal} value={deep.y} ink={pal.orange} title={`${lastName(deep.name)}: down the field`} text={`Yards on throws of 13+ air yards, with ${deep.td} TDs.`} />
        <NumberTile pal={pal} value={runner.yac_total} ink={pal.brand} title={`${lastName(runner.name)}: the runner`} text={`Yards after the catch on only ${runner.catches} catches.`} />
      </Cols>
      <Cols t="repeat(2, minmax(0,1fr))">
        <Panel pal={pal} kicker="Deep threats, yards on 13+ air yards"><Columns pal={pal} rows={DATA.deep_threats} get={(r) => r.y} fmt={int} h={190} sub={(r) => lastName(r.name)} /></Panel>
        <Panel pal={pal} kicker="Yards after the catch, total"><Columns pal={pal} rows={DATA.yac_total} get={(r) => r.yac_total} fmt={int} h={190} sub={(r) => lastName(r.name)} /></Panel>
      </Cols>
    </InfoPoster>
  );
};

// ── Who they trust: rings and stacked bars, a heat matrix, rings for the QBs ──

export const TrustInfo = ({ pal, innerRef }) => {
  const fg = fgOf(pal);
  const whit = DATA.t_share[0], rem = DATA.y_share[0];
  const invTrack = pal.fg === "255,255,255" ? "rgba(17,17,20,0.15)" : "rgba(255,255,255,0.18)";
  return (
    <InfoPoster pal={pal} innerRef={innerRef} title="Who does each" accent="offense trust">
      <Cols t="minmax(0,1fr) minmax(0,1.7fr)">
        <Flex direction="column" gap="2px">
          <Hero pal={pal} tone="ink" kicker="Feeding one receiver">
            <Flex align="center" gap="16px" mb="14px">
              <Ring share={0.6} color={pal.brand} track={invTrack} label="60%" ink={pal.bg} />
              <Text fontSize="17px" lineHeight={1.25} {...caps}>Won, top target at 35% or more</Text>
            </Flex>
            <Flex align="center" gap="16px">
              <Ring share={0.43} color={pal.orange} track={invTrack} label="43%" ink={pal.bg} />
              <Text fontSize="17px" lineHeight={1.25} {...caps}>Won, top target under 25%</Text>
            </Flex>
          </Hero>
          <NumberTile pal={pal} value={pct(whit.t_share)} ink={pal.brand} title={`${lastName(whit.name)}: the focal point`} text="Share of UAPB's targets, the most of anyone on a team with 5 or more games." />
          <NumberTile pal={pal} value={pct(rem.y_share)} ink={pal.orange} title={`${lastName(rem.name)}: the most yards`} text="Share of his team's receiving yards." />
          <Panel pal={pal} kicker="The biggest downs" flex={1}>
            <Bars pal={pal} rows={DATA.trusted.slice(0, 6)} get={(r) => r.share} fmt={pct} nameW={170} rowH={38} />
          </Panel>
        </Flex>
        <Panel pal={pal} kicker="How each offense splits its targets: top target, second, everyone else">
          <StackedTeams pal={pal} rows={DATA.concentration} rowH={52} />
        </Panel>
      </Cols>
      <Panel pal={pal} kicker="The go to target on every down">
        <HeatMatrix pal={pal} rows={DATA.go_by_down} cols={["1st", "2nd", "3rd", "4th"]} rowH={38}
          rowHead={(t) => <Who pal={pal} id={t.id} size={26} font="15px" />}
          cell={(t, j) => {
            const d = t.downs[j];
            if (!d) return null;
            const names = d.names.map(lastName);
            return { text: names.length > 2 ? `${names.slice(0, 2).join(" / ")} +${names.length - 2}` : names.join(" / "), sub: pct(d.share), share: d.share };
          }} />
      </Panel>
      <Panel pal={pal} kicker="The quarterback's most reliable target">
        <Grid templateColumns="repeat(6, minmax(0,1fr))" gap="12px">
          {DATA.reliable.slice(0, 12).map((r) => (
            <Flex key={`${r.qb}${r.wr}`} direction="column" align="center" textAlign="center" minW={0}>
              <Ring share={r.rate} color={pal.brand} track={fg(0.08)} size={120} width={14} label={pct(r.rate)} labelSize={28} ink={pal.ink} />
              <Text mt="8px" fontSize="14px" fontWeight="950" lineHeight={1.05} textTransform="uppercase" whiteSpace="nowrap">{lastName(r.wr)}</Text>
              <Text fontSize="12px" color={fg(0.6)} whiteSpace="nowrap" {...caps}>From {lastName(r.qb)}</Text>
            </Flex>
          ))}
        </Grid>
      </Panel>
    </InfoPoster>
  );
};

// ── Team identity: a wall of logos by type, a map of styles, the league's habits ──

const TYPE_ORDER = ["Deep Shot", "Quick Game", "Spread It Around", "One-Man Show", "Balanced"];
const BANDS = ["short", "medium", "long"];
const DOWN_NAMES = ["1st", "2nd", "3rd", "4th"];

export const IdentityInfo = ({ pal, innerRef }) => {
  const fg = fgOf(pal);
  const allEpa = (id) => teamOf(id)?.epa_26;
  const famu = DATA.by_score[0], norfolk = DATA.concentration[0];
  const at = (d, b) => DATA.tendency.find((r) => r.down === d && r.band === b);
  return (
    <InfoPoster pal={pal} innerRef={innerRef} title="What kind of" accent="passing offense">
      <Grid templateColumns="repeat(5, minmax(0,1fr))" gap="2px" alignItems="stretch">
        {TYPE_ORDER.map((type, i) => {
          const teams = DATA.types.filter((t) => t.type === type).sort((a, b) => allEpa(b.id) - allEpa(a.id));
          return (
            <Flex key={type} direction="column" minW={0} bg={pal.panel}>
              <Flex align="flex-end" h="96px" px="14px" pb="10px" style={{ background: i === 0 ? pal.brand : pal.ink, color: i === 0 ? "#FFFFFF" : pal.bg }}>
                <Text fontSize="26px" fontWeight="950" fontStyle="italic" lineHeight={0.95} textTransform="uppercase">{type.replace("One-Man", "One Man")}</Text>
              </Flex>
              <Flex direction="column" px="10px" py="8px">
                {teams.map((t) => (
                  <Flex key={t.id} direction="column" align="center" py="10px" borderBottom={`1px solid ${fg(0.06)}`}>
                    <Logo id={t.id} size={58} />
                    <Text mt="4px" fontSize="14px" fontWeight="950" textTransform="uppercase" whiteSpace="nowrap">{teamShortName(t.id)}</Text>
                    <Text fontSize="20px" fontWeight="950" color={pal.orange} style={{ fontVariantNumeric: "tabular-nums" }}>{epa(allEpa(t.id))}</Text>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          );
        })}
      </Grid>
      <Cols t="minmax(0,1.9fr) minmax(0,1fr)">
        <Panel pal={pal} kicker="How deep they throw × how much goes to one receiver">
          <Scatter pal={pal} rows={DATA.types} w={785} h={580} logo={44} x={(r) => r.adot} y={(r) => r.top_share} xFmt={(v) => v.toFixed(1)} yFmt={pct} xLabel="Target depth" yLabel="Top target's share" />
        </Panel>
        <Flex direction="column" gap="2px">
          <Hero pal={pal} kicker="The biggest swing" flex={1} justify="center">
            <Giant size={96}>+{Math.round(famu.swing * 100)}</Giant>
            <Text fontSize="26px" fontWeight="950" mt="6px" textTransform="uppercase">{teamShortName(famu.id)}</Text>
            <Text fontSize="17px" fontWeight="700" mt="6px" lineHeight={1.3}>Throws {pct(famu.lead)} of the time ahead and {pct(famu.trail)} behind on neutral downs.</Text>
          </Hero>
          <Hero pal={pal} tone={teamFillColors(norfolk.id)} kicker="The one man show" flex={1} justify="center">
            <Giant size={96}>{pct(norfolk.top_share)}</Giant>
            <Text fontSize="26px" fontWeight="950" mt="6px" textTransform="uppercase">{teamShortName(norfolk.id)}</Text>
            <Text fontSize="17px" fontWeight="700" mt="6px" lineHeight={1.3}>Share of its targets to {lastName(norfolk.top)}.</Text>
          </Hero>
        </Flex>
      </Cols>
      <Cols t="minmax(0,1.15fr) minmax(0,1fr)">
        <Panel pal={pal} kicker="When the league throws: pass rate by down and distance">
          <HeatMatrix pal={pal} rows={[1, 2, 3, 4]} cols={BANDS} rowH={110} headW="80px" font="34px"
            rowHead={(d) => <Text fontSize="28px" fontWeight="950" fontStyle="italic" textTransform="uppercase">{DOWN_NAMES[d - 1]}</Text>}
            cell={(d, j) => { const c = at(d, BANDS[j]); return c ? { text: pct(c.mean), share: c.mean } : null; }} />
        </Panel>
        <Panel pal={pal} kicker="Neutral down pass rate, ahead to behind">
          <MiniSlope pal={pal} rows={DATA.by_score.slice(0, 8)} a={(r) => r.lead} b={(r) => r.trail} fmt={pct} aLabel="Ahead" bLabel="Behind" w={520} h={490} />
        </Panel>
      </Cols>
      <Panel pal={pal} kicker="Who gets the targets: receivers, tight ends, backs">
        <Flex align="flex-end" gap="6px">
          {DATA.group_use.map((t) => (
            <Flex key={t.id} direction="column" align="center" flex={1} minW={0}>
              <Flex direction="column" w="100%" h="200px" rowGap="2px">
                {t.share_RB > 0 && <Box bg={pal.orange} style={{ flex: t.share_RB }} />}
                {t.share_TE > 0 && <Box bg={pal.brand} style={{ flex: t.share_TE }} />}
                <Box bg={fg(0.18)} style={{ flex: t.share_WR ?? 0 }} />
              </Flex>
              <Box mt="8px"><Logo id={t.id} size={36} /></Box>
            </Flex>
          ))}
        </Flex>
      </Panel>
    </InfoPoster>
  );
};
