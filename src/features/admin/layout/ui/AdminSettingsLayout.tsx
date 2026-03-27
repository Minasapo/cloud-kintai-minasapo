import type { ReactNode } from "react";

import Title from "@/shared/ui/typography/Title";

type AdminSettingsLayoutProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
};

export default function AdminSettingsLayout({
  title,
  description,
  children,
}: AdminSettingsLayoutProps) {
  return (
    <div className="flex flex-col gap-6 max-w-5xl w-full">
      <Title>{title}</Title>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </div>
  );
}
