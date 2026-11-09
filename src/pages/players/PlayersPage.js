import { PlayerDatabase } from "../../components/organisms/playersHub/PlayerDatabase";
import { filterPlayersHub } from "../../utils/playersHubFilterModel";
import { useNavigate } from "react-router-dom";
import { usePlayerStatsEnriched, useAllPlayers, usePlayerAnalytics, usePlayersHub, useAllPlayersByYear } from "../../hooks/useSWACData";
import { useState, useMemo } from "react";
import { PAGE_SIZE } from "../../utils/playersHubPresentation";







import { SpotlightHeroCard, BreakoutCard, TransferImpactCard, GloryLeadersCard, HiddenGemsCard, PhysicalOutliersCard, PositionBoardsCard, ConferenceMapCard, ArchetypeCard } from "../../components/organisms/player/PlayersHubCards";
import PageShell from "../../components/layouts/PageShell";
import PlayersBanner from "../../components/organisms/PlayersBanner";
import { LabSection } from "../../components/organisms/playersHub/PlayersLabLinks";

// ─── Page ─────────────────────────────────────────────────────────────────────

const PlayersPage = () => {
  const navigate = useNavigate();

  const { players: statPlayers, isLoading: statsLoading } =
    usePlayerStatsEnriched();
  const { players: rosterPlayers, isLoading: rosterLoading } = useAllPlayers();
  const {
    leaderboards,
    transferAnalytics,
    isLoading: analyticsLoading,
  } = usePlayerAnalytics();
  const { hub: playersHub, isLoading: playersHubLoading } = usePlayersHub(2025);

  const [view, setView] = useState("stats");
  const [year, setYear] = useState("2025");
  const [conf, setConf] = useState("all");
  const [pos, setPos] = useState("all");
  const [cls, setCls] = useState("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { players: histPlayers, isLoading: histLoading } =
    useAllPlayersByYear(year);

  const isLoading =
    statsLoading ||
    rosterLoading ||
    (view === "history" && histLoading) ||
    ((view === "leaderboards" || view === "transfers") && analyticsLoading);

  const setFilter = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  const filtered = useMemo(() => filterPlayersHub({ view, statPlayers, rosterPlayers, histPlayers, conf, pos, cls, search }), [view, statPlayers, rosterPlayers, histPlayers, conf, pos, cls, search]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  const listContent = <PlayerDatabase search={search} setSearch={setSearch} setPage={setPage} setView={setView} view={view} setYear={setYear} year={year} conf={conf} setFilter={setFilter} setConf={setConf} pos={pos} setPos={setPos} cls={cls} setCls={setCls} isLoading={isLoading} filtered={filtered} leaderboards={leaderboards} analyticsLoading={analyticsLoading} navigate={navigate} transferAnalytics={transferAnalytics} paginated={paginated} hasMore={hasMore} />;

  // ── Discovery boards, as real grid slots ──────────────────────────────────
  // Sizes are assigned per board rather than uniformly: the spotlight leads at
  // 2x2, the two vertical rank boards take 1x2, the position wall needs 2x2 to
  // fit eight rooms, and the single-subject cards sit at 1x1. Each is gated on
  // its own data so a board never claims a slot it can't fill.
  const hub = playersHubLoading ? null : playersHub;
  const boardSlots = hub
    ? [
        hub.spotlight?.primary && {
          key: "spotlight",
          cols: 2,
          rows: 2,
          node: <SpotlightHeroCard spotlight={hub.spotlight} />,
        },
        hub.breakout_radar?.length && {
          key: "breakout",
          cols: 1,
          rows: 2,
          node: <BreakoutCard entries={hub.breakout_radar} />,
        },
        hub.transfer_impact?.length && {
          key: "transfer",
          cols: 1,
          rows: 2,
          node: (
            <TransferImpactCard
              entries={hub.transfer_impact}
              transfersCount={hub.summary?.transfers_count}
            />
          ),
        },
        hub.glory_leaders?.overall?.length && {
          key: "glory",
          cols: 2,
          rows: 1,
          node: <GloryLeadersCard entries={hub.glory_leaders.overall} />,
        },
        hub.hidden_gems?.length && {
          key: "gems",
          cols: 1,
          rows: 1,
          node: <HiddenGemsCard entries={hub.hidden_gems} />,
        },
        hub.physical_outliers?.length && {
          key: "outliers",
          cols: 1,
          rows: 1,
          node: <PhysicalOutliersCard entries={hub.physical_outliers} />,
        },
        hub.position_boards?.length && {
          key: "positions",
          cols: 2,
          rows: 2,
          node: <PositionBoardsCard boards={hub.position_boards} />,
        },
        hub.conference_talent_map?.length && {
          key: "conference",
          cols: 1,
          rows: 2,
          node: <ConferenceMapCard groups={hub.conference_talent_map} />,
        },
        hub.archetypes?.length && {
          key: "archetypes",
          cols: 1,
          rows: 2,
          node: <ArchetypeCard archetypes={hub.archetypes} />,
        },
      ].filter(Boolean)
    : [];

  return (
    <PageShell listContent={listContent}>
      <PageShell.Slot cols={4}>
        <PlayersBanner />
      </PageShell.Slot>

      {boardSlots.map(({ key, cols, rows, node }) => (
        <PageShell.Slot key={key} cols={cols} rows={rows}>
          {node}
        </PageShell.Slot>
      ))}

      <PageShell.Slot cols={4}>
        <LabSection />
      </PageShell.Slot>
    </PageShell>
  );
};

export default PlayersPage;
