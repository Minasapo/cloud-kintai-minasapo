import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { StaffFormValues } from "@features/admin/staff/model/staffForm";
import { ApproverSettingTableRows } from "@features/admin/staff/ui/shared/ApproverSettingTableRows";
import { Checkbox, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { ApproverSettingMode } from "@shared/api/graphql/types";
import { AppTextField } from "@shared/ui/form";
import dayjs from "dayjs";
import {
  Control,
  Controller,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import { MailAddressTableCell } from "./MailAddressTableCell";
import { ShiftGroupRow } from "./ShiftGroupRow";
import { StaffNameTableCell } from "./StaffNameTableCell";
import { StaffRoleTableCell } from "./StaffRoleTableCell";
import { WorkTypeRow } from "./WorkTypeRow";

const LABEL_CELL_CLASS =
  "w-[220px] min-w-[180px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900";
const VALUE_CELL_CLASS = "border-b border-slate-200 px-4 py-3 align-middle";

type GeneralTabContentProps = {
  register: UseFormRegister<StaffFormValues>;
  control: Control<StaffFormValues>;
  setValue: UseFormSetValue<StaffFormValues>;
  watch: UseFormWatch<StaffFormValues>;
  cognitoUser: { id?: string; owner?: boolean | null } | null | undefined;
  staffs: StaffType[];
  shiftGroupOptions: { value: string; label: string }[];
};

export function GeneralTabContent({
  register,
  control,
  setValue,
  watch,
  cognitoUser,
  staffs,
  shiftGroupOptions,
}: GeneralTabContentProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px]">
        <tbody>
          <>
            <tr>
              <td className={LABEL_CELL_CLASS}>汎用コード</td>
              <td className={VALUE_CELL_CLASS}>
                <AppTextField
                  {...register("sortKey")}
                  size="small"
                  sx={{ width: { xs: "100%", sm: 400 } }}
                  placeholder="例：1、2、3...やZZ001、ZZ002...など"
                />
              </td>
            </tr>

            <tr>
              <td className={LABEL_CELL_CLASS}>スタッフ名</td>
              <td className={VALUE_CELL_CLASS}>
                <StaffNameTableCell register={register} />
              </td>
            </tr>

            <tr>
              <td className={LABEL_CELL_CLASS}>メールアドレス</td>
              <td className={VALUE_CELL_CLASS}>
                <MailAddressTableCell register={register} />
              </td>
            </tr>

            <tr>
              <td className={LABEL_CELL_CLASS}>権限</td>
              <td className={VALUE_CELL_CLASS}>
                <StaffRoleTableCell control={control} setValue={setValue} />
              </td>
            </tr>

            {cognitoUser?.owner && (
              <tr>
                <td className={LABEL_CELL_CLASS}>オーナー権限</td>
                <td className={VALUE_CELL_CLASS}>
                  <Controller
                    name="owner"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        checked={Boolean(field.value)}
                        onChange={(e) => {
                          setValue("owner", e.target.checked);
                          field.onChange(e.target.checked);
                        }}
                      />
                    )}
                  />
                </td>
              </tr>
            )}

            <tr>
              <td className={LABEL_CELL_CLASS}>利用開始日</td>
              <td className={VALUE_CELL_CLASS}>
                <Controller
                  name="usageStartDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(v) => {
                        const next = v ? v.format("YYYY-MM-DD") : null;
                        field.onChange(next);
                      }}
                      format="YYYY/M/D"
                      slotProps={{
                        textField: {
                          onBlur: field.onBlur,
                          size: "small",
                        },
                      }}
                    />
                  )}
                />
              </td>
            </tr>

            <tr>
              <td className={LABEL_CELL_CLASS}>勤怠管理対象</td>
              <td className={VALUE_CELL_CLASS}>
                <Controller
                  name="attendanceManagementEnabled"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-1">
                      <Checkbox
                        checked={field.value ?? true}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <p className="text-xs text-slate-500">
                        オフにすると勤怠チェックでエラーとして扱われなくなります
                      </p>
                    </div>
                  )}
                />
              </td>
            </tr>

            <WorkTypeRow control={control} setValue={setValue} />

            <ShiftGroupRow
              control={control}
              shiftGroupOptions={shiftGroupOptions}
            />

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
          </>
        </tbody>
      </table>
    </div>
  );
}
