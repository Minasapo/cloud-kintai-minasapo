import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import React, { useCallback } from "react";

import { SHIFT_GROUP_TEXTS } from "./shiftGroupTexts";
import {
  getHelperTexts,
  GroupValidationResult,
  ShiftGroupFormValue,
} from "./shiftGroupValidation";

type ShiftGroupRowProps = {
  group: ShiftGroupFormValue;
  validation: GroupValidationResult;
  onUpdate: (
    id: string,
    patch: Partial<Omit<ShiftGroupFormValue, "id">>,
  ) => void;
  onDelete: (id: string) => void;
};

const ShiftGroupRow: React.FC<ShiftGroupRowProps> = ({
  group,
  validation,
  onUpdate,
  onDelete,
}: ShiftGroupRowProps) => {
  const labelError = validation.labelError;
  const { minHelperText, maxHelperText, fixedHelperText } =
    getHelperTexts(validation);
  const handleChange = useCallback(
    (key: keyof Omit<ShiftGroupFormValue, "id">) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(group.id, { [key]: event.target.value });
      },
    [group.id, onUpdate],
  );
  const handleDelete = useCallback(() => {
    onDelete(group.id);
  }, [group.id, onDelete]);

  const getFieldProps = (
    key: keyof Omit<ShiftGroupFormValue, "id">,
  ) => ({
    value: group[key],
    onChange: handleChange(key),
  });

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
      <Stack spacing={1}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <TextField
            required
            size="small"
            label="ラベル名"
            {...getFieldProps("label")}
            error={labelError}
            helperText={
              labelError ? SHIFT_GROUP_TEXTS.labelRequired : undefined
            }
            sx={{ flexGrow: 1 }}
          />
          <IconButton
            aria-label={`${group.label || "未設定"}を削除`}
            onClick={handleDelete}
            size="small"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
        <TextField
          size="small"
          label="説明"
          {...getFieldProps("description")}
          inputProps={{ maxLength: 48 }}
          helperText="50文字以内を目安に入力"
          fullWidth
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            size="small"
            type="number"
            label="最小人数 (min)"
            {...getFieldProps("min")}
            inputProps={{ min: 0 }}
            error={
              validation.minInputError || validation.fixedWithRangeConflict
            }
            helperText={minHelperText}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            size="small"
            type="number"
            label="最大人数 (max)"
            {...getFieldProps("max")}
            inputProps={{ min: 0 }}
            error={
              validation.maxInputError ||
              validation.rangeError ||
              validation.fixedWithRangeConflict
            }
            helperText={maxHelperText}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            size="small"
            type="number"
            label="固定人数 (fixed)"
            {...getFieldProps("fixed")}
            inputProps={{ min: 0 }}
            error={
              validation.fixedInputError ||
              validation.fixedBelowMin ||
              validation.fixedAboveMax ||
              validation.fixedWithRangeConflict
            }
            helperText={fixedHelperText}
            sx={{ flexGrow: 1 }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {SHIFT_GROUP_TEXTS.rangeAndFixedHint}
        </Typography>
      </Stack>
    </Paper>
  );
};

export default React.memo(ShiftGroupRow);
