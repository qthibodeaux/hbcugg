import { Grid, Text } from "@chakra-ui/react";
import { getTeamLabel } from "../utils/teamHelpers";
import { SectionShell } from "../panels/SectionShell";
import { DualStatRow } from "../panels/DualStatRow";

const fraction = (conv, att) =>
  att != null ? `${conv ?? 0}/${att}` : "—";

export const TeamStatsPanel = ({ awayId, homeId, teamBox }) => {
  const aBox = teamBox[awayId] ?? {};
  const hBox = teamBox[homeId] ?? {};

  const rows = [
    {
      label: "Total Yards",
      av: aBox.total_yards, hv: hBox.total_yards,
    },
    {
      label: "Turnovers",
      av: aBox.turnovers_committed, hv: hBox.turnovers_committed,
      lowerIsBetter: true,
    },
    {
      label: "3rd Down",
      av: aBox.third_down_conversions, hv: hBox.third_down_conversions,
      aDisplay: fraction(aBox.third_down_conversions, aBox.third_down_attempts),
      hDisplay: fraction(hBox.third_down_conversions, hBox.third_down_attempts),
    },
    {
      label: "4th Down",
      av: aBox.fourth_down_go_conversions, hv: hBox.fourth_down_go_conversions,
      aDisplay: fraction(aBox.fourth_down_go_conversions, aBox.fourth_down_goes),
      hDisplay: fraction(hBox.fourth_down_go_conversions, hBox.fourth_down_goes),
    },
  ];

  return (
    <SectionShell title="Team Stats">
      <Grid templateColumns="1fr 1fr" gap={0} mb={2}>
        <Text fontSize="10px" fontWeight="bold" color="text.secondary">{getTeamLabel(awayId)}</Text>
        <Text fontSize="10px" fontWeight="bold" color="text.secondary" textAlign="right">{getTeamLabel(homeId)}</Text>
      </Grid>
      {rows.map((row) => (
        <DualStatRow
          key={row.label}
          label={row.label}
          awayVal={row.av}
          homeVal={row.hv}
          awayDisplay={row.aDisplay}
          homeDisplay={row.hDisplay}
          lowerIsBetter={row.lowerIsBetter}
        />
      ))}
    </SectionShell>
  );
};
