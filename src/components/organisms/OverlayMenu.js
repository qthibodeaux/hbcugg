import {
  Box,
  Text,
  Flex,
  IconButton,
  VStack,
  HStack,
  Badge,
} from "@chakra-ui/react";
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerCloseTrigger,
  Portal,
} from "@chakra-ui/react";
import { X, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const OVERLAY_BACKDROP_Z_INDEX = 1400;
const OVERLAY_CONTENT_Z_INDEX = 1401;

// Navigation items for "nav" mode
const NAV_ITEMS = [
  { label: "Home", path: "/", number: "01" },
  { label: "Game Center", path: "/game-center", number: "02" },
  { label: "Schools", path: "/schools", number: "03" },
  // People pulled from nav for launch.0 (2026-09-02) — see AFTER_LAUNCH_0.md §1.
  // Analytics renumbered to 04 so the sequence stays contiguous.
  // { label: "People", path: "/people", number: "04" },
  { label: "Analytics", path: "/stats", number: "04" },
];

const OverlayMenu = ({
  isOpen,
  onClose,
  mode = "nav", // "nav" | "filter"
  title = mode === "nav" ? "Menu" : "Filters",
  filterOptions = [], // For filter mode: [{ label, value, icon, count, color }]
  selectedFilters = [],
  onFilterSelect = () => {},
  children, // For custom content
}) => {
  // Do not early-return null while closed — DrawerRoot is a Zag.js-backed
  // state machine that expects to stay mounted and control its own
  // open/close lifecycle via `open`. Force-unmounting it here on every close
  // and rebuilding it from scratch on every open raced its internal
  // focus-trap activation against the portaled content actually attaching to
  // the DOM, which iOS Safari surfaced as an uncaught "Script error" inside
  // focus-trap's activate/finishActivation on open.
  //
  // That fix wasn't enough on its own — the same activate/finishActivation
  // crash kept happening on mobile (2026-08-27 report). trapFocus's own
  // effect auto-queries the DOM for the first focusable element to move
  // focus to on activation, which is a known crash point for the
  // focus-trap package on mobile WebKit/Chrome when that query runs before
  // the portaled content has fully attached/laid out. This is a simple nav
  // menu, not a form — losing strict focus containment is an acceptable
  // trade for not crashing; closeOnInteractOutside/closeOnEscape/modal/
  // preventScroll all still work normally.
  return (
    <DrawerRoot
      open={isOpen}
      onOpenChange={(e) => !e.open && onClose()}
      placement="start"
      modal
      preventScroll
      trapFocus={false}
    >
      <Portal>
        <DrawerBackdrop
          bg="blackAlpha.900"
          backdropFilter="blur(4px)"
          zIndex={OVERLAY_BACKDROP_Z_INDEX}
        />
        <DrawerPositioner zIndex={OVERLAY_CONTENT_Z_INDEX}>
          <DrawerContent
            bg="bg.primary"
            maxW={{ base: "100%", md: "500px" }}
            h="100vh"
            boxShadow="dark-lg"
          >
        {/* Header */}
        <DrawerHeader p={0}>
          <Flex
            px={{ base: 6, md: 8 }}
            py={6}
            align="center"
            justify="space-between"
            borderBottom="1px solid"
            borderColor="whiteAlpha.100"
          >
            <Text
              fontSize="sm"
              fontWeight="medium"
              color="text.muted"
              textTransform="uppercase"
              letterSpacing="widest"
            >
              {title}
            </Text>
            <DrawerCloseTrigger asChild>
              <IconButton
                aria-label="Close menu"
                variant="ghost"
                color="text.primary"
                _hover={{ bg: "whiteAlpha.100" }}
                size="lg"
              >
                <X size={24} />
              </IconButton>
            </DrawerCloseTrigger>
          </Flex>
        </DrawerHeader>

        {/* Body */}
        <DrawerBody px={{ base: 6, md: 8 }} py={8} overflow="auto">
          {mode === "nav" ? (
            <NavigationContent onClose={onClose} />
          ) : (
            <FilterContent
              options={filterOptions}
              selected={selectedFilters}
              onSelect={onFilterSelect}
            />
          )}
          {children}
        </DrawerBody>
          </DrawerContent>
        </DrawerPositioner>
      </Portal>
    </DrawerRoot>
  );
};

// Navigation Mode Content
const NavigationContent = ({ onClose }) => {
  return (
    <VStack align="stretch" gap={2}>
      {NAV_ITEMS.map((item) => (
        <Box
          key={item.path}
          as={Link}
          to={item.path}
          onClick={onClose}
          py={4}
          borderBottom="1px solid"
          borderColor="whiteAlpha.50"
          transition="all 0.2s"
          _hover={{
            borderColor: "brand.500",
            pl: 2,
          }}
        >
          <Flex align="center" justify="space-between">
            <HStack gap={4}>
              <Text
                fontSize="sm"
                fontWeight="bold"
                color="brand.500"
                fontFamily="mono"
              >
                {item.number}
              </Text>
              <Text
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="black"
                color="text.primary"
                textTransform="uppercase"
                letterSpacing="tight"
                lineHeight={1}
              >
                {item.label}
              </Text>
            </HStack>
            <HStack gap={3}>
              {item.badge && (
                <Badge colorScheme="red" size="sm" px={2} py={0.5}>
                  {item.badge}
                </Badge>
              )}
              <ArrowUpRight size={24} color="#A1A1AA" />
            </HStack>
          </Flex>
        </Box>
      ))}

      {/* Footer section */}
      <Box pt={12}>
        <Text fontSize="sm" color="text.muted" mb={4} textTransform="uppercase">
          Follow Us
        </Text>
        <Flex gap={4}>
          {["Twitter", "Instagram", "YouTube"].map((social) => (
            <Text
              key={social}
              fontSize="sm"
              color="text.secondary"
              _hover={{ color: "brand.500" }}
              cursor="pointer"
              transition="color 0.2s"
            >
              {social}
            </Text>
          ))}
        </Flex>
      </Box>
    </VStack>
  );
};

// Filter Mode Content
const FilterContent = ({ options, selected, onSelect }) => {
  if (options.length === 0) {
    return (
      <Text color="text.muted" textAlign="center" py={8}>
        No filters available
      </Text>
    );
  }

  return (
    <VStack align="stretch" gap={4}>
      <Flex wrap="wrap" gap={3}>
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <Box
              key={option.value}
              as="button"
              onClick={() => onSelect(option.value)}
              px={4}
              py={3}
              borderRadius="full"
              border="2px solid"
              borderColor={isSelected ? option.color || "brand.500" : "whiteAlpha.200"}
              bg={isSelected ? `${option.color || "brand.500"}20` : "transparent"}
              transition="all 0.2s"
              _hover={{
                borderColor: option.color || "brand.500",
                transform: "translateY(-2px)",
              }}
            >
              <HStack gap={2}>
                {option.icon && (
                  <Box color={option.color || "text.primary"}>{option.icon}</Box>
                )}
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color={isSelected ? "text.primary" : "text.secondary"}
                >
                  {option.label}
                </Text>
                {option.count !== undefined && (
                  <Badge
                    size="sm"
                    bg={isSelected ? option.color || "brand.500" : "whiteAlpha.200"}
                    color={isSelected ? "white" : "text.muted"}
                  >
                    {option.count}
                  </Badge>
                )}
              </HStack>
            </Box>
          );
        })}
      </Flex>

      {/* Selected filters summary */}
      {selected.length > 0 && (
        <Box mt={6} pt={6} borderTop="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="sm" color="text.muted" mb={3}>
            Selected: {selected.length}
          </Text>
          <Box
            as="button"
            onClick={() => onSelect("clear")}
            fontSize="sm"
            color="brand.500"
            textDecoration="underline"
            _hover={{ color: "brand.400" }}
          >
            Clear all filters
          </Box>
        </Box>
      )}
    </VStack>
  );
};

export default OverlayMenu;
