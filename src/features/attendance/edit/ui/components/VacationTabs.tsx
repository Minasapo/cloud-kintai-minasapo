import { AppTabs } from "@shared/ui/tabs";
import { type ReactNode } from "react";

type VacationTabsProps = {
  value: number;
  onChange: (index: number) => void;
  items: {
    label: string;
    content: ReactNode;
    disabled?: boolean;
  }[];
  appearance?: "pill" | "mui-standard";
  tabsProps?: {
    "aria-label"?: string;
    variant?: "standard" | "scrollable" | "fullWidth";
    sx?: unknown;
  };
  panelPadding?: number;
};

export function VacationTabs({
  value,
  onChange,
  items,
  appearance = "pill",
  tabsProps,
  panelPadding = 2,
}: VacationTabsProps) {
  return (
    <AppTabs
      value={value}
      onChange={onChange}
      items={items.map((item, index) => ({
        ...item,
        value: index,
      }))}
      appearance={appearance}
      tabsProps={tabsProps}
      panelPadding={panelPadding}
    />
  );
}
