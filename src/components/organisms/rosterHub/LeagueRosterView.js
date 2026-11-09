import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { TALL_ROW_H, GRID_GAP } from "../../../utils/rosterHubConfig";
import { Box } from "@chakra-ui/react";
import { SectionCard } from "./RosterHubPrimitives";
import { ClassPie } from "./RosterCompositionCards";
import { PhysicalRows } from "./RosterPhysicalCharts";
import { StateList, HotspotList, GeoKpis } from "./RosterGeographyCards";
import { TransferKpis } from "./RosterTransferCards";

// Owns one roster-hub view/control responsibility; existing behavior preserved.

export const LeagueModeContent = ({ all }) => {
  const { isMobile } = useLayoutDensity();
  const span2 = isMobile ? "1 / -1" : "span 2";
  const span4 = isMobile ? "1 / -1" : "span 4";
  const cardH = isMobile ? "auto" : TALL_ROW_H;
  const radius = isMobile ? 0 : "lg";

  return (
    <Box display="grid" gridTemplateColumns={isMobile ? "1fr" : "repeat(4, 1fr)"} gap={isMobile ? "0.75rem" : GRID_GAP}>
      {/* Row A: Composition + Experience combined — one full-width row, no
          set height, same donut+legend+pills card as Divisions mode's
          Composition card but laid out wide instead of stacked. */}
      <Box gridColumn={span4} h="auto">
        <SectionCard title="Composition & Experience" h="auto" borderRadius={radius} flat>
          <ClassPie data={all.composition} experience={all.experience} wide />
        </SectionCard>
      </Box>

      {/* Row B: Physical — full width. Auto height, not TALL_ROW_H — the
          2-column position layout still needs more room than one guessed
          row-unit multiple gives it. */}
      <Box gridColumn={span4} h="auto">
        <SectionCard
          title="Physical Profile — All 18 Programs"
          h="auto"
          borderRadius={radius}
          flat
        >
          <Box
            display="grid"
            gridTemplateColumns="repeat(4, 1fr)"
            gap={GRID_GAP}
            h="auto"
          >
            <Box gridColumn="span 4" h="auto">
              <PhysicalRows data={all.physical} twoColumn={!isMobile} />
            </Box>
          </Box>
        </SectionCard>
      </Box>

      {/* Row C: Top States (2) + City Hotspots (2) */}
      <Box gridColumn={span2} h={cardH}>
        <SectionCard
          title="Top Recruiting States"
          h={isMobile ? "auto" : "100%"}
          borderRadius={radius}
          flat
        >
          <StateList data={all.geographic} />
        </SectionCard>
      </Box>
      <Box gridColumn={span2} h={cardH}>
        <SectionCard
          title="Recruiting Hotspots"
          h={isMobile ? "auto" : "100%"}
          borderRadius={radius}
          flat
        >
          <HotspotList data={all.geographic} />
        </SectionCard>
      </Box>

      {/* Row D: Geographic KPIs (2) + Transfer Origin (2) */}
      <Box gridColumn={span2} h={cardH}>
        <SectionCard
          title="Geographic Distribution"
          h={isMobile ? "auto" : "100%"}
          borderRadius={radius}
          flat
        >
          <GeoKpis data={all.geographic} />
        </SectionCard>
      </Box>
      <Box gridColumn={span2} h={cardH}>
        <SectionCard
          title="Transfer Origin Breakdown"
          h={isMobile ? "auto" : "100%"}
          borderRadius={radius}
          flat
        >
          <TransferKpis data={all.transfers} />
        </SectionCard>
      </Box>

      {/* Row E: Transfer Origin States (2) + Transfer Hotspots (2) */}
      <Box gridColumn={span2} h={cardH}>
        <SectionCard
          title="Transfer Origin States"
          h={isMobile ? "auto" : "100%"}
          borderRadius={radius}
          flat
        >
          <StateList data={all.transfers?.transfer_geographic ?? all.transfers} />
        </SectionCard>
      </Box>
      <Box gridColumn={span2} h={cardH}>
        <SectionCard
          title="Where Transfers Come From"
          h={isMobile ? "auto" : "100%"}
          borderRadius={radius}
          flat
        >
          <HotspotList
            data={all.transfers?.transfer_geographic ?? all.transfers}
          />
        </SectionCard>
      </Box>
    </Box>
  );
};
