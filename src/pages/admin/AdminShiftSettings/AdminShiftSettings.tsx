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
import { useCallback, useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, S14001, S14002 } from "@/errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

import {
  buildShiftGroupPayload,
  createShiftGroup,
  ShiftGroupFormValue,
  ShiftGroupRow,
  toShiftGroupFormValue,
  useShiftGroupValidation,
} from "./";
import { SHIFT_GROUP_UI_TEXTS } from "./shiftGroupTexts.ui";

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
        toShiftGroupFormValue(group),
      ),
    );
    setConfigId(getConfigId());
  }, [getConfigId, getShiftGroups]);

  const { validationMap, hasValidationError } =
    useShiftGroupValidation(shiftGroups);

  const updateGroup = useCallback(
    (id: string, patch: Partial<Omit<ShiftGroupFormValue, "id">>) => {
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
    },
    [],
  );

  const handleAddGroup = () => {
    setShiftGroups((prev) => [...prev, createShiftGroup()]);
  };

  const handleDeleteGroup = useCallback((id: string) => {
    setShiftGroups((prev) => prev.filter((group) => group.id !== id));
  }, []);

  const persistConfig = useCallback(
    async (payloadShiftGroups: ReturnType<typeof buildShiftGroupPayload>) => {
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
    },
    [configId, dispatch, fetchConfig, saveConfig],
  );

  const handleSave = async () => {
    if (hasValidationError || saving) {
      return;
    }

    setSaving(true);
    const payloadShiftGroups = buildShiftGroupPayload(shiftGroups);

    try {
      await persistConfig(payloadShiftGroups);
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
        {SHIFT_GROUP_UI_TEXTS.intro}
      </Typography>
      <Alert severity="info">
        {SHIFT_GROUP_UI_TEXTS.saveInfo}
      </Alert>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={3}>
          <Typography variant="h6">シフトグループ</Typography>
          <Stack spacing={1.5}>
            {shiftGroups.length === 0 ? (
              <Alert severity="info" variant="outlined">
                {SHIFT_GROUP_UI_TEXTS.emptyGroups}
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
              {SHIFT_GROUP_UI_TEXTS.validationWarning}
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
