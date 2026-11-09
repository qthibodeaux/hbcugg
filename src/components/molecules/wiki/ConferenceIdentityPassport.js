import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { MobilePassportCard } from "./passport/MobilePassport";
import { CompactPassportCard } from "./passport/CompactPassport";
import { NormalPassportCard } from "./passport/NormalPassportCard";
import { Box, Grid } from "@chakra-ui/react";
import { CONFERENCES } from "./passport/passportModel";

export const ConferenceIdentityPassportCard = ({ conf, density = "normal" }) => {
  const { isMobile } = useLayoutDensity();
  if (isMobile) return <MobilePassportCard conf={conf} />;
  if (density === "compact") return <CompactPassportCard conf={conf} />;
  return <NormalPassportCard conf={conf} />;
};

export const ConferenceIdentityPassport = ({ density = "normal" }) => (
  <Box
    h="100%"
    w="100%"
    overflow="hidden"
    position="relative"
    borderRadius="8px"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="linear-gradient(90deg, rgba(111,38,51,0.18) 0%, rgba(11,11,13,0.99) 50%, rgba(75,0,130,0.18) 100%)"
    boxShadow="inset 0 -3px 0 #FFD100"
  >
    <Grid h="100%" templateColumns={{ base: "1fr", xl: "repeat(2, minmax(0, 1fr))" }} gap={3} p={3}>
      {CONFERENCES.map((conf) => (
        <ConferenceIdentityPassportCard key={conf.key} conf={conf} density={density} />
      ))}
    </Grid>
  </Box>
);

export default ConferenceIdentityPassport;

export { ConferencePassportCarousel } from "./passport/ConferencePassportCarousel";
