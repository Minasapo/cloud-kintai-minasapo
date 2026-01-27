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

  const getTextFieldProps = (
    key: "label" | "description",
  ): {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    error?: boolean;
    helperText?: string;
  } => {
    if (key === "label") {
      return {
        ...getFieldProps(key),
        error: labelError,
        helperText: labelError
          ? SHIFT_GROUP_TEXTS.validation.labelRequired
          : undefined,
      };
    }

    return {
      ...getFieldProps(key),
      helperText: SHIFT_GROUP_TEXTS.ui.descriptionHelperText,
    };
  };

  const getNumberFieldState = (
    key: "min" | "max" | "fixed",
  ): { error: boolean; helperText: string } => {
    switch (key) {
      case "min":
        return {
          error:
            validation.minInputError || validation.fixedWithRangeConflict,
          helperText: minHelperText,
        };
      case "max":
        return {
          error:
            validation.maxInputError ||
            validation.rangeError ||
            validation.fixedWithRangeConflict,
          helperText: maxHelperText,
        };
      case "fixed":
      default:
        return {
          error:
            validation.fixedInputError ||
            validation.fixedBelowMin ||
            validation.fixedAboveMax ||
            validation.fixedWithRangeConflict,
          helperText: fixedHelperText,
        };
    }
  };

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
            {...getTextFieldProps("label")}
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
          {...getTextFieldProps("description")}
          inputProps={{ maxLength: 48 }}
          fullWidth
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            size="small"
            type="number"
            label="最小人数 (min)"
            {...getFieldProps("min")}
            inputProps={{ min: 0 }}
            {...getNumberFieldState("min")}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            size="small"
            type="number"
            label="最大人数 (max)"
            {...getFieldProps("max")}
            inputProps={{ min: 0 }}
            {...getNumberFieldState("max")}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            size="small"
            type="number"
            label="固定人数 (fixed)"
            {...getFieldProps("fixed")}
            inputProps={{ min: 0 }}
            {...getNumberFieldState("fixed")}
            sx={{ flexGrow: 1 }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {SHIFT_GROUP_TEXTS.ui.rangeAndFixedHint}
        </Typography>
      </Stack>
    </Paper>
  );
};

export default React.memo(ShiftGroupRow);
