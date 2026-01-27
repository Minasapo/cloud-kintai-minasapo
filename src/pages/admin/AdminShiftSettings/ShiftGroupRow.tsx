import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { IconButton, Paper, Stack, TextField, Typography } from "@mui/material";

import {
  getHelperTexts,
  GroupValidationResult,
  ShiftGroupFormValue,
} from "./shiftGroupValidation";

type ShiftGroupRowProps = {
  group: ShiftGroupFormValue;
  validation: GroupValidationResult;
  onUpdate: (id: string, patch: Partial<Omit<ShiftGroupFormValue, "id">>) => void;
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
            value={group.label}
            onChange={(event) =>
              onUpdate(group.id, {
                label: event.target.value,
              })
            }
            error={labelError}
            helperText={labelError ? "ラベル名は必須です" : undefined}
            sx={{ flexGrow: 1 }}
          />
          <IconButton
            aria-label={`${group.label || "未設定"}を削除`}
            onClick={() => onDelete(group.id)}
            size="small"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
        <TextField
          size="small"
          label="説明"
          value={group.description}
          onChange={(event) =>
            onUpdate(group.id, {
              description: event.target.value,
            })
          }
          inputProps={{ maxLength: 48 }}
          helperText="50文字以内を目安に入力"
          fullWidth
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            size="small"
            type="number"
            label="最小人数 (min)"
            value={group.min}
            onChange={(event) =>
              onUpdate(group.id, {
                min: event.target.value,
              })
            }
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
            value={group.max}
            onChange={(event) =>
              onUpdate(group.id, {
                max: event.target.value,
              })
            }
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
            value={group.fixed}
            onChange={(event) =>
              onUpdate(group.id, {
                fixed: event.target.value,
              })
            }
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
          最小/最大 (レンジ指定) と固定人数は併用できません。いずれか一方のみ入力してください。
        </Typography>
      </Stack>
    </Paper>
  );
};

export default ShiftGroupRow;
