import PageShell from "../../layouts/PageShell";
import { PlayerStatTables } from "./boxScorePacket/PlayerTables";
import { GameProductionPassingFieldMapA } from "./GameProductionPassingFieldMapA";
import { GameProductionRushing } from "./GameProductionRushing";
import { GameProductionDefenseMasteryA } from "./GameProductionDefenseMasteryA";
import { GameProductionSpecialTeamsC } from "./GameProductionSpecialTeamsC";
import { BoxScoreBanner } from "./boxScorePacket/PacketBanner";

export const GameBoxScorePacketContent = ({ game }) => (
  <PageShell listContent={<PlayerStatTables game={game} />}>
    <PageShell.Slot cols={4} rows={2}>
      <GameProductionPassingFieldMapA />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={2}>
      <GameProductionRushing />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={2}>
      <GameProductionDefenseMasteryA />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={2}>
      <GameProductionSpecialTeamsC />
    </PageShell.Slot>
  </PageShell>
);

export const GameBoxScorePacketLab = ({ game }) => (
  <PageShell listContent={<PlayerStatTables game={game} />}>
    <PageShell.Slot cols={4}>
      <BoxScoreBanner game={game} />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={2}>
      <GameProductionPassingFieldMapA />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={2}>
      <GameProductionRushing />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={2}>
      <GameProductionDefenseMasteryA />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={2}>
      <GameProductionSpecialTeamsC />
    </PageShell.Slot>
  </PageShell>
);
