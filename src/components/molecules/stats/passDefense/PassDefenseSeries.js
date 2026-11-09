import { useRef } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ExportCardButton } from "../../../organisms/stats/ExportCardButton";
import { buildPassDefenseView } from "../../../../utils/passDefenseModel";
import { PassDefenseControls } from "./PassDefenseControls";
import { PassDefensePoster } from "./PassDefensePoster";

export const PassDefenseSeries = ({ data, selection, onChange, pal, scheme, isLoading = false, error = null, onRetry }) => {
  const capture = useRef(null);
  const view = buildPassDefenseView(selection, data);
  const zoom = Math.max(0.35, Math.min(0.75, (typeof window === "undefined" ? 1000 : window.innerWidth - 520) / 1400));
  const filename = `pass-defense-${selection.visual}-${view.scope}-${selection.teamId}-${selection.overview}-${selection.trajectory}-${selection.situation}-${selection.role}-2026-${scheme}.png`;
  return (
    <Box w="full" minW={0}>
      <PassDefenseControls data={data} selection={selection} onChange={onChange} />
      <Flex justify="flex-end" mb={4}>
        {!isLoading && !error && !view.blocked && <ExportCardButton target={capture} filename={filename} />}
      </Flex>
      {error ? (
        <Box role="alert" p={6} borderLeft="4px solid" borderColor="brand.500">
          <Text fontWeight="900">Pass-defense data could not be loaded.</Text>
          <Text fontSize="sm" mt={2}>{error.message}</Text>
          {onRetry && <Box as="button" type="button" onClick={onRetry} mt={3} px={4} py={2} bg="brand.500" color="white">Retry</Box>}
        </Box>
      ) : isLoading ? <Text role="status" py={10}>Loading published pass-defense sources…</Text> : <>
        <Box overflowX="auto">
          <Box w="fit-content" boxShadow="0 1rem 3rem rgba(0,0,0,0.5)" style={{ zoom }}>
            <PassDefensePoster data={data} selection={selection} view={view} pal={pal} />
          </Box>
        </Box>
        <Box position="fixed" left="-20000px" top={0} aria-hidden="true" pointerEvents="none">
          <PassDefensePoster data={data} selection={selection} view={view} pal={pal} innerRef={capture} />
        </Box>
      </>}
    </Box>
  );
};
