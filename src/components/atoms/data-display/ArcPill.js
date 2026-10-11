import { Box } from "@chakra-ui/react";

/**
 * ArcPill - Coaching tree arc type pill indicator
 * @param {Object} props
 * @param {string} props.arc - Arc type identifier
 */
const ArcPill = ({ arc }) => {
  const ARC_COLORS = {
    coordinator_to_head: "green.400",
    position_to_coordinator: "brand.400",
    stable: "text.muted",
    lateral: "yellow.400",
    head_to_coordinator: "orange.400",
  };
  
  const ARC_LABELS = {
    coordinator_to_head: "Coord → HC",
    position_to_coordinator: "Position → Coord",
    stable: "Stable",
    lateral: "Lateral",
    head_to_coordinator: "HC → Coord",
  };
  
  const color = ARC_COLORS[arc] ?? "text.muted";
  
  return (
    <Box
      display="inline-block" px={2} py="1px"
      borderRadius="full" fontSize="9px" fontWeight="bold"
      border="1px solid" borderColor={color} color={color}
      textTransform="uppercase" letterSpacing="wide"
    >
      {ARC_LABELS[arc] ?? arc}
    </Box>
  );
};

export default ArcPill;
