import { Box, Flex, Text } from "@chakra-ui/react";
import { SERIF, headSize, SIZE } from "./gloryContent";

// Dictionary headword and senses in desktop and stacked layouts.

const Headword = ({ entry, z, row }) => (
  <Box minW={0}>
    <Flex align="baseline" gap="0.6em" wrap="wrap">
      <Text fontFamily={SERIF} fontSize={headSize(entry.word, row)} fontWeight="700" color="white" lineHeight={1}>{entry.word}</Text>
      <Text fontFamily={SERIF} fontSize={z.noun} fontWeight="700" color="brand.300">{entry.pos}</Text>
    </Flex>
    <Flex align="center" gap="0.8em" mt="0.5em" wrap="wrap">
      <Text fontFamily={SERIF} fontSize={z.syl} color="whiteAlpha.600">{entry.syl}</Text>
      <Box border="1px solid" borderColor="whiteAlpha.400" borderRadius="full" px="0.8em" py="0.05em">
        <Text fontFamily={SERIF} fontSize={z.syl} color="brand.200">{entry.pron}</Text>
      </Box>
    </Flex>
    {entry.forms ? (
      <Flex align="center" gap="0.6em" mt="0.5em" wrap="wrap">
        <Box bg="whiteAlpha.200" borderRadius="sm" px="0.6em" py="0.1em">
          <Text fontFamily={SERIF} fontSize={z.plural} fontWeight="700" color="whiteAlpha.800">{entry.forms.label}</Text>
        </Box>
        <Text fontFamily={SERIF} fontSize={z.pluralWord} fontWeight="700" color="white">{entry.forms.value}</Text>
      </Flex>
    ) : null}
    <Text fontFamily={SERIF} fontStyle="italic" fontSize={z.origin} color="whiteAlpha.500" mt="0.6em" lineHeight={1.3}>
      Origin: {entry.origin}
    </Text>
  </Box>
);

const Sense = ({ letter, sense, z }) => (
  <Box>
    <Text fontFamily={SERIF} fontSize={z.sense} color="white" lineHeight={1.3}>
      <Box as="span" fontWeight="900" mr={2}>{letter} :</Box>
      {sense.def}
    </Text>
    <Flex mt="0.3em" ml="0.2rem">
      <Box w="2px" bg="whiteAlpha.300" flexShrink={0} />
      <Text pl={3} fontFamily={SERIF} fontSize={z.example} color="whiteAlpha.600" lineHeight={1.3}>
        {sense.example.before}
        <Box as="span" fontStyle="italic">{sense.example.word}</Box>
        {sense.example.after}
      </Text>
    </Flex>
  </Box>
);

const Senses = ({ entry, z }) => (
  <Flex direction="column" gap={z.gap} minW={0}>
    {entry.senses.map((s, i) => <Sense key={s.def} letter={"ab"[i]} sense={s} z={z} />)}
  </Flex>
);

export const EntryRow = ({ entry }) => (
  <Box h="100%" p={SIZE.row.pad} display="grid" gridTemplateColumns="minmax(0, 1fr) minmax(0, 1.25fr)" columnGap="4cqw" alignItems="center">
    <Headword entry={entry} z={SIZE.row} row />
    <Senses entry={entry} z={SIZE.row} />
  </Box>
);

export const EntryStack = ({ entry }) => (
  <Flex direction="column" gap={SIZE.stack.gap} p={SIZE.stack.pad}>
    <Headword entry={entry} z={SIZE.stack} />
    <Senses entry={entry} z={SIZE.stack} />
  </Flex>
);
