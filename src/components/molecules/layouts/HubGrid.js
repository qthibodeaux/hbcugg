import { Grid } from "@chakra-ui/react";
import HubCard from "../../atoms/cards/HubCard";

/**
 * HubGrid - Grid layout for hub navigation cards
 * @param {Object} props
 * @param {Array} props.hubs - Array of hub configuration objects
 */
const HubGrid = ({ hubs }) => {
  return (
    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(2, 1fr)" }} gap={6}>
      {hubs.map((hub, index) => (
        <HubCard key={index} hub={hub} />
      ))}
    </Grid>
  );
};

export default HubGrid;
