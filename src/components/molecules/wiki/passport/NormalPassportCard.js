import { Box, Grid, Flex, Text, Image } from "@chakra-ui/react";
import { Watermark, Label, EightFieldPassport, TitleLeaderCell, ChampionBlock } from "./PassportPrimitives";

export const NormalPassportCard = ({ conf }) => (
  <Box
    minW={0}
    h="100%"
    w="100%"
    position="relative"
    overflow="hidden"
    p={4}
    borderRadius="8px"
    bg={`linear-gradient(135deg, ${conf.colors.primary}33 0%, rgba(255,255,255,0.035) 58%, rgba(0,0,0,0.18) 100%)`}
    border="1px solid"
    borderColor="whiteAlpha.100"
  >
    <Watermark conf={conf} />
    <Grid h="100%" templateRows="minmax(0, 1fr) 52px" gap={2.5} minH={0}>
      <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={3} minH={0} alignItems="stretch">
        <Box minW={0} h="100%" position="relative" zIndex={2} display="flex" flexDirection="column" justifyContent="center">
          <Label color={conf.colors.secondary}>{conf.name}</Label>
          <Flex align="center" gap={3} mt={1}>
            <Text fontSize="clamp(3rem, 6vw, 5.35rem)" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0" lineHeight={0.78}>
              {conf.key}
            </Text>
            <Image src={conf.logo} alt={`${conf.key} logo`} h="42px" maxW="98px" objectFit="contain" filter="drop-shadow(0 8px 18px rgba(0,0,0,0.55))" />
          </Flex>
          <Text mt={2} fontSize="10px" color={conf.colors.secondary} fontWeight="black" fontStyle="italic" textTransform="uppercase" letterSpacing="0" lineClamp={2} maxW="300px">
            "{conf.slogan}"
          </Text>
        </Box>
        <EightFieldPassport conf={conf} />
      </Grid>
      <Grid templateColumns="minmax(0, 1fr) minmax(0, 0.92fr)" gap={3} minH={0}>
        <TitleLeaderCell conf={conf} />
        <ChampionBlock conf={conf} />
      </Grid>
    </Grid>
  </Box>
);
