import { useNavigate } from "react-router-dom";
import { Box, VStack } from "@chakra-ui/react";
import { HubHeaderBlock } from "./nav/sideNav/HubHeaderBlock";
import { TeamHubBlock } from "./nav/sideNav/TeamHubBlock";
import { VenueHubBlock } from "./nav/sideNav/VenueHubBlock";
import { SideNavGameButton } from "./SideNavGameButton";
import { NavItem } from "./nav/sideNav/NavItem";
import { THEME_SWITCH_ENABLED } from "../../theme/colorScheme";
import { ThemeSwitch } from "./ThemeSwitch";

// ─── SideNav ─────────────────────────────────────────────────────────────────

const SideNav = ({ navState }) => {
  const { stack = [], items = [] } = navState ?? {};
  const navigate = useNavigate();

  if (items.length === 0) return null;

  const teamEntity = stack[0]?.id === "team" ? stack[0] : null;

  return (
    <Box
      as="aside"
      position="fixed"
      left={0}
      top="var(--app-header-height, 64px)"
      bottom={0}
      w={{ base: 0, md: "var(--sidebar-w)" }}
      containerType="inline-size"
      bg="bg.secondary"
      borderRight="1px solid"
      borderColor="whiteAlpha.100"
      overflowY="auto"
      zIndex={20}
      display={{ base: "none", md: "flex" }}
      flexDirection="column"
      css={{
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-thumb": { bg: "whiteAlpha.200", borderRadius: "2px" },
      }}
    >
      <HubHeaderBlock stack={stack} />

      <VStack gap={0} align="stretch" px={2} flex="1 0 auto">
        {items.map((item) => {
          if (item.type === "teamHubSwitcher") {
            return <TeamHubBlock key={item.id} team={item.team ?? teamEntity} switcher={item} />;
          }
          if (item.type === "venueHubSwitcher") {
            return <VenueHubBlock key={item.id} switcher={item} />;
          }
          if (item.type === "game" && item.gameData) {
            return (
              <Box key={item.id} pl={4}>
                <SideNavGameButton
                  gameData={item.gameData}
                  isActive={item.active}
                  onClick={() => item.onClick ? item.onClick() : navigate(item.path)}
                />
              </Box>
            );
          }
          return (
            <NavItem
              key={item.id}
              item={item}
            />
          );
        })}
      </VStack>

      {/* Light / Night — pinned to the bottom of the sidebar, under the items. */}
      {THEME_SWITCH_ENABLED && (
        <Box position="sticky" bottom={0} px={2} py={2.5} bg="bg.secondary" borderTop="1px solid" borderColor="line">
          <ThemeSwitch />
        </Box>
      )}
    </Box>
  );
};

export default SideNav;
