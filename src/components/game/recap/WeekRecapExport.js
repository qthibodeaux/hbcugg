import { useWeekRecap } from "../../../hooks/useWeekRecap";
import { useState } from "react";
import { Flex, Text } from "@chakra-ui/react";
import { Download } from "lucide-react";
import { PreviewModal } from "./weekRecap/PreviewModal";

export const WeekRecapExport = ({ placement = {} }) => {
  const { recap } = useWeekRecap();
  const [open, setOpen] = useState(false);
  if (!recap) return null;
  return (
    <>
      <Flex as="button" type="button" onClick={() => setOpen(true)} position="absolute" top="0.75rem" right="0.75rem" zIndex={5}
        align="center" gap={1.5} px={3} py={1.5} borderRadius="md" bg="whiteAlpha.200" _hover={{ bg: "whiteAlpha.300" }} {...placement}>
        <Download size={13} />
        <Text fontSize="10px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.16em">Export</Text>
      </Flex>
      {open && <PreviewModal recap={recap} onClose={() => setOpen(false)} />}
    </>
  );
};

export default WeekRecapExport;

export { WeekRecapPoster } from "./weekRecap/WeekRecapPoster";

export { PALETTES, paletteOf, posterVars } from "../../molecules/export/posterPalette";
