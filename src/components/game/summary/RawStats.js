import {  Grid, Text } from "@chakra-ui/react";
import { BarChart3 } from "lucide-react";
import { Panel, Kicker } from "./GameSummaryPanel";
import { fmt } from "./gameSummaryUtils";

export const RawStats = ({ model }) => (
  <Panel accent="#A0AEC0" p={3}>
    <Kicker icon={BarChart3} color="#A0AEC0">
      Raw Team Stats
    </Kicker>
    <Grid templateColumns="1.3fr 1fr 1fr" gap={2} alignItems="center">
      <Text
        fontSize="9px"
        color="text.muted"
        fontWeight="black"
        textTransform="uppercase"
      >
        Stat
      </Text>
      {model.teams.map((team) => (
        <Text
          key={team.id}
          fontSize="9px"
          color="text.muted"
          fontWeight="black"
          textAlign="right"
          textTransform="uppercase"
        >
          {team.label}
        </Text>
      ))}
      {[
        ["Total Yards", "total_yards"],
        ["Pass", "pass_yards"],
        ["Rush", "rush_yards"],
        ["Plays", "plays_offense"],
        ["Turnovers", "turnovers_committed"],
        ["Sacks Made", "sacks_made"],
        ["3rd Down", "third_down_conversions", "third_down_attempts"],
        ["4th Down", "fourth_down_go_conversions", "fourth_down_goes"],
      ].map(([label, key, attempts]) => (
        <>
          <Text
            key={`${label}-label`}
            fontSize="10px"
            color="text.secondary"
            fontWeight="black"
          >
            {label}
          </Text>
          {model.teams.map((team) => (
            <Text
              key={`${team.id}-${label}`}
              fontSize="11px"
              color="white"
              fontWeight="black"
              textAlign="right"
            >
              {attempts
                ? `${team.box[key] ?? 0}/${team.box[attempts] ?? 0}`
                : fmt(team.box[key], 0)}
            </Text>
          ))}
        </>
      ))}
    </Grid>
  </Panel>
);
