import { Grid } from "@chakra-ui/react";

const DesktopBoard4x = ({ children, gap = 4, autoRows = "minmax(170px, auto)" }) => {
  return (
    <Grid
      templateColumns="repeat(4, minmax(0, 1fr))"
      autoRows={autoRows}
      gap={gap}
      alignItems="stretch"
    >
      {children}
    </Grid>
  );
};

export default DesktopBoard4x;
