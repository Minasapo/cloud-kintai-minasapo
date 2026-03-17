const preloaded = new Set<string>();
const preloadedData = new Set<string>();
let idlePreloadScheduled = false;

type IdleRoutePreloadOptions = {
  currentPathname: string;
  isAdminUser: boolean;
  isOperatorUser?: boolean;
};

type NavigatorConnection = {
  saveData?: boolean;
  effectiveType?: string;
};

const canUseAggressivePreload = () => {
  if (typeof navigator === "undefined") return true;

  const connection = (navigator as { connection?: NavigatorConnection })
    .connection;
  if (connection?.saveData) return false;
  if (
    connection?.effectiveType === "2g" ||
    connection?.effectiveType === "slow-2g"
  ) {
    return false;
  }

  const deviceMemory = (navigator as { deviceMemory?: number }).deviceMemory;
  if (typeof deviceMemory === "number" && deviceMemory <= 1) {
    return false;
  }

  return true;
};

const scheduleOnIdle = (task: () => void) => {
  const fallback = () => {
    window.setTimeout(task, 600);
  };

  type WindowWithIdle = Window & {
    requestIdleCallback?: (
      callback: (deadline: {
        didTimeout: boolean;
        timeRemaining: () => number;
      }) => void,
      options?: { timeout: number },
    ) => number;
  };

  const idleWindow = window as WindowWithIdle;
  if (typeof idleWindow.requestIdleCallback === "function") {
    idleWindow.requestIdleCallback(() => task(), { timeout: 1200 });
    return;
  }

  fallback();
};

const dataLoaders: Partial<Record<string, () => Promise<unknown>>> = {
  "/attendance/list": () =>
    import("./loaders/attendanceListLoader").then((module) =>
      module.attendanceListLoader(),
    ),
  "/workflow": () =>
    import("./loaders/workflowListLoader").then((module) =>
      module.workflowListLoader(),
    ),
  "/admin": () =>
    import("./loaders/adminDashboardLoader").then((module) =>
      module.adminDashboardLoader(),
    ),
};

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

  if (preloadedData.has(href)) return;
  preloadedData.add(href);
  dataLoaders[href]?.().catch(() => {
    preloadedData.delete(href);
  });
}

export function scheduleIdleRoutePreload({
  currentPathname,
  isAdminUser,
  isOperatorUser = false,
}: IdleRoutePreloadOptions): void {
  if (typeof window === "undefined") return;
  if (idlePreloadScheduled) return;

  idlePreloadScheduled = true;
  scheduleOnIdle(() => {
    const preloadTargets = new Set<string>();
    const canUseSupplementalPreload = canUseAggressivePreload();

    switch (currentPathname) {
      case "/":
      case "/register":
        if (isOperatorUser) {
          preloadTargets.add("/office/qr");
        } else {
          preloadTargets.add("/attendance/list");
        }
        break;
      case "/attendance/list":
        preloadTargets.add("/workflow");
        if (canUseSupplementalPreload) {
          preloadTargets.add("/attendance/report");
        }
        break;
      case "/workflow":
        preloadTargets.add("/attendance/list");
        break;
      case "/profile":
        preloadTargets.add("/attendance/list");
        break;
      default:
        preloadTargets.add("/attendance/list");
        break;
    }

    if (isAdminUser && canUseSupplementalPreload) {
      preloadTargets.add("/admin");
    }

    preloadTargets.forEach((href) => {
      preloadRoute(href);
    });
  });
}
