/**
 * @file Layout.tsx
 * @description アプリケーション全体のレイアウトを管理するコンポーネント。認証状態や各種設定・カレンダー情報の取得、コンテキストの提供を行う。
 */

import { useAuthenticator } from "@aws-amplify/ui-react";
import {
  useBulkCreateCompanyHolidayCalendarsMutation,
  useBulkCreateHolidayCalendarsMutation,
  useCreateCompanyHolidayCalendarMutation,
  useCreateHolidayCalendarMutation,
  useDeleteCompanyHolidayCalendarMutation,
  useDeleteHolidayCalendarMutation,
  useGetCompanyHolidayCalendarsQuery,
  useGetHolidayCalendarsQuery,
  useUpdateCompanyHolidayCalendarMutation,
  useUpdateHolidayCalendarMutation,
} from "@entities/calendar/api/calendarApi";
import { LinearProgress } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useCallback, useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Footer from "@/widgets/layout/footer/Footer";
import Header from "@/widgets/layout/header/Header";
import SnackbarGroup from "@/widgets/feedback/snackbar/SnackbarGroup";
import { AppConfigContext } from "./context/AppConfigContext";
import { AppContext } from "./context/AppContext";
import { AuthContext } from "./context/AuthContext";
import useAppConfig from "./hooks/useAppConfig/useAppConfig";
import useCognitoUser from "./hooks/useCognitoUser";
import { createAppTheme } from "./lib/theme";
import { AppShell } from "@/shared/ui/layout";

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
    loading: appConfigLoading,
    getStandardWorkHours,
    getHourlyPaidHolidayEnabled,
    getAmHolidayStartTime,
    getAmHolidayEndTime,
    getPmHolidayStartTime,
    getPmHolidayEndTime,
    getAmPmHolidayEnabled,
    getSpecialHolidayEnabled,
    getAbsentEnabled,
    getThemeColor,
    getThemeTokens,
  } = useAppConfig();
  const isAuthenticated = authStatus === "authenticated";
  const { data: holidayCalendars = [], isLoading: holidayCalendarLoading } =
    useGetHolidayCalendarsQuery(undefined, { skip: !isAuthenticated });
  const {
    data: companyHolidayCalendars = [],
    isLoading: companyHolidayCalendarLoading,
  } = useGetCompanyHolidayCalendarsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [createHolidayCalendarMutation] = useCreateHolidayCalendarMutation();
  const [bulkCreateHolidayCalendarsMutation] =
    useBulkCreateHolidayCalendarsMutation();
  const [updateHolidayCalendarMutation] = useUpdateHolidayCalendarMutation();
  const [deleteHolidayCalendarMutation] = useDeleteHolidayCalendarMutation();

  const [createCompanyHolidayCalendarMutation] =
    useCreateCompanyHolidayCalendarMutation();
  const [bulkCreateCompanyHolidayCalendarsMutation] =
    useBulkCreateCompanyHolidayCalendarsMutation();
  const [updateCompanyHolidayCalendarMutation] =
    useUpdateCompanyHolidayCalendarMutation();
  const [deleteCompanyHolidayCalendarMutation] =
    useDeleteCompanyHolidayCalendarMutation();

  const createHolidayCalendar = useCallback(
    async (input: Parameters<typeof createHolidayCalendarMutation>[0]) => {
      const result = await createHolidayCalendarMutation(input).unwrap();
      return result;
    },
    [createHolidayCalendarMutation]
  );

  const bulkCreateHolidayCalendar = useCallback(
    async (
      inputs: Parameters<typeof bulkCreateHolidayCalendarsMutation>[0]
    ) => {
      const result = await bulkCreateHolidayCalendarsMutation(inputs).unwrap();
      return result;
    },
    [bulkCreateHolidayCalendarsMutation]
  );

  const updateHolidayCalendar = useCallback(
    async (input: Parameters<typeof updateHolidayCalendarMutation>[0]) => {
      const result = await updateHolidayCalendarMutation(input).unwrap();
      return result;
    },
    [updateHolidayCalendarMutation]
  );

  const deleteHolidayCalendar = useCallback(
    async (input: Parameters<typeof deleteHolidayCalendarMutation>[0]) => {
      await deleteHolidayCalendarMutation(input).unwrap();
    },
    [deleteHolidayCalendarMutation]
  );

  const createCompanyHolidayCalendar = useCallback(
    async (
      input: Parameters<typeof createCompanyHolidayCalendarMutation>[0]
    ) => {
      const result = await createCompanyHolidayCalendarMutation(input).unwrap();
      return result;
    },
    [createCompanyHolidayCalendarMutation]
  );

  const bulkCreateCompanyHolidayCalendar = useCallback(
    async (
      inputs: Parameters<typeof bulkCreateCompanyHolidayCalendarsMutation>[0]
    ) => {
      const result = await bulkCreateCompanyHolidayCalendarsMutation(
        inputs
      ).unwrap();
      return result;
    },
    [bulkCreateCompanyHolidayCalendarsMutation]
  );

  const updateCompanyHolidayCalendar = useCallback(
    async (
      input: Parameters<typeof updateCompanyHolidayCalendarMutation>[0]
    ) => {
      const result = await updateCompanyHolidayCalendarMutation(input).unwrap();
      return result;
    },
    [updateCompanyHolidayCalendarMutation]
  );

  const deleteCompanyHolidayCalendar = useCallback(
    async (
      input: Parameters<typeof deleteCompanyHolidayCalendarMutation>[0]
    ) => {
      const result = await deleteCompanyHolidayCalendarMutation(input).unwrap();
      return result;
    },
    [deleteCompanyHolidayCalendarMutation]
  );

  const isLoginRoute = location.pathname === "/login";

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
      "メール認証が完了していません。ログイン時にメール認証を行なってください。"
    );

    try {
      void signOut();
    } catch (error) {
      console.error(error);
    }
  }, [
    authStatus,
    cognitoUser,
    cognitoUserLoading,
    isLoginRoute,
    navigate,
    signOut,
  ]);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  const authContextValue = useMemo(
    () => ({
      signOut,
      signIn: () => navigate("/login"),
      isCognitoUserRole,
      user,
      authStatus,
      cognitoUser,
    }),
    [signOut, navigate, isCognitoUserRole, user, authStatus, cognitoUser]
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
      getThemeColor,
      getThemeTokens,
    ]
  );

  const appContextValue = useMemo(
    () => ({
      holidayCalendars,
      companyHolidayCalendars,
      createHolidayCalendar,
      bulkCreateHolidayCalendar,
      updateHolidayCalendar,
      deleteHolidayCalendar,
      createCompanyHolidayCalendar,
      bulkCreateCompanyHolidayCalendar,
      updateCompanyHolidayCalendar,
      deleteCompanyHolidayCalendar,
    }),
    [
      holidayCalendars,
      companyHolidayCalendars,
      createHolidayCalendar,
      bulkCreateHolidayCalendar,
      updateHolidayCalendar,
      deleteHolidayCalendar,
      createCompanyHolidayCalendar,
      bulkCreateCompanyHolidayCalendar,
      updateCompanyHolidayCalendar,
      deleteCompanyHolidayCalendar,
    ]
  );

  const configuredThemeColor = useMemo(
    () => (typeof getThemeColor === "function" ? getThemeColor() : undefined),
    [getThemeColor]
  );

  const appTheme = useMemo(
    () => createAppTheme(configuredThemeColor),
    [configuredThemeColor]
  );

  const shouldBlockUnauthenticated =
    authStatus === "unauthenticated" && !isLoginRoute;

  if (
    authStatus === "configuring" ||
    cognitoUserLoading ||
    appConfigLoading ||
    holidayCalendarLoading ||
    companyHolidayCalendarLoading ||
    shouldBlockUnauthenticated
  ) {
    return (
      <ThemeProvider theme={appTheme}>
        <LinearProgress data-testid="layout-linear-progress" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={appTheme}>
      <AuthContext.Provider value={authContextValue}>
        <AppConfigContext.Provider value={appConfigContextValue}>
          <AppContext.Provider value={appContextValue}>
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
          </AppContext.Provider>
        </AppConfigContext.Provider>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}
