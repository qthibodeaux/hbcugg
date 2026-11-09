import { memo, useState } from "react";
import { NEUTRAL_ACCENT, venueInitials } from "./sideNavPresentation";
import { Box, Flex, Image, Text, IconButton, Grid, VStack } from "@chakra-ui/react";
import { MapPin, List, LayoutGrid } from "lucide-react";
import { NavItem } from "./NavItem";

export const VenueHubBlock = memo(({ switcher }) => {
  const [showGrid, setShowGrid] = useState(false);
  const primary = switcher.accent || NEUTRAL_ACCENT;
  const hasVenue = Boolean(switcher.venueId);

  const tileStyle = (active) => ({
    w: 12,
    h: 12,
    mx: "auto",
    borderRadius: "md",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bg: active ? "whiteAlpha.100" : "transparent",
    opacity: active ? 1 : 0.55,
    _hover: { opacity: 1, bg: "whiteAlpha.100" },
    transition: "all 0.15s",
  });

  const pick = (id) => {
    switcher.onVenueClick(id);
    setShowGrid(false);
  };

  return (
    <Box mt={2} mb={4}>
      <Flex align="center" justify="space-between" gap={2} p={4} bg={primary}>
        <Flex align="center" gap={3} minW={0} as="button" onClick={switcher.onClick} textAlign="left">
          <Box
            w={11}
            h={11}
            minW={11}
            bg="white"
            borderRadius="lg"
            p={1.5}
            boxShadow="sm"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={primary}
          >
            {switcher.logo ? (
              <Image src={switcher.logo} alt="" w="full" h="full" objectFit="contain" />
            ) : (
              <MapPin size={22} />
            )}
          </Box>
          <Box minW={0}>
            <Text
              color="white"
              fontWeight="black"
              fontSize="clamp(0.85rem, 7cqw, 1.13rem)"
              letterSpacing="tight"
              lineHeight="1.15"
              lineClamp={2}
            >
              {switcher.label}
            </Text>
            {switcher.meta && (
              <Text color="whiteAlpha.800" fontSize="0.72rem" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" lineClamp={1}>
                {switcher.meta}
              </Text>
            )}
          </Box>
        </Flex>
        <IconButton
          aria-label={showGrid ? "Hide venues" : "Switch venue"}
          onClick={() => setShowGrid((v) => !v)}
          size="sm"
          variant="ghost"
          color="white"
          flexShrink={0}
          _hover={{ bg: "whiteAlpha.200" }}
        >
          {showGrid ? <List size={16} /> : <LayoutGrid size={16} />}
        </IconButton>
      </Flex>

      {showGrid ? (
        <Box bg="bg.secondary" pb={2}>
          <Text px={3} pt={3} pb={1} fontSize="0.6rem" fontWeight="black" color="text.muted" letterSpacing="0.3em" textTransform="uppercase">
            Campus
          </Text>
          <Grid templateColumns="repeat(3, 1fr)" gap={1} px={3}>
            {switcher.campus.map((v) => (
              <Box key={v.id} as="button" onClick={() => pick(v.id)} p={1.5} title={v.name} {...tileStyle(v.id === switcher.venueId)}>
                {v.logo ? (
                  <Image src={v.logo} alt={v.name} w="full" h="full" objectFit="contain" />
                ) : (
                  <Text fontSize="0.7rem" fontWeight="black" color="white">{venueInitials(v.name)}</Text>
                )}
              </Box>
            ))}
          </Grid>
          <Text px={3} pt={3} pb={1} fontSize="0.6rem" fontWeight="black" color="text.muted" letterSpacing="0.3em" textTransform="uppercase">
            Neutral sites
          </Text>
          <Grid templateColumns="repeat(3, 1fr)" gap={1} px={3}>
            {switcher.neutral.map((v) => (
              <Box
                key={v.id}
                as="button"
                onClick={() => pick(v.id)}
                title={v.name}
                border="1px solid"
                borderColor="whiteAlpha.200"
                {...tileStyle(v.id === switcher.venueId)}
              >
                <Text fontSize="0.7rem" fontWeight="black" color="white" letterSpacing="0.05em">{venueInitials(v.name)}</Text>
              </Box>
            ))}
          </Grid>
        </Box>
      ) : hasVenue ? (
        <VStack gap={0} align="stretch">
          <NavItem item={{ id: "all-stadiums", label: "ALL STADIUMS", indent: true, active: false, accent: primary, onClick: () => switcher.onVenueClick(null) }} />
        </VStack>
      ) : null}
    </Box>
  );
});

VenueHubBlock.displayName = "VenueHubBlock";
