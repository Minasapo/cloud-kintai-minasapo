import { useAdminStaffEditorForm } from "@features/admin/staff/model/useAdminStaffEditorForm";
import { CircularProgress } from "@mui/material";
import { AppButton } from "@shared/ui/button";
import { ProgressBar } from "@shared/ui/feedback";
import { usePageLeaveGuard } from "@shared/ui/feedback/usePageLeaveGuard";
import { AppTabs } from "@shared/ui/tabs";
import { PageTitle } from "@shared/ui/typography";

import { AdvancedTabContent } from "./AdvancedTabContent";
import { GeneralTabContent } from "./GeneralTabContent";
import { WorkflowTabContent } from "./WorkflowTabContent";

export default function AdminStaffEditor() {
  const {
    cognitoUser,
    staffs,
    staffLoading,
    staffError,
    tabIndex,
    setTabIndex,
    saving,
    formState: { isValid, isDirty, isSubmitting },
    register,
    control,
    setValue,
    watch,
    getValues,
    handleSubmit,
    onSubmit,
    shiftGroupOptions,
  } = useAdminStaffEditorForm();

  const { dialog } = usePageLeaveGuard({
    isDirty,
    isBusy: saving || isSubmitting,
  });

  if (staffLoading) return <ProgressBar />;
  if (staffError) {
    // Note: Error handling is now inside the hook or handled by the component.
    // In the original, it dispatched a notification.
    return null;
  }

  return (
    <div className="h-full w-full px-2 pb-3 pt-2 sm:px-4 md:px-6">
      {dialog}
      <div className="space-y-2.5">
        <section className="rounded-[18px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 px-5 py-4">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <PageTitle className="text-xl font-extrabold tracking-[0.01em] text-emerald-950">
                スタッフ編集
              </PageTitle>
              <p className="text-sm text-emerald-800">
                スタッフ情報と承認設定を更新できます。
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-2.5 py-1 font-mono text-slate-700">
                <span className="font-bold">Cognito ID:</span>
                <span className="ml-1">{getValues("staffId") ?? "-"}</span>
              </span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-2.5 py-1 font-mono text-slate-700">
                <span className="font-bold">スタッフID:</span>
                <span className="ml-1">{getValues("internalId") ?? "-"}</span>
              </span>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white/95">
          <AppTabs
            value={tabIndex}
            onChange={setTabIndex}
            appearance="underline"
            panelPadding={0}
            tabsProps={{ "aria-label": "スタッフ編集タブ" }}
            items={[
              {
                value: 0,
                label: "全般",
                content: (
                  <GeneralTabContent
                    register={register}
                    control={control}
                    setValue={setValue}
                    cognitoUser={cognitoUser}
                    shiftGroupOptions={shiftGroupOptions}
                  />
                ),
              },
              {
                value: 1,
                label: "ワークフロー",
                content: (
                  <WorkflowTabContent
                    control={control}
                    setValue={setValue}
                    watch={watch}
                    cognitoUser={cognitoUser}
                    staffs={staffs}
                  />
                ),
              },
              {
                value: 2,
                label: "高度設定",
                disabled: !cognitoUser?.owner,
                content: (
                  <AdvancedTabContent control={control} setValue={setValue} />
                ),
              },
            ]}
          />
        </section>

        <div className="flex justify-end pb-8 pt-2">
          <AppButton
            data-testid="save-button"
            variant="solid"
            disabled={!isValid || !isDirty || saving || isSubmitting}
            startIcon={saving ? <CircularProgress size={15} /> : undefined}
            onClick={handleSubmit(onSubmit)}
          >
            保存
          </AppButton>
        </div>
      </div>
    </div>
  );
}
