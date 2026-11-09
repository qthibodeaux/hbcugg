import { Flex } from "@chakra-ui/react";
import { TeamPanel } from "./defenseMastery/DefenseTeamPanel";

export const GameProductionDefenseMasteryA = () => {
    return (
        <Flex direction="row" gap="20px" p="4px" h="full" w="full" bg="bg.primary">
            <TeamPanel teamKey="pvamu" />
            <TeamPanel teamKey="jsu" />
        </Flex>
    );
};
