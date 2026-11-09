import { useNavigate, useLocation } from "react-router-dom";
import { useRouteSideNav } from "../../hooks/useRouteSideNav";
import { useState } from "react";
import useMountEffect from "../../hooks/useMountEffect";
import { PEEK_DELAY_MS, PEEK_DURATION_MS, PEEK_CSS } from "./sectionSwitcher/switcherStyles";
import { Box, Flex, Text } from "@chakra-ui/react";
import { BANNER_STRIP_BG } from "./BannerControls";
import { ChevronDown } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { TeamHubSwitcherSheetBlock } from "./sectionSwitcher/TeamHubSwitcherSheetBlock";

// Mobile stand-in for the desktop SideNav — trigger bar (styled to look like
// it's still part of the banner via the `accent` prop) that opens a bottom
// sheet listing the current hub's sections. Sources its data from the same
// useRouteSideNav() hook MainLayout already feeds to SideNav, so there's no
// separate mobile nav model to keep in sync — reusable on any hub page, not
// just Game Center; the caller just passes the color its own banner uses
// (brand purple on a generic hub banner, a team's own color on a team page).
export const MobileSectionSwitcher = ({ accent = "#A855F7" }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { stack, items: navItems } = useRouteSideNav(navigate);
  // Locked sections (Player Analytics, postponed) stay in the sidebar greyed
  // out; the mobile sheet simply leaves them off.
  const items = navItems.filter((item) => !item.locked && !item.mobileHidden);
  const [isOpen, setIsOpen] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);

  const activeIndex = items.findIndex((item) => item.active);
  const nextItem = items.length > 1 ? items[(Math.max(activeIndex, 0) + 1) % items.length] : null;

  useMountEffect(() => {
    if (!nextItem) return undefined;
    const openTimer = setTimeout(() => setIsPeeking(true), PEEK_DELAY_MS);
    const closeTimer = setTimeout(() => setIsPeeking(false), PEEK_DELAY_MS + PEEK_DURATION_MS);
    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };
  });

  if (!items.length) return null;

  // On a team hub page, none of the Schools-level items (Directory/Wiki/
  // Rosters Hub) are ever the active one — without this, the pill fell back
  // to items[0] ("DIRECTORY") no matter which team tab you were actually on.
  // Check the team hub's own tabs for a pathname match first.
  const teamSwitcherItem = items.find((item) => item.type === "teamHubSwitcher");
  const activeTeamTab = teamSwitcherItem?.tabs?.find((tab) => pathname === tab.path);
  const activeItem = items.find((item) => item.active) ?? activeTeamTab ?? teamSwitcherItem ?? items[0];
  const currentLabel = activeItem?.label ?? stack[0]?.breadcrumb ?? stack[0]?.label ?? "Menu";

  return (
    <>
      <style>{PEEK_CSS}</style>
      <Box position="relative" flexShrink={0}>
        <Flex
          as="button"
          type="button"
          onClick={() => setIsOpen(true)}
          align="center"
          gap="0.4rem"
          pl="0.9rem"
          pr="1.5rem"
          py="0.5rem"
          bg={`linear-gradient(110deg, ${accent} 0%, ${BANNER_STRIP_BG} 100%)`}
          borderBottomRightRadius="1.75rem"
          flexShrink={0}
        >
          <Text fontSize="0.75rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
            {currentLabel}
          </Text>
          <Box as="span" display="inline-flex" style={isPeeking ? { animation: "sectionSwitcherChevronBounce 0.6s ease" } : undefined}>
            <ChevronDown size={14} color="white" />
          </Box>
        </Flex>

        {isPeeking && (
          <Flex
            position="absolute"
            top="100%"
            left="0.9rem"
            mt="0.35rem"
            align="center"
            gap="0.35rem"
            px="0.7rem"
            py="0.4rem"
            borderRadius="0"
            boxShadow="0 0.4rem 0.9rem rgba(0,0,0,0.4)"
            pointerEvents="none"
            zIndex={20}
            style={{ "--peek-accent": accent, animation: `sectionSwitcherPeek ${PEEK_DURATION_MS}ms ease` }}
            transformOrigin="top"
          >
            <Text fontSize="0.7rem" fontWeight="black" color="inherit" lineHeight={1}>
              →
            </Text>
            <Text fontSize="0.7rem" fontWeight="black" color="inherit" textTransform="uppercase" letterSpacing="0.04em" lineClamp={1} lineHeight={1}>
              {nextItem.label}
            </Text>
          </Flex>
        )}
      </Box>

      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title={stack[0]?.label ?? "Sections"}>
        <Flex direction="column" py="0.4rem">
          {items.map((item) => {
            if (item.type === "teamHubSwitcher") {
              return (
                <TeamHubSwitcherSheetBlock
                  key={item.id}
                  item={item}
                  team={stack[0]}
                  pathname={pathname}
                  onNavigate={() => setIsOpen(false)}
                />
              );
            }
            return (
              <Box
                key={item.id}
                as="button"
                type="button"
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                w="full"
                textAlign="left"
                px="1rem"
                py="0.85rem"
                bg={item.active ? "whiteAlpha.100" : "transparent"}
                borderLeft="3px solid"
                borderColor={item.active ? accent : "transparent"}
              >
                <Text
                  fontSize="0.85rem"
                  fontWeight="black"
                  color={item.active ? "white" : "whiteAlpha.700"}
                  textTransform="uppercase"
                  letterSpacing="0.04em"
                >
                  {item.label}
                </Text>
              </Box>
            );
          })}
        </Flex>
      </BottomSheet>
    </>
  );
};
