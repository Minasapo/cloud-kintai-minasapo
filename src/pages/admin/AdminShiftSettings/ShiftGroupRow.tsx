import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import React, { useCallback } from "react";

import {
  getNumberFieldState,
  type NumberFieldKey,
  SHIFT_GROUP_UI_TEXTS,
  SHIFT_GROUP_VALIDATION_TEXTS,
} from "./";
import {
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
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  } => {
    if (key === "label") {
      return {
        ...getFieldProps(key),
        error: labelError,
        helperText: labelError
          ? SHIFT_GROUP_VALIDATION_TEXTS.labelRequired
          : undefined,
      };
    }

    return {
      ...getFieldProps(key),
      helperText: SHIFT_GROUP_UI_TEXTS.descriptionHelperText,
      inputProps: { maxLength: 48 },
    };
  };

  const getNumberFieldProps = (
    key: NumberFieldKey,
  ): {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    error: boolean;
    helperText: string;
    inputProps: { min: number };
  } => {
    const fieldProps = getFieldProps(key);
    return {
      ...fieldProps,
      inputProps: { min: 0 },
      ...getNumberFieldState(validation, key),
    };
  };

  type FieldDefinition =
    | {
        kind: "text";
        key: "label" | "description";
        label: string;
        required?: boolean;
        fullWidth?: boolean;
        sx?: { flexGrow: number };
      }
    | {
        kind: "number";
        key: NumberFieldKey;
        label: string;
      };

  const fieldDefinitions: FieldDefinition[] = [
    {
      kind: "text",
      key: "label",
      label: "ラベル名",
      required: true,
      sx: { flexGrow: 1 },
    },
    {
      kind: "text",
      key: "description",
      label: "説明",
      fullWidth: true,
    },
    { kind: "number", key: "min", label: "最小人数 (min)" },
    { kind: "number", key: "max", label: "最大人数 (max)" },
    { kind: "number", key: "fixed", label: "固定人数 (fixed)" },
  ];

  const renderTextField = (field: Extract<FieldDefinition, { kind: "text" }>) => (
    <TextField
      key={field.key}
      required={field.required}
      size="small"
      label={field.label}
      {...getTextFieldProps(field.key)}
      sx={field.sx}
      fullWidth={field.fullWidth}
    />
  );

  const renderNumberField = (
    field: Extract<FieldDefinition, { kind: "number" }>
  ) => (
    <TextField
      key={field.key}
      size="small"
      type="number"
      label={field.label}
      {...getNumberFieldProps(field.key)}
      sx={{ flexGrow: 1 }}
    />
  );

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
      <Stack spacing={1}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          {fieldDefinitions
            .filter((field): field is Extract<FieldDefinition, { kind: "text" }> =>
              field.kind === "text" && field.key === "label"
            )
            .map(renderTextField)}
          <IconButton
            aria-label={`${group.label || "未設定"}を削除`}
            onClick={handleDelete}
            size="small"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
        {fieldDefinitions
          .filter((field): field is Extract<FieldDefinition, { kind: "text" }> =>
            field.kind === "text" && field.key === "description"
          )
          .map(renderTextField)}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          {fieldDefinitions
            .filter((field): field is Extract<FieldDefinition, { kind: "number" }> =>
              field.kind === "number"
            )
            .map(renderNumberField)}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {SHIFT_GROUP_UI_TEXTS.rangeAndFixedHint}
        </Typography>
      </Stack>
    </Paper>
  );
};

export default React.memo(ShiftGroupRow);
