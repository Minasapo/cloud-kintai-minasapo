import {
  createShiftPlanYear,
  updateShiftPlanYear,
} from "@shared/api/graphql/documents/mutations";
import { shiftPlanYearByTargetYear } from "@shared/api/graphql/documents/queries";
import {
  CreateShiftPlanYearMutation,
  CreateShiftPlanYearMutationVariables,
  ShiftPlanYearByTargetYearQuery,
  ShiftPlanYearByTargetYearQueryVariables,
  UpdateShiftPlanYearMutationVariables,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

import {
  areRowsEqual,
  buildRowsFromPlans,
  convertRowsToPlanInput,
  createDefaultRows,
  EditableField,
  getOrInitYearRows,
  sanitizeCapacityValue,
  ShiftPlanRow,
  TIME_FORMAT,
} from "../shiftPlanUtils";

type ShiftPlanDataState = {
  selectedYear: number;
  currentRows: ShiftPlanRow[];
  isDirty: boolean;
  isPending: boolean;
  isFetchingYear: boolean;
  isSaving: boolean;
  setIsSaving: (value: boolean | ((prev: boolean) => boolean)) => void;
  yearRecordIds: Record<number, string>;
  lastAutoSaveTime: string | null;
  handleYearChange: (delta: number) => void;
  handleFieldChange: (month: number, field: EditableField, value: string) => void;
  handleToggleEnabled: (month: number) => void;
  handleDailyCapacityChange: (
    month: number,
    dayIndex: number,
    value: string,
  ) => void;
  handleSaveAll: () => Promise<void>;
  performSave: (
    rows: ShiftPlanRow[],
    year: number,
    recordIds: Record<number, string>,
    showNotification?: boolean,
  ) => Promise<boolean>;
};

export const useShiftPlanData = (): ShiftPlanDataState => {
  const dispatch = useAppDispatchV2();
  const initialYear = dayjs().year();
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [yearlyPlans, setYearlyPlans] = useState<
    Record<number, ShiftPlanRow[]>
  >(() => ({
    [initialYear]: createDefaultRows(initialYear),
  }));
  const [isPending, startTransition] = useTransition();
  const [isFetchingYear, setIsFetchingYear] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [yearRecordIds, setYearRecordIds] = useState<Record<number, string>>(
    {},
  );
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string | null>(null);
  const [savedYearlyPlans, setSavedYearlyPlans] = useState<
    Record<number, ShiftPlanRow[]>
  >(() => ({
    [initialYear]: createDefaultRows(initialYear),
  }));

  // 年を跨いだときも必ず初期行が存在するように補完する
  useEffect(() => {
    setYearlyPlans((prev) => {
      if (prev[selectedYear]) return prev;
      return {
        ...prev,
        [selectedYear]: getOrInitYearRows(selectedYear, prev),
      };
    });
    // 年が切り替わった時は保存済み状態をリセット
    setSavedYearlyPlans((prev) => {
      if (prev[selectedYear]) return prev;
      return {
        ...prev,
        [selectedYear]: getOrInitYearRows(selectedYear, prev),
      };
    });
  }, [selectedYear]);

  useEffect(() => {
    let isMounted = true;
    const fetchYearPlan = async () => {
      setIsFetchingYear(true);
      try {
        const response = (await graphqlClient.graphql({
          query: shiftPlanYearByTargetYear,
          variables: {
            targetYear: selectedYear,
            limit: 1,
          } as ShiftPlanYearByTargetYearQueryVariables,
          authMode: "userPool",
        })) as GraphQLResult<ShiftPlanYearByTargetYearQuery>;

        if (!isMounted) return;

        if (response.errors?.length) {
          throw new Error(
            response.errors.map((error) => error.message).join(","),
          );
        }

        const record =
          response.data?.shiftPlanYearByTargetYear?.items?.find(
            (item): item is NonNullable<typeof item> => item !== null,
          ) ?? null;

        if (record) {
          setYearlyPlans((prev) => ({
            ...prev,
            [selectedYear]: buildRowsFromPlans(selectedYear, record.plans),
          }));
          setSavedYearlyPlans((prev) => ({
            ...prev,
            [selectedYear]: buildRowsFromPlans(selectedYear, record.plans),
          }));
          setYearRecordIds((prev) => ({
            ...prev,
            [selectedYear]: record.id,
          }));
        } else {
          setYearRecordIds((prev) => {
            if (!prev[selectedYear]) return prev;
            const next = { ...prev };
            delete next[selectedYear];
            return next;
          });
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          dispatch(setSnackbarError("シフト計画の読み込みに失敗しました。"));
        }
      } finally {
        if (isMounted) {
          setIsFetchingYear(false);
        }
      }
    };

    void fetchYearPlan();

    return () => {
      isMounted = false;
    };
  }, [dispatch, selectedYear]);

  const currentRows = yearlyPlans[selectedYear] ?? [];

  // 現在の年のプランが保存済み状態から変更されているかを判定
  const isDirty = useMemo(() => {
    const current = yearlyPlans[selectedYear];
    const saved = savedYearlyPlans[selectedYear];

    if (!current || !saved) {
      return false;
    }

    return !areRowsEqual(current, saved);
  }, [yearlyPlans, savedYearlyPlans, selectedYear]);

  const updateYearRows = useCallback(
    (
      year: number,
      updater: (rows: ShiftPlanRow[]) => ShiftPlanRow[],
    ) => {
      setYearlyPlans((prev) => {
        const rows = getOrInitYearRows(year, prev);
        return {
          ...prev,
          [year]: updater(rows),
        };
      });
    },
    [],
  );

  const ensureYearRows = useCallback((year: number) => {
    updateYearRows(year, (rows) => rows);
  }, [updateYearRows]);

  const handleYearChange = useCallback(
    (delta: number) => {
      const nextYear = selectedYear + delta;
      startTransition(() => {
        ensureYearRows(nextYear);
        setSelectedYear(nextYear);
      });
    },
    [ensureYearRows, selectedYear, startTransition],
  );

  const handleFieldChange = useCallback(
    (month: number, field: EditableField, value: string) => {
      updateYearRows(selectedYear, (rows) =>
        rows.map((row) =>
          row.month === month ? { ...row, [field]: value } : row,
        ),
      );
    },
    [selectedYear, updateYearRows],
  );

  const handleToggleEnabled = useCallback(
    (month: number) => {
      updateYearRows(selectedYear, (rows) =>
        rows.map((row) =>
          row.month === month ? { ...row, enabled: !row.enabled } : row,
        ),
      );
    },
    [selectedYear, updateYearRows],
  );

  const handleDailyCapacityChange = useCallback(
    (month: number, dayIndex: number, value: string) => {
      const normalizedValue = sanitizeCapacityValue(value);
      updateYearRows(selectedYear, (rows) =>
        rows.map((row) => {
          if (row.month !== month) return row;
          const nextCapacity = [...row.dailyCapacity];
          nextCapacity[dayIndex] = normalizedValue;
          return { ...row, dailyCapacity: nextCapacity };
        }),
      );
    },
    [selectedYear, updateYearRows],
  );

  const performSave = useCallback(
    async (
      rows: ShiftPlanRow[],
      year: number,
      recordIds: Record<number, string>,
      showNotification = true,
    ) => {
      try {
        const plansInput = convertRowsToPlanInput(rows);
        const existingId = recordIds[year];
        if (existingId) {
          await graphqlClient.graphql({
            query: updateShiftPlanYear,
            variables: {
              input: {
                id: existingId,
                targetYear: year,
                plans: plansInput,
              },
            } as UpdateShiftPlanYearMutationVariables,
            authMode: "userPool",
          });
        } else {
          const response = (await graphqlClient.graphql({
            query: createShiftPlanYear,
            variables: {
              input: {
                targetYear: year,
                plans: plansInput,
              },
            } as CreateShiftPlanYearMutationVariables,
            authMode: "userPool",
          })) as GraphQLResult<CreateShiftPlanYearMutation>;

          const createdId = response.data?.createShiftPlanYear?.id;
          if (createdId) {
            setYearRecordIds((prev) => ({ ...prev, [year]: createdId }));
          }
        }

        if (showNotification) {
          dispatch(setSnackbarSuccess(`${year}年の申請期間を保存しました。`));
        }

        // 保存済み状態を記録
        setSavedYearlyPlans((prev) => ({
          ...prev,
          [year]: rows.map((row) => ({ ...row })),
        }));
        // 保存時刻を更新
        setLastAutoSaveTime(dayjs().format(TIME_FORMAT));

        return true;
      } catch (error) {
        console.error(error);
        if (showNotification) {
          dispatch(setSnackbarError("シフト計画の保存に失敗しました。"));
        }
        return false;
      }
    },
    [dispatch],
  );

  const handleSaveAll = useCallback(async () => {
    for (const row of currentRows) {
      if (!row.enabled) continue;
      const label = `${selectedYear}年${row.month}月`;
      if (!row.editStart || !row.editEnd) {
        dispatch(setSnackbarError(`${label}の入力が未完了です。`));
        return;
      }
      if (dayjs(row.editStart).isAfter(dayjs(row.editEnd))) {
        dispatch(
          setSnackbarError(`${label}は開始日が終了日より後になっています。`),
        );
        return;
      }
    }

    setIsSaving(true);
    try {
      await performSave(currentRows, selectedYear, yearRecordIds, true);
    } finally {
      setIsSaving(false);
    }
  }, [
    currentRows,
    dispatch,
    performSave,
    selectedYear,
    setIsSaving,
    yearRecordIds,
  ]);

  return {
    selectedYear,
    currentRows,
    isDirty,
    isPending,
    isFetchingYear,
    isSaving,
    setIsSaving,
    yearRecordIds,
    lastAutoSaveTime,
    handleYearChange,
    handleFieldChange,
    handleToggleEnabled,
    handleDailyCapacityChange,
    handleSaveAll,
    performSave,
  };
};
