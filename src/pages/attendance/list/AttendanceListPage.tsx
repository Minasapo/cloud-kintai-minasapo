import AttendanceList from "@features/attendance/list/ui/AttendanceList";
import Page from "@shared/ui/page/Page";
import type { CSSProperties } from "react";

import { PANEL_HEIGHTS } from "@/shared/config/uiDimensions";
import { DashboardInnerSurface, PageSection } from "@/shared/ui/layout";

export default function AttendanceListPage() {
  return (
    <Page title="勤怠一覧" maxWidth="xl" showDefaultHeader={false}>
      <PageSection layoutVariant="dashboard">
        <DashboardInnerSurface
          className="h-full md:min-h-[var(--dashboard-min-height)]"
          style={
            {
              "--dashboard-min-height": `${PANEL_HEIGHTS.DASHBOARD_MIN}px`,
            } as CSSProperties & Record<`--${string}`, string>
          }
        >
          <AttendanceList />
        </DashboardInnerSurface>
      </PageSection>
    </Page>
  );
}
