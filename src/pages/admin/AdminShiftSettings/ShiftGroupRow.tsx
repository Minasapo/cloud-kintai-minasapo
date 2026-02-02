import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { IconButton, Paper, Stack, Typography } from "@mui/material";
import React, { useCallback } from "react";
import type { Control } from "react-hook-form";
import { useController, useWatch } from "react-hook-form";

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
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
      <Stack spacing={1}>
        <input type="hidden" {...idField} />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <RHFTextField
            control={control}
            name={`shiftGroups.${index}.label`}
            required
            size="small"
            label="ラベル名"
            sx={{ flexGrow: 1 }}
          />
          <IconButton
            aria-label={`${labelValue || "未設定"}を削除`}
            onClick={handleDelete}
            size="small"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
        <RHFTextField
          control={control}
          name={`shiftGroups.${index}.description`}
          size="small"
          label="説明"
          helperText={SHIFT_GROUP_UI_TEXTS.descriptionHelperText}
          inputProps={{ maxLength: 50 }}
          fullWidth
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
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
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {SHIFT_GROUP_UI_TEXTS.rangeAndFixedHint}
        </Typography>
      </Stack>
    </Paper>
  );
};

export default React.memo(ShiftGroupRow);
