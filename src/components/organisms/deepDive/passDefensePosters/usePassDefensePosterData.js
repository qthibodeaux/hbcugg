import { usePassDefenseData } from "../../../../hooks/usePassDefenseData";
import { INITIAL_PASS_DEFENSE_SELECTION } from "../../../../utils/passDefenseConfig";
import { SCOPE } from "./posterModel";

// Existing pass-defense hook adapter at competitive scope; queries and extra-source selection are unchanged.

export const usePD = (visual = "PD02") => {
  const { data, isLoading, error } = usePassDefenseData({ ...INITIAL_PASS_DEFENSE_SELECTION, visual, scope: SCOPE });
  return { docs: data?.documents ?? [], index: data?.index, receiving: data?.receiving, ready: !isLoading && !error && (data?.documents ?? []).length > 0, error };
};
