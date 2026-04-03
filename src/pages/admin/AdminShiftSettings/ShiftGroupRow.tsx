import React, { useCallback } from "react";
import type { Control } from "react-hook-form";
import { useController, useWatch } from "react-hook-form";

import SettingsIcon from "@/features/admin/layout/ui/SettingsIcon";
import RHFTextField from "@/shared/ui/form/RHFTextField";

import { SHIFT_GROUP_UI_TEXTS, SHIFT_GROUP_VALIDATION_TEXTS } from "./";
import type { ShiftGroupFormState } from "./shiftGroupSchema";

type ShiftGroupRowProps = {
  control: Control<ShiftGroupFormState>;
  index: number;
  onDelete: () => void;
};

const ShiftGroupRow: React.FC<ShiftGroupRowProps> = ({
  control,
  index,
  onDelete,
}: ShiftGroupRowProps) => {
  const hasInputValue = (value?: string | null) => (value ?? "").trim() !== "";
  const labelValue = useWatch({
    control,
    name: `shiftGroups.${index}.label`,
  });
  const minValue = useWatch({
    control,
    name: `shiftGroups.${index}.min`,
  });
  const maxValue = useWatch({
    control,
    name: `shiftGroups.${index}.max`,
  });
  const fixedValue = useWatch({
    control,
    name: `shiftGroups.${index}.fixed`,
  });
  const handleDelete = useCallback(() => {
    onDelete();
  }, [onDelete]);

  const disableMinMax = hasInputValue(fixedValue);
  const disableFixed = hasInputValue(minValue) || hasInputValue(maxValue);

  const { field: idField } = useController({
    control,
    name: `shiftGroups.${index}.id`,
  });

  return (
    <div className="flex flex-col gap-2 p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
      <input type="hidden" {...idField} />
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <RHFTextField
          control={control}
          name={`shiftGroups.${index}.label`}
          required
          size="small"
          label="ラベル名"
          sx={{ flexGrow: 1 }}
        />
        <button
          className="text-red-500 hover:bg-red-50 p-2 rounded-full transition self-end sm:self-auto"
          aria-label={`${labelValue || "未設定"}を削除`}
          onClick={handleDelete}
          type="button"
        >
          <SettingsIcon name="delete" />
        </button>
      </div>
      <RHFTextField
        control={control}
        name={`shiftGroups.${index}.description`}
        size="small"
        label="説明"
        helperText={SHIFT_GROUP_UI_TEXTS.descriptionHelperText}
        inputProps={{ maxLength: 50 }}
        fullWidth
      />
      <div className="flex flex-col sm:flex-row gap-2">
        <RHFTextField
          control={control}
          name={`shiftGroups.${index}.min`}
          size="small"
          type="number"
          label="最小人数 (min)"
          helperText={SHIFT_GROUP_VALIDATION_TEXTS.minOptional}
          disabled={disableMinMax}
          inputProps={{ min: 0 }}
          sx={{ flexGrow: 1 }}
        />
        <RHFTextField
          control={control}
          name={`shiftGroups.${index}.max`}
          size="small"
          type="number"
          label="最大人数 (max)"
          helperText={SHIFT_GROUP_VALIDATION_TEXTS.maxOptional}
          disabled={disableMinMax}
          inputProps={{ min: 0 }}
          sx={{ flexGrow: 1 }}
        />
        <RHFTextField
          control={control}
          name={`shiftGroups.${index}.fixed`}
          size="small"
          type="number"
          label="固定人数 (fixed)"
          helperText={SHIFT_GROUP_VALIDATION_TEXTS.fixedOptional}
          disabled={disableFixed}
          inputProps={{ min: 0 }}
          sx={{ flexGrow: 1 }}
        />
      </div>
      <span className="text-xs text-slate-500">
        {SHIFT_GROUP_UI_TEXTS.rangeAndFixedHint}
      </span>
    </div>
  );
};

export default React.memo(ShiftGroupRow);
