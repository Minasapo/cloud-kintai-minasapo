import { findAdminSettingsItemByPath } from "@features/admin/layout/model/adminSettingsNavigation";
import { PageTitle } from "@shared/ui/typography";
import { memo } from "react";
import { Outlet, useLocation } from "react-router-dom";

const SettingsContextHeader = memo(function SettingsContextHeader() {
  const location = useLocation();
  const currentItem = findAdminSettingsItemByPath(location.pathname);

  if (!currentItem) {
    return (
      <div className="flex flex-col gap-3">
        <PageTitle className="m-0 text-[1.8rem] font-bold leading-[1.1] tracking-[-0.03em] text-slate-950 md:text-[2.15rem]">
          設定
        </PageTitle>
        <p className="m-0 max-w-[72ch] text-slate-500">
          業務ごとに設定を整理しています。カテゴリから必要な項目を選んで詳細を確認してください。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <PageTitle className="m-0 text-[1.8rem] font-bold leading-[1.1] tracking-[-0.03em] text-slate-950 md:text-[2.1rem]">
        {currentItem.title}
      </PageTitle>
      <p className="m-0 max-w-[72ch] text-slate-500">
        {currentItem.description}
      </p>
    </div>
  );
});

const MasterLayoutContent = memo(function MasterLayoutContent() {
  return (
    <div className="w-full max-w-[1040px]">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-5 shadow-[0_24px_48px_-38px_rgba(15,23,42,0.5)] md:px-7 md:py-7">
        <SettingsContextHeader />
        <div className="rounded-xl border border-slate-100 bg-slate-50/35 p-3 md:p-4">
          <Outlet />
        </div>
      </section>
    </div>
  );
});

export default function AdminMasterLayout() {
  return (
    <div className="w-full pb-4 pt-2">
      <MasterLayoutContent />
    </div>
  );
}
