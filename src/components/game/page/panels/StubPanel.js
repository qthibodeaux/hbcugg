import {  Flex, Text } from "@chakra-ui/react";
import { SectionShell } from "./SectionShell";

export const StubPanel = ({ title }) => (
  <SectionShell title={title}>
    <Flex justify="center" align="center" minH="80px">
      <Text color="text.muted" fontSize="sm">Coming soon</Text>
    </Flex>
  </SectionShell>
);
