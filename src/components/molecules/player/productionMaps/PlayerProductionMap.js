import { Flex, Box, Text } from "@chakra-ui/react";
import { KIND_LABEL, KIND_HEADLINE, getPosition, COMPONENT_TO_VIEW, POSITION_GROUPS } from "./playerMapModel";
import { useState } from "react";
import { PassingGridMap } from "./PassingGridMap";
import { RushingDirectionStrip, RushingLaneMap } from "./RushingMaps";
import { HavocSpatialMap } from "./HavocSpatialMap";
import { KickDistanceMap, PuntFieldPositionMap, SpecialTeamsGenericMap } from "./SpecialTeamsMaps";
import { OLCombinedMap } from "./OffensiveLineMap";

const ProductionKindToggle = ({ kinds, active, onChange, primary }) => (
  <Flex position="absolute" top="0.3rem" right="0.3rem" zIndex={2} gap="2px" bg="rgba(0,0,0,0.45)" borderRadius="sm" p="2px">
    {kinds.map((kind) => (
      <Box
        key={kind}
        as="button"
        type="button"
        onClick={() => onChange(kind)}
        px="0.32rem"
        py="0.08rem"
        borderRadius="xs"
        bg={active === kind ? primary : "transparent"}
        cursor="pointer"
      >
        <Text fontSize="0.42rem" fontWeight="900" letterSpacing="0.04em" color={active === kind ? "white" : "rgba(255,255,255,0.6)"}>
          {KIND_LABEL[kind] ?? kind}
        </Text>
      </Box>
    ))}
  </Flex>
);

const ProductionKindUnavailable = ({ kind }) => (
  <Flex direction="column" h="full" w="full" align="center" justify="center" p="0.5rem" gap="0.25rem" textAlign="center">
    <Text fontSize="0.58rem" fontWeight="900" color="text.secondary" textTransform="uppercase" letterSpacing="0.06em">
      {KIND_HEADLINE[kind] ?? kind} Field Map
    </Text>
    <Text fontSize="0.5rem" fontWeight="700" color="text.muted">
      Spatial data not available for this production type yet.
    </Text>
  </Flex>
);

export const PlayerProductionMap = ({ player, primary, secondary, gameOverride, havoc, fieldMap, fieldMapViews, depthBands, productionComponents }) => {
  const position = getPosition(player);

  // fieldMap is the active game's {passing, rushing} block (or undefined
  // for a player with no profile document, which keeps the legacy
  // fabricated fallbacks below untouched).
  const availableKinds = fieldMapViews?.length
    ? fieldMapViews
    : Object.entries(productionComponents ?? {})
        .filter(([, value]) => Number(value) > 0)
        .map(([key]) => COMPONENT_TO_VIEW[key] ?? key);
  const [activeKind, setActiveKind] = useState(null);
  const kind = activeKind ?? (availableKinds.includes("passing") ? "passing" : availableKinds[0]);

  if (POSITION_GROUPS.PASS.has(position) && availableKinds.length > 1) {
    const view = fieldMap?.[kind];
    return (
      <Box position="relative" h="full" w="full">
        <ProductionKindToggle kinds={availableKinds} active={kind} onChange={setActiveKind} primary={primary} />
        {kind === "passing" ? (
          <PassingGridMap player={player} primary={primary} secondary={secondary} fieldMap={view?.cells} depthBands={depthBands} />
        ) : kind === "rushing" && view?.available ? (
          <RushingDirectionStrip cells={view.cells} primary={primary} />
        ) : (
          <ProductionKindUnavailable kind={kind} />
        )}
      </Box>
    );
  }

  if (POSITION_GROUPS.PASS.has(position)) {
    return <PassingGridMap player={player} primary={primary} secondary={secondary} fieldMap={fieldMap?.passing?.cells} depthBands={depthBands} />;
  }
  if (POSITION_GROUPS.RUN.has(position)) {
    return <RushingLaneMap real rushing={fieldMap?.rushing} player={player} primary={primary} secondary={secondary} gameOverride={gameOverride} />;
  }
  if (POSITION_GROUPS.DEF.has(position)) {
    return <HavocSpatialMap primary={primary} secondary={secondary} havoc={havoc} />;
  }
  if (POSITION_GROUPS.K.has(position)) {
    return <KickDistanceMap player={player} primary={primary} secondary={secondary} />;
  }
  if (POSITION_GROUPS.P.has(position)) {
    return <PuntFieldPositionMap player={player} primary={primary} secondary={secondary} />;
  }
  if (POSITION_GROUPS.OL.has(position)) {
    return <OLCombinedMap player={player} primary={primary} secondary={secondary} gameOverride={gameOverride} />;
  }
  if (POSITION_GROUPS.ST.has(position)) {
    return <SpecialTeamsGenericMap player={player} primary={primary} secondary={secondary} />;
  }

  // Default fallback
  return <PassingGridMap player={player} primary={primary} secondary={secondary} />;
};
