import { useState } from "react";
import { Box, Text, Flex, NativeSelect, SimpleGrid } from "@chakra-ui/react";

const YEARS = [2025, 2024, 2023, 2022, 2021];

const isBlack = (value) => {
  const c = (value || "").toString().trim().toLowerCase();
  return c === "#000" || c === "#000000" || c === "black";
};

const bannerNameSize = (name = "") => {
  const len = name.length;
  if (len <= 10) return { base: "6xl", md: "8xl",  lg: "9xl"  };
  if (len <= 16) return { base: "5xl", md: "7xl",  lg: "8xl"  };
  if (len <= 22) return { base: "4xl", md: "6xl",  lg: "7xl"  };
  return               { base: "3xl", md: "5xl",  lg: "6xl"  };
};

/**
 * TeamBannerTest — lab variant, do not touch live TeamBanner.js
 *
 * Layout:
 *   [LOGO full-height] | [top row: name + mascot | record + year]
 *                        [bottom row: 3 info banners             ]
 */
export const TeamBannerTest = ({ team, year = 2025, onYearChange, record = "8-3" }) => {
  const [imgError, setImgError] = useState(false);
  if (!team) return null;

  const accent    = isBlack(team.colors?.primary) ? "#ffffff" : (team.colors?.primary || "#E53E3E");
  const confLabel = team.division ? `${team.conference} · ${team.division}` : team.conference;

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      bg="gray.900"
      border="1px solid"
      borderColor="whiteAlpha.200"
      minH={{ base: "140px", md: "180px" }}
    >
      {/* Gradient wash */}
      <Box
        position="absolute"
        inset={0}
        bg={`linear-gradient(135deg, ${accent}22 0%, transparent 40%)`}
        pointerEvents="none"
      />

      <Flex position="relative" align="stretch" h="full" minH={{ base: "140px", md: "180px" }}>

        {/* ── Column 1: Logo ── */}
        <Box
          flexShrink={0}
          w={{ base: "120px", md: "180px", lg: "220px" }}
          bg={`${accent}18`}
          borderRight="1px solid"
          borderColor="whiteAlpha.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          {imgError ? (
            <Text fontSize="7xl" fontWeight="black" color="whiteAlpha.300">
              {team.name.charAt(0)}
            </Text>
          ) : (
            <Box
              as="img"
              src={team.logo}
              alt={team.name}
              key={team.id}
              maxW="90%"
              maxH="90%"
              style={{ objectFit: "contain", filter: "drop-shadow(0 0 20px rgba(0,0,0,0.5))" }}
              onError={() => setImgError(true)}
            />
          )}
        </Box>

        {/* ── Column 2: Info Stack ── */}
        <Flex flex={1} direction="column" minW={0}>

          {/* Row 1 — Identity block */}
          <Flex
            flex={1}
            align="center"
            justify="space-between"
            px={{ base: 4, md: 6 }}
            pt={2}
          >
            <Flex align="baseline" gap={3} minW={0} flex={1}>
              <Text
                fontSize={bannerNameSize(team.name)}
                fontWeight="900"
                color="white"
                textTransform="uppercase"
                letterSpacing="-0.05em"
                lineHeight={0.8}
                lineClamp={1}
                fontFamily="'Barlow Condensed', sans-serif"
              >
                {team.name}
              </Text>
              <Text
                fontSize={{ base: "xl", md: "3xl" }}
                fontWeight="300"
                color="whiteAlpha.600"
                textTransform="uppercase"
                letterSpacing="0.1em"
                display={{ base: "none", sm: "block" }}
                fontFamily="'Barlow Condensed', sans-serif"
              >
                {team.mascot}
              </Text>
            </Flex>

            {/* Record & Year */}
            <Flex align="center" gap={3} flexShrink={0} ml={4}>
              <Box textAlign="right">
                <Text fontSize="xs" color="whiteAlpha.400" fontWeight="bold" textTransform="uppercase">
                  Record
                </Text>
                <Text fontSize={{ base: "xl", md: "3xl" }} fontWeight="900" color={accent} lineHeight={1}>
                  {record}
                </Text>
              </Box>
              <NativeSelect.Root w="100px" size="sm" variant="subtle">
                <NativeSelect.Field
                  value={year}
                  onChange={(e) => onYearChange?.(Number(e.target.value))}
                  bg="whiteAlpha.100"
                  fontWeight="bold"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y} style={{ background: "#1A1A1D", color: "#F4F4F5" }}>
                      {y}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Flex>
          </Flex>

          {/* Row 2 — Info banners */}
          <SimpleGrid
            columns={3}
            gap={0}
            bg="whiteAlpha.50"
            borderTop="1px solid"
            borderColor="whiteAlpha.100"
          >
            {[
              { label: "Conference", val: confLabel            },
              { label: "Stadium",    val: team.stadium  || "—" },
              { label: "Location",   val: team.location || "—" },
            ].map((item, i) => (
              <Box
                key={item.label}
                px={4}
                py={3}
                borderRight={i < 2 ? "1px solid" : "none"}
                borderColor="whiteAlpha.100"
              >
                <Text fontSize="9px" color="whiteAlpha.400" textTransform="uppercase" fontWeight="bold" letterSpacing="widest">
                  {item.label}
                </Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color="white" fontWeight="600" lineClamp={1}>
                  {item.val}
                </Text>
              </Box>
            ))}
          </SimpleGrid>

        </Flex>
      </Flex>
    </Box>
  );
};
