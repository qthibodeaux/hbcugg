import { getWinner, getActiveColor, getDisplayData } from "./rowModel";
import { Box, Flex, Text } from "@chakra-ui/react";
import { WatermarkLogo, Logo, TeamText } from "./RowPrimitives";

export const WeekCentralGameRowJStandard = ({ row, mb, selected, highlightColor, highlightAccent }) => {
  const winner = getWinner(row);
  const activeColor = getActiveColor(row, highlightColor);
  const activeAccent = highlightAccent ?? activeColor;
  const { hasScore, awayRecord, homeRecord, venue } = getDisplayData(row);
  const borderColor = selected ? activeAccent : "whiteAlpha.100";
  const glow = selected
    ? `0 0 0 1px ${activeAccent}88, 0 18px 42px rgba(0,0,0,0.38)`
    : "0 18px 42px rgba(0,0,0,0.32)";
  const gradient = selected
    ? `linear-gradient(90deg, ${activeColor} 0%, ${activeColor} 100%)`
    : `linear-gradient(90deg, ${row.away.color}24 0%, ${row.away.color}10 14%, #111114 34%, #111114 66%, ${row.home.color}10 86%, ${row.home.color}24 100%)`;

  return (
    <Box
      w="full"
      minH="132px"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      mb={mb}
      border={selected ? "2px solid" : "1px solid"}
      borderColor={borderColor}
      bg={gradient}
      boxShadow={glow}
    >
      {selected && (
        <Box
          position="absolute"
          inset={0}
          bg="rgba(0,0,0,0.3)"
          zIndex={1}
          pointerEvents="none"
        />
      )}
      <WatermarkLogo team={row.away} side="left" selected={selected} />
      <WatermarkLogo team={row.home} side="right" selected={selected} />

      <Flex
        position="relative"
        zIndex={2}
        w="full"
        minH="132px"
        align="center"
        justify="space-between"
        px={7}
        py={3}
        gap={5}
      >
        <Flex align="center" gap={4} minW={0} flex="1 1 0" overflow="hidden">
          <Logo team={row.away} size="64px" pad="7px" />
          <TeamText
            align="left"
            name={row.away.name}
            record={awayRecord}
            active={winner === "away"}
            maxW="100%"
            fontSize="clamp(19px, 1.8vw, 26px)"
          />
        </Flex>

        {/* Centre column sizes to its content (min 240px) so a long classic
            name or venue is shown in full; both caption lines may wrap once. */}
        <Box textAlign="center" flex="0 1 auto" minW="240px" maxW="46%" px={2}>
          <Text
            color={selected ? activeAccent : "brand.400"}
            fontSize="xs"
            fontWeight="black"
            letterSpacing="0.16em"
            textTransform="uppercase"
            mb={1}
            lineClamp={2}
            lineHeight={1.2}
          >
            {row.gameName}
          </Text>
          <Text
            color="whiteAlpha.900"
            fontSize="5xl"
            fontWeight="extrabold"
            letterSpacing="0.04em"
            lineHeight="0.95"
            whiteSpace="nowrap"
            style={{ textShadow: "0 2px 12px #000b" }}
          >
            {hasScore ? `${row.awayScore} - ${row.homeScore}` : "VS"}
          </Text>
          <Text
            color="whiteAlpha.600"
            fontSize="xs"
            fontWeight="black"
            letterSpacing="0.12em"
            textTransform="uppercase"
            mt={2}
            lineClamp={2}
            lineHeight={1.2}
          >
            {row.status} | {venue}
          </Text>
        </Box>

        <Flex
          align="center"
          gap={4}
          minW={0}
          flex="1 1 0"
          justify="flex-end"
          overflow="hidden"
        >
          <TeamText
            align="right"
            name={row.home.name}
            record={homeRecord}
            active={winner === "home"}
            maxW="100%"
            fontSize="clamp(19px, 1.8vw, 26px)"
          />
          <Logo team={row.home} size="64px" pad="7px" />
        </Flex>
      </Flex>
      {selected && (
        <Box
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          h="5px"
          bg={activeAccent}
          zIndex={3}
        />
      )}
    </Box>
  );
};
