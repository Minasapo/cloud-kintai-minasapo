import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { StaffFormValues } from "@features/admin/staff/model/staffForm";
import { ApproverSettingTableRows } from "@features/admin/staff/ui/shared/ApproverSettingTableRows";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { ApproverSettingMode } from "@shared/api/graphql/types";
import {
  Control,
  Controller,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

const LABEL_CELL_CLASS =
  "w-[220px] min-w-[180px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900";
const VALUE_CELL_CLASS = "border-b border-slate-200 px-4 py-3 align-middle";

type WorkflowTabContentProps = {
  control: Control<StaffFormValues>;
  setValue: UseFormSetValue<StaffFormValues>;
  watch: UseFormWatch<StaffFormValues>;
  cognitoUser: { id?: string; owner?: boolean | null } | null | undefined;
  staffs: StaffType[];
};

export function WorkflowTabContent({
  control,
  watch,
  staffs,
  cognitoUser,
}: WorkflowTabContentProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px]">
        <tbody>
          <tr>
            <td className={LABEL_CELL_CLASS}>承認者設定</td>
            <td className={VALUE_CELL_CLASS}>
              <Controller
                name="approverSetting"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    row
                    value={field.value}
                    onChange={(e) => {
                      const v = e.target.value as ApproverSettingMode;
                      field.onChange(v);
                    }}
                  >
                    <FormControlLabel
                      value={ApproverSettingMode.ADMINS}
                      control={<Radio />}
                      label="管理者全員 (デフォルト)"
                    />
                    <FormControlLabel
                      value={ApproverSettingMode.SINGLE}
                      control={<Radio />}
                      label="特定の承認者を1名に限定"
                    />
                    <FormControlLabel
                      value={ApproverSettingMode.MULTIPLE}
                      control={<Radio />}
                      label="特定の承認者を複数選択"
                    />
                  </RadioGroup>
                )}
              />
            </td>
          </tr>

          <ApproverSettingTableRows
            control={control}
            watch={watch}
            staffs={staffs}
            currentCognitoUserId={cognitoUser?.id}
            labelCellClassName={LABEL_CELL_CLASS}
            valueCellClassName={VALUE_CELL_CLASS}
          />
        </tbody>
      </table>
    </div>
  );
}
