/**
 * RadarChart - SVG-based radar chart for player efficiency profile
 * @param {Object} props
 * @param {number[]} props.scores - Array of scores (0-100)
 * @param {string[]} props.labels - Array of labels for each point
 */
const RadarChart = ({ scores, labels }) => {
  const cx = 100;
  const cy = 100;
  const r = 72;
  const n = scores.length;

  const getPoint = (i, radius) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const dataPoints = scores.map((s, i) =>
    getPoint(i, r * Math.min(1, s / 100)),
  );
  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    " Z";

  return (
    <svg viewBox="0 0 200 200" width="100%" style={{ maxWidth: "220px" }}>
      {/* Grid rings */}
      {gridLevels.map((lvl) => {
        const pts = Array.from({ length: n }, (_, i) => getPoint(i, r * lvl));
        const path =
          pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
          " Z";
        return (
          <path
            key={lvl}
            d={path}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        );
      })}

      {/* Spokes */}
      {Array.from({ length: n }, (_, i) => {
        const outer = getPoint(i, r);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        );
      })}

      {/* Data fill */}
      <path
        d={dataPath}
        fill="rgba(229,62,62,0.25)"
        stroke="#E53E3E"
        strokeWidth="1.5"
      />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#E53E3E" />
      ))}

      {/* Labels */}
      {labels.map((label, i) => {
        const pt = getPoint(i, r + 16);
        return (
          <text
            key={i}
            x={pt.x}
            y={pt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fill="rgba(255,255,255,0.5)"
            fontFamily="Inter, sans-serif"
            textTransform="uppercase"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
};

export default RadarChart;
