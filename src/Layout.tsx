/**
 * @file Layout.tsx
 * @description アプリケーション全体のレイアウトを管理するコンポーネント。認証状態や各種設定・カレンダー情報の取得、コンテキストの提供を行う。
 */

import { useAuthenticator } from "@aws-amplify/ui-react";
import { Box, LinearProgress, Stack } from "@mui/material";
import { useCallback, useEffect, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";

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
} from "@/lib/api/calendarApi";

import SnackbarGroup from "./components/ snackbar/SnackbarGroup";
import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import { AppConfigContext } from "./context/AppConfigContext";
import { AppContext } from "./context/AppContext";
import { AuthContext } from "./context/AuthContext";
import useAppConfig from "./hooks/useAppConfig/useAppConfig";
import useCognitoUser from "./hooks/useCognitoUser";
/**
 * アプリケーションのレイアウトコンポーネント。
 * 認証状態や各種設定・カレンダー情報の取得、各種コンテキストの提供を行う。
 *
 * @returns レイアウト構造（ヘッダー・フッター・メイン・スナックバー等）を含むReact要素
 */
export default function Layout() {
  const navigate = useNavigate();
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
    getHourlyPaidHolidayEnabled,
    getAmHolidayStartTime,
    getAmHolidayEndTime,
    getPmHolidayStartTime,
    getPmHolidayEndTime,
    getAmPmHolidayEnabled,
    getSpecialHolidayEnabled,
    getAbsentEnabled,
    getThemeColor,
  } = useAppConfig();
  const {
    data: holidayCalendars = [],
    isLoading: holidayCalendarLoading,
  } = useGetHolidayCalendarsQuery();
  const {
    data: companyHolidayCalendars = [],
    isLoading: companyHolidayCalendarLoading,
  } = useGetCompanyHolidayCalendarsQuery();

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

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.pathname === "/login") return;

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

    const isMailVerified = user.attributes?.email_verified ? true : false;
    if (isMailVerified) {
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
  }, [authStatus]);

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
    }),
    [
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
      getHourlyPaidHolidayEnabled,
      getAmHolidayStartTime,
      getAmHolidayEndTime,
      getPmHolidayStartTime,
      getPmHolidayEndTime,
      getAmPmHolidayEnabled,
      getSpecialHolidayEnabled,
      getAbsentEnabled,
      getThemeColor,
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

  if (
    authStatus === "configuring" ||
    cognitoUserLoading ||
    appConfigLoading ||
    holidayCalendarLoading ||
    companyHolidayCalendarLoading
  ) {
    return <LinearProgress data-testid="layout-linear-progress" />;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <AppConfigContext.Provider value={appConfigContextValue}>
        <AppContext.Provider value={appContextValue}>
          <Stack sx={{ minHeight: "100vh" }} data-testid="layout-stack">
            <Box data-testid="layout-header">
              <Header />
            </Box>
            <Box sx={{ flex: 1, overflow: "auto" }} data-testid="layout-main">
              <Outlet />
            </Box>
            <Box data-testid="layout-footer">
              <Footer />
            </Box>
            <Box data-testid="layout-snackbar">
              <SnackbarGroup />
            </Box>
          </Stack>
        </AppContext.Provider>
      </AppConfigContext.Provider>
    </AuthContext.Provider>
  );
}
