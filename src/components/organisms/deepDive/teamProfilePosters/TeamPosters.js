// Existing fixed PVAMU profile poster variants, using the shared profile data model.
import { Frame, Banner } from "./PosterPrimitives";
import { ResultsStrip, TrendCard, ResultsTrend, VsLeague } from "./TeamResults";
import { SideColumns, MirrorTable } from "./TeamStatTables";
import { SpecialTeams, Drives } from "./TeamDriveSpecialTeams";
import { Grid } from "@chakra-ui/react";

export const TeamPosterYours = ({ pal, innerRef }) => (
  <Frame pal={pal} innerRef={innerRef} page="1 / 3">
    <Banner pal={pal} title="Team profile" />
    <ResultsStrip pal={pal} />
    <TrendCard pal={pal} />
    <SideColumns pal={pal} />
    <SpecialTeams pal={pal} />
  </Frame>
);

export const TeamPosterMine = ({ pal, innerRef }) => (
  <Frame pal={pal} innerRef={innerRef} page="1 / 3">
    <Banner pal={pal} title="Team profile" />
    <Grid templateColumns="minmax(0,2.1fr) minmax(0,1fr)" gap="2px">
      <ResultsTrend pal={pal} />
      <VsLeague pal={pal} />
    </Grid>
    <MirrorTable pal={pal} />
    <Drives pal={pal} />
    <SpecialTeams pal={pal} attributes />
  </Frame>
);
