import { isLightColor } from "./rosterCardModel";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ContextRing } from "./RosterCardPrimitives";
import { ArrowRight } from "lucide-react";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";

export const RosterKpiCard = ({ title, value, detail, tone = "default", onClick, accent, bgMode = "dark", contextPct = 0 }) => {
  const isWhite = bgMode === "white";
  const isColor = bgMode === "primary" || bgMode === "secondary";
  const bg = isWhite ? "#FFFFFF" : isColor ? accent : "bg.secondary";
  const textColor = isWhite || (isColor && isLightColor(accent)) ? "#0B0B0D" : "#FFFFFF";
  const mutedColor = isWhite || (isColor && isLightColor(accent)) ? "rgba(11,11,13,0.62)" : "rgba(255,255,255,0.66)";
  const ringColor = isWhite ? accent : bgMode === "dark" ? accent : textColor;
  const color = tone === "alert" ? "#FC8181" : isColor || isWhite ? textColor : accent ?? (tone === "accent" ? "brand.400" : "text.primary");
  const ringInner = isWhite ? "#FFFFFF" : isColor ? bg : "#141416";
  const valueText = String(value ?? "--");
  const valueSize = valueText.length > 4 ? "clamp(3rem, 4.6vw, 5.2rem)" : "clamp(4.7rem, 7vw, 7.5rem)";
  const valueShadow = isWhite
    ? `3px 3px 0 ${accent}, 6px 6px 0 rgba(11,11,13,0.12)`
    : `3px 3px 0 ${accent}, 6px 6px 0 rgba(11,11,13,0.28)`;

  return (
    <Box
      w="full"
      h="full"
      bg={bg}
      color={textColor}
      border="1px solid"
      borderColor={isWhite ? "rgba(0,0,0,0.12)" : "whiteAlpha.100"}
      borderRadius="lg"
      overflow="hidden"
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.18s ease"
      _hover={onClick ? { filter: "brightness(0.95)" } : undefined}
      onClick={onClick}
      position="relative"
    >
      <Box position="absolute" right="-20px" bottom="-22px" fontSize="clamp(5rem, 7vw, 8rem)" fontWeight="black" opacity={isWhite ? 0.07 : 0.1} lineHeight="1">
        {value}
      </Box>
      <Box position="absolute" top={4} right={4} zIndex={2}>
        <ContextRing
          pct={contextPct}
          color={ringColor}
          track={isWhite ? "rgba(11,11,13,0.12)" : "rgba(255,255,255,0.2)"}
          inner={ringInner}
        />
      </Box>
      <Flex direction="column" justify="space-between" h="full" p={4} pr="72px" position="relative" zIndex={1}>
        <Text fontSize="8px" fontWeight="black" color={mutedColor} textTransform="uppercase" letterSpacing="0.14em" lineClamp={1}>
          {title}
        </Text>

        <Flex flex="1" align="center" minH={0}>
          <Text
            fontSize={valueSize}
            fontWeight="black"
            color={color}
            lineHeight="0.82"
            letterSpacing="0"
            textShadow={valueShadow}
            lineClamp={1}
          >
            {valueText}
          </Text>
        </Flex>

        <Flex align="end" justify="space-between" gap={3} minH="34px">
          <Text fontSize="xs" color={mutedColor} fontWeight="black" lineHeight="1.2" lineClamp={2}>
            {detail}
          </Text>
          {onClick && (
            <Flex align="center" gap={1} color={ringColor} flexShrink={0}>
              <Text fontSize="9px" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
                View
              </Text>
              <ArrowRight size={12} />
            </Flex>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

const RosterKpiCardMobile = ({ title, value, detail, onClick, accent, bgMode = "dark", contextPct = 0 }) => {
  const isWhite = bgMode === "white";
  const isColor = bgMode === "primary" || bgMode === "secondary";
  const bg = isWhite ? "#FFFFFF" : isColor ? accent : "bg.secondary";
  const textColor = isWhite || (isColor && isLightColor(accent)) ? "#0B0B0D" : "#FFFFFF";
  const mutedColor = isWhite || (isColor && isLightColor(accent)) ? "rgba(11,11,13,0.66)" : "rgba(255,255,255,0.68)";
  const ringColor = isWhite ? accent : bgMode === "dark" ? accent : textColor;
  const ringInner = isWhite ? "#FFFFFF" : isColor ? bg : "#141416";
  const valueText = String(value ?? "--");
  const detailText = String(detail ?? "")
    .replace(" in the 2025 roster file", "")
    .replace("Junior, senior, and graduate roster share", "Upperclass share");
  const valueSize = valueText.length > 4 ? "clamp(0.95rem, 4vw, 1.4rem)" : "clamp(1.3rem, 5.6vw, 1.9rem)";

  return (
    <Box
      w="full"
      h="full"
      bg={bg}
      color={textColor}
      position="relative"
      overflow="hidden"
      p={2}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      borderRight="1px solid"
      borderColor={isWhite ? "blackAlpha.100" : "whiteAlpha.100"}
      _last={{ borderRight: "none" }}
      cursor={onClick ? "pointer" : "default"}
      onClick={onClick}
    >
      <Box position="absolute" top={1.5} right={1.5} zIndex={2}>
        <ContextRing
          pct={contextPct}
          color={ringColor}
          track={isWhite ? "rgba(11,11,13,0.12)" : "rgba(255,255,255,0.2)"}
          inner={ringInner}
          size={26}
        />
      </Box>

      <Text fontSize="0.5rem" fontWeight="black" color={mutedColor} textTransform="uppercase" letterSpacing="0.12em" lineClamp={1} position="relative" zIndex={1}>
        {title}
      </Text>

      <Flex flex="1" align="center" justify="center" minH={0} mt={3} position="relative" zIndex={1}>
        <Text fontSize={valueSize} fontWeight="black" color={textColor} lineHeight="0.86" textAlign="center" lineClamp={1}>
          {valueText}
        </Text>
      </Flex>

      <Text fontSize="0.5rem" color={mutedColor} fontWeight="bold" lineHeight="1.15" lineClamp={2} position="relative" zIndex={1}>
        {detailText}
      </Text>
    </Box>
  );
};

const RosterKpiCardCompact = ({ title, value, detail, tone = "default", onClick, accent, bgMode = "dark", contextPct = 0 }) => {
  const isWhite = bgMode === "white";
  const isColor = bgMode === "primary" || bgMode === "secondary";
  const bg = isWhite ? "#FFFFFF" : isColor ? accent : "bg.secondary";
  const textColor = isWhite || (isColor && isLightColor(accent)) ? "#0B0B0D" : "#FFFFFF";
  const mutedColor = isWhite || (isColor && isLightColor(accent)) ? "rgba(11,11,13,0.66)" : "rgba(255,255,255,0.68)";
  const ringColor = isWhite ? accent : bgMode === "dark" ? accent : textColor;
  const color = tone === "alert" ? "#FC8181" : isColor || isWhite ? textColor : accent ?? (tone === "accent" ? "brand.400" : "text.primary");
  const ringInner = isWhite ? "#FFFFFF" : isColor ? bg : "#141416";
  const valueText = String(value ?? "--");
  const detailText = String(detail ?? "").replace(" in the 2025 roster file", "").replace("Junior, senior, and graduate roster share", "Upperclass roster share");
  const valueSize = valueText.length > 4 ? "clamp(2.5rem, 5.4vw, 3.2rem)" : "clamp(3.35rem, 7.1vw, 4.65rem)";

  return (
    <Box
      w="full"
      h="full"
      bg={bg}
      color={textColor}
      border="1px solid"
      borderColor={isWhite ? "rgba(0,0,0,0.12)" : "whiteAlpha.100"}
      borderRadius="lg"
      overflow="hidden"
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.18s ease"
      _hover={onClick ? { filter: "brightness(0.95)" } : undefined}
      onClick={onClick}
      position="relative"
    >
      <Box position="absolute" right="-10px" bottom="-14px" fontSize="4.5rem" fontWeight="black" opacity={isWhite ? 0.06 : 0.08} lineHeight="1">
        {valueText}
      </Box>
      <Box position="absolute" top={3} right={3} zIndex={2}>
        <ContextRing
          pct={contextPct}
          color={ringColor}
          track={isWhite ? "rgba(11,11,13,0.12)" : "rgba(255,255,255,0.2)"}
          inner={ringInner}
          size={38}
        />
      </Box>
      <Flex direction="column" h="full" p={3} pr="46px" position="relative" zIndex={1}>
        <Text fontSize="7px" fontWeight="black" color={mutedColor} textTransform="uppercase" letterSpacing="0.12em" lineClamp={1}>
          {title}
        </Text>

        <Flex flex="1" align="center" minH={0} mt={1}>
          <Text
            fontSize={valueSize}
            fontWeight="black"
            color={color}
            lineHeight="0.86"
            letterSpacing="0"
            textShadow={isWhite ? `2px 2px 0 ${accent}` : "none"}
            lineClamp={1}
          >
            {valueText}
          </Text>
        </Flex>

        <Flex align="end" justify="space-between" gap={2} minH="32px">
          <Text fontSize="10px" color={mutedColor} fontWeight="black" lineHeight="1.08" lineClamp={3}>
            {detailText}
          </Text>
          {onClick && (
            <Flex align="center" gap={1} color={ringColor} flexShrink={0}>
              <Text fontSize="8px" fontWeight="black" textTransform="uppercase" letterSpacing="0.1em">
                View
              </Text>
              <ArrowRight size={10} />
            </Flex>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export const RosterKpiTile = ({ variant = "standard", ...props }) => {
  const { isMobile } = useLayoutDensity();
  if (isMobile) return <RosterKpiCardMobile {...props} />;
  if (variant === "compact") return <RosterKpiCardCompact {...props} />;
  return <RosterKpiCard {...props} />;
};
