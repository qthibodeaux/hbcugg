import { DIM, JUMP_MARGIN, PANEL, LINE, ACCENT } from "./scoutMobilePresentation";
import { Text, Flex, Box, Grid, Image } from "@chakra-ui/react";
import { inkOn, brandOf } from "../GamePreviewScout";
import { withAlpha, teamLogo, teamShort } from "../../export/exportData";

// Mobile scout labels, rank chips, jump-target section frame and team switch.

export const Label = ({ children, color = DIM, ...rest }) => (
  <Text fontSize="0.62rem" fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.12em" lineHeight={1.2} {...rest}>{children}</Text>
);

export const Chip = ({ rank, color, on }) => (
  <Flex align="center" justify="center" minW="2.3rem" h="1.5rem" px="0.3rem" bg={rank ? (on ? color : "whiteAlpha.150") : "whiteAlpha.100"} flexShrink={0}>
    <Text fontSize="0.74rem" fontWeight="900" color={rank && on ? inkOn(color) : "whiteAlpha.800"} fontVariantNumeric="tabular-nums" lineHeight={1}>{rank ? `#${rank}` : "—"}</Text>
  </Flex>
);

export const Section = ({ id, refs, title, right, children }) => (
  <Box ref={refs?.[id]} data-jump={id} style={{ scrollMarginTop: JUMP_MARGIN }} bg={PANEL} borderBottom="1px solid" borderColor={LINE}>
    <Flex align="center" justify="space-between" gap="0.5rem" px="0.75rem" pt="0.85rem" pb="0.6rem">
      <Flex align="center" gap="0.5rem">
        <Box w="0.4rem" h="0.4rem" borderRadius="full" bg={ACCENT} flexShrink={0} />
        <Text fontSize="0.8rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.14em">{title}</Text>
      </Flex>
      {right}
    </Flex>
    {children}
  </Box>
);

export const TeamSwitch = ({ m, value, onChange }) => (
  <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="1px" bg={LINE} borderTop="1px solid" borderBottom="1px solid" borderColor={LINE}>
    {[m.away, m.home].map((s) => {
      const on = value === s.team_id;
      const c = brandOf(s.team_id);
      return (
        <Flex key={s.team_id} as="button" type="button" onClick={() => onChange(s.team_id)} align="center" justify="center" gap="0.5rem" py="0.6rem"
          bg={on ? withAlpha(c, 0.22) : PANEL} borderBottom="2px solid" borderBottomColor={on ? c : "transparent"}>
          <Image src={teamLogo(s.team_id)} alt="" w="1.4rem" h="1.4rem" objectFit="contain" />
          <Text fontSize="0.85rem" fontWeight="900" color={on ? "white" : "whiteAlpha.600"} textTransform="uppercase">{teamShort(s.team_id)}</Text>
        </Flex>
      );
    })}
  </Grid>
);
