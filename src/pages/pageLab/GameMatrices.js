import { DEPTHS, DIRS, PANEL, LINE } from "./gameTablesPresentation";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { Kicker } from "./GameTableBlocks";

// Single-game lab target-depth/direction and rushing matrices, using the existing payload fields.

export const Matrix = ({ team, pass, rush }) => {
  const cells = DEPTHS.flatMap(([d]) => DIRS.map(([dir]) => pass?.[`${d}_${dir}`]?.attempts ?? 0));
  const peak = Math.max(1, ...cells);
  return (
    <Box bg={PANEL} border="1px solid" borderColor={LINE} borderRadius="md" mb={3} style={{ breakInside: "avoid" }}>
      <Flex align="center" gap={2} px={3} py={2} borderBottom="1px solid" borderColor={LINE}>
        {team.logo && <Image src={team.logo} alt="" w="16px" h="16px" objectFit="contain" />}
        <Text fontSize="11px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.1em">
          {team.short} · target matrix
        </Text>
      </Flex>

      <Box px={3} py={3}>
        {DEPTHS.map(([d, dLabel]) => (
          <Flex key={d} gap={1} mb={1} align="stretch">
            <Flex w="4rem" align="center" flexShrink={0}>
              <Kicker>{dLabel}</Kicker>
            </Flex>
            {DIRS.map(([dir]) => {
              const c = pass?.[`${d}_${dir}`];
              const att = c?.attempts ?? 0;
              return (
                <Box
                  key={dir}
                  flex="1"
                  minW={0}
                  py={2}
                  borderRadius="sm"
                  textAlign="center"
                  bg={att ? `rgba(168,85,247,${0.12 + (att / peak) * 0.34})` : "whiteAlpha.50"}
                >
                  <Text fontSize="12px" fontWeight="900" color={att ? "white" : "whiteAlpha.400"} fontVariantNumeric="tabular-nums">
                    {c ? `${c.completions}/${att}` : "0/0"}
                  </Text>
                  <Text fontSize="9px" color="whiteAlpha.600" fontVariantNumeric="tabular-nums">
                    {c?.yards ?? 0} yds
                  </Text>
                </Box>
              );
            })}
          </Flex>
        ))}
        <Flex gap={1} mt={1}>
          <Box w="4rem" flexShrink={0} />
          {DIRS.map(([dir, label]) => (
            <Box key={dir} flex="1" textAlign="center"><Kicker>{label}</Kicker></Box>
          ))}
        </Flex>

        <Box mt={4}>
          <Kicker mb={2}>Rush matrix</Kicker>
          <Flex gap={1}>
            {DIRS.map(([dir, label]) => {
              const c = rush?.[dir];
              return (
                <Box key={dir} flex="1" py={2} borderRadius="sm" textAlign="center" bg="whiteAlpha.100">
                  <Text fontSize="12px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">
                    {c?.yards ?? 0}
                  </Text>
                  <Text fontSize="9px" color="whiteAlpha.600" fontVariantNumeric="tabular-nums">
                    {c?.attempts ?? 0} car · {c?.yards_per_carry?.toFixed(1) ?? "—"} ypc
                  </Text>
                  <Kicker mt={1}>{label}</Kicker>
                </Box>
              );
            })}
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};
