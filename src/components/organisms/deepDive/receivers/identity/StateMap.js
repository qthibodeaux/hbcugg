import { fgOf, DATA, RPoster, int, caps, Logo, lastName } from "../kit";
import { Grid, Box, Text, Flex } from "@chakra-ui/react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { GEO_URL } from "../../../../molecules/wiki/footprint/footprintModel";

// Receiver home-state map geometry and published marker values.

const STATE_SPOTS = {
  FL: ["12", [-81.7, 28.3]], TX: ["48", [-99.3, 31.4]], LA: ["22", [-92.5, 31.0]], GA: ["13", [-83.4, 32.7]], NC: ["37", [-79.2, 35.5]],
  AL: ["01", [-86.8, 32.8]], IL: ["17", [-89.2, 40.0]], MS: ["28", [-89.7, 32.7]], SC: ["45", [-80.9, 33.9]], VA: ["51", [-78.7, 37.5]],
};

const MAP_W = 854;

const MAP_H = 640;

export const StateMap = (props) => {
  const { pal } = props;
  const fg = fgOf(pal);
  const rgb = String(pal.brand).replace("#", "").match(/../g).map((h) => parseInt(h, 16)).join(",");
  const byId = Object.fromEntries(DATA.states.map((s) => [STATE_SPOTS[s.home_state]?.[0], s]));
  const best = Object.fromEntries(DATA.state_best.map((s) => [s.state, s]));
  const max = Math.max(...DATA.states.map((s) => s.yards));
  const strong = (s) => s.yards / max > 0.45;
  return (
    <RPoster {...props} title="Where the receiving yards are from">
      <Grid templateColumns={`${MAP_W}px minmax(0,1fr)`} columnGap="24px">
        <Box w={`${MAP_W}px`} h={`${MAP_H}px`} overflow="hidden">
          <ComposableMap width={MAP_W} height={MAP_H} projection="geoMercator" projectionConfig={{ center: [-90.9, 34], scale: 1450 }} style={{ width: "100%", height: "100%" }}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) => geographies.map((geo) => {
                const s = byId[String(geo.id).padStart(2, "0")];
                const fill = s ? `rgba(${rgb}, ${0.2 + (s.yards / max) * 0.8})` : `rgba(${pal.fg}, 0.05)`;
                return (
                  <Geography key={geo.rsmKey} geography={geo} fill={fill} stroke={s ? pal.brand : `rgba(${pal.fg}, 0.18)`} strokeWidth={s ? 1.4 : 0.7}
                    style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }} />
                );
              })}
            </Geographies>
            {DATA.states.map((s) => (
              <Marker key={s.home_state} coordinates={STATE_SPOTS[s.home_state][1]}>
                <text textAnchor="middle" y="-3" fontSize="20" fontWeight="950" fill={strong(s) ? "#FFFFFF" : pal.ink}>{s.home_state}</text>
                <text textAnchor="middle" y="15" fontSize="16" fontWeight="900" fill={strong(s) ? "#FFFFFF" : pal.ink}>{int(s.yards)}</text>
              </Marker>
            ))}
          </ComposableMap>
        </Box>
        <Box>
          <Text fontSize="17px" color={pal.orange} mb="4px" {...caps}>Best from each</Text>
          {DATA.states.slice(0, 8).map((s) => (
            <Flex key={s.home_state} align="center" gap="8px" h="56px" borderBottom={`1px solid ${fg(0.06)}`} minW={0}>
              <Text fontSize="20px" fontWeight="950" w="34px" color={pal.brand}>{s.home_state}</Text>
              {best[s.home_state] && <Logo id={best[s.home_state].id} size={26} />}
              <Text fontSize="15px" fontWeight="900" lineHeight={1.05} textTransform="uppercase">{best[s.home_state] ? lastName(best[s.home_state].name) : "—"}</Text>
            </Flex>
          ))}
        </Box>
      </Grid>
    </RPoster>
  );
};
