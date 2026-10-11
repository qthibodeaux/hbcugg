import HorizontalSparkBarChart from "./HorizontalSparkBarChart";

/**
 * SeasonVelocity - Season performance progression bar chart
 * @param {Object} props
 * @param {number} props.par - Player PAR score
 * @param {number} props.games - Number of games played
 */
const SeasonVelocity = ({ par, games }) => {
  const gamesCount = games ?? 10;
  const bars = Array.from({ length: gamesCount }, (_, i) => {
    const progress = i / (gamesCount - 1);
    const noise = (Math.sin(i * 2.7 + 1.3) * 0.3 + Math.cos(i * 1.5) * 0.2);
    const height = Math.max(15, Math.min(95, 30 + progress * 55 + noise * 25));
    return Math.round(height);
  });

  return (
    <HorizontalSparkBarChart
      values={bars}
      height="60px"
      gap="3px"
      baseColor="whiteAlpha.200"
      highlightColor="brand.500"
      highlightIndex={bars.length - 1}
      minBarPercent={15}
    />
  );
};

export default SeasonVelocity;
