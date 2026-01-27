import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Alert,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
// Title removed per admin UI simplification
import { useContext, useEffect, useMemo, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, S14001, S14002 } from "@/errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

import {
  GroupValidationResult,
  getGroupValidation,
  getHelperTexts,
  parseOptionalInteger,
  ShiftGroupFormValue,
} from "./shiftGroupValidation";

const createShiftGroup = (
  initial?: Partial<ShiftGroupFormValue>,
): ShiftGroupFormValue => ({
  id: `sg-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
  label: "",
  description: "",
  min: "",
  max: "",
  fixed: "",
  ...initial,
});

export default function AdminShiftSettings() {
  const { getShiftGroups, getConfigId, saveConfig, fetchConfig } =
    useContext(AppConfigContext);
  const dispatch = useAppDispatchV2();
  const [shiftGroups, setShiftGroups] = useState<ShiftGroupFormValue[]>([]);
  const [configId, setConfigId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initialGroups = getShiftGroups();
    setShiftGroups(() =>
      initialGroups.map((group) =>
        createShiftGroup({
          label: group.label ?? "",
          description: group.description ?? "",
          min:
            typeof group.min === "number" && !Number.isNaN(group.min)
              ? String(group.min)
              : "",
          max:
            typeof group.max === "number" && !Number.isNaN(group.max)
              ? String(group.max)
              : "",
          fixed:
            typeof group.fixed === "number" && !Number.isNaN(group.fixed)
              ? String(group.fixed)
              : "",
        }),
      ),
    );
    setConfigId(getConfigId());
  }, [getConfigId, getShiftGroups]);

  const { validationMap, hasValidationError } = useMemo(() => {
    const map = new Map<string, GroupValidationResult>();
    let hasError = false;
    shiftGroups.forEach((group) => {
      const validation = getGroupValidation(group);
      map.set(group.id, validation);
      if (validation.hasError) {
        hasError = true;
      }
    });
    return { validationMap: map, hasValidationError: hasError };
  }, [shiftGroups]);

  const updateGroup = (
    id: string,
    patch: Partial<Omit<ShiftGroupFormValue, "id">>,
  ) => {
    setShiftGroups((prev) =>
      prev.map((group) =>
        group.id === id
          ? {
              ...group,
              ...patch,
            }
          : group,
      ),
    );
  };

  const handleAddGroup = () => {
    setShiftGroups((prev) => [...prev, createShiftGroup()]);
  };

  const handleDeleteGroup = (id: string) => {
    setShiftGroups((prev) => prev.filter((group) => group.id !== id));
  };

  const handleSave = async () => {
    if (hasValidationError || saving) {
      return;
    }

    setSaving(true);
    const payloadShiftGroups = shiftGroups.map((group) => ({
      label: group.label.trim(),
      description: group.description.trim() ? group.description.trim() : null,
      min: parseOptionalInteger(group.min),
      max: parseOptionalInteger(group.max),
      fixed: parseOptionalInteger(group.fixed),
    }));

    try {
      if (configId) {
        await saveConfig({
          id: configId,
          shiftGroups: payloadShiftGroups,
        } as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          shiftGroups: payloadShiftGroups,
        } as CreateAppConfigInput);
        dispatch(setSnackbarSuccess(S14001));
      }
      await fetchConfig();
    } catch (error) {
      console.error(error);
      dispatch(setSnackbarError(E14001));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Typography>
        シフトグループを定義し、公開範囲や担当者単位でシフトを整理できます。
        ラベル・説明に加えて、各グループの最小／最大人数、または固定人数を任意で設定し、必要に応じて追加・編集・削除してください（レンジ指定と固定人数は同時に使用できません）。
      </Typography>
      <Alert severity="info">
        入力内容は「保存」ボタンを押すと全社設定に反映され、以降の画面で参照できます。
        編集途中の変更は自動保存されないためご注意ください。
      </Alert>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={3}>
          <Typography variant="h6">シフトグループ</Typography>
          <Stack spacing={1.5}>
            {shiftGroups.length === 0 ? (
              <Alert severity="info" variant="outlined">
                現在登録されているシフトグループはありません。「グループを追加」から新規に追加できます。
              </Alert>
            ) : (
              shiftGroups.map((group) => {
                const validation = validationMap.get(group.id)!;
                const labelError = validation.labelError;
                const { minHelperText, maxHelperText, fixedHelperText } =
                  getHelperTexts(validation);
                return (
                  <Paper
                    key={group.id}
                    variant="outlined"
                    sx={{ p: 1.5, borderRadius: 2 }}
                  >
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
                            updateGroup(group.id, {
                              label: event.target.value,
                            })
                          }
                          error={labelError}
                          helperText={
                            labelError ? "ラベル名は必須です" : undefined
                          }
                          sx={{ flexGrow: 1 }}
                        />
                        <IconButton
                          aria-label={`${group.label || "未設定"}を削除`}
                          onClick={() => handleDeleteGroup(group.id)}
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
                          updateGroup(group.id, {
                            description: event.target.value,
                          })
                        }
                        inputProps={{ maxLength: 48 }}
                        helperText="50文字以内を目安に入力"
                        fullWidth
                      />
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                      >
                        <TextField
                          size="small"
                          type="number"
                          label="最小人数 (min)"
                          value={group.min}
                          onChange={(event) =>
                            updateGroup(group.id, {
                              min: event.target.value,
                            })
                          }
                          inputProps={{ min: 0 }}
                          error={
                            validation.minInputError ||
                            validation.fixedWithRangeConflict
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
                            updateGroup(group.id, {
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
                            updateGroup(group.id, {
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
                        最小/最大 (レンジ指定)
                        と固定人数は併用できません。いずれか一方のみ入力してください。
                      </Typography>
                    </Stack>
                  </Paper>
                );
              })
            )}
          </Stack>
          <Button
            variant="outlined"
            onClick={handleAddGroup}
            startIcon={<AddCircleOutlineIcon />}
          >
            グループを追加
          </Button>
          {hasValidationError && (
            <Alert severity="warning">
              ラベル未入力、または人数設定に誤りのあるグループがあります。保存前に修正してください。
            </Alert>
          )}
        </Stack>
      </Paper>

      <Stack direction="row" justifyContent="flex-end" sx={{ pb: 4 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={hasValidationError || saving}
        >
          {saving ? "保存中..." : "保存"}
        </Button>
      </Stack>
    </Stack>
  );
}
