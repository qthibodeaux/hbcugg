import { render, screen } from "@testing-library/react";
import PlayerDetailPage from "./PlayerDetailPage";

let mockSeason = 2025;
let mockRows = [];
let mockProfileDoc = null;
let mockProfileLoading = false;
let mockMobile = false;
const mockRow = (name) => ({ person_id: "PERS_1", full_name: name, team_id: "swacjsu", position_group: "QB", position_abbr: "QB", class_year: 1, height: 72, weight: 200 });

jest.mock("react-router-dom", () => ({
  Link: "a", useParams: () => ({ playerKey: "PERS_1" }),
  useLocation: () => ({ state: null }), useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}), { virtual: true });
jest.mock("@chakra-ui/react", () => ({
  Box: ({ children }) => children,
  Flex: ({ children }) => children,
  Grid: ({ children }) => children,
  Text: ({ children }) => <span>{children}</span>,
  Spinner: () => null,
}));
jest.mock("lucide-react", () => ({ Activity: () => null, ArrowLeft: () => null, BarChart3: () => null, User: () => null }));
jest.mock("../../components/layouts/PageShell", () => {
  const Shell = ({ children }) => children;
  Shell.Slot = ({ children }) => children;
  return { __esModule: true, default: Shell };
});
jest.mock("../../hooks/useLayoutDensity", () => ({ useLayoutDensity: () => ({ isMobile: mockMobile }) }));
jest.mock("../../hooks/useSWACData", () => ({
  useAllPlayersByYear: () => ({ players: mockRows, isLoading: false }),
  usePlayerProfileDoc: () => ({ doc: mockProfileDoc, isLoading: mockProfileLoading }),
}));
jest.mock("../../hooks/useFootballCurrentContext", () => ({ useFootballCurrentContext: () => ({ currentSeason: mockSeason }) }));
jest.mock("../../components/organisms/player/PlayerProfileBanner", () => ({ __esModule: true, default: ({ player }) => <div data-testid="profile-name">{player.name_display}</div> }));
jest.mock("../../components/organisms/test/GameSpotlightColumn", () => ({
  MOCK_SEASON_GAMES: [{ week: "Lab fixture" }],
  useGameSpotlight: () => ({ index: 0, visible: true }),
  GameReadout: ({ game }) => (
    <div>
      <span>{game.week}</span>
      {game.statFields?.map(({ label, value }) => <span key={label}>{label}: {value}</span>)}
    </div>
  ),
  SeasonBarChart: () => <div>PAR by Game</div>,
}));
jest.mock("../../components/molecules/player/productionMaps/PlayerProductionMap", () => ({
  PlayerProductionMap: () => <div>Production Field Map</div>,
}));
jest.mock("../../components/organisms/player/PlayerStatsTab", () => () => null);
jest.mock("../../components/organisms/player/PlayerAdvancedTab", () => () => null);
jest.mock("../../components/organisms/player/PlayerBioBackgroundPanel", () => () => null);

beforeEach(() => {
  mockMobile = false;
  mockProfileDoc = null;
  mockProfileLoading = false;
});

test("profile refreshes for a new season and data update with unchanged roster size", () => {
  mockSeason = 2025;
  mockRows = [mockRow("Original Player")];
  const { rerender } = render(<PlayerDetailPage />);
  expect(screen.getByTestId("profile-name")).toHaveTextContent("Original Player");

  mockSeason = 2026;
  mockRows = [mockRow("Updated Player")];
  rerender(<PlayerDetailPage />);
  expect(screen.getByTestId("profile-name")).toHaveTextContent("Updated Player");

  mockRows = [mockRow("Revised Player")];
  rerender(<PlayerDetailPage />);
  expect(screen.getByTestId("profile-name")).toHaveTextContent("Revised Player");
});

test.each([false, true])("profile handles unavailable and late game data (mobile: %s)", (isMobile) => {
  mockMobile = isMobile;
  mockSeason = 2026;
  mockRows = [mockRow("Roster Player")];
  mockProfileLoading = true;
  const { rerender } = render(<PlayerDetailPage />);
  expect(screen.getByText("Loading game data…")).toBeInTheDocument();

  mockProfileLoading = false;
  for (const doc of [
    null,
    {},
    { games: {} },
    { games: [] },
    { games: [null, { data_state: "no_appearance" }, { data_state: "no_play_by_play" }, { data_state: "not_yet_played" }] },
  ]) {
    mockProfileDoc = doc;
    rerender(<PlayerDetailPage />);
    expect(screen.getByTestId("profile-name")).toHaveTextContent("Roster Player");
    expect(screen.getByText("No charted games available.")).toBeInTheDocument();
    expect(screen.queryByText("PAR by Game")).not.toBeInTheDocument();
    expect(screen.queryByText("Lab fixture")).not.toBeInTheDocument();
  }

  mockProfileDoc = { games: [
    { data_state: "no_appearance", week: 8 },
    { data_state: "played", week: 9, par: 7, opponent_name: "Alcorn", stat_line: [null, { label: "TD", value: 0 }] },
  ] };
  rerender(<PlayerDetailPage />);
  expect(screen.getByText("Week 9")).toBeInTheDocument();
  expect(screen.getByText("TD: 0")).toBeInTheDocument();
  expect(screen.getByText("PAR by Game")).toBeInTheDocument();
  expect(screen.getByText("Production Field Map")).toBeInTheDocument();
});
