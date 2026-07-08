import { useAppDispatchV2 } from "@app/hooks";
import AdminSettingsLayout from "@features/admin/layout/ui/AdminSettingsLayout";
import { useAdminShiftSettings } from "@features/admin-config-shift/useAdminShiftSettings";
import { Tab, Tabs } from "@mui/material";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { usePageLeaveGuard } from "@shared/ui/feedback/usePageLeaveGuard";
import { useCallback, useState } from "react";

import { S14001, S14002 } from "@/errors";

import ShiftDisplaySettingsPanel from "./ShiftDisplaySettingsPanel";
import ShiftGroupSettingsPanel from "./ShiftGroupSettingsPanel";

type ShiftSettingsTab = "shift-group" | "shift-display";

const SHIFT_SETTINGS_TABS: ReadonlyArray<{
  value: ShiftSettingsTab;
  label: string;
}> = [
  { value: "shift-group", label: "シフトグループ" },
  { value: "shift-display", label: "シフト表示" },
];

const getTabId = (tab: ShiftSettingsTab) => `admin-shift-settings-tab-${tab}`;
const getPanelId = (tab: ShiftSettingsTab) =>
  `admin-shift-settings-panel-${tab}`;

export default function AdminShiftSettings() {
  const dispatch = useAppDispatchV2();
  const [activeTab, setActiveTab] = useState<ShiftSettingsTab>("shift-group");

  const handleSaveSuccess = useCallback(
    (isUpdate: boolean) => {
      dispatch(
        pushNotification({
          tone: "success",
          message: isUpdate ? S14002 : S14001,
        }),
      );
    },
    [dispatch],
  );

  const {
    control,
    fields,
    validationDetails,
    hasValidationError,
    savingShiftGroup,
    savingShiftDisplay,
    isDirty,
    isBusy,
    shiftDefaultMode,
    setShiftDefaultMode,
    handleAddGroup,
    handleRemoveGroup,
    handleSaveShiftGroup,
    handleSaveShiftDisplay,
  } = useAdminShiftSettings({
    enableShiftDisplayAutoSave: false,
    onShiftDisplaySaveSuccess: handleSaveSuccess,
  });

  const { dialog } = usePageLeaveGuard({
    isDirty,
    isBusy,
  });

  return (
    <AdminSettingsLayout>
      {dialog}
      <div className="flex flex-col gap-6">
        <div className="rounded-lg border border-slate-200 bg-white px-2 pt-2 shadow-sm">
          <Tabs
            value={activeTab}
            onChange={(_, newValue: ShiftSettingsTab) => setActiveTab(newValue)}
            aria-label="シフト設定タブ"
            variant="fullWidth"
            selectionFollowsFocus
          >
            {SHIFT_SETTINGS_TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                id={getTabId(tab.value)}
                aria-controls={getPanelId(tab.value)}
              />
            ))}
          </Tabs>
        </div>

        <div
          id={getPanelId("shift-group")}
          role="tabpanel"
          hidden={activeTab !== "shift-group"}
          aria-labelledby={getTabId("shift-group")}
        >
          {activeTab === "shift-group" && (
            <ShiftGroupSettingsPanel
              control={control}
              fields={fields}
              validationDetails={validationDetails}
              hasValidationError={hasValidationError}
              savingShiftGroup={savingShiftGroup}
              onAddGroup={handleAddGroup}
              onRemoveGroup={handleRemoveGroup}
              onSaveShiftGroup={handleSaveShiftGroup}
            />
          )}
        </div>

        <div
          id={getPanelId("shift-display")}
          role="tabpanel"
          hidden={activeTab !== "shift-display"}
          aria-labelledby={getTabId("shift-display")}
        >
          {activeTab === "shift-display" && (
            <ShiftDisplaySettingsPanel
              shiftDefaultMode={shiftDefaultMode}
              savingShiftDisplay={savingShiftDisplay}
              onSwitchShiftDefaultMode={setShiftDefaultMode}
              onSaveShiftDisplay={handleSaveShiftDisplay}
            />
          )}
        </div>
      </div>
    </AdminSettingsLayout>
  );
}
