import { Flex, Text } from "@chakra-ui/react";
import { SectionShell } from "../panels/SectionShell";

export const GameInfoPanel = ({ meta }) => {
  const rows = [
    { label: "Date", value: meta?.date },
    { label: "Site", value: meta?.site },
    { label: "Season", value: meta?.season },
    { label: "Week", value: meta?.week != null ? `Week ${meta.week}` : null },
    { label: "Attendance", value: meta?.attendance?.toLocaleString() },
  ].filter((r) => r.value);

  return (
    <SectionShell title="Game Info">
      {rows.map((r) => (
        <Flex key={r.label} justify="space-between" py={1.5} borderBottom="1px solid" borderColor="whiteAlpha.50">
          <Text fontSize="xs" color="text.muted">{r.label}</Text>
          <Text fontSize="xs" fontWeight="medium" color="text.primary" textAlign="right" maxW="60%" lineClamp={1}>
            {r.value}
          </Text>
        </Flex>
      ))}
    </SectionShell>
  );
};
