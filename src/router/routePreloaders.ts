const preloaded = new Set<string>();

const moduleLoaders: Partial<Record<string, () => Promise<unknown>>> = {
  "/register": () => import("../pages/Register"),
  "/attendance/list": () =>
    import("../pages/attendance/list/AttendanceListPage"),
  "/attendance/stats": () =>
    import("../pages/attendance/statistics/AttendanceStatisticsPage"),
  "/attendance/report": () =>
    import("../pages/attendance/daily-report/DailyReport"),
  "/shift": () => import("../pages/shift/request"),
  "/workflow": () => import("../pages/workflow/list/WorkflowListPage"),
  "/admin": () => import("../pages/admin/AdminLayout"),
  "/profile": () => import("../pages/Profile"),
  "/office/qr": () => import("../pages/office/qr/OfficeQrPage"),
};

export function preloadRoute(href: string): void {
  if (preloaded.has(href)) return;
  preloaded.add(href);
  moduleLoaders[href]?.().catch(() => {
    preloaded.delete(href);
  });
}
