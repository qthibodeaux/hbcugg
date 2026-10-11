import { Children } from "react";
import { Grid } from "@chakra-ui/react";
import PageShell from "../../layouts/PageShell";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import {
  RosterCompositionCard,
  RosterDepthSnapshotCard,
  RosterExperienceCard,
  RosterGeographyCard,
  RosterKpiTile,
  RosterPhysicalProfileCard,
  RosterTransferCard,
} from "./RosterHubCards";
import { RosterOutlookCarousel } from "./RosterOutlookCarousel";

const uniquePalette = (team) => {
  const colors = [
    team.colors?.primary,
    team.colors?.secondary,
    team.colors?.accent,
    "#FFFFFF",
  ].filter(Boolean);

  return [...new Set(colors)];
};

// Every card in here was a PageShell.Slot with radius="lg" — square corners
// are a mobile rule, so the radius is dropped there. One wrapper instead of
// editing every slot, and it stays a plain PageShell.Slot on desktop.
const Slot = ({ radius = "lg", children, ...rest }) => {
  const { isMobile } = useLayoutDensity();
  return (
    <PageShell.Slot radius={isMobile ? "none" : radius} {...rest}>
      {children}
    </PageShell.Slot>
  );
};

// Desktop keeps the four KPI tiles as individual 1-col slots; mobile groups
// them into a single 4-across strip with a fixed height, so they read as one
// band instead of four full-page cards.
const KpiRow = ({ isMobile, children }) =>
  isMobile ? (
    <Grid templateColumns="repeat(4, minmax(0, 1fr))" h="clamp(5.5rem, 22vw, 7rem)" w="full">
      {children}
    </Grid>
  ) : (
    <>
      {Children.map(children, (child, index) => (
        <PageShell.Slot key={index} cols={1} radius="lg">
          {child}
        </PageShell.Slot>
      ))}
    </>
  );

export const RosterHubGrid = ({ team, model, year, onFullRoster, players = [], variant = "standard" }) => {
  const { isMobile } = useLayoutDensity();
  const palette = uniquePalette(team);
  const accent = (index) => palette[index % palette.length] ?? "#E53E3E";

  return (
    <>
      {/* Roster Outlook carousel + compact build/balance lead the section. */}
      <Slot cols={3} rows={2} radius="lg">
        <RosterOutlookCarousel team={team} players={players} year={year} />
      </Slot>

      <Slot cols={1} radius="lg">
        <RosterCompositionCard model={model} accent={accent(0)} variant="compact" />
      </Slot>

      <Slot cols={1} radius="lg">
        <RosterExperienceCard model={model} accent={accent(1)} palette={palette} variant="compact" />
      </Slot>

      <Slot cols={2} rows={4} radius="lg">
        <RosterGeographyCard
          model={model}
          accent={team.colors?.primary ?? accent(0)}
          secondaryAccent={team.colors?.secondary ?? accent(1)}
          tertiaryAccent={team.colors?.accent ?? accent(2)}
        />
      </Slot>

      <Slot cols={2} rows={2} radius="lg">
        <RosterTransferCard model={model} accent={accent(2)} palette={palette} />
      </Slot>

      <Slot cols={1} rows={2} radius="lg">
        <RosterPhysicalProfileCard model={model} accent={accent(1)} />
      </Slot>

      <Slot cols={1} rows={2} radius="lg">
        {/* teamPrimary drives a single-hue light->dark ramp for the ordered
            class-year scale (see RosterDepthSnapshotCard). */}
        <RosterDepthSnapshotCard model={model} accent={accent(0)} teamPrimary={team.colors?.primary} />
      </Slot>

      {/* KPI tiles — now last, per the mockup: they close out the section
          instead of leading it. On mobile the four render as one 4-across
          strip (same treatment as TeamKPIStrip on the team pages) rather
          than four stacked full-width cards. */}
      <KpiRow isMobile={isMobile}>
        <RosterKpiTile
          variant={variant}
          title="Roster Size"
          value={model.kpis.totalPlayers}
          detail={`${team.shortName} active players in the ${year} roster file`}
          onClick={onFullRoster}
          accent={accent(0)}
          bgMode="primary"
          contextPct={(model.kpis.totalPlayers / 120) * 100}
        />
        <RosterKpiTile
          variant={variant}
          title="Upperclass Rate"
          value={`${model.kpis.upperclassPct ?? "--"}%`}
          detail="Junior, senior, and graduate roster share"
          tone="accent"
          accent={accent(1)}
          bgMode="secondary"
          contextPct={model.kpis.upperclassPct}
        />
        <RosterKpiTile
          variant={variant}
          title="New Additions"
          value={model.kpis.newAdditions}
          detail={`${model.kpis.freshmenCount} freshmen plus ${model.kpis.transferCount} transfers`}
          accent={accent(0)}
          bgMode="white"
          contextPct={(model.kpis.newAdditions / Math.max(1, model.kpis.totalPlayers)) * 100}
        />
        <RosterKpiTile
          variant={variant}
          title="Transfer Rate"
          value={`${model.kpis.transferRate ?? "--"}%`}
          detail={`${model.kpis.transferCount} portal or prior-school additions`}
          accent={accent(3)}
          bgMode="dark"
          contextPct={model.kpis.transferRate}
        />
      </KpiRow>
    </>
  );
};
