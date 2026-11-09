import { useState } from "react";
import PageShell from "../../components/layouts/PageShell";
import CountingStatsBanner from "../../components/organisms/stats/CountingStatsBanner";
import { ReceiverDeepDive } from "../../components/organisms/deepDive/receivers/ReceiverDeepDive";

// ─────────────────────────────────────────────────────────────────────────────
// DEEP DIVE — /stats/deep-dive
//
// One subject at a time, told through posters for export: charts, infographics,
// tables and team grids. The banner picks the subject; receivers is the first.
// ─────────────────────────────────────────────────────────────────────────────

const SUBJECTS = [{ value: "receivers", label: "Receivers" }];

const DeepDiveStatsPage = () => {
  const [subject, setSubject] = useState(SUBJECTS[0].value);
  return (
    <PageShell listContent={<ReceiverDeepDive />}>
      <PageShell.Slot cols={4}>
        <CountingStatsBanner title="Deep Dive" ghost="RECEIVERS" views={{ options: SUBJECTS, value: subject, onChange: setSubject }} />
      </PageShell.Slot>
    </PageShell>
  );
};

export default DeepDiveStatsPage;
