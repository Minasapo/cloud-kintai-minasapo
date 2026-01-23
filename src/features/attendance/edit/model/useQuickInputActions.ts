import dayjs from "dayjs";
import { useMemo } from "react";

import useAppConfig from "@/hooks/useAppConfig/useAppConfig";

import {
  AttendanceFieldPath,
  AttendanceFieldValue,
  AttendanceGetValues,
  AttendanceSetValue,
} from "./types";

type ButtonRoleMode = "all" | "admin" | "staff";

export interface QuickInputAction {
  key: string;
  label: string;
  action: () => void;
  tooltip?: string;
}

type UseQuickInputActionsProps = {
  setValue: AttendanceSetValue;
  restReplace: (
    items: { startTime: string | null; endTime: string | null }[]
  ) => void;
  hourlyPaidHolidayTimeReplace: (
    items: { startTime: string | null; endTime: string | null }[]
  ) => void;
  workDate: dayjs.Dayjs | null;
  visibleMode?: ButtonRoleMode;
  getValues?: AttendanceGetValues;
  readOnly?: boolean;
};

const BUTTON_ROLE_MAP: Record<
  | "clear"
  | "normal"
  | "regularStart"
  | "regularEnd"
  | "amHalf"
  | "pmHalf"
  | "paidHoliday",
  ButtonRoleMode
> = {
  clear: "all",
  normal: "all",
  regularStart: "staff",
  regularEnd: "staff",
  amHalf: "admin",
  pmHalf: "admin",
  paidHoliday: "admin",
};

const isVisibleFor = (mode?: ButtonRoleMode, visibleMode?: ButtonRoleMode) => {
  const current = visibleMode ?? "all";
  if (current === "all" || mode === "all") return true;
  return mode === current;
};

const toISO = (time: string | null, workDate: dayjs.Dayjs | null) => {
  if (!time || !workDate) return null;
  const [hh, mm] = time.split(":").map(Number);
  return workDate.hour(hh).minute(mm).second(0).millisecond(0).toISOString();
};

const setFieldValue = <TFieldName extends AttendanceFieldPath>(
  setValue: AttendanceSetValue,
  name: TFieldName,
  value: AttendanceFieldValue<TFieldName>
) => {
  setValue(name, value, {
    shouldDirty: true,
    shouldTouch: true,
    shouldValidate: true,
  });
};

export function useQuickInputActions({
  setValue,
  restReplace,
  hourlyPaidHolidayTimeReplace,
  workDate,
  visibleMode,
  getValues,
  readOnly,
}: UseQuickInputActionsProps): QuickInputAction[] {
  const {
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
    getAmHolidayStartTime,
    getAmHolidayEndTime,
    getPmHolidayStartTime,
    getPmHolidayEndTime,
    getAmPmHolidayEnabled,
  } = useAppConfig();

  const defaultStart = getStartTime().format("HH:mm");
  const defaultEnd = getEndTime().format("HH:mm");
  const defaultLunchStart = getLunchRestStartTime().format("HH:mm");
  const defaultLunchEnd = getLunchRestEndTime().format("HH:mm");
  const defaultAmStart = getAmHolidayStartTime().format("HH:mm");
  const defaultAmEnd = getAmHolidayEndTime().format("HH:mm");
  const defaultPmStart = getPmHolidayStartTime().format("HH:mm");
  const defaultPmEnd = getPmHolidayEndTime().format("HH:mm");

  return useMemo(() => {
    const actions: QuickInputAction[] = [];

    if (isVisibleFor(BUTTON_ROLE_MAP.clear, visibleMode)) {
      actions.push({
        key: "clear",
        label: "クリア",
        tooltip: "入力内容をすべてクリアします。",
        action: () => {
          if (readOnly) return;
          setFieldValue(setValue, "startTime", null);
          setFieldValue(setValue, "endTime", null);
          restReplace([]);
          hourlyPaidHolidayTimeReplace([]);
          setFieldValue(setValue, "paidHolidayFlag", false);
          setFieldValue(setValue, "remarkTags", []);
          setFieldValue(setValue, "remarks", "");
          setFieldValue(setValue, "goDirectlyFlag", false);
          setFieldValue(setValue, "returnDirectlyFlag", false);
        },
      });
    }

    if (isVisibleFor(BUTTON_ROLE_MAP.normal, visibleMode)) {
      actions.push({
        key: "normal",
        label: "通常勤務",
        tooltip: "規定の出勤時間と昼休みをセットします。",
        action: () => {
          if (readOnly) return;
          setFieldValue(setValue, "startTime", toISO(defaultStart, workDate));
          setFieldValue(setValue, "endTime", toISO(defaultEnd, workDate));
          restReplace([
            {
              startTime: toISO(defaultLunchStart, workDate),
              endTime: toISO(defaultLunchEnd, workDate),
            },
          ]);
          hourlyPaidHolidayTimeReplace([]);
          setFieldValue(setValue, "paidHolidayFlag", false);
          setFieldValue(setValue, "remarkTags", []);
          setFieldValue(setValue, "remarks", "");
        },
      });
    }

    if (isVisibleFor(BUTTON_ROLE_MAP.regularStart, visibleMode)) {
      actions.push({
        key: "regularStart",
        label: "定時出勤",
        tooltip: "定時出勤（スタッフ向け）をセットします。",
        action: () => {
          if (readOnly) return;
          setFieldValue(setValue, "startTime", toISO(defaultStart, workDate));
        },
      });
    }

    if (isVisibleFor(BUTTON_ROLE_MAP.regularEnd, visibleMode)) {
      actions.push({
        key: "regularEnd",
        label: "定時退勤",
        tooltip: "定時退勤（スタッフ向け）をセットします。",
        action: () => {
          if (readOnly) return;
          setFieldValue(setValue, "endTime", toISO(defaultEnd, workDate));
          restReplace([
            {
              startTime: toISO(defaultLunchStart, workDate),
              endTime: toISO(defaultLunchEnd, workDate),
            },
          ]);
        },
      });
    }

    if (getAmPmHolidayEnabled()) {
      if (isVisibleFor(BUTTON_ROLE_MAP.amHalf, visibleMode)) {
        actions.push({
          key: "amHalf",
          label: "午前半休",
          tooltip: "午前半休を設定します。",
          action: () => {
            if (readOnly) return;
            setFieldValue(
              setValue,
              "startTime",
              toISO(defaultAmStart, workDate)
            );
            setFieldValue(setValue, "endTime", toISO(defaultAmEnd, workDate));
            restReplace([]);
            hourlyPaidHolidayTimeReplace([]);
            setFieldValue(setValue, "paidHolidayFlag", false);
            try {
              if (getValues) {
                const tags: string[] =
                  (getValues("remarkTags") as string[]) || [];
                if (!tags.includes("午前半休")) {
                  setFieldValue(setValue, "remarkTags", [...tags, "午前半休"]);
                }
              }
            } catch {
              // noop
            }
          },
        });
      }

      if (isVisibleFor(BUTTON_ROLE_MAP.pmHalf, visibleMode)) {
        actions.push({
          key: "pmHalf",
          label: "午後半休",
          tooltip: "午後半休を設定します。",
          action: () => {
            if (readOnly) return;
            setFieldValue(
              setValue,
              "startTime",
              toISO(defaultPmStart, workDate)
            );
            setFieldValue(setValue, "endTime", toISO(defaultPmEnd, workDate));
            restReplace([]);
            hourlyPaidHolidayTimeReplace([]);
            setFieldValue(setValue, "paidHolidayFlag", false);
            try {
              if (getValues) {
                const tags: string[] =
                  (getValues("remarkTags") as string[]) || [];
                if (!tags.includes("午後半休")) {
                  setFieldValue(setValue, "remarkTags", [...tags, "午後半休"]);
                }
              }
            } catch {
              // noop
            }
          },
        });
      }
    }

    if (isVisibleFor(BUTTON_ROLE_MAP.paidHoliday, visibleMode)) {
      actions.push({
        key: "paidHoliday",
        label: "有給休暇(1日)",
        tooltip: "有給休暇(1日)を設定します。",
        action: () => {
          if (readOnly) return;
          setFieldValue(setValue, "startTime", toISO(defaultStart, workDate));
          setFieldValue(setValue, "endTime", toISO(defaultEnd, workDate));
          restReplace([
            {
              startTime: toISO(defaultLunchStart, workDate),
              endTime: toISO(defaultLunchEnd, workDate),
            },
          ]);
          hourlyPaidHolidayTimeReplace([]);
          setFieldValue(setValue, "paidHolidayFlag", true);
          setFieldValue(setValue, "remarkTags", ["有給休暇"]);
        },
      });
    }

    return actions;
  }, [
    visibleMode,
    workDate,
    setValue,
    restReplace,
    hourlyPaidHolidayTimeReplace,
    getValues,
    readOnly,
    getAmPmHolidayEnabled,
    defaultStart,
    defaultEnd,
    defaultLunchStart,
    defaultLunchEnd,
    defaultAmStart,
    defaultAmEnd,
    defaultPmStart,
    defaultPmEnd,
  ]);
}
