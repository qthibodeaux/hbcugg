import { QbBanner, OLineRow, RushingCol } from "./PlayerPassingRushing";
import { Grid } from "@chakra-ui/react";
import { ReceivingCol, Defenders, ProductionLeft } from "./PlayerReceivingDefense";
import { Frame, Banner } from "./PosterPrimitives";

const PlayersBody = ({ pal }) => (
  <>
    <QbBanner pal={pal} />
    <OLineRow pal={pal} />
    <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" gap="2px">
      <RushingCol pal={pal} />
      <ReceivingCol pal={pal} />
    </Grid>
    <Defenders pal={pal} />
  </>
);

export const PlayersPosterYours = ({ pal, innerRef }) => (
  <Frame pal={pal} innerRef={innerRef} page="2 / 3">
    <Banner pal={pal} title="Player profiles" />
    <PlayersBody pal={pal} />
  </Frame>
);

export const PlayersPosterMine = ({ pal, innerRef }) => (
  <Frame pal={pal} innerRef={innerRef} page="2 / 3">
    <Banner pal={pal} title="Player profiles" />
    <PlayersBody pal={pal} />
    <ProductionLeft pal={pal} />
  </Frame>
);
