import PageShell from "../components/layouts/PageShell";
import { LabRegistryList, LabIntroCard } from "../components/organisms/test/componentLab/LabCatalog";
import { registry } from "../components/organisms/test/componentLabRegistry";
import { Box, Text } from "@chakra-ui/react";
import { LabSlot } from "../components/organisms/test/componentLab/LabSlot";

const parseSize = (size = "1x1") => {
  const [c, r] = size.split("x").map(Number);
  return { cols: Number.isNaN(c) ? 1 : c, rows: Number.isNaN(r) ? 1 : r };
};

const ComponentLab = () => (
  <PageShell listContent={<LabRegistryList />}>
    <PageShell.Slot cols={4}>
      <LabIntroCard />
    </PageShell.Slot>

    {registry.length === 0 ? (
      <PageShell.Slot cols={4}>
        <Box
          h="100%"
          border="1px dashed"
          borderColor="whiteAlpha.200"
          borderRadius="xl"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={6}
          textAlign="center"
        >
          <Text fontSize="sm" color="text.muted">
            No components registered yet. Add entries to `src/components/organisms/test/componentLabRegistry.js`.
          </Text>
        </Box>
      </PageShell.Slot>
    ) : (
      registry.map((entry) => {
        const { cols, rows } = parseSize(entry.size);
        return (
          <PageShell.Slot key={`${entry.number}-${entry.name}`} cols={cols} rows={rows}>
            <LabSlot entry={entry} />
          </PageShell.Slot>
        );
      })
    )}
  </PageShell>
);

export default ComponentLab;
