import { useState, useMemo } from "react";
import { useCountingTeamStats } from "../../../hooks/useSWACData";
import { getPath, FMT, n0, DEF_TONE, OFF_TONE, passingLabelFor, rushingLabelFor } from "./profilePhases/phasePresentation";
import { Kicker, Section } from "./analyticsTabs/AnalyticsPrimitives";
import { MapHead, PassingHeadCard, HeadCard, FullGrid, PassingSectionShell } from "./profilePhases/PhasePrimitives";
import { PassFieldMap } from "./profilePhases/PassingFieldMap";
import { RushLaneMap } from "./profilePhases/RushingFieldMap";
import { Box, Flex, Text } from "@chakra-ui/react";
import { HavocMap } from "./profilePhases/HavocMap";
import { PHASES } from "./profilePhases/phaseConfig";

export const TeamProfilePhasesPassingCopy = ({ season, teamId, row, vals, adv, maps, tapeRanks, advRanks, hubRanks, passingLeaders, rushingLeaders, teamColors }) => {
  const [passSide, setPassSide] = useState("offense");
  const [rushSide, setRushSide] = useState("offense");
  const [tips, setTips] = useState(true);

  const { teams: countingTeams, gamesThrough } = useCountingTeamStats(season);
  const counting = useMemo(
    () => (countingTeams ?? []).find((t) => t.team_id === teamId) ?? null,
    [countingTeams, teamId],
  );
  const total = (countingTeams ?? []).length || 18;

  const cache = {};
  const countRank = (root, cacheKey, getter, high) => {
    const key = `${root}|${cacheKey}|${high}`;
    if (!cache[key]) {
      const sorted = (countingTeams ?? [])
        .map((t) => ({ id: t.team_id, v: getter(t[root]) }))
        .filter((x) => Number.isFinite(x.v))
        .sort((a, b) => (high ? b.v - a.v : a.v - b.v));
      cache[key] = Object.fromEntries(sorted.map((x, i) => [x.id, i + 1]));
    }
    return cache[key][teamId];
  };

  const resolve = (spec, side) => {
    const block = counting?.[side.root] ?? null;
    const scoped = side.base ? getPath(block, side.base.slice(0, -1)) : block;
    const fmt = FMT[spec.fmt] ?? n0;

    if (spec.src === "count" || spec.src === "calc") {
      const get = spec.src === "calc" ? spec.num : (b) => getPath(b, spec.key);
      const value = get(scoped);
      const high = side.flip ? spec.defHigh ?? !spec.high : spec.high;
      const base = side.base.slice(0, -1);
      return {
        label: spec.label,
        value: spec.text ? spec.text(scoped) : fmt(value),
        note: spec.note ? spec.note(scoped) : null,
        rank: countRank(side.root, `${spec.key}|${base}`, (b) => get(base ? getPath(b, base) : b), high),
      };
    }

    const field = `${side.prefix}_${spec.key}`;
    const source = spec.src === "hub" ? row?.metrics : spec.src === "adv" ? adv : vals;
    const ranks = spec.src === "hub" ? hubRanks : spec.src === "adv" ? advRanks : tapeRanks;
    return {
      label: spec.label,
      value: fmt(source?.[field]),
      note: spec.note ? spec.note(scoped) : null,
      rank: ranks?.[field]?.[teamId],
    };
  };

  const games = counting?.games;
  const note = <Kicker color="whiteAlpha.400">{games ? `${games} games · rank of ${total}` : season}</Kicker>;

  // A season whose feed doesn't place plays (2019–2023) ships no map; skip it.
  const mapFor = (id) => {
    if (id === "pass" && !(passSide === "offense" ? maps.passOff : maps.passDef)) return null;
    if (id === "rush" && !(rushSide === "offense" ? maps.rushOff : maps.rushDef)) return null;
    if (id === "havoc" && !maps.havoc) return null;
    if (id === "pass") {
      return (
        <>
          <MapHead title="Passing field map" side={passSide} onSide={setPassSide} options={[["offense", "Offense"], ["defense", "Defense"]]} />
          <PassFieldMap
            grid={passSide === "offense" ? maps.passOff : maps.passDef}
            targets={passSide === "offense" ? maps.targetsOff : maps.targetsDef}
            side={passSide}
          />
        </>
      );
    }
    if (id === "rush") {
      return (
        <>
          <MapHead title="Rushing lanes" side={rushSide} onSide={setRushSide} />
          <RushLaneMap
            lanes={rushSide === "offense" ? maps.rushOff : maps.rushDef}
            leaders={rushSide === "offense" ? rushingLeaders?.offense : rushingLeaders?.defense}
            side={rushSide}
            teamColors={teamColors}
          />
        </>
      );
    }
    if (id === "havoc") {
      return (
        <Box mt={5}>
          <Kicker color="whiteAlpha.700" mb={2}>Havoc map</Kicker>
          <HavocMap zones={maps.havoc} />
        </Box>
      );
    }
    return null;
  };

  return (
    <Flex direction="column" gap={4}>
      <Flex justify="flex-end">
        <Box as="button" onClick={() => setTips((v) => !v)} px={3} py={1.5} borderRadius="md"
          bg={tips ? "whiteAlpha.100" : "brand.500"} color={tips ? "whiteAlpha.700" : "white"}
          fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em"
          _hover={{ bg: tips ? "whiteAlpha.200" : "brand.500" }}>
          {tips ? "Hide definitions" : "Show definitions"}
        </Box>
      </Flex>

      {!counting && (
        <Section title="Phase breakdown">
          <Text fontSize="sm" color="whiteAlpha.600">
            No counting stats on file for {season}. The rate and EPA numbers above still apply.
          </Text>
        </Section>
      )}

      {PHASES.map((phase) => {
        const isPassing = phase.id === "passing";
        const isRushing = phase.id === "rushing";
        const content = (
          <>
            <Flex gap={3} direction={{ base: "column", md: "row" }} align="stretch">
              {phase.sides.map((side, si) => {
                const tone = si ? DEF_TONE : OFF_TONE;
                const label = isPassing ? passingLabelFor(side) : isRushing ? rushingLabelFor(side) : side.label;
                if (isPassing || isRushing) {
                  return (
                    <PassingHeadCard
                      key={side.label} label={label} tone={tone} total={total} tips={tips}
                      cells={phase.head.map((spec) => resolve(spec, side))}
                      leaders={
                        isPassing
                          ? (side.root === "offense" ? passingLeaders?.offense : passingLeaders?.defense)
                          : (side.root === "offense" ? rushingLeaders?.offense?.rail ?? [] : rushingLeaders?.defense?.rail ?? [])
                      }
                    />
                  );
                }
                return (
                  <HeadCard
                    key={side.label} label={label} tone={tone} total={total} tips={tips}
                    cells={phase.head.map((spec) => resolve(spec, side))}
                  />
                );
              })}
            </Flex>
            <Flex gap={5} mt={4} direction={{ base: "column", lg: "row" }} align="flex-start">
              {phase.sides.map((side, si) => (
                <FullGrid
                  key={side.label} label={isPassing ? passingLabelFor(side) : isRushing ? rushingLabelFor(side) : side.label} tone={si ? DEF_TONE : OFF_TONE} total={total} tips={tips}
                  cells={phase.full.map((spec) => resolve(spec, side))}
                />
              ))}
            </Flex>
            {mapFor(phase.map)}
          </>
        );

        if (isPassing) return <PassingSectionShell key={phase.id}>{content}</PassingSectionShell>;
        return <Section key={phase.id} title={phase.title} right={note}>{content}</Section>;
      })}

      {gamesThrough?.label && <Kicker color="whiteAlpha.300" px={1}>Through {gamesThrough.label}</Kicker>}
    </Flex>
  );
};

export default TeamProfilePhasesPassingCopy;
