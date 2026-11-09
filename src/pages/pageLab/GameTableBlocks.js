import { Text, Flex, Image, Box } from "@chakra-ui/react";
import { PANEL, LINE, shadeFor, ordinal } from "./gameTablesPresentation";

// Lab statistic tables, player lines and their shared labels/team headers.

export const Kicker = ({ children, ...rest }) => (
  <Text fontSize="9px" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.12em" {...rest}>
    {children}
  </Text>
);

const TeamHead = ({ teams }) => (
  <Flex align="center" gap={2} justify="flex-end" flexShrink={0}>
    {teams.map((t) => (
      <Flex key={t.id} w="4.4rem" justify="center" align="center" gap={1}>
        {t.logo
          ? <Image src={t.logo} alt={t.short} w="18px" h="18px" objectFit="contain" />
          : <Text fontSize="9px" fontWeight="900" color="white">{t.short}</Text>}
      </Flex>
    ))}
  </Flex>
);

export const StatTable = ({ table, teams }) => (
  <Box bg={PANEL} border="1px solid" borderColor={LINE} borderRadius="md" mb={3} style={{ breakInside: "avoid" }}>
    <Flex align="center" justify="space-between" gap={3} px={3} py={2} borderBottom="1px solid" borderColor={LINE}>
      <Text fontSize="11px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.1em">
        {table.title}
      </Text>
      <TeamHead teams={teams} />
    </Flex>

    {table.rows.map((row, i) => (
      <Flex
        key={`${row.label}-${i}`}
        align="center"
        justify="space-between"
        gap={3}
        px={3}
        py={1}
        borderBottom={i === table.rows.length - 1 ? "none" : "1px solid"}
        borderColor="rgba(255,255,255,0.04)"
        _hover={{ bg: "whiteAlpha.50" }}
      >
        <Text
          fontSize="11px"
          color={row.indent ? "whiteAlpha.600" : "whiteAlpha.900"}
          pl={row.indent ? `${row.indent * 0.9}rem` : 0}
          lineClamp={1}
          title={row.label}
        >
          {row.label}
        </Text>
        <Flex gap={2} flexShrink={0}>
          {row.values.map((v, j) => (
            <Flex
              key={j}
              w="4.4rem"
              justify="center"
              align="baseline"
              gap={1}
              bg={shadeFor(v.pct)}
              borderRadius="sm"
              px={1}
              py={0.5}
            >
              <Text fontSize="11px" fontWeight="700" color="white" fontVariantNumeric="tabular-nums">
                {v.display}
              </Text>
              {v.pct != null && (
                <Text fontSize="8px" color="whiteAlpha.600" fontVariantNumeric="tabular-nums">
                  {ordinal(v.pct)}
                </Text>
              )}
            </Flex>
          ))}
        </Flex>
      </Flex>
    ))}

    {table.footnote && (
      <Text fontSize="9px" color="whiteAlpha.400" lineHeight={1.5} px={3} py={2} borderTop="1px solid" borderColor={LINE}>
        {table.footnote}
      </Text>
    )}
  </Box>
);

export const PlayerBlock = ({ team, dropbacks, rushes, targets }) => {
  const Group = ({ label, rows }) =>
    !rows.length ? null : (
      <Box mb={3}>
        <Kicker mb={1.5}>{label}</Kicker>
        {rows.map((r) => (
          <Flex key={r.name} align="baseline" gap={3} py={1} borderBottom="1px solid" borderColor="rgba(255,255,255,0.04)">
            <Box flex="1" minW={0}>
              <Text fontSize="11px" fontWeight="700" color="white" lineClamp={1}>{r.name}</Text>
              <Text fontSize="10px" color="whiteAlpha.500" lineClamp={1}>{r.stat_line}</Text>
            </Box>
            {[["EPA", r.epa], ["EPA/Play", r.epa_per_play], ["SR", r.sr], ["WPA", r.wpa]].map(([k, v]) => (
              <Box key={k} w="3.1rem" textAlign="right" flexShrink={0}>
                <Text fontSize="11px" fontWeight="700" color="white" fontVariantNumeric="tabular-nums">{v}</Text>
                <Kicker>{k}</Kicker>
              </Box>
            ))}
          </Flex>
        ))}
      </Box>
    );

  return (
    <Box bg={PANEL} border="1px solid" borderColor={LINE} borderRadius="md" mb={3} style={{ breakInside: "avoid" }}>
      <Flex align="center" gap={2} px={3} py={2} borderBottom="1px solid" borderColor={LINE}>
        {team.logo && <Image src={team.logo} alt="" w="16px" h="16px" objectFit="contain" />}
        <Text fontSize="11px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.1em">
          {team.name}
        </Text>
      </Flex>
      <Box px={3} py={3}>
        <Group label="Dropbacks" rows={dropbacks} />
        <Group label="Rush attempts" rows={rushes} />
        <Group label="Pass targets" rows={targets} />
      </Box>
    </Box>
  );
};
