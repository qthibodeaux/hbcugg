import { useMemo } from "react";
import { buildModel } from "./gameSummaryPacket/packetModel";
import PageShell from "../../layouts/PageShell";
import { TeamMetrics, HiddenEdges } from "./gameSummaryPacket/MetricsPanels";
import { QuarterStrip, ScoringTimeline, KeyPlays, WhyItHappened } from "./gameSummaryPacket/ScoringStory";
import { RawStats, StandingsContext, ImpactLeaders } from "./gameSummaryPacket/PlayersRawStats";
import { DriveLedger } from "./gameSummaryPacket/DriveLedger";

export const GameSummaryPacketContent = ({ game, includeBanner = false, embedded = false }) => {
  const model = useMemo(() => buildModel(game), [game]);

  const slots = (
    <>
      <PageShell.Slot cols={2} rows={2}>
        <TeamMetrics model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <QuarterStrip model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <RawStats model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <HiddenEdges model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <StandingsContext model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={2} rows={2}>
        <ImpactLeaders model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={2} rows={2}>
        <ScoringTimeline model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={1} rows={2}>
        <KeyPlays model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={1} rows={2}>
        <WhyItHappened model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={4} rows={2}>
        <DriveLedger model={model} />
      </PageShell.Slot>
    </>
  );

  if (embedded) return slots;
  return <PageShell>{slots}</PageShell>;
};

export const GameSummaryPacketLab = ({ game }) => (
  <GameSummaryPacketContent game={game}  />
);
