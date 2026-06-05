import SettingsIcon from "@features/admin/layout/ui/SettingsIcon";
import {
  SettingsAlert,
  SettingsButton,
} from "@features/admin/layout/ui/SettingsPrimitives";
import { SubsectionTitle } from "@shared/ui/typography";
import type { Control, FieldArrayWithId } from "react-hook-form";

import { SHIFT_GROUP_UI_TEXTS, ShiftGroupRow } from "./";
import type { ShiftGroupFormState } from "./shiftGroupSchema";

type ShiftGroupField = FieldArrayWithId<
  ShiftGroupFormState,
  "shiftGroups",
  "id"
>;

type ShiftGroupSettingsPanelProps = {
  control: Control<ShiftGroupFormState>;
  fields: ShiftGroupField[];
  validationDetails: string[];
  hasValidationError: boolean;
  savingShiftGroup: boolean;
  onAddGroup: () => void;
  onRemoveGroup: (index: number) => void;
  onSaveShiftGroup: () => void;
};

export default function ShiftGroupSettingsPanel({
  control,
  fields,
  validationDetails,
  hasValidationError,
  savingShiftGroup,
  onAddGroup,
  onRemoveGroup,
  onSaveShiftGroup,
}: ShiftGroupSettingsPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-800">
          {SHIFT_GROUP_UI_TEXTS.introTitle}
        </span>
        <ul className="m-0 list-disc pl-6 text-sm text-slate-600">
          {SHIFT_GROUP_UI_TEXTS.introBullets.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </div>
      <SettingsAlert>{SHIFT_GROUP_UI_TEXTS.saveInfo}</SettingsAlert>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-6">
          <SubsectionTitle className="border-b border-slate-100 pb-2 text-lg font-semibold text-slate-800">
            シフトグループ
          </SubsectionTitle>
          <div className="flex flex-col gap-4">
            {fields.length === 0 ? (
              <SettingsAlert>{SHIFT_GROUP_UI_TEXTS.emptyGroups}</SettingsAlert>
            ) : (
              fields.map((group, index) => (
                <ShiftGroupRow
                  key={group.id}
                  control={control}
                  index={index}
                  onDelete={() => onRemoveGroup(index)}
                />
              ))
            )}
          </div>
          <button
            className="flex flex-row items-center gap-2 self-start rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50"
            onClick={onAddGroup}
            type="button"
          >
            <SettingsIcon name="plus" className="text-slate-500" />
            <span>グループを追加</span>
          </button>
          {hasValidationError && (
            <SettingsAlert variant="warning">
              <div className="flex flex-col gap-2">
                <span className="text-sm">
                  {SHIFT_GROUP_UI_TEXTS.validationWarning}
                </span>
                <ul className="m-0 list-disc pl-6 text-sm">
                  {validationDetails.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            </SettingsAlert>
          )}
        </div>
      </div>

      <div className="flex flex-row justify-end pb-8">
        <SettingsButton
          onClick={onSaveShiftGroup}
          disabled={hasValidationError || savingShiftGroup}
        >
          {savingShiftGroup ? "保存中..." : "保存"}
        </SettingsButton>
      </div>
    </div>
  );
}
