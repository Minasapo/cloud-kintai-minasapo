/**
 * @file Layout.tsx
 * @description アプリケーション全体のレイアウトを管理するコンポーネント。認証状態や各種設定・カレンダー情報の取得、コンテキストの提供を行う。
 */

import { useAuthenticator } from "@aws-amplify/ui-react";
import { Box, LinearProgress, Stack } from "@mui/material";
import { useCallback, useEffect, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import SnackbarGroup from "./components/ snackbar/SnackbarGroup";
import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import { AppConfigContext } from "./context/AppConfigContext";
import { AppContext } from "./context/AppContext";
import { AuthContext } from "./context/AuthContext";
import useAppConfig from "./hooks/useAppConfig/useAppConfig";
import useCognitoUser from "./hooks/useCognitoUser";
import useCompanyHolidayCalendar from "./hooks/useCompanyHolidayCalendars/useCompanyHolidayCalendars";
import useHolidayCalendar from "./hooks/useHolidayCalendars/useHolidayCalendars";

/**
 * cookieの有効期限を管理しつつ、指定したfetch関数を実行するユーティリティ関数。
 *
 * @param cookieName - 管理するcookie名
 * @param fetchFn - 実行するfetch関数
 * @param getCookie - cookie取得関数
 * @param setCookie - cookie設定関数
 * @param expireMinutes - cookieの有効期限（分）
 */
export const fetchWithCookie = (
  cookieName: string,
  fetchFn: () => void,
  getCookie: (name: string) => string | null,
  setCookie: (name: string, value: string, minutes: number) => void,
  expireMinutes: number = 2
) => {
  const lastFetchTime = getCookie(cookieName);
  if (lastFetchTime) {
    return;
  }
  setCookie(cookieName, String(Date.now()), expireMinutes);
  fetchFn();
};

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
  } = useAppConfig();
  const {
    fetchAllHolidayCalendars,
    createHolidayCalendar,
    bulkCreateHolidayCalendar,
    updateHolidayCalendar,
    deleteHolidayCalendar,
    holidayCalendars,
    loading: holidayCalendarLoading,
  } = useHolidayCalendar();
  const {
    fetchAllCompanyHolidayCalendars,
    companyHolidayCalendars,
    loading: companyHolidayCalendarLoading,
    createCompanyHolidayCalendar,
    bulkCreateCompanyHolidayCalendar,
    updateCompanyHolidayCalendar,
    deleteCompanyHolidayCalendar,
  } = useCompanyHolidayCalendar();

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
    if (isMailVerified) return;

    alert(
      "メール認証が完了していません。ログイン時にメール認証を行なってください。"
    );

    try {
      void signOut();
    } catch (error) {
      console.error(error);
    }
  }, [authStatus]);

  /**
   * cookieを設定する関数
   *
   * @param name - cookie名
   * @param value - cookie値
   * @param minutes - 有効期限（分）
   */
  const setCookie = useCallback(
    (name: string, value: string, minutes: number) => {
      const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
      document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    },
    []
  );

  /**
   * cookieを取得する関数
   *
   * @param name - cookie名
   * @returns cookie値またはnull
   */
  const getCookie = useCallback((name: string): string | null => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
  }, []);

  /**
   * 設定情報をcookie管理付きで取得する関数
   */
  const fetchConfigWithCookie = useCallback(() => {
    fetchWithCookie("configLastFetchTime", fetchConfig, getCookie, setCookie);
  }, [getCookie, setCookie, fetchConfig]);

  /**
   * 祝日カレンダーをcookie管理付きで取得する関数
   */
  const fetchHolidayCalendarsWithCookie = useCallback(() => {
    fetchWithCookie(
      "holidayCalendarsLastFetchTime",
      fetchAllHolidayCalendars,
      getCookie,
      setCookie
    );
  }, [getCookie, setCookie, fetchAllHolidayCalendars]);

  /**
   * 会社祝日カレンダーをcookie管理付きで取得する関数
   */
  const fetchCompanyHolidayCalendarsWithCookie = useCallback(() => {
    fetchWithCookie(
      "companyHolidayCalendarsLastFetchTime",
      fetchAllCompanyHolidayCalendars,
      getCookie,
      setCookie
    );
  }, [getCookie, setCookie, fetchAllCompanyHolidayCalendars]);

  useEffect(() => {
    fetchConfigWithCookie();
    fetchHolidayCalendarsWithCookie();
    fetchCompanyHolidayCalendarsWithCookie();
  }, []);

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
      getLunchRestStartTime,
      getLunchRestEndTime,
      getHourlyPaidHolidayEnabled,
      getAmHolidayStartTime,
      getAmHolidayEndTime,
      getPmHolidayStartTime,
      getPmHolidayEndTime,
      getAmPmHolidayEnabled,
      getSpecialHolidayEnabled,
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
      getLunchRestStartTime,
      getLunchRestEndTime,
      getHourlyPaidHolidayEnabled,
      getAmHolidayStartTime,
      getAmHolidayEndTime,
      getPmHolidayStartTime,
      getPmHolidayEndTime,
      getAmPmHolidayEnabled,
      getSpecialHolidayEnabled,
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
    cognitoUserLoading ||
    appConfigLoading ||
    holidayCalendarLoading ||
    companyHolidayCalendarLoading ||
    authStatus === "configuring"
  ) {
    return <LinearProgress />;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <AppConfigContext.Provider value={appConfigContextValue}>
        <AppContext.Provider value={appContextValue}>
          <Stack sx={{ height: "100vh" }}>
            <Box>
              <Header />
            </Box>
            <Box sx={{ flexGrow: 2 }}>
              <Outlet />
            </Box>
            <Box>
              <Footer />
            </Box>
            <SnackbarGroup />
          </Stack>
        </AppContext.Provider>
      </AppConfigContext.Provider>
    </AuthContext.Provider>
  );
}
