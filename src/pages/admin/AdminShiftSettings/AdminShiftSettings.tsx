import { useAppDispatchV2 } from "@app/hooks";
import AdminSettingsLayout from "@features/admin/layout/ui/AdminSettingsLayout";
import { useAdminShiftSettings } from "@features/admin-config-shift/useAdminShiftSettings";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { usePageLeaveGuard } from "@shared/ui/feedback/usePageLeaveGuard";
import { useCallback, useRef, useState } from "react";

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
  const tabRefs = useRef<Record<ShiftSettingsTab, HTMLButtonElement | null>>({
    "shift-group": null,
    "shift-display": null,
  });

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

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentTab: ShiftSettingsTab,
  ) => {
    const currentIndex = SHIFT_SETTINGS_TABS.findIndex(
      (tab) => tab.value === currentTab,
    );

    if (currentIndex < 0) {
      return;
    }

    const moveFocusTo = (nextIndex: number) => {
      const nextTab = SHIFT_SETTINGS_TABS[nextIndex];
      if (!nextTab) {
        return;
      }
      setActiveTab(nextTab.value);
      tabRefs.current[nextTab.value]?.focus();
    };

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveFocusTo((currentIndex + 1) % SHIFT_SETTINGS_TABS.length);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveFocusTo(
        (currentIndex - 1 + SHIFT_SETTINGS_TABS.length) %
          SHIFT_SETTINGS_TABS.length,
      );
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      moveFocusTo(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      moveFocusTo(SHIFT_SETTINGS_TABS.length - 1);
    }
  };

  return (
    <AdminSettingsLayout>
      {dialog}
      <div className="flex flex-col gap-6">
        <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
          <div
            className="grid grid-cols-2 gap-2"
            role="tablist"
            aria-label="シフト設定タブ"
          >
            {SHIFT_SETTINGS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                id={getTabId(tab.value)}
                aria-selected={activeTab === tab.value}
                aria-controls={getPanelId(tab.value)}
                tabIndex={activeTab === tab.value ? 0 : -1}
                onClick={() => setActiveTab(tab.value)}
                onKeyDown={(event) => handleTabKeyDown(event, tab.value)}
                ref={(element) => {
                  tabRefs.current[tab.value] = element;
                }}
                className={[
                  "rounded-xl px-4 py-3 text-sm font-medium transition",
                  activeTab === tab.value
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </div>
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
