import { useState } from "react";
import { Flex, Text, Image } from "@chakra-ui/react";

// Shared candidate-headshot rendering with initials fallback; identity joins remain in headshots utilities.

export const initialsOf = (name) => String(name ?? "")
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase() ?? "")
  .join("") || "--";

export const HeadshotOrInitials = ({ name, src, srcs, fontSize = "sm" }) => {
  const candidates = srcs ?? (src ? [src] : []);
  const [attempt, setAttempt] = useState(0);
  const current = candidates[attempt] ?? null;
  if (!current) {
    return (
      <Flex w="100%" h="100%" align="center" justify="center">
        <Text fontSize={fontSize} color="white" fontWeight="black" letterSpacing="0.04em">{initialsOf(name)}</Text>
      </Flex>
    );
  }
  return <Image key={current} src={current} alt={name} w="100%" h="100%" objectFit="cover" onError={() => setAttempt((a) => a + 1)} />;
};
