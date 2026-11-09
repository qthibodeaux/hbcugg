import { getWinner, getActiveColor, getDisplayData, getCompactGameTag, getCompactLabel, getResultLine } from "./rowModel";
import { Box, Flex, Text } from "@chakra-ui/react";
import { WatermarkLogo, Logo, CompactTeamLabel } from "./RowPrimitives";

export const WeekCentralGameRowJCompact = ({ row, mb, selected, highlightColor, highlightAccent }) => {
  const winner = getWinner(row);
  const activeColor = getActiveColor(row, highlightColor);
  const activeAccent = highlightAccent ?? activeColor;
  const { hasScore, venue } = getDisplayData(row);
  const borderColor = selected ? activeAccent : "whiteAlpha.100";
  const gradient = selected
    ? `linear-gradient(90deg, ${activeColor} 0%, ${activeColor} 100%)`
    : `linear-gradient(90deg, ${row.away.color}20 0%, #111115 24%, #070708 50%, #111115 76%, ${row.home.color}20 100%)`;
  const gameTag = getCompactGameTag(row.gameName);
  const awayLabel = getCompactLabel(row.away);
  const homeLabel = getCompactLabel(row.home);
  const resultLine = getResultLine(row, venue, hasScore);

  return (
    <Box
      w="full"
      h="72px"
      borderRadius="lg"
      overflow="hidden"
      position="relative"
      mb={mb}
      border={selected ? "2px solid" : "1px solid"}
      borderColor={borderColor}
      bg={gradient}
      boxShadow={
        selected
          ? `0 0 0 1px ${activeAccent}CC, 0 0 24px ${activeAccent}66, 0 16px 32px rgba(0,0,0,0.42)`
          : "0 8px 18px rgba(0,0,0,0.22)"
      }
    >
      {selected && (
        <Box
          position="absolute"
          inset={0}
          bg="rgba(0,0,0,0.34)"
          zIndex={1}
          pointerEvents="none"
        />
      )}
      <WatermarkLogo team={row.away} side="left" selected={selected} compact />
      <WatermarkLogo team={row.home} side="right" selected={selected} compact />
      <Box
        position="relative"
        zIndex={2}
        h="full"
        display="grid"
        alignItems="center"
        gridTemplateColumns="44px minmax(38px, 1fr) minmax(104px, 128px) minmax(38px, 1fr) 44px"
        columnGap={{ base: 1, lg: 2 }}
        px={{ base: 2, lg: 3 }}
        py={2}
      >
        <Logo team={row.away} size="42px" pad="5px" />
        <CompactTeamLabel
          label={awayLabel}
          active={winner === "away"}
          align="left"
        />

        <Flex
          minW={0}
          h="full"
          direction="column"
          align="center"
          justify="center"
          overflow="hidden"
        >
          <Text
            color={selected ? activeAccent : "brand.400"}
            fontSize="8px"
            fontWeight="black"
            letterSpacing="0.16em"
            textTransform="uppercase"
            mb="3px"
            lineClamp={1}
          >
            {gameTag}
          </Text>
          <Text
            color="white"
            fontSize={{ base: "22px", lg: "26px" }}
            fontWeight="black"
            letterSpacing="0.03em"
            lineHeight="0.9"
            whiteSpace="nowrap"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}
          >
            {hasScore ? `${row.awayScore} - ${row.homeScore}` : "VS"}
          </Text>
          <Text
            color="rgba(255,255,255,0.58)"
            fontSize="7px"
            fontWeight="black"
            letterSpacing="0.12em"
            textTransform="uppercase"
            mt="4px"
            textAlign="center"
            lineClamp={1}
            maxW="100%"
          >
            {resultLine}
          </Text>
        </Flex>

        <CompactTeamLabel
          label={homeLabel}
          active={winner === "home"}
          align="right"
        />
        <Box justifySelf="end">
          <Logo team={row.home} size="42px" pad="5px" />
        </Box>
      </Box>
      {selected && (
        <Box
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          h="5px"
          bg={activeAccent}
        />
      )}
    </Box>
  );
};
