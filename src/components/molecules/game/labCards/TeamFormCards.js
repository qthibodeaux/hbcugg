import { DashboardCardFrame } from "../../../layouts/dashboard";
import { Text, Flex, Box } from "@chakra-ui/react";

// Recent-form and home/road record card presentation.

export const TeamFormCard = ({ title = "Team Form", team = "TEAM", results = [], note = null }) => {
  return (
    <DashboardCardFrame kicker="Week Central" title={title} minH="230px">
      <Text fontSize="xs" color="white" fontWeight="bold" textTransform="uppercase" mb={2}>{team}</Text>
      <Flex gap={1.5} align="end" h="82px" mb={2}>
        {results.slice(0, 5).map((r, index) => (
          <Box
            key={`${team}-form-${index}`}
            flex={1}
            h={`${Math.min(90, Math.max(26, 45 + (r.margin ?? 0) * 3))}%`}
            bg={r.result === "W" ? "green.400" : "red.400"}
            borderRadius="sm"
            position="relative"
          >
            <Text position="absolute" bottom="-16px" left="50%" transform="translateX(-50%)" fontSize="9px" color="text.muted" fontWeight="bold">
              {r.result}
            </Text>
          </Box>
        ))}
      </Flex>
      {note ? (
        <Text fontSize="xs" color="text.secondary" lineClamp={2}>{note}</Text>
      ) : null}
    </DashboardCardFrame>
  );
};

export const RecordSplitCard = ({ title, team = "TEAM", record = "--", detail = "" }) => {
  return (
    <DashboardCardFrame kicker="Schedules" title={title} minH="230px">
      <Text fontSize="xs" color="white" fontWeight="bold" textTransform="uppercase" lineClamp={1}>{team}</Text>
      <Text mt={2} fontSize="2xl" color="brand.300" fontWeight="black" lineHeight={1}>{record}</Text>
      <Text mt={2} fontSize="xs" color="text.secondary" lineClamp={2}>{detail}</Text>
    </DashboardCardFrame>
  );
};
