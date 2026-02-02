import { zodResolver } from "@hookform/resolvers/zod";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
// Title removed per admin UI simplification
import { useCallback, useContext, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

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
  SHIFT_GROUP_UI_TEXTS,
  ShiftGroupRow,
} from "./";
import { toShiftGroupFormValue } from "./shiftGroupFactory";
import type { ShiftGroupFormState } from "./shiftGroupSchema";
import { shiftGroupFormSchema } from "./shiftGroupSchema";

export default function AdminShiftSettings() {
  const { getShiftGroups, getConfigId, saveConfig, fetchConfig } =
    useContext(AppConfigContext);
  const dispatch = useAppDispatchV2();
  const [configId, setConfigId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<ShiftGroupFormState>({
    defaultValues: { shiftGroups: [] },
    resolver: zodResolver(shiftGroupFormSchema),
    mode: "onChange",
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "shiftGroups",
  });

  useEffect(() => {
    const initialGroups = getShiftGroups();
    reset({
      shiftGroups: initialGroups.map((group) => toShiftGroupFormValue(group)),
    });
    setConfigId(getConfigId());
    void trigger();
  }, [getConfigId, getShiftGroups, reset, trigger]);

  const handleAddGroup = () => {
    append(createShiftGroup());
    void trigger();
  };

  const hasValidationError = Object.keys(errors).length > 0;

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

  const handleSave = handleSubmit(async (values) => {
    if (saving) {
      return;
    }

    setSaving(true);
    const payloadShiftGroups = buildShiftGroupPayload(values.shiftGroups);

    try {
      await persistConfig(payloadShiftGroups);
    } catch (error) {
      console.error(error);
      dispatch(setSnackbarError(E14001));
    } finally {
      setSaving(false);
    }
  });

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
            {fields.length === 0 ? (
              <Alert severity="info" variant="outlined">
                {SHIFT_GROUP_UI_TEXTS.emptyGroups}
              </Alert>
            ) : (
              fields.map((group, index) => (
                <ShiftGroupRow
                  key={group.id}
                  control={control}
                  index={index}
                  onDelete={() => remove(index)}
                />
              ))
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
