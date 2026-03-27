import { zodResolver } from "@hookform/resolvers/zod";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {
  Alert,
  FormLabel,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
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
import AdminSettingsLayout from "@/features/admin/layout/ui/AdminSettingsLayout";
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
    <AdminSettingsLayout title="シフト設定">
      <div className="flex flex-col gap-6">
        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200">
          <Tabs
            value={activeTab}
            onChange={(_, value: ShiftSettingsTab) => setActiveTab(value)}
            variant="fullWidth"
          >
            <Tab label="シフトグループ" value="shift-group" />
            <Tab label="シフト表示" value="shift-display" />
          </Tabs>
        </div>

        <div
          role="tabpanel"
          hidden={activeTab !== "shift-group"}
          aria-labelledby="shift-group-tab"
        >
          {activeTab === "shift-group" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-800">
                  {SHIFT_GROUP_UI_TEXTS.introTitle}
                </span>
                <ul className="list-disc pl-6 m-0 text-sm text-slate-600">
                  {SHIFT_GROUP_UI_TEXTS.introBullets.map((text) => (
                    <li key={text}>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
              <Alert severity="info">{SHIFT_GROUP_UI_TEXTS.saveInfo}</Alert>

              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="flex flex-col gap-6">
                  <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">シフトグループ</h3>
                  <div className="flex flex-col gap-4">
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
                  </div>
                  <button
                    className="flex flex-row items-center gap-2 self-start px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                    onClick={handleAddGroup}
                    type="button"
                  >
                    <AddCircleOutlineIcon className="text-slate-500" fontSize="small" />
                    <span>グループを追加</span>
                  </button>
                  {hasValidationError && (
                    <Alert severity="warning">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm">
                          {SHIFT_GROUP_UI_TEXTS.validationWarning}
                        </span>
                        <ul className="list-disc pl-6 m-0 text-sm">
                          {validationDetails.map((detail) => (
                            <li key={detail}>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Alert>
                  )}
                </div>
              </div>

              <div className="flex flex-row justify-end pb-8">
                <button
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                  onClick={handleSave}
                  disabled={hasValidationError || savingShiftGroup}
                  type="button"
                >
                  {savingShiftGroup ? "保存中..." : "保存"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          role="tabpanel"
          hidden={activeTab !== "shift-display"}
          aria-labelledby="shift-display-tab"
        >
          {activeTab === "shift-display" && (
            <div className="flex flex-col gap-6">
              <Alert severity="info">
                シフト管理画面の表示モードを設定します。
              </Alert>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="flex flex-col gap-6">
                  <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">シフト表示</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <FormLabel>表示モード</FormLabel>
                      <div>
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
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">
                      スタッフ側への設定反映には数分程度かかる場合があります。
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row justify-end pb-8">
                <button
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                  onClick={handleShiftDisplaySave}
                  disabled={savingShiftDisplay}
                  type="button"
                >
                  {savingShiftDisplay ? "保存中..." : "保存"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminSettingsLayout>
  );
}
