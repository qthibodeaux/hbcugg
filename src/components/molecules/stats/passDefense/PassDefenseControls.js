import { Box, Flex, Text } from "@chakra-ui/react";
import { CONTRIBUTOR_ROLES, effectivePassDefenseScope, fullOnlySelection, OVERVIEW_METRICS, PASS_DEFENSE_VISUALS, SITUATIONS, TRAJECTORY_METRICS } from "../../../../utils/passDefenseConfig";
import { passDefenseTeam } from "../../../../utils/passDefenseModel";

const Select = ({ label, value, options, onChange }) => (
  <Box as="label" minW="12rem" maxW="24rem" flex="1">
    <Text fontSize="10px" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em" mb={1} color="text.secondary">{label}</Text>
    <Box as="select" value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}
      w="full" px={3} py={2} fontSize="sm" bg="bg.secondary" color="text.primary" border="1px solid" borderColor="line.strong" borderRadius="md">
      {options.map((o) => <option key={o.id} value={o.id} disabled={o.disabled}>{o.label}</option>)}
    </Box>
  </Box>
);

export const PassDefenseControls = ({ selection, onChange, data }) => {
  const change = (key, value) => onChange({ ...selection, [key]: value });
  const scope = effectivePassDefenseScope(selection);
  const teams = (data.index?.teams ?? []).map((t) => ({ id: t.team_id, label: passDefenseTeam(t.team_id, data.metadata).name }));
  return (
    <Box data-export-skip="true">
      <Flex gap={2} wrap="wrap" mb={4}>
        {PASS_DEFENSE_VISUALS.map((view) => (
          <Box key={view.id} as="button" type="button" onClick={() => change("visual", view.id)} aria-pressed={selection.visual === view.id}
            px={3} py={2} borderRadius="md" border="1px solid" borderColor={selection.visual === view.id ? "brand.500" : "line.strong"}
            bg={selection.visual === view.id ? "brand.500" : "line"} color={selection.visual === view.id ? "white" : "text.primary"} textAlign="left">
            <Text fontSize="11px" fontWeight="900">{view.title}{view.blocked ? " · pending" : ""}</Text>
          </Box>
        ))}
      </Flex>
      <Flex gap={3} wrap="wrap" mb={4}>
        <Select label="Source scope" value={scope} options={[
          { id: "all", label: "Full game" },
          { id: "competitive", label: fullOnlySelection(selection) ? "Competitive — not published for this measure" : "Competitive", disabled: Boolean(fullOnlySelection(selection)) },
        ]} onChange={(value) => change("scope", value)} />
        {selection.visual === "PD01" && <Select label="Overview measure" value={selection.overview} options={OVERVIEW_METRICS} onChange={(v) => change("overview", v)} />}
        {selection.visual === "PD04" && <Select label="Red-zone measure" value="success" options={[{ id: "success", label: "Passing success allowed" }, { id: "td", label: "Passing TD rate — not published", disabled: true }]} onChange={() => {}} />}
        {selection.visual === "PD10" && <Select label="Situation" value={selection.situation} options={[
          ...SITUATIONS.map(([id, label]) => ({ id, label, disabled: !(data.documents ?? []).some((d) => d.subsets?.[scope]?.[id]?.metrics?.success_allowed) })),
          { id: "third_and_long", label: "Third-and-long — intersection not published", disabled: true },
        ]} onChange={(v) => change("situation", v)} />}
        {selection.visual === "PD11" && <Select label="Observed contribution" value={selection.role} options={CONTRIBUTOR_ROLES} onChange={(v) => change("role", v)} />}
        {["PD08", "PD13"].includes(selection.visual) && <Select label="Defense" value={selection.teamId} options={teams} onChange={(v) => change("teamId", v)} />}
        {selection.visual === "PD13" && <Select label="Game measure" value={selection.trajectory} options={TRAJECTORY_METRICS} onChange={(v) => change("trajectory", v)} />}
      </Flex>
    </Box>
  );
};
