import { Grid, Flex, Text, Image, Box } from "@chakra-ui/react";
import { LINE, DIM, TAPE } from "./scoutMobilePresentation";
import { Chip, Section, Label } from "./ScoutPrimitives";
import { brandOf } from "../GamePreviewScout";
import { teamLogo, teamShort } from "../../export/exportData";

// Mobile scout tale-of-the-tape rows and comparison section.

const TapeRow = ({ label, a, h, ac, hc }) => {
  // Lower rank is better on every row (the backend ranks each field by its own
  // polarity), so the lit side is simply the smaller rank.
  const aOn = a.rank && h.rank ? a.rank < h.rank : false;
  const hOn = a.rank && h.rank ? h.rank < a.rank : false;
  return (
    <Grid templateColumns="minmax(0, 1fr) auto minmax(0, 1fr)" alignItems="center" gap="0.5rem" px="0.75rem" py="0.55rem" borderTop="1px solid" borderColor={LINE}>
      <Flex align="center" gap="0.4rem" minW={0}>
        <Chip rank={a.rank} color={ac} on={aOn} />
        <Text fontSize="1.05rem" fontWeight="900" color={aOn ? "white" : "whiteAlpha.700"} fontVariantNumeric="tabular-nums" whiteSpace="nowrap">{a.display}</Text>
      </Flex>
      <Text fontSize="0.62rem" fontWeight="900" color={DIM} textTransform="uppercase" letterSpacing="0.06em" textAlign="center" maxW="6.5rem" lineHeight={1.2}>{label}</Text>
      <Flex align="center" gap="0.4rem" justify="flex-end" minW={0}>
        <Text fontSize="1.05rem" fontWeight="900" color={hOn ? "white" : "whiteAlpha.700"} fontVariantNumeric="tabular-nums" whiteSpace="nowrap">{h.display}</Text>
        <Chip rank={h.rank} color={hc} on={hOn} />
      </Flex>
    </Grid>
  );
};

export const Tape = ({ m, refs }) => {
  const ac = brandOf(m.away.team_id);
  const hc = brandOf(m.home.team_id);
  return (
    <Section id="tape" refs={refs} title="Tale of the tape" right={<Label>{m.away.games ?? "—"} · {m.home.games ?? "—"} games</Label>}>
      <Grid templateColumns="minmax(0, 1fr) minmax(0, 1fr)" px="0.75rem" pb="0.5rem">
        <Flex align="center" gap="0.4rem"><Image src={teamLogo(m.away.team_id)} alt="" w="1.3rem" h="1.3rem" objectFit="contain" /><Text fontSize="0.85rem" fontWeight="900" color={ac}>{teamShort(m.away.team_id)}</Text></Flex>
        <Flex align="center" gap="0.4rem" justify="flex-end"><Text fontSize="0.85rem" fontWeight="900" color={hc}>{teamShort(m.home.team_id)}</Text><Image src={teamLogo(m.home.team_id)} alt="" w="1.3rem" h="1.3rem" objectFit="contain" /></Flex>
      </Grid>
      {TAPE.map((g) => (
        <Box key={g.key}>
          <Box px="0.75rem" py="0.4rem" bg="blackAlpha.300" borderTop="1px solid" borderColor={LINE}><Label color="whiteAlpha.700">{g.title}</Label></Box>
          {g.rows.map(([k, label]) => (
            <TapeRow key={k} label={label} a={m.away[g.key][k]} h={m.home[g.key][k]} ac={ac} hc={hc} />
          ))}
        </Box>
      ))}
    </Section>
  );
};
