import { WeekCentralProvider } from "../../components/organisms/game-center/week/WeekCentralProvider";
import { WeekCentralShell } from "../../components/organisms/game-center/week/WeekCentralShell";

const WeekCentralPage = () => (
  <WeekCentralProvider>
    <WeekCentralShell />
  </WeekCentralProvider>
);

export default WeekCentralPage;
