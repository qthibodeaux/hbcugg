import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export const HomeStateMapSvg = ({ home, school, anchor, isTwoState, center, mapScale, primary, secondary }) => {
  return (
    <ComposableMap
      width={400}
      height={260}
      projection="geoMercator"
      projectionConfig={{ center, scale: mapScale }}
      style={{ width: "100%", height: "100%" }}
      role="img"
      aria-label={isTwoState ? `${home.name} to ${school.name} map` : `${anchor.name} map`}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies
            .filter((geo) => {
              const id = String(geo.id).padStart(2, "0");
              return isTwoState ? id === home.fips || id === school.fips : id === anchor.fips;
            })
            .map((geo) => {
              const id = String(geo.id).padStart(2, "0");
              const isSchoolState = isTwoState && id === school.fips;
              // Outline is always the opposite of the fill — school
              // state fills primary/outlines secondary and vice versa;
              // single-state view fills primary/outlines secondary too.
              const fillColor = isTwoState ? (isSchoolState ? primary : secondary) : primary;
              const strokeColor = isTwoState ? (isSchoolState ? secondary : primary) : secondary;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={`${fillColor}8f`}
                  stroke={strokeColor}
                  strokeWidth={1.6}
                  style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                />
              );
            })
        }
      </Geographies>
    </ComposableMap>
  );
};
