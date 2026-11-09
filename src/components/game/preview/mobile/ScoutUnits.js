import { brandOf } from "../GamePreviewScout";
import { Box, Grid, Flex, Image, Text } from "@chakra-ui/react";
import { LINE, DIM } from "./scoutMobilePresentation";
import { teamLogo, teamShort } from "../../export/exportData";
import { Label, Chip, Section } from "./ScoutPrimitives";

// Mobile scout offense/defense unit comparison sections.

const UnitBlock = ({ offId, defId, rows }) => {
  const oc = brandOf(offId);
  const dc = brandOf(defId);
  return (
    <Box>
      <Grid templateColumns="minmax(0, 1fr) auto minmax(0, 1fr)" alignItems="center" px="0.75rem" py="0.55rem" bg="blackAlpha.300" borderTop="1px solid" borderColor={LINE}>
        <Flex align="center" gap="0.4rem"><Image src={teamLogo(offId)} alt="" w="1.2rem" h="1.2rem" objectFit="contain" /><Label color="white">{teamShort(offId)} offense</Label></Flex>
        <Label px="0.5rem">vs</Label>
        <Flex align="center" gap="0.4rem" justify="flex-end"><Label color="white">{teamShort(defId)} defense</Label><Image src={teamLogo(defId)} alt="" w="1.2rem" h="1.2rem" objectFit="contain" /></Flex>
      </Grid>
      {rows.map((r) => {
        const gap = r.off.rank && r.def.rank ? r.def.rank - r.off.rank : 0;
        const edge = gap > 0 ? offId : gap < 0 ? defId : null;
        return (
          <Box key={r.label} px="0.75rem" py="0.55rem" borderTop="1px solid" borderColor={LINE}>
            <Label textAlign="center" mb="0.35rem">{r.label}</Label>
            <Grid templateColumns="minmax(0, 1fr) 2rem minmax(0, 1fr)" alignItems="center" gap="0.5rem">
              <Flex align="center" gap="0.4rem">
                <Chip rank={r.off.rank} color={oc} on={edge === offId} />
                <Text fontSize="1.05rem" fontWeight="900" color={edge === offId ? "white" : "whiteAlpha.700"} fontVariantNumeric="tabular-nums" whiteSpace="nowrap">{r.off.display}</Text>
              </Flex>
              <Flex align="center" justify="center" w="2rem" h="2rem" borderRadius="full" bg="#0B0B0D" border="1px solid" borderColor="whiteAlpha.300">
                {edge ? <Image src={teamLogo(edge)} alt="" w="1.35rem" h="1.35rem" objectFit="contain" /> : <Text fontSize="0.8rem" fontWeight="900" color={DIM}>=</Text>}
              </Flex>
              <Flex align="center" gap="0.4rem" justify="flex-end">
                <Text fontSize="1.05rem" fontWeight="900" color={edge === defId ? "white" : "whiteAlpha.700"} fontVariantNumeric="tabular-nums" whiteSpace="nowrap">{r.def.display}</Text>
                <Chip rank={r.def.rank} color={dc} on={edge === defId} />
              </Flex>
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
};

export const Units = ({ m, refs }) => (
  <Section id="units" refs={refs} title="Unit matchups">
    <UnitBlock offId={m.away.team_id} defId={m.home.team_id} rows={m.units.away_offense} />
    <UnitBlock offId={m.home.team_id} defId={m.away.team_id} rows={m.units.home_offense} />
  </Section>
);
