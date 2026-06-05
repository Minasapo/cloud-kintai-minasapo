import { createLazyRoute } from "@/router/lazyRoute";

import type { ExtensionManifest } from "../_types";

const AttendanceStatisticsRoute = createLazyRoute(
  () => import("./pages/AttendanceStatisticsPage"),
);

export const attendanceStatisticsManifest: ExtensionManifest = {
  name: "attendance-statistics",
  isEnabled: (derived) => !!derived?.attendanceStatisticsEnabled,
  routes: [
    {
      path: "attendance/stats",
      lazy: AttendanceStatisticsRoute,
    },
  ],
  menuItems: [
    {
      label: "稼働統計",
      href: "/attendance/stats",
      roles: ["STAFF", "STAFF_ADMIN", "ADMIN"],
    },
  ],
};
