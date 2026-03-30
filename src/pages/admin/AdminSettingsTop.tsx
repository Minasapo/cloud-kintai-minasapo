import { memo } from "react";
import { Link as RouterLink } from "react-router-dom";

import {
  getAdminSettingsNavigationGroups,
} from "@/features/admin/layout/model/adminSettingsNavigation";
import SettingsIcon from "@/features/admin/layout/ui/SettingsIcon";

const SettingsCard = memo(function SettingsCard({
  title,
  description,
  path,
  ctaLabel,
}: {
  title: string;
  description: string;
  path: string;
  ctaLabel: string;
}) {
  return (
    <RouterLink
      to={path}
      className="flex min-h-[196px] flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-6 text-left no-underline shadow-[0_18px_42px_-34px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_28px_54px_-34px_rgba(15,23,42,0.4)]"
    >
      <div className="flex flex-col gap-2">
        <h3 className="m-0 text-[1.05rem] font-bold text-slate-900">{title}</h3>
        <p className="m-0 leading-7 text-slate-600">{description}</p>
      </div>
      <div className="mt-auto flex items-center gap-2 text-emerald-600">
        <span className="text-[0.95rem] font-bold">{ctaLabel}</span>
        <SettingsIcon name="chevron-right" />
      </div>
    </RouterLink>
  );
});

export default function AdminSettingsTop() {
  const groups = getAdminSettingsNavigationGroups();

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-900">
              {group.title}
            </span>
            <h2 className="m-0 text-[1.35rem] font-bold tracking-[-0.02em] text-slate-950 md:text-[1.55rem]">
              {group.title}
            </h2>
            <p className="m-0 max-w-[72ch] leading-7 text-slate-500">{group.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {group.items.map((item) => (
              <SettingsCard key={item.path} {...item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
