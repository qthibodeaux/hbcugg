import { Box, Flex, Text, Button, IconButton } from "@chakra-ui/react";
import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";

const NAV_ITEMS = [
  { label: "Home", path: "/", matches: ["/"] },
  { label: "Game Center", path: "/game-center", matches: ["/game-center", "/game/"] },
  { label: "Schools", path: "/schools", matches: ["/schools", "/teams", "/rosters"] },
  // People pulled from nav for launch.0 (2026-09-02) — the hub needs a real
  // design pass, not the current board-in-a-slot layout. Routes stay wired in
  // App.js so /people, /players, /coaches, /officials all still resolve by URL.
  // See AFTER_LAUNCH_0.md §1.
  // { label: "People", path: "/people", matches: ["/people", "/players", "/player/", "/coaches", "/officials"] },
  { label: "Stats", path: "/stats", matches: ["/stats", "/stat-lab", "/glory", "/team-analytics", "/player-analytics"] },
];

const Header = ({ onMenuOpen }) => {
  const location = useLocation();
  const { isMobile } = useLayoutDensity();

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={50}
      bg="bg.primary/90"
      backdropFilter="blur(10px)"
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      h="var(--app-header-height)"
      overflow="hidden"
    >
      <Flex
        maxW="1400px"
        h="100%"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={0}
        align="center"
        justify="space-between"
        gap={3}
        flexWrap="nowrap"
      >
        {/* Logo */}
        <Link to="/">
          {isMobile ? (
            <Text fontSize="2xl" fontWeight="black" color="text.primary" letterSpacing="tight">
              HBCU<Box as="span" color="brand.500">GG</Box>
            </Text>
          ) : (
            <Text fontSize="xl" fontWeight="bold" color="text.primary" letterSpacing="tight">
              HBCU<Box as="span" color="brand.500">GRIDIRONGLORY</Box>
            </Text>
          )}
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <Flex
          display={{ base: "none", md: "flex" }}
          gap={2}
          align="center"
          minW={0}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = item.matches?.some((match) =>
              match === "/"
                ? location.pathname === "/"
                : location.pathname === match || location.pathname.startsWith(match),
            );
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  px={4}
                  color={isActive ? "brand.500" : "text.secondary"}
                  bg={isActive ? "whiteAlpha.100" : "transparent"}
                  _hover={{ 
                    color: "text.primary", 
                    bg: "whiteAlpha.100" 
                  }}
                  position="relative"
                >
                  {item.label}
                  {item.badge && (
                    <Box
                      as="span"
                      position="absolute"
                      top={1}
                      right={1}
                      w={2}
                      h={2}
                      bg="brand.500"
                      borderRadius="full"
                    />
                  )}
                </Button>
              </Link>
            );
          })}
        </Flex>

        {/* Lab shortcuts removed 2026-10-04. The lab routes still work by URL
            (/lab/components, /lab/pages, /lab/tested-designs) and Game Center
            keeps its temporary Component Lab button. */}

        {/* Mobile Hamburger - Only show on mobile */}
        <IconButton
          display={{ base: "flex", md: "none" }}
          aria-label="Open menu"
          onClick={onMenuOpen}
          variant="ghost"
          color="text.primary"
          bg="brand.500"
          _hover={{ bg: "brand.600" }}
          borderRadius="none"
          size="lg"
          p={2}
        >
          <Menu size={20} />
        </IconButton>
      </Flex>
    </Box>
  );
};

export default Header;
