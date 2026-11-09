import { TEAM_BY_ID, logo, teamLabel, recordText } from "./standingsData";
import { Box, Image, Flex, Text } from "@chakra-ui/react";
import { FormBoxes, TeamLogo, exportName, ExportFrame } from "./StandingsPrimitives";
import { useRef } from "react";
import { ExportCardButton } from "../../../components/organisms/stats/ExportCardButton";
import { DivisionTableMobile } from "./StandingsMobile";

// Desktop division standings rows/table and exported table card.

const DivisionStandingsRow = ({ row, index, accent }) => {
  const team = TEAM_BY_ID[row.id];
  const isLeader = index === 0;

  return (
    <Box position="relative" overflow="hidden" borderRadius="0.75rem" flex={1} minH={0} bg="#0B0B0D">
      <Box position="absolute" inset={0} overflow="hidden">
        <Image
          src={logo(team)}
          alt=""
          w="100%"
          h="100%"
          objectFit="contain"
          style={{ transform: "scale(1.65)" }}
        />
      </Box>
      <Box position="absolute" inset={0} bg="linear-gradient(100deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.15) 100%)" />

      <Flex position="relative" zIndex={1} h="100%" align="center" justify="space-between" px="1rem" py="0.25rem" gap="0.75rem">
        <Box minW={0}>
          <Flex align="baseline" gap="0.6rem">
            <Text fontSize="1.25rem" fontWeight="black" fontStyle="italic" color={isLeader ? accent : "whiteAlpha.500"} flexShrink={0} lineHeight={1}>
              {index + 1}
            </Text>
            <Text
              fontSize="clamp(1rem, 2vw, 1.6rem)"
              fontWeight="black"
              fontStyle="italic"
              color="white"
              textTransform="uppercase"
              letterSpacing="-0.01em"
              lineHeight={1}
              lineClamp={1}
              minW={0}
            >
              {team?.name ?? teamLabel(team)}
            </Text>
          </Flex>
          <Text fontSize="0.65rem" color="whiteAlpha.750" fontWeight="black" textTransform="uppercase" letterSpacing="0.06em" mt="0.2rem" ml="1.9rem">
            {recordText(row.w, row.l)} Overall · {row.diff > 0 ? "+" : ""}{row.diff} Diff
          </Text>
        </Box>

        <Flex align="center" gap="1rem" flexShrink={0}>
          <Box textAlign="center">
            <Text fontSize="clamp(1.1rem, 2vw, 1.75rem)" fontWeight="black" color="white" lineHeight={1}>
              {recordText(row.cw, row.cl)}
            </Text>
            <Text fontSize="0.55rem" color="whiteAlpha.750" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em">
              Conf
            </Text>
          </Box>
          <FormBoxes form={row.last5} />
        </Flex>
      </Flex>
    </Box>
  );
};

const DivisionTableBody = ({ group, action = null }) => {
  const leader = group.rows[0];
  const leaderTeam = TEAM_BY_ID[leader.id];
  return (
    <>
      <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${leaderTeam.colors.primary}33 0%, transparent 54%)`} />
      <Flex position="relative" direction="column" h="100%" p="1rem" gap="0.5rem">
        <Flex align="center" justify="space-between" flexShrink={0}>
          <Box>
            <Text fontSize="0.625rem" color={group.accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
              Division Table
            </Text>
            <Text fontSize="1.25rem" color="var(--gg-ink)" fontWeight="black" textTransform="uppercase" lineHeight={1}>
              {group.label}
            </Text>
          </Box>
          <Flex align="center" gap="0.5rem">
            {action}
            <TeamLogo team={leaderTeam} size="2.125rem" />
            <Box textAlign="right">
              <Text fontSize="0.7rem" color="text.muted" fontWeight="black" textTransform="uppercase">
                Leader
              </Text>
              <Text fontSize="1.25rem" color="var(--gg-ink)" fontWeight="black" lineHeight={1}>
                {teamLabel(leaderTeam)}
              </Text>
            </Box>
          </Flex>
        </Flex>

        <Flex direction="column" flex={1} minH={0} gap="0.4rem">
          {group.rows.map((row, index) => (
            <DivisionStandingsRow key={row.id} row={row} index={index} accent={group.accent} />
          ))}
        </Flex>
      </Flex>
    </>
  );
};

export const DivisionStandingsCard = ({ group }) => {
  const posterRef = useRef(null);
  if (!group?.rows?.length) return null;

  return (
    <Box h="100%" w="full" bg="bg.secondary" border="1px solid" borderColor="line" borderRadius="xl" overflow="hidden" position="relative">
      <DivisionTableBody group={group} action={<ExportCardButton compact target={posterRef} filename={exportName("division-table", group)} />} />
      <ExportFrame frameRef={posterRef}>
        <DivisionTableMobile group={group} />
      </ExportFrame>
    </Box>
  );
};
