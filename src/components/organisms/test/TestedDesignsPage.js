import PageShell from "../../layouts/PageShell";
import { Box, Text, Flex } from "@chakra-ui/react";
import { sectionOrder, testedDesignsRegistry } from "./designArchive/archiveRegistry";
import React from "react";

export const TestedDesignsPage = () => {
  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <Box
          w="full"
          h="full"
          bg="bg.secondary"
          borderRadius="xl"
          border="1px solid"
          borderColor="whiteAlpha.100"
          p={8}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          position="relative"
          overflow="hidden"
        >
          <Text
            position="absolute"
            right="-20px"
            bottom="-20px"
            fontSize="140px"
            fontWeight="black"
            color="whiteAlpha.50"
            userSelect="none"
            pointerEvents="none"
          >
            GALLERY
          </Text>
          <Text fontSize="xs" fontWeight="black" color="brand.400" letterSpacing="widest" mb={2}>
            COMPONENT ARCHIVE
          </Text>
          <Text fontSize="4xl" fontWeight="black" color="white" textTransform="uppercase">
            Tested Designs
          </Text>
          <Text mt={2} color="text.secondary" maxW="700px" fontSize="sm">
            Visual patterns and UI variants graduated out of the active Component Lab for future reference.
          </Text>
        </Box>
      </PageShell.Slot>

      {sectionOrder.map((section) => (
        <React.Fragment key={section}>
          <SectionHeader title={section} />
          {testedDesignsRegistry
            .filter((item) => item.section === section)
            .map((item) => (
              <ArchivedSlot key={item.number} label={item.label} cols={item.cols} component={item.component} />
            ))}
        </React.Fragment>
      ))}
    </PageShell>
  );
};

const SectionHeader = ({ title }) => (
  <PageShell.Slot cols={4}>
    <Flex align="center" gap={4} h="full">
      <Box w="4px" h="20px" bg="brand.500" />
      <Text fontSize="md" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="widest">
        {title}
      </Text>
      <Box flex={1} h="1px" bg="whiteAlpha.100" />
    </Flex>
  </PageShell.Slot>
);

const ArchivedSlot = ({ label, cols, component: Component }) => (
  <PageShell.Slot cols={cols}>
    <Box w="full" h="full" position="relative" overflow="hidden">
      <Component />
      <Box
        position="absolute"
        top={2}
        left={2}
        bg="blackAlpha.800"
        backdropFilter="blur(8px)"
        px={2}
        py={1}
        borderRadius="sm"
        border="1px solid"
        borderColor="whiteAlpha.200"
        zIndex={10}
        pointerEvents="none"
      >
        <Text fontSize="8px" fontWeight="black" color="white" textTransform="uppercase">
          {label}
        </Text>
      </Box>
    </Box>
  </PageShell.Slot>
);
