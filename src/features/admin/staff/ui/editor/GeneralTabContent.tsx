import { StaffFormValues } from "@features/admin/staff/model/staffForm";
import { Checkbox } from "@mui/material";
import { AppTextField, DateField } from "@shared/ui/form";
import dayjs from "dayjs";
import {
  Control,
  Controller,
  UseFormRegister,
  UseFormSetValue,
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
  cognitoUser: { id?: string; owner?: boolean | null } | null | undefined;
  shiftGroupOptions: { value: string; label: string }[];
};

export function GeneralTabContent({
  register,
  control,
  setValue,
  cognitoUser,
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
                    <DateField
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(value) => {
                        const next = value ? value.format("YYYY-MM-DD") : null;
                        field.onChange(next);
                      }}
                      format="YYYY/MM/DD"
                      className="w-full sm:max-w-[400px]"
                      helperText="全角数字は自動で半角に変換されます"
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
          </>
        </tbody>
      </table>
    </div>
  );
}
