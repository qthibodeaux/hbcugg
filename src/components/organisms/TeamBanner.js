import { useState } from "react";
import { Box, Text, Flex, NativeSelect, Badge, SimpleGrid, Button } from "@chakra-ui/react";

const YEARS = [2025, 2024, 2023, 2022, 2021];

const TeamBanner = ({
  team,
  year,
  pendingYear = 2025,
  onPendingYearChange,
  onApplyYear,
  record = "8-3",
}) => {
  const [imageError, setImageError] = useState(false);

  if (!team) return null;


  const conferenceLabel = team.division ? `${team.conference} ${team.division}` : team.conference;
  const hasPendingYearChange = Number(pendingYear) !== Number(year);

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      bg="gray.800"
      border="1px solid"
      borderColor="whiteAlpha.200"
      p={{ base: 4, md: 6 }}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h={{ base: "90px", md: "120px" }}
        bg={`linear-gradient(180deg, ${team.colors.primary}66 0%, ${team.colors.primary}33 5%, transparent 16%)`}
        pointerEvents="none"
      />

      <Flex justify="space-between" align="center" mb={4} gap={3}>
        <Flex align="center" gap={3} minW={0}>
          {/* Logo Section */}
          <Box
            w={{ base: "56px", md: "72px" }}
            h={{ base: "56px", md: "72px" }}
            bg="white"
            borderRadius="lg"
            border="2px solid"
            borderColor={team.colors.primary}
            p={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="sm"
            flexShrink={0}
          >
            {imageError ? (
              <Text fontSize="2xl" fontWeight="bold" color="bg.primary">
                {team.name.charAt(0)}
              </Text>
            ) : (
              <img
                src={team.logo}
                alt={`${team.name} logo`}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                onError={() => setImageError(true)}
              />
            )}
          </Box>

          <Box minW={0}>
            <Text color="white" fontWeight="black" fontSize={{ base: "sm", md: "2xl" }} lineClamp={1}>
              {team.name}
            </Text>
            <Text fontSize={{ base: "11px", md: "sm" }} lineClamp={1}>
              <Box as="span" color="white" fontWeight="bold">{conferenceLabel}</Box>
              <Box as="span" color="whiteAlpha.500"> - </Box>
              <Box as="span" color="white">{team.location}</Box>
            </Text>
          </Box>
        </Flex>

        <Box
          flexShrink={0}
          display="flex"
          alignItems="center"
          gap={2}
        >
            <NativeSelect.Root
              w={{ base: "92px", md: "104px" }}
              h="32px"
              bg="whiteAlpha.50"
              border="1px solid"
              borderColor="whiteAlpha.200"
              borderRadius="md"
              color="white"
              fontWeight="bold"
            >
              <NativeSelect.Field
                value={pendingYear}
                onChange={(e) => onPendingYearChange?.(Number(e.target.value))}
                borderRadius="md"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y} style={{ background: "#1A1A1D", color: "#F4F4F5" }}>
                    {y}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>

            <Button
              h="32px"
              minW="44px"
              px={3}
              borderRadius="md"
              fontSize="xs"
              fontWeight="bold"
              bg={hasPendingYearChange ? "brand.500" : "whiteAlpha.100"}
              color={hasPendingYearChange ? "white" : "whiteAlpha.700"}
              border="1px solid"
              borderColor={hasPendingYearChange ? "brand.400" : "whiteAlpha.200"}
              _hover={hasPendingYearChange ? { bg: "brand.600" } : { bg: "whiteAlpha.100" }}
              onClick={onApplyYear}
              isDisabled={!hasPendingYearChange}
            >
              GO
            </Button>

            <Badge
              bg="whiteAlpha.50"
              color="white"
              px={{ base: 2, md: 3 }}
              py="7px"
              borderRadius="md"
              border="1px solid"
              borderColor="whiteAlpha.200"
              fontSize={{ base: "11px", md: "sm" }}
              fontWeight="semibold"
              whiteSpace="nowrap"
            >
              {record}
            </Badge>
        </Box>
      </Flex>

      <SimpleGrid columns={3} gap={2}>
        {[
          { label: "Mascot", val: team.mascot || "-" },
          { label: "Stadium", val: team.stadium || "-" },
          { label: "Season", val: String(year) },
        ].map((item) => (
          <Box key={item.label} bg="whiteAlpha.50" borderRadius="md" px={2} py={2} textAlign="center">
            <Text fontSize="9px" color="whiteAlpha.500" textTransform="uppercase">{item.label}</Text>
            <Text fontSize={{ base: "xs", md: "sm" }} color="white" fontWeight="semibold" lineClamp={1}>
              {item.val}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

    </Box>
  );
};

export default TeamBanner;
