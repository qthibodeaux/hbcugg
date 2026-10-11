import { Box, Flex, Text } from "@chakra-ui/react";
import { Moon, Sun } from "lucide-react";
import { useColorScheme } from "../../theme/colorScheme";

const OPTIONS = [
  { key: "night", label: "Night", Icon: Moon },
  { key: "light", label: "Light", Icon: Sun },
];

// Light / Night switch — pinned to the bottom of the sidebar. Two halves of one
// pill; the active half is filled.
export const ThemeSwitch = () => {
  const [scheme, setScheme] = useColorScheme();
  return (
    <Flex
      role="radiogroup"
      aria-label="Color mode"
      bg="var(--gg-bg-primary)"
      border="1px solid"
      borderColor="var(--gg-line-strong)"
      borderRadius="full"
      p="3px"
      gap="3px"
    >
      {OPTIONS.map(({ key, label, Icon }) => {
        const active = scheme === key;
        return (
          <Flex
            key={key}
            as="button"
            role="radio"
            aria-checked={active}
            onClick={() => setScheme(key)}
            flex="1"
            minW={0}
            align="center"
            justify="center"
            gap="0.35rem"
            py="0.4rem"
            borderRadius="full"
            bg={active ? "var(--gg-bg-raised)" : "transparent"}
            color={active ? "var(--gg-ink)" : "var(--gg-text-muted)"}
            transition="background 0.2s ease, color 0.2s ease"
            _hover={active ? undefined : { color: "var(--gg-text-primary)" }}
          >
            <Box as={Icon} boxSize="0.8rem" flexShrink={0} />
            <Text fontSize="clamp(0.55rem, 5cqw, 0.68rem)" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1}>
              {label}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
};

export default ThemeSwitch;
