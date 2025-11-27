import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { AppConfig, CreateAppConfigInput, UpdateAppConfigInput } from "@/API";
import { DEFAULT_THEME_COLOR } from "@/constants/theme";

import { AppConfigDataManager } from "./AppConfigDataManager";

/**
 * アプリケーション設定の一部項目のみを抽出した型。
 */
export type DefaultAppConfig = Pick<
  AppConfig,
  | "name"
  | "workStartTime"
  | "workEndTime"
  | "lunchRestStartTime"
  | "lunchRestEndTime"
  | "links"
  | "officeMode"
  | "reasons"
  | "quickInputStartTimes"
  | "quickInputEndTimes"
  | "themeColor"
>;

/**
 * デフォルトのアプリケーション設定値。
 */
export const DEFAULT_CONFIG: DefaultAppConfig = {
  name: "default",
  workStartTime: "09:00",
  workEndTime: "18:00",
  lunchRestStartTime: "12:00",
  lunchRestEndTime: "13:00",
  officeMode: false,
  links: [],
  reasons: [],
  quickInputStartTimes: [],
  quickInputEndTimes: [],
  themeColor: DEFAULT_THEME_COLOR,
};

const LOCAL_STORAGE_KEY = "appConfig";

/**
 * アプリケーション設定を取得・保存・管理するカスタムフック。
 *
 * @returns 設定データ、ローディング状態、各種getter・setter関数
 */
export default function useAppConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const dataManager = new AppConfigDataManager();

  useEffect(() => {
    // ローカルストレージからキャッシュを読み込む
    const cachedConfig = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cachedConfig) {
      setConfig(JSON.parse(cachedConfig));
    }
  }, []);

  /**
   * 設定をバックエンドから取得し、ローカルストレージにキャッシュする。
   */
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const fetchedConfig = await dataManager.fetch();
      setConfig(fetchedConfig);
      // キャッシュをローカルストレージに保存
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fetchedConfig));
    } catch (error) {
      console.error("Failed to fetch app config:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 設定を新規作成または更新し、ローカルストレージにキャッシュする。
   *
   * @param newConfig 新しい設定データ
   */
  const saveConfig = async (
    newConfig: CreateAppConfigInput | UpdateAppConfigInput
  ) => {
    setLoading(true);
    try {
      let savedConfig;
      if ("id" in newConfig && newConfig.id) {
        // IDが存在する場合は更新
        savedConfig = await dataManager.update(
          newConfig as UpdateAppConfigInput
        );
      } else {
        // IDが存在しない場合は作成
        savedConfig = await dataManager.create(
          newConfig as CreateAppConfigInput
        );
      }
      setConfig(savedConfig);
      // キャッシュをローカルストレージに保存
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedConfig));
    } catch (error) {
      console.error("Failed to save app config:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 勤務開始時刻を取得する。
   * @returns dayjsオブジェクト
   */
  const getStartTime = () =>
    config
      ? dayjs(config.workStartTime, "HH:mm")
      : dayjs(DEFAULT_CONFIG.workStartTime, "HH:mm");
  /**
   * 勤務終了時刻を取得する。
   * @returns dayjsオブジェクト
   */
  const getEndTime = () =>
    config
      ? dayjs(config.workEndTime, "HH:mm")
      : dayjs(DEFAULT_CONFIG.workEndTime, "HH:mm");

  /**
   * 設定IDを取得する。
   * @returns 設定IDまたはnull
   */
  const getConfigId = () => config?.id || null;

  /**
   * リンク情報を取得する。
   * @returns リンク配列
   */
  const getLinks = () => {
    if (config && config.links) {
      return config.links.map((link) => ({
        label: link?.label || "",
        url: link?.url || "",
        enabled: link?.enabled || false,
        icon: link?.icon || "",
      }));
    }
    return [];
  };

  /**
   * 利用可能な理由一覧を取得する。
   * @returns 理由配列
   */
  const getReasons = () => {
    if (config && config.reasons) {
      return config.reasons
        .filter((reason) => reason !== null)
        .map((reason) => ({
          reason: reason?.reason || "",
          enabled: reason?.enabled || false,
        }));
    }
    return [];
  };

  /**
   * オフィスモードの有効/無効を取得する。
   * @returns boolean
   */
  const getOfficeMode = () => config?.officeMode || false;

  /**
   * クイック入力の開始時刻一覧を取得する。
   * @param onlyEnabled 有効なもののみ取得する場合true
   * @returns 時刻配列
   */
  const getQuickInputStartTimes = (onlyEnabled = false) => {
    if (config && config.quickInputStartTimes) {
      return config.quickInputStartTimes
        .filter((time) => time !== null && (!onlyEnabled || time?.enabled))
        .map((time) => ({
          time: time?.time || "",
          enabled: time?.enabled || false,
        }));
    }
    return [];
  };

  /**
   * クイック入力の終了時刻一覧を取得する。
   * @param onlyEnabled 有効なもののみ取得する場合true
   * @returns 時刻配列
   */
  const getQuickInputEndTimes = (onlyEnabled = false) => {
    if (config && config.quickInputEndTimes) {
      return config.quickInputEndTimes
        .filter((time) => time !== null && (!onlyEnabled || time?.enabled))
        .map((time) => ({
          time: time?.time || "",
          enabled: time?.enabled || false,
        }));
    }
    return [];
  };

  /**
   * 昼休憩開始時刻を取得する。
   * @returns dayjsオブジェクト
   */
  const getLunchRestStartTime = () =>
    config
      ? dayjs(config.lunchRestStartTime, "HH:mm")
      : dayjs("12:00", "HH:mm");

  /**
   * 昼休憩終了時刻を取得する。
   * @returns dayjsオブジェクト
   */
  const getLunchRestEndTime = () =>
    config ? dayjs(config.lunchRestEndTime, "HH:mm") : dayjs("13:00", "HH:mm");

  /**
   * 時間単位有給休暇の有効/無効を取得する。
   * @returns boolean
   */
  const getHourlyPaidHolidayEnabled = () => {
    return config?.hourlyPaidHolidayEnabled ?? false;
  };

  /**
   * 午前休開始時刻を取得する。
   * @returns dayjsオブジェクト
   */
  const getAmHolidayStartTime = () =>
    config && config.amHolidayStartTime
      ? dayjs(config.amHolidayStartTime, "HH:mm")
      : dayjs("09:00", "HH:mm");
  /**
   * 午前休終了時刻を取得する。
   * @returns dayjsオブジェクト
   */
  const getAmHolidayEndTime = () =>
    config && config.amHolidayEndTime
      ? dayjs(config.amHolidayEndTime, "HH:mm")
      : dayjs("12:00", "HH:mm");
  /**
   * 午後休開始時刻を取得する。
   * @returns dayjsオブジェクト
   */
  const getPmHolidayStartTime = () =>
    config && config.pmHolidayStartTime
      ? dayjs(config.pmHolidayStartTime, "HH:mm")
      : dayjs("13:00", "HH:mm");
  /**
   * 午後休終了時刻を取得する。
   * @returns dayjsオブジェクト
   */
  const getPmHolidayEndTime = () =>
    config && config.pmHolidayEndTime
      ? dayjs(config.pmHolidayEndTime, "HH:mm")
      : dayjs("18:00", "HH:mm");

  /**
   * 午前午後休の有効/無効を取得する。
   * @returns boolean
   */
  const getAmPmHolidayEnabled = () =>
    config && typeof config.amPmHolidayEnabled === "boolean"
      ? config.amPmHolidayEnabled
      : false;

  /**
   * 特別休暇フラグの有効/無効を取得する。
   * @returns boolean
   */
  const getSpecialHolidayEnabled = () =>
    config && typeof config.specialHolidayEnabled === "boolean"
      ? config.specialHolidayEnabled
      : false;

  /**
   * 欠勤機能の有効/無効を取得する。
   * @returns boolean
   */
  const getAbsentEnabled = () =>
    config && typeof config.absentEnabled === "boolean"
      ? config.absentEnabled
      : false;

  const getThemeColor = () =>
    config?.themeColor ?? DEFAULT_CONFIG.themeColor ?? DEFAULT_THEME_COLOR;

  return {
    config,
    loading,
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
    getAbsentEnabled,
    getThemeColor,
  };
}
