import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getDisplayName, getPlayerNumber, getPosition, splitDisplayName, isLightColor, formatClassYear, formatHeightWeight, getSideFields } from "./playerCardModel";
import { Box, Image, Flex, Text } from "@chakra-ui/react";
import { User } from "lucide-react";
import { StandardPlayerPlate, CompactPlayerPlate } from "./PlayerCardPlates";

export const PlayerCardMobile = ({ player, team }) => {
  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);
  const primary = team?.colors?.primary ?? "#E53E3E";
  const displayName = getDisplayName(player);
  const number = getPlayerNumber(player);
  const position = getPosition(player);
  const lastName = splitDisplayName(displayName).last || displayName;

  return (
    <Box
      bg="bg.secondary"
      overflow="hidden"
      position="relative"
      cursor="pointer"
      onClick={() => navigate(`/player/${encodeURIComponent(`${displayName}__${player.team_id}`)}`, { state: { player } })}
    >
      <Box position="relative" w="full" aspectRatio={1} bg="whiteAlpha.50" overflow="hidden">
        {player.image_url && !imgErr ? (
          <Image
            src={player.image_url}
            alt={displayName}
            w="100%"
            h="100%"
            objectFit="cover"
            objectPosition="top"
            onError={() => setImgErr(true)}
          />
        ) : (
          <Flex align="center" justify="center" h="100%">
            <User size={24} color="var(--chakra-colors-whiteAlpha-300)" />
          </Flex>
        )}
        {/* Number bottom-left, position bottom-right. */}
        {number != null && (
          <Text
            position="absolute"
            left="0.25rem"
            bottom="0.15rem"
            zIndex={2}
            color="white"
            fontSize="0.6rem"
            fontWeight="black"
            textShadow="0 1px 3px rgba(0,0,0,0.8)"
          >
            #{number}
          </Text>
        )}
        {position && position !== "--" && (
          <Text
            position="absolute"
            right="0.25rem"
            bottom="0.15rem"
            zIndex={2}
            color="white"
            fontSize="0.6rem"
            fontWeight="black"
            textTransform="uppercase"
            textShadow="0 1px 3px rgba(0,0,0,0.8)"
          >
            {position}
          </Text>
        )}
      </Box>

      <Box px="0.3rem" py="0.3rem" borderTop="2px solid" borderColor={primary}>
        <Text fontSize="0.62rem" fontWeight="black" color="text.primary" textTransform="uppercase" lineClamp={1} textAlign="center">
          {lastName}
        </Text>
      </Box>
    </Box>
  );
};

export const PlayerCard = ({ player, team, variant = "standard" }) => {
  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);
  const resolvedVariant = variant === "standard" ? "standard" : "compact";
  const primary = team?.colors?.primary ?? "#E53E3E";
  const secondary = team?.colors?.secondary ?? "#FFFFFF";
  const scoreText = isLightColor(secondary) ? "#0B0B0D" : "#FFFFFF";
  const number = getPlayerNumber(player);
  const position = getPosition(player);
  const classYear = formatClassYear(player.class_year);
  const { h, w } = formatHeightWeight(player);
  const glory = Number.isFinite(Number(player.par)) ? Number(player.par).toFixed(0) : "--";
  const displayName = getDisplayName(player);
  const nameParts = splitDisplayName(displayName);
  const sideFields = getSideFields(position, classYear, { h, w });

  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="md"
      overflow="hidden"
      position="relative"
      cursor="pointer"
      minH={{ base: "320px", md: "352px", xl: "380px" }}
      _hover={{ borderColor: secondary, transform: "translateY(-2px)" }}
      transition="border-color 0.15s, transform 0.15s"
      onClick={() => navigate(`/player/${encodeURIComponent(`${displayName}__${player.team_id}`)}`, { state: { player } })}
    >
      <Box bg="whiteAlpha.50" h={{ base: "232px", md: "258px", xl: "284px" }} position="relative" overflow="visible">
        <Box position="absolute" inset={0} overflow="hidden">
        {player.image_url && !imgErr ? (
          <Image
            src={player.image_url}
            alt={displayName}
            w="100%" h="100%"
            objectFit="cover"
            objectPosition="top"
            onError={() => setImgErr(true)}
            position="relative"
            zIndex={0}
          />
        ) : (
          <Flex align="center" justify="center" h="100%" position="relative" zIndex={0}>
            <User size={44} color="var(--chakra-colors-whiteAlpha-300)" />
          </Flex>
        )}

        <Box
          position="absolute"
          inset={0}
          zIndex={2}
          pointerEvents="none"
          bg={`linear-gradient(180deg, transparent 68%, ${primary}45 82%, #141416 96%)`}
        />
        </Box>

        {number != null && (
          <Text
            position="absolute"
            left={4}
            bottom={3}
            zIndex={3}
            color="white"
            fontSize="sm"
            fontWeight="black"
            letterSpacing="0.08em"
          >
            #{number}
          </Text>
        )}

        <Box
          position="absolute"
          right={4}
          bottom={0}
          zIndex={4}
          bg={secondary}
          color={scoreText}
          px={4}
          py={2.5}
          minW="90px"
          textAlign="center"
          boxShadow="0 10px 24px rgba(0,0,0,0.35)"
        >
          <Text fontSize="7px" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
            Glory Score
          </Text>
          <Text mt={1} fontSize="2xl" fontWeight="black" lineHeight="0.9">
            {glory}
          </Text>
        </Box>
      </Box>

      <Box px={4} pt={3} pb={3} minH={resolvedVariant === "standard" ? { base: "88px", xl: "96px" } : "100px"}>
        {resolvedVariant === "standard" ? (
          <StandardPlayerPlate nameParts={nameParts} sideFields={sideFields} secondary={secondary} />
        ) : (
          <CompactPlayerPlate nameParts={nameParts} sideFields={sideFields} secondary={secondary} />
        )}
      </Box>
    </Box>
  );
};
