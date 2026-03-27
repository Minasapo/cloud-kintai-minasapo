import type { ReactNode } from "react";

type AdminSettingsSectionProps = {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  alert?: ReactNode;
};

export default function AdminSettingsSection({
  title,
  description,
  children,
  actions,
  alert,
}: AdminSettingsSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      {alert && <div>{alert}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col gap-5 p-5 md:p-6">
          {(title || description) && (
            <div className="flex flex-col gap-1">
              {title && <h2 className="text-lg font-semibold text-slate-800">{title}</h2>}
              {description && <p className="text-sm text-slate-500">{description}</p>}
            </div>
          )}
          <div className="flex flex-col gap-4">
            {children}
          </div>
        </div>
        {actions && (
          <div className="border-t border-slate-100 bg-slate-50/50 p-4 flex justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
