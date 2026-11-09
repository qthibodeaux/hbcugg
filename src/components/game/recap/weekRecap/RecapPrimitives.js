import { DIM, fg, COMP_INK } from "./recapPresentation";
import { Text, Box } from "@chakra-ui/react";
import { scoreOf } from "./recapModel";

export const Kick = ({ children, color = DIM, size = 14, ...rest }) => (
  <Text fontSize={`${size}px`} fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.16em" lineHeight={1.15} {...rest}>{children}</Text>
);

export const SectionHead = ({ children }) => <Kick size={16} color={fg(0.7)} mb="12px">{children}</Kick>;

export const ColHead = ({ children, align = "left", ...rest }) => <Kick size={12} color={fg(0.45)} textAlign={align} {...rest}>{children}</Kick>;

export const Divider = () => <Box alignSelf="stretch" bg={fg(0.12)} />;

export const CompBar = ({ p, max, h = "16px" }) => {
  // Length represents the printed production score, not positive component sums.
  // Color identifies the largest production component; it is not a stacked total.
  const dominant = [...COMP_INK].sort(([a], [b]) => (p.components?.[b] ?? 0) - (p.components?.[a] ?? 0))[0];
  const width = max > 0 && Number.isFinite(scoreOf(p)) ? Math.max(0, Math.min(100, scoreOf(p) / max * 100)) : 0;
  return (
    <Box position="relative" h={h} w="full" minW={0} bg={fg(0.16)} borderRight="2px solid" borderColor={fg(0.65)}
      aria-label={`PAR ${scoreOf(p) || 0} of ${max.toFixed(1)}`}>
      <Box h="full" bg={dominant?.[1]} style={{ width: `${width}%` }} />
    </Box>
  );
};
