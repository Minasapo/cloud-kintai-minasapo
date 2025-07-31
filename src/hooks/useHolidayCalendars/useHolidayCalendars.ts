/**
 * 祝日カレンダーの取得・作成・更新・削除を管理するカスタムフック。
 * ローカルストレージを利用してキャッシュし、Amplifyバックエンドと連携します。
 * @packageDocumentation
 */

import { useEffect, useState } from "react";

import {
  CreateHolidayCalendarInput,
  DeleteHolidayCalendarInput,
  HolidayCalendar,
  UpdateHolidayCalendarInput,
} from "../../API";
import createHolidayCalendarData from "./createHolidayCalendarData";
import deleteHolidayCalendarData from "./deleteHolidayCalendarData";
import fetchHolidayCalendars from "./fetchHolidayCalendars";
import updateHolidayCalendarData from "./updateHolidayCalendarData";

const LOCAL_STORAGE_KEY = "holidayCalendars";

/**
 * useHolidayCalendar
 * 祝日カレンダーのCRUD操作を提供するReactフック。
 * @returns 祝日カレンダーの状態と操作関数群
 */
export default function useHolidayCalendar() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [holidayCalendars, setHolidayCalendars] = useState<HolidayCalendar[]>(
    []
  );

  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      setHolidayCalendars(JSON.parse(cached));
    }
    setLoading(false);
  }, []);

  /**
   * ローカルストレージに祝日カレンダー配列を保存します。
   * @param data 保存する祝日カレンダー配列
   */
  const saveToLocalStorage = (data: HolidayCalendar[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  /**
   * 祝日カレンダーを新規作成します。
   * @param input 作成する祝日カレンダーの入力データ
   * @returns 作成された祝日カレンダー
   */
  const createHolidayCalendar = async (input: CreateHolidayCalendarInput) =>
    createHolidayCalendarData(input)
      .then((holidayCalendar) => {
        if (holidayCalendar) {
          const updated = [...holidayCalendars, holidayCalendar];
          setHolidayCalendars(updated);
          saveToLocalStorage(updated);
        }

        return holidayCalendar;
      })
      .catch(setError);

  /**
   * 祝日カレンダーを複数件一括作成します。
   * @param inputs 作成する祝日カレンダーの入力データ配列
   * @returns 作成された祝日カレンダー配列
   */
  const bulkCreateHolidayCalendar = async (
    inputs: CreateHolidayCalendarInput[]
  ) =>
    Promise.all(inputs.map((input) => createHolidayCalendarData(input)))
      .then((res) => {
        const updated = [...holidayCalendars, ...res];
        setHolidayCalendars(updated);
        saveToLocalStorage(updated);
        return res;
      })
      .catch((e) => {
        throw e;
      });

  /**
   * 祝日カレンダーを更新します。
   * @param input 更新する祝日カレンダーの入力データ
   * @returns 更新された祝日カレンダー
   */
  const updateHolidayCalendar = async (input: UpdateHolidayCalendarInput) =>
    updateHolidayCalendarData(input)
      .then((res) => {
        setHolidayCalendars((holidayCalendars) => {
          const updated = holidayCalendars.map((holidayCalendar) =>
            holidayCalendar.id === res.id ? res : holidayCalendar
          );
          saveToLocalStorage(updated);
          return updated;
        });
        return res;
      })
      .catch((e) => {
        throw e;
      });

  /**
   * 祝日カレンダーを削除します。
   * @param input 削除する祝日カレンダーの入力データ
   */
  const deleteHolidayCalendar = async (input: DeleteHolidayCalendarInput) => {
    deleteHolidayCalendarData(input)
      .then((res) => {
        const updated = holidayCalendars.filter((holidayCalendar) => {
          return holidayCalendar.id !== res.id;
        });
        setHolidayCalendars(updated);
        saveToLocalStorage(updated);
      })
      .catch((e) => {
        throw e;
      });
  };

  /**
   * すべての祝日カレンダーを取得します。
   * @returns 取得した祝日カレンダー配列
   */
  const fetchAllHolidayCalendars = async () => {
    try {
      setLoading(true);
      const allHolidayCalendars = await fetchHolidayCalendars();
      setHolidayCalendars(allHolidayCalendars);
      saveToLocalStorage(allHolidayCalendars);
      return allHolidayCalendars;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    holidayCalendars,
    createHolidayCalendar,
    bulkCreateHolidayCalendar,
    updateHolidayCalendar,
    deleteHolidayCalendar,
    fetchAllHolidayCalendars,
  };
}
