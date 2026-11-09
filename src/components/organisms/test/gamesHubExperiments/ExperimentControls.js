import { Box, Image, Flex, Text, NativeSelect } from "@chakra-ui/react";
import { useState } from "react";
import { BarChart3, Newspaper, ListFilter } from "lucide-react";
import { SEASONS, WEEKS, TEAM_OPTIONS } from "./fixtures";

export const TeamLogo = ({ team, size = "44px", opacity = 1 }) => (
  <Box w={size} h={size} opacity={opacity} flexShrink={0}>
    {team?.logo ? <Image src={team.logo} alt={team.shortName} w="100%" h="100%" objectFit="contain" /> : null}
  </Box>
);

export const GhostLogo = ({ team, side = "left", size = "160px", opacity = 0.08 }) => (
  <Box
    position="absolute"
    top={side === "left" ? "-26px" : "auto"}
    bottom={side === "right" ? "-34px" : "auto"}
    left={side === "left" ? "-22px" : "auto"}
    right={side === "right" ? "-22px" : "auto"}
    w={size}
    h={size}
    opacity={opacity}
    pointerEvents="none"
  >
    {team?.logo ? <Image src={team.logo} alt={team.shortName} w="100%" h="100%" objectFit="contain" /> : null}
  </Box>
);

const ControlSelect = ({ icon: Icon, label, value, onChange, children }) => (
  <Box minW={{ base: "100%", md: "118px" }}>
    <Flex align="center" gap={1.5} mb={1}>
      {Icon ? <Icon size={12} color="#A1A1AA" /> : null}
      <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
        {label}
      </Text>
    </Flex>
    <NativeSelect.Root
      h="30px"
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="md"
      bg="rgba(255,255,255,0.06)"
      overflow="hidden"
    >
      <NativeSelect.Field
        value={value}
        onChange={(event) => onChange(event.target.value)}
        color="white"
        fontSize="11px"
        fontWeight="bold"
        bg="transparent"
        px={2}
      >
        {children}
      </NativeSelect.Field>
      <NativeSelect.Indicator color="whiteAlpha.700" />
    </NativeSelect.Root>
  </Box>
);

export const LabControls = ({ compact = false }) => {
  const [season, setSeason] = useState("2025");
  const [week, setWeek] = useState("All");
  const [team, setTeam] = useState("");

  return (
    <Flex direction={compact ? "row" : { base: "column", md: "row" }} gap={2.5} align="end" wrap="wrap">
      <ControlSelect icon={BarChart3} label="Season" value={season} onChange={setSeason}>
        {SEASONS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </ControlSelect>
      <ControlSelect icon={Newspaper} label="Week" value={week} onChange={setWeek}>
        {WEEKS.map((item) => (
          <option key={item} value={item}>
            {item === "All" ? "All Weeks" : `Week ${item}`}
          </option>
        ))}
      </ControlSelect>
      <ControlSelect icon={ListFilter} label="Team" value={team} onChange={setTeam}>
        {TEAM_OPTIONS.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </ControlSelect>
    </Flex>
  );
};
