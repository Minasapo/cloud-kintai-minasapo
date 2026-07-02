import SettingsIcon from "@features/admin/layout/ui/SettingsIcon";
import { AppButton } from "@shared/ui/button";

type WorkflowPageHeaderProps = {
  onOpenSettings: () => void;
};

export default function WorkflowPageHeader({
  onOpenSettings,
}: WorkflowPageHeaderProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_44px_-34px_rgba(15,23,42,0.38)] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-2xl">
            ワークフロー管理
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            申請一覧の確認と承認対応を行う画面です。申請カテゴリやテンプレートの設定は、右上の設定ボタンからまとめて見直せます。
          </p>
        </div>
        <AppButton
          variant="outline"
          tone="secondary"
          onClick={onOpenSettings}
          className="self-start"
          aria-label="ワークフロー設定を開く"
          startIcon={<SettingsIcon name="settings" className="text-current" />}
        >
          <span className="whitespace-nowrap">設定</span>
        </AppButton>
      </div>
    </section>
  );
}
