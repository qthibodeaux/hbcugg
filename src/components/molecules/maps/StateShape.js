import { ComposableMap, Geographies } from "react-simple-maps";
import { geoAlbersUsa, geoPath } from "d3-geo";

export const US_STATES_GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export const STATE_FIPS = {
  AL: "01",
  AK: "02",
  AZ: "04",
  AR: "05",
  CA: "06",
  CO: "08",
  CT: "09",
  DE: "10",
  DC: "11",
  FL: "12",
  GA: "13",
  HI: "15",
  IA: "19",
  ID: "16",
  IL: "17",
  IN: "18",
  KS: "20",
  KY: "21",
  LA: "22",
  MA: "25",
  ME: "23",
  MD: "24",
  MI: "26",
  MN: "27",
  MO: "29",
  MS: "28",
  MT: "30",
  NC: "37",
  ND: "38",
  NE: "31",
  NH: "33",
  NJ: "34",
  NM: "35",
  NV: "32",
  NY: "36",
  OH: "39",
  OK: "40",
  OR: "41",
  PA: "42",
  RI: "44",
  SC: "45",
  SD: "46",
  TN: "47",
  TX: "48",
  UT: "49",
  VA: "51",
  VT: "50",
  WA: "53",
  WI: "55",
  WV: "54",
  WY: "56",
};

const VIEWBOX_WIDTH = 120;
const VIEWBOX_HEIGHT = 84;

const getFittedStatePath = (geo, padding) => {
  const projection = geoAlbersUsa().fitExtent(
    [
      [padding, padding],
      [VIEWBOX_WIDTH - padding, VIEWBOX_HEIGHT - padding],
    ],
    geo
  );

  return geoPath(projection)(geo);
};

export const StateShape = ({
  state,
  fill = "#FFFFFF",
  stroke = "rgba(255,255,255,0.7)",
  strokeWidth = 1,
  padding = 7,
}) => {
  const fips = STATE_FIPS[state];

  if (!fips) return null;

  return (
    <ComposableMap
      projection="geoAlbersUsa"
      width={VIEWBOX_WIDTH}
      height={VIEWBOX_HEIGHT}
      style={{ width: "100%", height: "100%" }}
    >
      <Geographies geography={US_STATES_GEO_URL}>
        {({ geographies }) => {
          const geo = geographies.find((item) => String(item.id).padStart(2, "0") === fips);
          const path = geo ? getFittedStatePath(geo, padding) : null;

          if (!path) return null;

          return (
            <path
              d={path}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              vectorEffect="non-scaling-stroke"
            />
          );
        }}
      </Geographies>
    </ComposableMap>
  );
};
