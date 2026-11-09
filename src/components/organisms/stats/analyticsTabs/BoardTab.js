import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { useState, useMemo } from "react";
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { Kicker, SectionFlush, Section, PANEL_BG, fmt } from "./AnalyticsPrimitives";
import { Link } from "react-router-dom";

// Existing implementation extracted along responsibility boundaries.

const BOARD_SIDES = [
  { id: "o", label: "Offensive" },
  { id: "d", label: "Defensive" },
  { id: "net", label: "Net statistics" },
];

const BOARD_SCOPES = [
  { id: "all", label: "All 18" },
  { id: "MEAC", label: "MEAC", test: (t) => t.conference === "MEAC" },
  { id: "SWAC", label: "SWAC", test: (t) => t.conference === "SWAC" },
  { id: "East", label: "East division", test: (t) => t.division === "East" },
  { id: "West", label: "West division", test: (t) => t.division === "West" },
];

const boardNet = (row, base, offGood) => {
  const o = row?.metrics?.[`o_${base}`];
  const d = row?.metrics?.[`d_${base}`];
  if (!Number.isFinite(o) || !Number.isFinite(d)) return undefined;
  return offGood ? o - d : d - o;
};

const boardFill = (pct) => {
  if (!Number.isFinite(pct)) return "transparent";
  const strength = Math.min(1, Math.abs(pct - 50) / 50);
  const alpha = (0.08 + strength * 0.44).toFixed(2);
  return pct >= 50 ? `rgba(34,197,94,${alpha})` : `rgba(168,85,247,${alpha})`;
};

export const BoardTab = ({ hub, season }) => {
  const { isMobile: m } = useLayoutDensity();
  const [side, setSide] = useState("o");
  const [scope, setScope] = useState("all");
  const [sortField, setSortField] = useState("rating");
  const [desc, setDesc] = useState(true);

  const bases = useMemo(
    () => [...new Set((hub.units ?? []).filter((u) => u.available).flatMap((u) => u.metrics))],
    [hub.units],
  );

  // The columns are the same list read through whichever side is chosen.
  const columns = useMemo(() => {
    const cols = [{ key: "rating", label: "Team Rating", group: "Overall", unit: "num", signed: true }];
    bases.forEach((base) => {
      const def = hub.metrics?.[base] ?? {};
      cols.push({
        key: side === "net" ? `net_${base}` : `${side}_${base}`,
        base,
        label: def.short ?? base,
        full: def.label ?? base,
        group: (def.family ?? "other").replace(/^./, (c) => c.toUpperCase()),
        unit: def.unit ?? "num",
        offGood: def.offGood !== false,
        signed: side === "net",
      });
    });
    return cols;
  }, [bases, hub.metrics, side]);

  const scopeDef = BOARD_SCOPES.find((x) => x.id === scope) ?? BOARD_SCOPES[0];

  // Values first, then percentiles — in net mode the percentile has to be
  // earned by ranking the nets, since nothing on file carries them.
  const rows = useMemo(() => {
    const base = Object.values(hub.teams ?? {})
      .filter((t) => t.seasons?.[season])
      .filter((t) => !scopeDef.test || scopeDef.test(t.identity))
      .map((t) => {
        const row = t.seasons[season];
        const values = { rating: row.rating };
        const pcts = { rating: undefined };
        columns.slice(1).forEach((c) => {
          values[c.key] = side === "net" ? boardNet(row, c.base, c.offGood) : row.metrics?.[c.key];
          pcts[c.key] = side === "net" ? undefined : row.percentiles?.[c.key];
        });
        return { id: t.identity.id, identity: t.identity, record: row.record, values, pcts };
      });

    const n = base.length;
    const pctOf = (rank) => (n > 1 ? Math.round(((n - rank) / (n - 1)) * 100) : 50);
    // Rating always needs one; net columns need all of them.
    columns.forEach((c) => {
      if (side !== "net" && c.key !== "rating") return;
      const sorted = base
        .map((r) => ({ id: r.id, v: r.values[c.key] }))
        .filter((x) => Number.isFinite(x.v))
        .sort((a, b) => b.v - a.v);
      sorted.forEach((x, i) => {
        const hit = base.find((r) => r.id === x.id);
        if (hit) hit.pcts[c.key] = pctOf(i + 1);
      });
    });

    return base.sort((a, b) => {
      const av = a.values[sortField];
      const bv = b.values[sortField];
      if (!Number.isFinite(av)) return 1;
      if (!Number.isFinite(bv)) return -1;
      return desc ? bv - av : av - bv;
    });
  }, [hub.teams, season, columns, side, scopeDef, sortField, desc]);

  const sortBy = (key) => {
    if (key === sortField) setDesc((v) => !v);
    else { setSortField(key); setDesc(true); }
  };

  const groups = [...new Set(columns.map((c) => c.group))];
  const active = columns.find((c) => c.key === sortField) ?? columns[0];
  // Mobile: the sorted column sits right after the team, so the number the
  // board is ranked by is on screen without scrolling.
  const shown = m ? [active, ...columns.filter((c) => c.key !== active.key)] : columns;
  // Mobile column widths: rank and team pinned narrow, metric columns fixed.
  const RK_W = m ? "1.9rem" : "2.6rem";
  const TEAM_W = m ? "4.4rem" : "9rem";
  const COL_W = m ? "4.1rem" : undefined;

  const Picker = ({ label, value, onChange, children }) => (
    <Box flex="1" minW={m ? 0 : "9rem"}>
      <Kicker mb={1}>{label}</Kicker>
      <Box as="select" value={value} onChange={(e) => onChange(e.target.value)}
        bg="line" color="text.primary" fontSize={m ? "0.8rem" : "11px"} fontWeight="700" borderRadius={m ? 0 : "md"} px={2} py={m ? "0.5rem" : 1.5}
        border="1px solid" borderColor="line.strong" w="100%">
        {children}
      </Box>
    </Box>
  );

  return (
    <SectionFlush.Provider value={m}>
    <Flex direction="column" gap={m ? 0 : 4}>
      <Section title={m ? `${BOARD_SIDES.find((x) => x.id === side)?.label} rankings` : `${season} ${BOARD_SIDES.find((x) => x.id === side)?.label} team rankings`} right={m ? null : <Kicker color="text.muted">{rows.length} teams</Kicker>}>
        <Flex gap={m ? "0.4rem" : 3} wrap={m ? "nowrap" : "wrap"} align="flex-end">
          <Picker label="Unit" value={side} onChange={(v) => { setSide(v); setSortField("rating"); setDesc(true); }}>
            {BOARD_SIDES.map((x) => <option key={x.id} value={x.id} style={{ background: "var(--gg-bg-secondary)" }}>{x.label}</option>)}
          </Picker>
          <Picker label="Teams" value={scope} onChange={setScope}>
            {BOARD_SCOPES.map((x) => <option key={x.id} value={x.id} style={{ background: "var(--gg-bg-secondary)" }}>{x.label}</option>)}
          </Picker>
          <Picker label="Metric" value={sortField} onChange={(v) => { setSortField(v); setDesc(true); }}>
            {groups.map((g) => (
              <optgroup key={g} label={g} style={{ background: "var(--gg-bg-secondary)" }}>
                {columns.filter((c) => c.group === g).map((c) => (
                  <option key={c.key} value={c.key} style={{ background: "var(--gg-bg-secondary)" }}>{c.full ?? c.label}</option>
                ))}
              </optgroup>
            ))}
          </Picker>
        </Flex>
      </Section>

      <Section title={active.full ?? active.label}>
        <Box overflowX="auto">
          <Box as="table" minW={m ? undefined : "60rem"} w="100%" style={{ borderCollapse: "separate", borderSpacing: 0, tableLayout: m ? "fixed" : undefined }}>
            <Box as="thead">
              <Box as="tr">
                <Box as="th" position="sticky" left={0} zIndex={2} bg={PANEL_BG} textAlign="left" px={m ? "0.4rem" : 2} py={2} w={RK_W} minW={RK_W}>
                  <Kicker color="text.muted">Rk</Kicker>
                </Box>
                <Box as="th" position="sticky" left={RK_W} zIndex={2} bg={PANEL_BG} textAlign="left" px={m ? "0.3rem" : 2} py={2} w={m ? TEAM_W : undefined} minW={TEAM_W} borderRight={m ? "1px solid" : undefined} borderColor="line">
                  <Kicker color="text.muted">Team</Kicker>
                </Box>
                {shown.map((c) => (
                  <Box key={c.key} as="th" px={m ? "0.4rem" : 2} py={2} textAlign="right" whiteSpace="nowrap" w={COL_W} minW={COL_W} overflow="hidden" textOverflow="ellipsis"
                    cursor="pointer" onClick={() => sortBy(c.key)} title={c.full}>
                    <Kicker color={sortField === c.key ? "brand.400" : "text.muted"}>
                      {c.label}{sortField === c.key ? (desc ? " \u2193" : " \u2191") : ""}
                    </Kicker>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box as="tbody">
              {rows.map((r, i) => (
                <Box as="tr" key={r.id} _hover={{ "& td": { filter: "brightness(1.25)" } }}>
                  <Box as="td" position="sticky" left={0} zIndex={1} bg={PANEL_BG} px={m ? "0.4rem" : 2} py={m ? "0.55rem" : 1.5} w={RK_W} minW={RK_W} borderBottom="1px solid" borderColor="line.subtle">
                    <Text fontSize={m ? "0.75rem" : "10px"} fontWeight="900" color="text.muted" fontVariantNumeric="tabular-nums">{i + 1}</Text>
                  </Box>
                  <Box as="td" position="sticky" left={RK_W} zIndex={1} bg={PANEL_BG} px={m ? "0.3rem" : 2} py={m ? "0.55rem" : 1.5} w={m ? TEAM_W : undefined} minW={TEAM_W} borderBottom="1px solid" borderColor="line.subtle" borderRight={m ? "1px solid" : undefined} borderRightColor="line">
                    <Flex as={Link} to={`/teams/${r.id}`} align="center" gap={m ? "0.35rem" : 2} minW={0} color="text.primary">
                      {r.identity.logo && <Image src={r.identity.logo} alt="" w={m ? "1.1rem" : "16px"} h={m ? "1.1rem" : "16px"} objectFit="contain" flexShrink={0} />}
                      <Text fontSize={m ? "0.8rem" : "11px"} fontWeight="900" color="text.primary" lineClamp={1}>{r.identity.short}</Text>
                    </Flex>
                  </Box>
                  {shown.map((c) => {
                    const v = r.values[c.key];
                    const pct = r.pcts[c.key];
                    return (
                      <Box key={c.key} as="td" px={m ? "0.4rem" : 2} py={m ? "0.55rem" : 1.5} textAlign="right" bg={boardFill(pct)} w={COL_W}
                        borderBottom="1px solid" borderColor="line.subtle">
                        <Text fontSize={m ? (sortField === c.key ? "0.85rem" : "0.78rem") : "11px"} fontWeight={sortField === c.key ? "900" : "700"} color="text.primary" fontVariantNumeric="tabular-nums">
                          {c.signed && Number.isFinite(v) && v > 0 ? "+" : ""}{fmt(v, c.unit)}
                        </Text>
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Section>
    </Flex>
    </SectionFlush.Provider>
  );
};
