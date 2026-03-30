import type { ReactNode } from "react";

type AdminSettingsLayoutProps = {
  description?: ReactNode;
  children: ReactNode;
};

export default function AdminSettingsLayout({
  description,
  children,
}: AdminSettingsLayoutProps) {
  return (
    <div className="flex flex-col gap-6 max-w-5xl w-full">
      {description && <p className="text-sm text-gray-500">{description}</p>}
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </div>
  );
}
