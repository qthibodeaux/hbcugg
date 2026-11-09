import { readableTextColor } from "./historyModel";
import { Box, Text, Flex } from "@chakra-ui/react";

export const TITLE_PATH_TIMELINE_CSS = `
  @keyframes timelineCardIn {
    from { opacity: 0; transform: translateY(6px) scale(0.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

export const TimelinePeriodCard = ({ bucket, event }) => {
  const textColor = readableTextColor(bucket.tone);
  const mutedColor = textColor === "#FFFFFF" ? "rgba(255,255,255,0.72)" : "rgba(7,7,8,0.68)";
  const pillBg = textColor === "#FFFFFF" ? "rgba(0,0,0,0.28)" : "rgba(255,255,255,0.55)";
  const pillBorder = textColor === "#FFFFFF" ? "rgba(0,0,0,0.4)" : "rgba(7,7,8,0.25)";

  return (
    <Box
      minW={0}
      h="100%"
      overflow="hidden"
      borderRadius="7px"
      border="1px solid"
      borderColor="rgba(0,0,0,0.35)"
      bg={bucket.tone}
      position="relative"
      p={{ base: 2, lg: 2.5 }}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      style={{ animation: "timelineCardIn 420ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
    >
      <Text
        position="absolute"
        right={{ base: "-6px", lg: "-10px" }}
        bottom={{ base: "-10px", lg: "-16px" }}
        fontSize={{ base: "42px", lg: "62px" }}
        color={textColor}
        opacity={0.1}
        fontWeight="black"
        lineHeight={0.8}
        pointerEvents="none"
      >
        {bucket.range}
      </Text>

      <Flex align="center" justify="space-between" gap={2} position="relative" zIndex={1}>
        <Text
          fontSize={{ base: "7px", lg: "8px" }}
          color={textColor}
          fontWeight="black"
          textTransform="uppercase"
          letterSpacing="0.12em"
          lineClamp={1}
        >
          {bucket.title}
        </Text>
        <Box px={1.5} py={0.5} borderRadius="999px" bg={pillBg} border="1px solid" borderColor={pillBorder} minW={0}>
          <Text fontSize="7px" color={textColor} fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
            {bucket.range}
          </Text>
        </Box>
      </Flex>

      <Box key={`${bucket.id}-${event.year}-${event.label}`} position="relative" zIndex={1} minW={0} style={{ animation: "timelineCardIn 360ms cubic-bezier(0.22, 1, 0.36, 1) both" }}>
        <Text
          fontSize={{ base: "lg", lg: "2xl" }}
          color={textColor}
          fontWeight="black"
          lineHeight={0.82}
          lineClamp={1}
          mb={1}
        >
          {event.year}
        </Text>
        <Text
          fontSize={{ base: "9px", lg: "11px" }}
          color={textColor}
          fontWeight="black"
          textTransform="uppercase"
          lineHeight={0.95}
          lineClamp={1}
          mb={1}
        >
          {event.label}
        </Text>
        <Text
          fontSize={{ base: "7px", lg: "8px" }}
          color={mutedColor}
          fontWeight="bold"
          lineHeight={1.25}
          lineClamp={2}
        >
          {event.detail}
        </Text>
      </Box>

      <Box position="relative" zIndex={1} h="2px" w="54%" bg={textColor} borderRadius="full" opacity={0.6} />
    </Box>
  );
};
