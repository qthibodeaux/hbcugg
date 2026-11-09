import { Poster } from "./PosterPrimitives";
import { TeamTable, LeagueLines, TeamStories, StaffSplit, ProductionWent } from "./TeamPanels";
import { Grid, Text } from "@chakra-ui/react";
import { LeagueStrip, ThirdDown, ShortYardage, RedZone, Clutch, Finishers, Depth, Size } from "./SituationalPanels";
import { fgOf, rowsOf, caps } from "./posterModel";
import { PEOPLE, lastSchool } from "../deepDiveModel";
import { Leader, PlayersDeveloped, Falling, PeopleTable, NotReplaced } from "./PlayerPanels";

export const DlineTeamsPoster = ({ pal, innerRef }) => (
  <Poster pal={pal} title="Who got better" accent="up front" innerRef={innerRef}>
    <TeamTable pal={pal} />
    <LeagueLines pal={pal} />
    <TeamStories pal={pal} />
    <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" gap="2px">
      <StaffSplit pal={pal} />
      <ProductionWent pal={pal} />
    </Grid>
  </Poster>
);

export const DlineSituationalPoster = ({ pal, innerRef }) => (
  <Poster pal={pal} title="When it" accent="matters" innerRef={innerRef}>
    <LeagueStrip pal={pal} />
    <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" gap="2px">
      <ThirdDown pal={pal} />
      <ShortYardage pal={pal} />
    </Grid>
    <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" gap="2px">
      <RedZone pal={pal} />
      <Clutch pal={pal} />
    </Grid>
    <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="2px">
      <Finishers pal={pal} />
      <Depth pal={pal} />
      <Size pal={pal} />
    </Grid>
  </Poster>
);

export const DlinePlayersPoster = ({ pal, innerRef }) => {
  const fg = fgOf(pal);
  const transfers = (PEOPLE.newcomers ?? []).filter((p) => p.is_transfer && p.previous_school).slice(0, 6);
  const gone = rowsOf("departed_players").slice(0, 6);
  return (
    <Poster pal={pal} title="Who's making" accent="plays" innerRef={innerRef}>
      <Leader pal={pal} />
      <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" gap="2px">
        <PlayersDeveloped pal={pal} />
        <Falling pal={pal} />
      </Grid>
      <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" gap="2px">
        <PeopleTable pal={pal} kicker="Impact transfers" head="New to their school, already producing." rows={transfers}
          third={{ label: "From", cell: (r) => <Text fontSize="15px" fontWeight="800" color={fg(0.75)} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{lastSchool(r.previous_school)}</Text> }} />
        <PeopleTable pal={pal} kicker="Gone" head="Last year's top producers who aren't back. Their 2025 lines." rows={gone}
          third={{ label: "Status", cell: (r) => <Text fontSize="13px" color={r.status === "left" ? pal.orange : fg(0.6)} {...caps}>{r.status === "left" ? "Left" : "Graduated"}</Text> }} />
      </Grid>
      <NotReplaced pal={pal} />
    </Poster>
  );
};
