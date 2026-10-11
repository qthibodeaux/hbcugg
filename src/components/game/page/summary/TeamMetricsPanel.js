import { Grid, Text } from "@chakra-ui/react";
import { pct } from "../../../../utils/gameHelpers";
import { getTeamLabel } from "../utils/teamHelpers";
import { SectionShell } from "../panels/SectionShell";
import { DualStatRow } from "../panels/DualStatRow";

export const TeamMetricsPanel = ({ awayId, homeId, teamBox, advancedTeam }) => {
  const aBox = teamBox[awayId] ?? {};
  const hBox = teamBox[homeId] ?? {};
  const aAdv = advancedTeam[awayId] ?? {};
  const hAdv = advancedTeam[homeId] ?? {};

  const rows = [
    { label: "EPA / Play", ak: "epa_per_play", src: "adv", dec: 2 },
    { label: "Success Rate", ak: "success_rate", src: "adv", format: pct },
    { label: "Yards / Play", ak: null, src: "calc", dec: 1 },
    { label: "EPA / Rush", ak: "epa_per_rush", src: "adv", dec: 2 },
    { label: "EPA / Pass", ak: "epa_per_pass", src: "adv", dec: 2 },
    { label: "Explosive Rate", ak: "explosive_rate_yardage", src: "adv", format: pct },
    { label: "3rd Down", ak: "third_down_conversion_rate", src: "box", format: pct },
    { label: "Red Zone TD%", ak: "red_zone_td_rate", src: "adv", format: pct },
    { label: "Stuff Rate", ak: "stuff_rate", src: "adv", format: pct, lowerIsBetter: true },
    { label: "Havoc Rate", ak: "havoc_rate_forced", src: "adv", format: pct },
  ];

  return (
    <SectionShell title="Team Metrics">
      <Grid templateColumns="1fr 1fr" gap={0} mb={2}>
        <Text fontSize="10px" fontWeight="bold" color="text.secondary">{getTeamLabel(awayId)}</Text>
        <Text fontSize="10px" fontWeight="bold" color="text.secondary" textAlign="right">{getTeamLabel(homeId)}</Text>
      </Grid>
      {rows.map((row) => {
        let av, hv;
        if (row.src === "calc") {
          av = aBox.plays_offense > 0 ? (aBox.total_yards ?? 0) / aBox.plays_offense : null;
          hv = hBox.plays_offense > 0 ? (hBox.total_yards ?? 0) / hBox.plays_offense : null;
        } else {
          const aData = row.src === "adv" ? aAdv : aBox;
          const hData = row.src === "adv" ? hAdv : hBox;
          av = aData[row.ak];
          hv = hData[row.ak];
        }
        return (
          <DualStatRow
            key={row.label}
            label={row.label}
            awayVal={av}
            homeVal={hv}
            format={row.format}
            dec={row.dec}
            lowerIsBetter={row.lowerIsBetter}
          />
        );
      })}
    </SectionShell>
  );
};
