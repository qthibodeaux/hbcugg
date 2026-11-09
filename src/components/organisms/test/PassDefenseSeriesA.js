import { useState } from "react";
import { Box, Text } from "@chakra-ui/react";
import { PassDefenseSeries } from "../../molecules/stats/passDefense/PassDefenseSeries";
import { paletteOf } from "../../molecules/export/posterPalette";
import { useColorScheme } from "../../../theme/colorScheme";
import fixture from "./passDefenseFixture.json";

// Four-team excerpt selected verbatim from the November 3 published bundle.
// DSU supplies an unranked sample; TSU retains the source-conflict note.
export const PassDefenseSeriesA = () => {
  const [scheme] = useColorScheme();
  const [selection, setSelection] = useState({ visual: "PD01", scope: "all", overview: "ball_disruption_rate", trajectory: "completion_rate", situation: "down_1", role: "sacks", teamId: "swacjsu" });
  const pal = paletteOf(scheme);
  return (
    <Box h="full" w="full" overflowY="auto">
      <Text mb={4} fontSize="sm">Pass-defense lab: four real teams from the published 2026 cohort. Use all thirteen visual selectors and the site Light/Night switch. Live data loads all eighteen teams.</Text>
      <PassDefenseSeries data={fixture} selection={selection} onChange={setSelection} pal={pal} scheme={scheme} />
      <Text mt={8} mb={4} fontWeight="900">Loading / transport-error / empty states</Text>
      <PassDefenseSeries data={{}} selection={selection} onChange={setSelection} pal={pal} scheme={scheme} isLoading />
      <PassDefenseSeries data={{}} selection={selection} onChange={setSelection} pal={pal} scheme={scheme} error={new Error("Published source unavailable (lab state)")} />
      <PassDefenseSeries data={{ documents: [] }} selection={{ ...selection, visual: "PD01" }} onChange={setSelection} pal={pal} scheme={scheme} />
    </Box>
  );
};
