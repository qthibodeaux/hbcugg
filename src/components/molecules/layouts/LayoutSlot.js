import { GridItem } from "@chakra-ui/react";

const LayoutSlot = ({ colSpan = 1, rowSpan = 1, children }) => {
  return (
    <GridItem colSpan={colSpan} rowSpan={rowSpan} minW={0}>
      {children}
    </GridItem>
  );
};

export default LayoutSlot;
