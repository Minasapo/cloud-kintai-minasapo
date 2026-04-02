import { memo } from "react";
import { Outlet, useLocation } from "react-router-dom";

import {
  findAdminSettingsItemByPath,
  resolveAdminSettingsCategory,
} from "@/features/admin/layout/model/adminSettingsNavigation";

const SettingsContextHeader = memo(function SettingsContextHeader() {
  const location = useLocation();
  const currentItem = findAdminSettingsItemByPath(location.pathname);
  const currentCategory = resolveAdminSettingsCategory(location.pathname);

  if (!currentItem || !currentCategory) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="m-0 text-[1.8rem] font-bold leading-[1.1] tracking-[-0.03em] text-slate-950 md:text-[2.15rem]">
          設定
        </h1>
        <p className="m-0 max-w-[72ch] text-slate-500">
          業務ごとに設定を整理しています。カテゴリから必要な項目を選んで詳細を確認してください。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
          {currentCategory.title}
        </span>
        <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-[0.04em] text-slate-600">
          Settings Zone
        </span>
      </div>
      <h1 className="m-0 text-[1.8rem] font-bold leading-[1.1] tracking-[-0.03em] text-slate-950 md:text-[2.1rem]">
        {currentItem.title}
      </h1>
      <p className="m-0 max-w-[72ch] text-slate-500">
        {currentItem.description}
      </p>
      <div className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        {currentItem.ctaLabel}
      </div>
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
