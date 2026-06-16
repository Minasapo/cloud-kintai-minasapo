import { StaffFormValues } from "@features/admin/staff/model/staffForm";
import { Checkbox } from "@mui/material";
import { Control, Controller, UseFormSetValue } from "react-hook-form";

const LABEL_CELL_CLASS =
  "w-[220px] min-w-[180px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900";
const VALUE_CELL_CLASS = "border-b border-slate-200 px-4 py-3 align-middle";

type AdvancedTabContentProps = {
  control: Control<StaffFormValues>;
  setValue: UseFormSetValue<StaffFormValues>;
};

export function AdvancedTabContent({ control, setValue }: AdvancedTabContentProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px]">
        <tbody>
          <tr>
            <td className={LABEL_CELL_CLASS}>開発者フラグ</td>
            <td className={VALUE_CELL_CLASS}>
              <Controller
                name="developer"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    data-testid="developer-flag-checkbox"
                    checked={Boolean(field.value)}
                    onChange={(e) => {
                      setValue("developer", e.target.checked, {
                        shouldDirty: true,
                      });
                      field.onChange(e.target.checked);
                    }}
                  />
                )}
              />
              <p className="text-sm text-slate-500">
                開発用の機能を表示するための設定です。
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}