import { createLazyRoute } from "@/router/lazyRoute";
import { wrapWithMuiXDateProvider } from "@/router/wrapWithMuiXDateProvider";

import type { ExtensionManifest } from "../_types";

const DailyReportRoute = createLazyRoute(() => import("./pages/DailyReport"), {
  wrap: wrapWithMuiXDateProvider,
});

const AdminDailyReportRoute = createLazyRoute(
  () => import("./admin/AdminDailyReport"),
);

const AdminDailyReportDetailRoute = createLazyRoute(
  () => import("./admin/AdminDailyReportDetail"),
);

const NotFoundRoute = createLazyRoute(() => import("@/pages/NotFound"));

export const dailyReportManifest: ExtensionManifest = {
  name: "daily-report",
  routes: [
    {
      path: "attendance/report",
      lazy: DailyReportRoute,
    },
  ],
  adminRoutes: [
    {
      path: "daily-report",
      children: [
        {
          index: true,
          lazy: AdminDailyReportRoute,
        },
        {
          path: ":id",
          lazy: AdminDailyReportDetailRoute,
        },
        {
          path: "*",
          lazy: NotFoundRoute,
        },
      ],
    },
  ],
};
