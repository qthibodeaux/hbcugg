import React from "react";
import { Box, Flex, Text, SimpleGrid, Icon, Badge } from "@chakra-ui/react";
import { TrendingUp, Users, ArrowUpRight, GraduationCap } from "lucide-react";

/**
 * RosterCommandHeader
 * 4x1 Magazine-style header for the Roster Hub
 */
export const RosterCommandHeader = ({ allStats, year }) => {
  const totalPlayers = allStats?.composition?.total_players ?? 0;
  const avgVetPct = allStats?.experience?.veteran_pct ?? 0;
  const avgTransferRate = allStats?.transfers?.transfer_rate ?? 0;

  return (
    <Box
      bg="bg.secondary"
      borderRadius="xl"
      p={6}
      border="1px solid"
      borderColor="whiteAlpha.100"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-10%"
        right="-5%"
        w="400px"
        h="400px"
        bg="brand.500"
        filter="blur(150px)"
        opacity={0.05}
        pointerEvents="none"
      />

      <Flex direction="column" gap={6}>
        <Flex justify="space-between" align="center">
          <Box>
            <Text fontSize="9px" fontWeight="black" color="brand.400" textTransform="uppercase" letterSpacing="widest" mb={1}>
              HBCU GridIron Glory — Analytics Laboratory
            </Text>
            <Text fontSize="4xl" fontWeight="black" color="text.primary" lineHeight="1" textTransform="uppercase">
              Roster Intelligence Hub
            </Text>
          </Box>
          <Box textAlign="right">
            <Badge variant="outline" borderColor="whiteAlpha.300" color="text.secondary" px={3} py={1} borderRadius="full">
              SEASON {year}
            </Badge>
          </Box>
        </Flex>

        <SimpleGrid columns={4} gap={6}>
          <Box>
            <Flex align="center" gap={2} mb={1}>
              <Icon as={Users} color="brand.400" size={14} />
              <Text fontSize="xs" color="text.muted" fontWeight="bold" textTransform="uppercase">Active Personnel</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="black" color="text.primary">{totalPlayers.toLocaleString()}</Text>
            <Flex align="center" gap={1}>
              <Text fontSize="10px" color="#68D391" fontWeight="bold">+3.2%</Text>
              <Text fontSize="10px" color="text.muted">vs previous season</Text>
            </Flex>
          </Box>

          <Box borderLeft="1px solid" borderColor="whiteAlpha.100" pl={6}>
            <Flex align="center" gap={2} mb={1}>
              <Icon as={GraduationCap} color="brand.400" size={14} />
              <Text fontSize="xs" color="text.muted" fontWeight="bold" textTransform="uppercase">Veteran Composition</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="black" color="text.primary">{(avgVetPct * 100).toFixed(1)}%</Text>
            <Text fontSize="10px" color="text.muted">Sr. & Gr. Student Athletes</Text>
          </Box>

          <Box borderLeft="1px solid" borderColor="whiteAlpha.100" pl={6}>
            <Flex align="center" gap={2} mb={1}>
              <Icon as={ArrowUpRight} color="brand.400" size={14} />
              <Text fontSize="xs" color="text.muted" fontWeight="bold" textTransform="uppercase">Transfer Intake</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="black" color="text.primary">{(avgTransferRate * 100).toFixed(1)}%</Text>
            <Text fontSize="10px" color="text.muted">Portal Utilization Rate</Text>
          </Box>

          <Box borderLeft="1px solid" borderColor="whiteAlpha.100" pl={6}>
            <Flex align="center" gap={2} mb={1}>
              <Icon as={TrendingUp} color="brand.400" size={14} />
              <Text fontSize="xs" color="text.muted" fontWeight="bold" textTransform="uppercase">Growth Trend</Text>
            </Flex>
            <Flex h="40px" align="flex-end" gap={1}>
              {[20, 35, 45, 60, 80].map((h, i) => (
                <Box key={i} w="100%" h={`${h}%`} bg={i === 4 ? "brand.500" : "whiteAlpha.200"} borderRadius="1px" />
              ))}
            </Flex>
            <Text fontSize="10px" color="text.muted">Roster expansion since 2021</Text>
          </Box>
        </SimpleGrid>
      </Flex>
    </Box>
  );
};
