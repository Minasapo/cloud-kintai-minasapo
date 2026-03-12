import { zodResolver } from "@hookform/resolvers/zod";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {
  Alert,
  Box,
  Button,
  FormLabel,
  Paper,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
// Title removed per admin UI simplification
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import type { ShiftDisplayMode } from "@/entities/app-config/model/useAppConfig";
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

const SHIFT_GROUP_ERROR_FIELDS = [
  { key: "label", label: "ラベル名" },
  { key: "min", label: "最小人数" },
  { key: "max", label: "最大人数" },
  { key: "fixed", label: "固定人数" },
] as const;

type ShiftSettingsTab = "shift-group" | "shift-display";

const getValidationDetails = (errors: {
  shiftGroups?: Array<Record<string, { message?: unknown } | undefined>>;
}) => {
  const details: string[] = [];

  errors.shiftGroups?.forEach((groupError, index) => {
    if (!groupError) {
      return;
    }

    const messageToLabels = new Map<string, string[]>();
    SHIFT_GROUP_ERROR_FIELDS.forEach(({ key, label }) => {
      const message = groupError[key]?.message;
      if (typeof message !== "string" || message.length === 0) {
        return;
      }

      const labels = messageToLabels.get(message) ?? [];
      if (!labels.includes(label)) {
        labels.push(label);
      }
      messageToLabels.set(message, labels);
    });

    messageToLabels.forEach((labels, message) => {
      const labelText = labels.join(" / ");
      details.push(`${index + 1}行目 ${labelText}: ${message}`);
    });
  });

  return details;
};

export default function AdminShiftSettings() {
  const {
    getShiftGroups,
    getConfigId,
    saveConfig,
    fetchConfig,
    getShiftDefaultMode,
  } = useContext(AppConfigContext);
  const dispatch = useAppDispatchV2();
  const [configId, setConfigId] = useState<string | null>(null);
  const [savingShiftGroup, setSavingShiftGroup] = useState(false);
  const [savingShiftDisplay, setSavingShiftDisplay] = useState(false);
  const [activeTab, setActiveTab] = useState<ShiftSettingsTab>("shift-group");
  const [shiftDefaultMode, setShiftDefaultMode] =
    useState<ShiftDisplayMode>("normal");

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
    if (typeof getShiftDefaultMode === "function") {
      setShiftDefaultMode(getShiftDefaultMode());
    }
    void trigger();
  }, [getConfigId, getShiftDefaultMode, getShiftGroups, reset, trigger]);

  const handleAddGroup = () => {
    append(createShiftGroup());
    void trigger();
  };

  const validationDetails = useMemo(
    () =>
      getValidationDetails(
        errors as {
          shiftGroups?: Array<
            Record<string, { message?: unknown } | undefined>
          >;
        },
      ),
    [errors],
  );
  const hasValidationError = validationDetails.length > 0;

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
    if (savingShiftGroup) {
      return;
    }

    setSavingShiftGroup(true);
    const payloadShiftGroups = buildShiftGroupPayload(values.shiftGroups);

    try {
      await persistConfig(payloadShiftGroups);
    } catch (error) {
      console.error(error);
      dispatch(setSnackbarError(E14001));
    } finally {
      setSavingShiftGroup(false);
    }
  });

  const handleShiftDisplaySave = async () => {
    if (savingShiftDisplay) {
      return;
    }

    setSavingShiftDisplay(true);

    try {
      const payload = {
        shiftCollaborativeEnabled: true,
        shiftDefaultMode,
      };

      if (configId) {
        await saveConfig({
          id: configId,
          ...payload,
        } as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          ...payload,
        } as CreateAppConfigInput);
        dispatch(setSnackbarSuccess(S14001));
      }
      await fetchConfig();
    } catch (error) {
      console.error(error);
      dispatch(setSnackbarError(E14001));
    } finally {
      setSavingShiftDisplay(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value: ShiftSettingsTab) => setActiveTab(value)}
          variant="fullWidth"
        >
          <Tab label="シフトグループ" value="shift-group" />
          <Tab label="シフト表示" value="shift-display" />
        </Tabs>
      </Paper>

      <Box
        role="tabpanel"
        hidden={activeTab !== "shift-group"}
        aria-labelledby="shift-group-tab"
      >
        {activeTab === "shift-group" && (
          <Stack spacing={2.5}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">
                {SHIFT_GROUP_UI_TEXTS.introTitle}
              </Typography>
              <Stack component="ul" sx={{ m: 0, pl: 3 }}>
                {SHIFT_GROUP_UI_TEXTS.introBullets.map((text) => (
                  <Typography key={text} component="li" variant="body2">
                    {text}
                  </Typography>
                ))}
              </Stack>
            </Stack>
            <Alert severity="info">{SHIFT_GROUP_UI_TEXTS.saveInfo}</Alert>

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
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        {SHIFT_GROUP_UI_TEXTS.validationWarning}
                      </Typography>
                      <Stack component="ul" sx={{ m: 0, pl: 3 }}>
                        {validationDetails.map((detail) => (
                          <Typography
                            key={detail}
                            component="li"
                            variant="body2"
                          >
                            {detail}
                          </Typography>
                        ))}
                      </Stack>
                    </Stack>
                  </Alert>
                )}
              </Stack>
            </Paper>

            <Stack direction="row" justifyContent="flex-end" sx={{ pb: 4 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={hasValidationError || savingShiftGroup}
              >
                {savingShiftGroup ? "保存中..." : "保存"}
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>

      <Box
        role="tabpanel"
        hidden={activeTab !== "shift-display"}
        aria-labelledby="shift-display-tab"
      >
        {activeTab === "shift-display" && (
          <Stack spacing={2.5}>
            <Alert severity="info">
              シフト管理画面の表示モードを設定します。
            </Alert>
            <Paper sx={{ p: 2 }}>
              <Stack spacing={3}>
                <Typography variant="h6">シフト表示</Typography>
                <Stack spacing={1.5}>
                  <Stack spacing={1}>
                    <FormLabel>表示モード</FormLabel>
                    <ToggleButtonGroup
                      color="primary"
                      exclusive
                      size="small"
                      value={shiftDefaultMode}
                      onChange={(_, value: ShiftDisplayMode | null) => {
                        if (!value) {
                          return;
                        }
                        setShiftDefaultMode(value);
                      }}
                    >
                      <ToggleButton value="normal">通常モード</ToggleButton>
                      <ToggleButton value="collaborative">
                        共同編集モード
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                  <Typography variant="body2" color="textSecondary">
                    スタッフ側への設定反映には数分程度かかる場合があります。
                  </Typography>
                </Stack>
              </Stack>
            </Paper>

            <Stack direction="row" justifyContent="flex-end" sx={{ pb: 4 }}>
              <Button
                variant="contained"
                onClick={handleShiftDisplaySave}
                disabled={savingShiftDisplay}
              >
                {savingShiftDisplay ? "保存中..." : "保存"}
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
