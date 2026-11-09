import { Box, Image, Text, Flex, Grid } from "@chakra-ui/react";
import { BannerTitleArea } from "../BannerControls";
import { MobileSectionSwitcher } from "../MobileSectionSwitcher";

export const MobileWikiHeroBanner = ({ wikiData, stats, gradient }) => (
  <Box w="full" position="relative" overflow="hidden" display="flex" flexDirection="column">
    <Box
      position="relative"
      overflow="hidden"
      h="var(--app-header-height)"
      flexShrink={0}
      bg={gradient}
      display="flex"
      flexDirection="column"
    >
      <BannerTitleArea>
        <Box position="absolute" right="-1rem" top="50%" style={{ transform: 'translateY(-50%)' }} pointerEvents="none">
          <Image src={wikiData.logo} alt="" w="5.5rem" h="5.5rem" objectFit="contain" style={{ opacity: 0.25 }} />
        </Box>
        <Box position="relative" zIndex={2}>
          <Text
            fontSize="clamp(2.6rem, 7vw, 7.5rem)"
            fontWeight="black"
            fontStyle="italic"
            letterSpacing="-0.04em"
            lineHeight="0.85"
            color="#FFFFFF"
            textTransform="uppercase"
            whiteSpace="nowrap"
          >
            {wikiData.name}
          </Text>
        </Box>
      </BannerTitleArea>
    </Box>

    <Flex align="flex-start">
      <MobileSectionSwitcher accent={wikiData.colors.primary} />
    </Flex>

    <Grid templateColumns="repeat(4, minmax(0, 1fr))" bg="bg.secondary">
      {stats.map((stat) => (
        <Box key={stat.label} px="0.4rem" py="0.5rem" borderRight="1px solid" borderColor="whiteAlpha.100" _last={{ borderRight: 'none' }}>
          <Text fontSize="0.5rem" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
            {stat.label}
          </Text>
          <Text fontSize="0.95rem" fontWeight="black" color="white" lineHeight={1.2} lineClamp={1}>
            {stat.value}
          </Text>
        </Box>
      ))}
    </Grid>
  </Box>
);
