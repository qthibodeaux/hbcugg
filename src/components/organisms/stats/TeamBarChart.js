import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { readableTeamColor } from "../../../utils/teamColor";

// ─────────────────────────────────────────────────────────────────────────────
// TEAM BAR CHART — one measure, every team, ranked. The Charts tab's bar mode.
//
// Desktop: a bar per team in its own colour, the logo riding the bar's tip,
// the abbreviation and value under it. Values below zero hang under a zero
// line, so EPA and net measures read honestly. Mobile: the same ranking as
// rows — rank, mark, a bar across, the value — which is what fits a phone.
//
// Drawn in plain boxes (not a chart library) so the logos sit exactly on the
// tips and the export captures the images like every other card.
// ─────────────────────────────────────────────────────────────────────────────

const niceTicks = (lo, hi, target = 5) => {
  const span = hi - lo || 1;
  const raw = span / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((m) => m >= raw) ?? 10 * mag;
  const a = Math.floor(lo / step) * step;
  const b = Math.ceil(hi / step) * step;
  const ticks = [];
  for (let v = a; v <= b + step / 1e6; v += step) ticks.push(Number(v.toFixed(10)));
  return { lo: a, hi: b, ticks };
};

export const TeamBarChart = ({ points, fmt, mobile = false }) => {
  const vals = points.map((p) => p.value);
  const axis = niceTicks(Math.min(0, ...vals), Math.max(0, ...vals));
  const span = axis.hi - axis.lo || 1;
  const pctFromTop = (v) => ((axis.hi - v) / span) * 100;
  const zero = pctFromTop(0);

  if (mobile) {
    const maxAbs = Math.max(...vals.map((v) => Math.abs(v)), 1e-9);
    const signed = vals.some((v) => v < 0);
    return (
      <Box mx="-0.75rem" mb="-0.75rem" mt={2}>
        {points.map((p, i) => {
          const color = readableTeamColor(p.identity, "#141416");
          const w = (Math.abs(p.value) / maxAbs) * (signed ? 50 : 100);
          return (
            <Flex key={p.id} align="center" gap="0.55rem" px="0.75rem" py="0.45rem" borderTop="1px solid" borderColor="whiteAlpha.100">
              <Text w="1.3rem" flexShrink={0} fontSize="0.8rem" fontWeight="900" color="whiteAlpha.500" fontVariantNumeric="tabular-nums">{i + 1}</Text>
              {p.logo ? <Image src={p.logo} alt="" w="1.6rem" h="1.6rem" objectFit="contain" flexShrink={0} /> : <Box w="1.6rem" flexShrink={0} />}
              <Text w="3.4rem" flexShrink={0} fontSize="0.85rem" fontWeight="900" color="white" textTransform="uppercase" lineClamp={1}>{p.short}</Text>
              <Box flex={1} minW={0} h="0.9rem" position="relative" bg="whiteAlpha.50">
                {signed && <Box position="absolute" left="50%" top="-0.15rem" bottom="-0.15rem" w="1px" bg="whiteAlpha.400" />}
                <Box
                  position="absolute"
                  top={0}
                  bottom={0}
                  bg={color}
                  style={{ width: `${w}%`, ...(signed ? (p.value >= 0 ? { left: "50%" } : { right: "50%" }) : { left: 0 }) }}
                />
              </Box>
              <Text w="3.6rem" flexShrink={0} textAlign="right" fontSize="0.85rem" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{fmt(p.value)}</Text>
            </Flex>
          );
        })}
      </Box>
    );
  }

  return (
    <Flex mt={4} gap={2}>
      {/* y ticks */}
      <Box position="relative" w="3rem" flexShrink={0} h="24rem">
        {axis.ticks.map((t) => (
          <Text key={t} position="absolute" right="0.5rem" top={`${pctFromTop(t)}%`} transform="translateY(-50%)" fontSize="11px" fontWeight="800" color="whiteAlpha.500" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
            {fmt(t)}
          </Text>
        ))}
      </Box>

      <Box flex={1} minW={0}>
        <Box position="relative" h="24rem">
          {axis.ticks.map((t) => (
            <Box key={t} position="absolute" left={0} right={0} top={`${pctFromTop(t)}%`} h="1px" bg={Math.abs(t) < 1e-9 ? "whiteAlpha.400" : "whiteAlpha.100"} />
          ))}
          <Flex position="absolute" inset={0} gap="0.35rem">
            {points.map((p) => {
              const color = readableTeamColor(p.identity, "#141416");
              const pos = p.value >= 0;
              const top = pos ? pctFromTop(p.value) : zero;
              const height = (Math.abs(p.value) / span) * 100;
              return (
                <Box key={p.id} flex={1} minW={0} position="relative" title={`${p.name} · ${fmt(p.value)}`}>
                  <Box position="absolute" left="8%" right="8%" bg={color} borderRadius={pos ? "0.35rem 0.35rem 0 0" : "0 0 0.35rem 0.35rem"} style={{ top: `${top}%`, height: `${Math.max(height, 0.4)}%` }} />
                  {p.logo && (
                    <Image
                      src={p.logo}
                      alt=""
                      position="absolute"
                      left="50%"
                      w="78%"
                      maxW="2.4rem"
                      objectFit="contain"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
                      style={
                        pos
                          ? { bottom: `calc(${100 - top}% + 0.35rem)`, transform: "translateX(-50%)" }
                          : { top: `calc(${top + height}% + 0.35rem)`, transform: "translateX(-50%)" }
                      }
                    />
                  )}
                </Box>
              );
            })}
          </Flex>
        </Box>
        <Flex gap="0.35rem" mt={2}>
          {points.map((p) => (
            <Box key={p.id} flex={1} minW={0} textAlign="center">
              <Text fontSize="11px" fontWeight="900" color="white" textTransform="uppercase" lineClamp={1}>{p.short}</Text>
              <Text fontSize="10px" fontWeight="800" color="whiteAlpha.600" fontVariantNumeric="tabular-nums" lineClamp={1}>{fmt(p.value)}</Text>
            </Box>
          ))}
        </Flex>
      </Box>
    </Flex>
  );
};

export default TeamBarChart;
