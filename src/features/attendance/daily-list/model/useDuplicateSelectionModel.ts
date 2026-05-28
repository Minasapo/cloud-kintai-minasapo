import { useCallback, useState } from "react";

export type DuplicateSelectionMode = "record" | "field";

type UseDuplicateSelectionModelArgs = {
  fieldLabels: readonly string[];
};

export function useDuplicateSelectionModel({
  fieldLabels,
}: UseDuplicateSelectionModelArgs) {
  const [selectionMode, setSelectionMode] =
    useState<DuplicateSelectionMode>("record");
  const [selectedRecordIndex, setSelectedRecordIndex] = useState<number | null>(
    null,
  );
  const [fieldSelections, setFieldSelections] = useState<Record<string, number>>(
    {},
  );
  const [lastFieldRowIndex, setLastFieldRowIndex] = useState<number | null>(null);
  const [lastFieldRecordIndex, setLastFieldRecordIndex] = useState<number | null>(
    null,
  );

  const resetSelection = useCallback(() => {
    setSelectedRecordIndex(null);
    setFieldSelections({});
    setLastFieldRowIndex(null);
    setLastFieldRecordIndex(null);
  }, []);

  const handleChangeSelectionMode = useCallback(
    (_: unknown, next: DuplicateSelectionMode | null) => {
      if (!next) {
        return;
      }
      setSelectionMode(next);
      resetSelection();
    },
    [resetSelection],
  );

  const handleSelectRecord = useCallback(
    (index: number) => {
      if (selectionMode !== "record") {
        return;
      }
      setSelectedRecordIndex((previous) => (previous === index ? null : index));
    },
    [selectionMode],
  );

  const handleSelectField = useCallback(
    (label: string, index: number, rowIndex: number, isShift: boolean) => {
      if (selectionMode !== "field") {
        return;
      }

      setFieldSelections((previous) => {
        if (
          isShift &&
          lastFieldRowIndex !== null &&
          lastFieldRecordIndex === index
        ) {
          const next = { ...previous };
          const start = Math.min(lastFieldRowIndex, rowIndex);
          const end = Math.max(lastFieldRowIndex, rowIndex);
          fieldLabels.slice(start, end + 1).forEach((fieldLabel) => {
            next[fieldLabel] = index;
          });
          return next;
        }

        const current = previous[label];
        if (current === index) {
          const { [label]: _removed, ...rest } = previous;
          return rest;
        }

        return { ...previous, [label]: index };
      });

      setLastFieldRowIndex(rowIndex);
      setLastFieldRecordIndex(index);
    },
    [fieldLabels, lastFieldRecordIndex, lastFieldRowIndex, selectionMode],
  );

  const resetToRecordMode = useCallback(() => {
    setSelectionMode("record");
    resetSelection();
  }, [resetSelection]);

  return {
    selectionMode,
    selectedRecordIndex,
    fieldSelections,
    resetSelection,
    resetToRecordMode,
    handleChangeSelectionMode,
    handleSelectRecord,
    handleSelectField,
  } as const;
}
