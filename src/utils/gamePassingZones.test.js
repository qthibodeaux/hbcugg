import { buildGamePassingZones } from "./gamePassingZones";

// Contract fixtures, not display/mock statistics.
const player = { key: "qb", name: "Quarterback", _type: "passer" };
const gameWith = (row, spotting) => ({
  metadata: { pass_spotting: { incompletion_depth: spotting } },
  individual_stats: { team: { passing: [{ player_key: "qb", name: "Quarterback", ...row }] } },
});

test("keeps measured zones in depth/lane order and retains negative yards", () => {
  const zones = buildGamePassingZones(gameWith({
    adot: 7.5,
    direction_breakdown: {
      deep: { right: { attempts: 2, completions: 1, yards: 19 } },
      short: { left: { attempts: 1, completions: 1, yards: -2 } },
      uncharted: { attempts: 1, no_direction: 1 },
    },
  }), "team", player);
  expect(zones.depths.map((d) => d.key)).toEqual(["deep", "medium", "short"]);
  expect(zones.cells).toHaveLength(9);
  expect(zones.cells[2]).toEqual({ att: 2, comp: 1, yards: 19 });
  expect(zones.cells[6]).toEqual({ att: 1, comp: 1, yards: -2 });
  expect(zones).toMatchObject({ total: 4, uncharted: 1, noLane: 1, noDepth: 0, adot: 7.5, hidden: true });
});

test("called zones have two rows with no numeric air-yard labels", () => {
  const zones = buildGamePassingZones(gameWith({
    direction_breakdown: { deep: { left: { attempts: 99 } } },
    call_breakdown: { short: { middle: { attempts: 2, completions: 1, yards: 8 } } },
  }, "unspotted"), "team", player);
  expect(zones.depths).toEqual([
    { key: "deep", label: "Deep", range: null },
    { key: "short", label: "Short", range: null },
  ]);
  expect(zones.cells).toHaveLength(6);
  expect(zones.cells[4]).toEqual({ att: 2, comp: 1, yards: 8 });
  expect(zones.total).toBe(2);
});

test("keeps measured fallback when call breakdown is absent", () => {
  const zones = buildGamePassingZones(gameWith({ direction_breakdown: {} }, "unspotted"), "team", player);
  expect(zones.cells).toHaveLength(9);
  expect(zones).toMatchObject({ total: 0, hidden: false, adot: null });
});

test("missing breakdown stays unavailable rather than becoming an empty grid", () => {
  expect(buildGamePassingZones(gameWith({}), "team", player)).toBeNull();
  expect(buildGamePassingZones({}, "team", player)).toBeNull();
});

test("receiver maps use targets/receptions and preserve name fallback", () => {
  const game = { individual_stats: { team: { receiving: [{
    player_key: "old-key", name: "Receiver",
    direction_breakdown: { medium: { middle: { targets: 3, receptions: 2, yards: 17 } }, uncharted: { targets: 1, no_depth: 1 } },
  }] } } };
  const zones = buildGamePassingZones(game, "team", { key: "new-key", name: "Receiver", _type: "receiver" });
  expect(zones.cells[4]).toEqual({ att: 3, comp: 2, yards: 17 });
  expect(zones).toMatchObject({ total: 4, uncharted: 1, noDepth: 1 });
});

test("hiding remains strictly above twenty percent uncharted", () => {
  const zonesFor = (attempts) => buildGamePassingZones(gameWith({
    direction_breakdown: { short: { middle: { attempts } }, uncharted: { attempts: 1 } },
  }), "team", player);
  expect(zonesFor(4).hidden).toBe(false);
  expect(zonesFor(3).hidden).toBe(true);
});
