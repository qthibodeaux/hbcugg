import { useState } from "react";
import { usePassDefenseData } from "../../../hooks/usePassDefenseData";
import { INITIAL_PASS_DEFENSE_SELECTION } from "../../../utils/passDefenseConfig";
import { PassDefenseSeries } from "../../molecules/stats/passDefense/PassDefenseSeries";

export const PassDefenseSection = ({ pal, scheme }) => {
  const [selection, setSelection] = useState(INITIAL_PASS_DEFENSE_SELECTION);
  const { data, isLoading, error, retry } = usePassDefenseData(selection);
  return <PassDefenseSeries data={data} selection={selection} onChange={setSelection} pal={pal} scheme={scheme} isLoading={isLoading} error={error} onRetry={retry} />;
};
