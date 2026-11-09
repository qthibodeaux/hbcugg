import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { Box, Grid } from "@chakra-ui/react";
import { STATIC_CSS } from "./wikiDirectoryModel";

export const DirectoryShell = ({ children, variant }) => {
  const { isMobile } = useLayoutDensity();
  const isMobileStandard = isMobile && variant !== "compact";
  return (
    <Box
      w="full"
      h="full"
      minH={variant === "compact" ? "144px" : "clamp(160px, 20vw, 260px)"}
      bg="#0B0B0D"
      overflow="hidden"
      p={isMobileStandard ? 0 : variant === "compact" ? "4px" : { base: "4px", lg: "6px" }}
    >
      <style>{STATIC_CSS}</style>
      {children}
    </Box>
  );
};

export const DirectoryGrid = ({ children, variant }) => {
  const { isMobile } = useLayoutDensity();
  const isMobileStandard = isMobile && variant !== "compact";
  return (
    <Grid
      h="full"
      minH={0}
      templateColumns="repeat(6, minmax(0, 1fr))"
      templateRows="repeat(3, minmax(0, 1fr))"
      gap={isMobileStandard ? "0" : variant === "compact" ? "4px" : { base: "4px", lg: "6px" }}
    >
      {children}
    </Grid>
  );
};
