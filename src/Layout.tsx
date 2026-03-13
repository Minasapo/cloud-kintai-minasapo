/**
 * @file Layout.tsx
 * @description アプリケーション全体のレイアウトを管理するコンポーネント。認証状態や各種設定・カレンダー情報の取得、コンテキストの提供を行う。
 */

import { useAuthenticator } from "@aws-amplify/ui-react";
import useAppConfig from "@entities/app-config/model/useAppConfig";
import useCloseDates from "@entities/attendance/model/useCloseDates";
import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Hub } from "aws-amplify/utils";
import dayjs from "dayjs";
import {
  ComponentProps,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { SplitViewProvider } from "@/features/splitView/context/SplitViewProvider";
import { scheduleIdleRoutePreload } from "@/router/routePreloaders";
import { createLogger } from "@/shared/lib/logger";
import { createAppTheme } from "@/shared/lib/theme";
import { AppShell } from "@/shared/ui/layout";
import SnackbarGroup from "@/widgets/feedback/snackbar/SnackbarGroup";
import Footer from "@/widgets/layout/footer/Footer";
import Header from "@/widgets/layout/header/Header";

import { AppConfigContext } from "./context/AppConfigContext";
import { AuthContext } from "./context/AuthContext";
import { ThemeContextProvider } from "./context/ThemeContext";
import useCognitoUser from "./hooks/useCognitoUser";
import { useDuplicateAttendanceWarning } from "./hooks/useDuplicateAttendanceWarning";
import { useLocalNotification } from "./hooks/useLocalNotification";
import { useWorkflowCommentNotification } from "./hooks/useWorkflowCommentNotification";
import { useWorkflowNotification } from "./hooks/useWorkflowNotification";

const logger = createLogger("Layout");

type MissingCloseDateAlertProps = {
  onConfirm: () => void;
};

function MissingCloseDateAlert({ onConfirm }: MissingCloseDateAlertProps) {
  const {
    closeDates,
    loading: closeDatesLoading,
    error: closeDatesError,
  } = useCloseDates();
  const [dismissed, setDismissed] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // ローディング完了を追跡
  useEffect(() => {
    if (!closeDatesLoading && !hasLoaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasLoaded(true);
    }
  }, [closeDatesLoading, hasLoaded]);

  const isCurrentDateCovered = useMemo(() => {
    const today = dayjs().startOf("day").valueOf();
    return closeDates.some((item) => {
      const start = dayjs(item.startDate).startOf("day").valueOf();
      const end = dayjs(item.endDate).startOf("day").valueOf();
      return today >= start && today <= end;
    });
  }, [closeDates]);

  // 派生状態として計算：データロード完了後、エラーがなく、却下されておらず、日付がカバーされていない場合のみ表示
  const open = useMemo(() => {
    if (!hasLoaded || closeDatesLoading || closeDatesError || dismissed)
      return false;
    return !isCurrentDateCovered;
  }, [
    hasLoaded,
    closeDatesLoading,
    closeDatesError,
    dismissed,
    isCurrentDateCovered,
  ]);

  const handleLater = useCallback(() => {
    setDismissed(true);
  }, []);

  const handleConfirm = useCallback(() => {
    setDismissed(true);
    onConfirm();
  }, [onConfirm]);

  return (
    <Dialog open={open} onClose={handleLater} maxWidth="xs" fullWidth>
      <DialogTitle>集計対象月の未登録</DialogTitle>
      <DialogContent>
        <DialogContentText>
          現在日付を含む集計対象月が登録されていません。設定画面で登録を確認してください。
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLater}>あとで</Button>
        <Button variant="contained" onClick={handleConfirm}>
          確認する
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type AuthContextValue = ComponentProps<typeof AuthContext.Provider>["value"];
type AppConfigContextValue = ComponentProps<
  typeof AppConfigContext.Provider
>["value"];

type AppProvidersProps = {
  children: ReactNode;
  auth: AuthContextValue;
  config: AppConfigContextValue;
};

function AppProviders({ children, auth, config }: AppProvidersProps) {
  return (
    <AuthContext.Provider value={auth}>
      <AppConfigContext.Provider value={config}>
        <SplitViewProvider>{children}</SplitViewProvider>
      </AppConfigContext.Provider>
    </AuthContext.Provider>
  );
}

/**
 * アプリケーションのレイアウトコンポーネント。
 * 認証状態や各種設定・カレンダー情報の取得、各種コンテキストの提供を行う。
 *
 * @returns レイアウト構造（ヘッダー・フッター・メイン・スナックバー等）を含むReact要素
 */
export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, authStatus } = useAuthenticator();
  const {
    cognitoUser,
    isCognitoUserRole,
    loading: cognitoUserLoading,
  } = useCognitoUser();

  // 重複勤怠データの警告をリッスン
  useDuplicateAttendanceWarning();

  // 通知権限をリクエスト
  const { requestPermission, permission, isSupported } = useLocalNotification();

  // 認証後に通知権限をリクエスト
  useEffect(() => {
    if (
      authStatus === "authenticated" &&
      isSupported &&
      permission === "default"
    ) {
      logger.info("Requesting notification permission on authentication");
      requestPermission().catch((error) => {
        logger.warn("Failed to request notification permission:", error);
      });
    }
  }, [authStatus, isSupported, permission, requestPermission]);

  useEffect(() => {
    if (authStatus !== "authenticated" || cognitoUserLoading) {
      return;
    }

    scheduleIdleRoutePreload({
      isAdminUser:
        isCognitoUserRole(StaffRole.ADMIN) ||
        isCognitoUserRole(StaffRole.STAFF_ADMIN),
    });
  }, [authStatus, cognitoUserLoading, isCognitoUserRole]);

  // ワークフロー申請の通知を購読
  useWorkflowNotification();
  // ワークフローコメント通知を全画面で購読
  useWorkflowCommentNotification();

  const {
    fetchConfig,
    saveConfig,
    getStartTime,
    getEndTime,
    getConfigId,
    getLinks,
    getReasons,
    getOfficeMode,
    getQuickInputStartTimes,
    getQuickInputEndTimes,
    getShiftGroups,
    getLunchRestStartTime,
    getLunchRestEndTime,
    getStandardWorkHours,
    getHourlyPaidHolidayEnabled,
    getAmHolidayStartTime,
    getAmHolidayEndTime,
    getPmHolidayStartTime,
    getPmHolidayEndTime,
    getAmPmHolidayEnabled,
    getSpecialHolidayEnabled,
    getAbsentEnabled,
    getWorkflowCategoryOrder,
    getAttendanceStatisticsEnabled,
    getWorkflowNotificationEnabled,
    getShiftCollaborativeEnabled,
    getShiftDefaultMode,
    getThemeColor,
    getThemeTokens,
  } = useAppConfig();

  const isAdminUser = useMemo(
    () => isCognitoUserRole(StaffRole.ADMIN),
    [isCognitoUserRole],
  );

  const isLoginRoute = location.pathname === "/login";

  // Handle authentication errors, especially token expiration
  useEffect(() => {
    const handleTokenRefreshFailure = async () => {
      try {
        await signOut();
      } catch (error) {
        logger.error("Failed to sign out after token refresh failure", error);
      } finally {
        navigate("/login");
      }
    };

    const hubListenerCancelToken = Hub.listen("auth", (data) => {
      const { payload } = data;

      if (payload.event === "tokenRefresh_failure") {
        logger.error("Token refresh failed", payload.data);
        void handleTokenRefreshFailure();
      }
    });

    return () => {
      hubListenerCancelToken();
    };
  }, [signOut, navigate]);

  useEffect(() => {
    if (isLoginRoute) {
      return;
    }

    if (authStatus === "configuring") {
      return;
    }

    if (authStatus === "unauthenticated") {
      navigate("/login");
      return;
    }

    if (authStatus !== "authenticated") {
      return;
    }

    if (cognitoUserLoading || !cognitoUser) {
      return;
    }

    if (cognitoUser.emailVerified) {
      return;
    }

    alert(
      "メール認証が完了していません。ログイン時にメール認証を行なってください。",
    );

    try {
      void signOut();
    } catch (error) {
      logger.error("Failed to sign out:", error);
    }
  }, [
    authStatus,
    cognitoUser,
    cognitoUserLoading,
    isLoginRoute,
    navigate,
    signOut,
  ]);

  const authContextValue = useMemo(
    () => ({
      signOut,
      signIn: () => navigate("/login"),
      isCognitoUserRole,
      user,
      authStatus,
      cognitoUser,
    }),
    [signOut, navigate, isCognitoUserRole, user, authStatus, cognitoUser],
  );

  const appConfigContextValue = useMemo(
    () => ({
      fetchConfig,
      saveConfig,
      getStartTime,
      getEndTime,
      getStandardWorkHours,
      getConfigId,
      getLinks,
      getReasons,
      getOfficeMode,
      getQuickInputStartTimes,
      getQuickInputEndTimes,
      getShiftGroups,
      getLunchRestStartTime,
      getLunchRestEndTime,
      getHourlyPaidHolidayEnabled,
      getAmHolidayStartTime,
      getAmHolidayEndTime,
      getPmHolidayStartTime,
      getPmHolidayEndTime,
      getAmPmHolidayEnabled,
      getSpecialHolidayEnabled,
      getAbsentEnabled,
      getWorkflowCategoryOrder,
      getAttendanceStatisticsEnabled,
      getWorkflowNotificationEnabled,
      getShiftCollaborativeEnabled,
      getShiftDefaultMode,
      getThemeColor,
      getThemeTokens,
    }),
    [
      fetchConfig,
      saveConfig,
      getStartTime,
      getEndTime,
      getStandardWorkHours,
      getConfigId,
      getLinks,
      getReasons,
      getOfficeMode,
      getQuickInputStartTimes,
      getQuickInputEndTimes,
      getShiftGroups,
      getLunchRestStartTime,
      getLunchRestEndTime,
      getHourlyPaidHolidayEnabled,
      getAmHolidayStartTime,
      getAmHolidayEndTime,
      getPmHolidayStartTime,
      getPmHolidayEndTime,
      getAmPmHolidayEnabled,
      getSpecialHolidayEnabled,
      getAbsentEnabled,
      getWorkflowCategoryOrder,
      getAttendanceStatisticsEnabled,
      getWorkflowNotificationEnabled,
      getShiftCollaborativeEnabled,
      getShiftDefaultMode,
      getThemeColor,
      getThemeTokens,
    ],
  );

  const configuredThemeColor = useMemo(
    () => (typeof getThemeColor === "function" ? getThemeColor() : undefined),
    [getThemeColor],
  );

  const appTheme = useMemo(
    () => createAppTheme(configuredThemeColor),
    [configuredThemeColor],
  );

  const shouldBlockUnauthenticated =
    authStatus === "unauthenticated" && !isLoginRoute;

  const shouldBlockLayoutBootstrap =
    authStatus === "configuring" ||
    cognitoUserLoading ||
    shouldBlockUnauthenticated;

  if (shouldBlockLayoutBootstrap) {
    return (
      <ThemeContextProvider>
        <ThemeProvider theme={appTheme}>
          <LinearProgress data-testid="layout-linear-progress" />
        </ThemeProvider>
      </ThemeContextProvider>
    );
  }

  return (
    <ThemeContextProvider>
      <ThemeProvider theme={appTheme}>
        <AppProviders
          auth={authContextValue}
          config={appConfigContextValue}
        >
          <AppShell
            header={<Header />}
            main={<Outlet />}
            footer={<Footer />}
            snackbar={<SnackbarGroup />}
            slotProps={{
              root: { "data-testid": "layout-stack" },
              header: { "data-testid": "layout-header" },
              main: { "data-testid": "layout-main" },
              footer: { "data-testid": "layout-footer" },
              snackbar: { "data-testid": "layout-snackbar" },
            }}
          />
          {isAdminUser && (
            <MissingCloseDateAlert
              onConfirm={() => navigate("/admin/master/job_term")}
            />
          )}
        </AppProviders>
      </ThemeProvider>
    </ThemeContextProvider>
  );
}
