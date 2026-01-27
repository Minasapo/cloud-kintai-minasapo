import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {
  Alert,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
// Title removed per admin UI simplification
import { useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, S14001, S14002 } from "@/errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

import {
  parseOptionalInteger,
  ShiftGroupFormValue,
} from "./shiftGroupValidation";
import ShiftGroupRow from "./ShiftGroupRow";
import useShiftGroupValidation from "./useShiftGroupValidation";

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

  const { validationMap, hasValidationError } =
    useShiftGroupValidation(shiftGroups);

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
                return (
                  <ShiftGroupRow
                    key={group.id}
                    group={group}
                    validation={validation}
                    onUpdate={updateGroup}
                    onDelete={handleDeleteGroup}
                  />
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
