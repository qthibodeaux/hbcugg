import { Flex } from "@chakra-ui/react";
import { Micro } from "../../../molecules/home/LiveTile";

// Home Games tile tint and backend-authored reasons display.

export const tint = (team, alpha = "33") => `${team?.primary ?? "#27272A"}${alpha}`;

export const Reasons = ({ lines, size = 3 }) =>
  lines?.length ? (
    <Flex direction="column" gap="0.8cqmin">
      {lines.slice(0, 3).map((line) => (
        <Micro key={line} color="brand.300" size={size} lineClamp={1}>{line}</Micro>
      ))}
    </Flex>
  ) : null;
