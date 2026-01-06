import { Box, Tab, Tabs, TabsProps } from "@mui/material";
import { Activity, ReactNode } from "react";

type TabItem = {
  label: string;
  content: ReactNode;
  disabled?: boolean;
};

type VacationTabsProps = {
  value: number;
  onChange: (index: number) => void;
  items: TabItem[];
  tabsProps?: TabsProps;
  panelPadding?: number;
};

export function VacationTabs({
  value,
  onChange,
  items,
  tabsProps,
  panelPadding = 2,
}: VacationTabsProps) {
  "use memo";

  return (
    <>
      <Tabs
        value={value}
        onChange={(_, v) => onChange(v)}
        aria-label="vacation-tabs"
        {...tabsProps}
      >
        {items.map((tab, idx) => (
          <Tab key={idx} label={tab.label} disabled={tab.disabled} />
        ))}
      </Tabs>
      {items.map((tab, idx) => (
        <Activity
          key={`panel-${idx}`}
          mode={value === idx ? "visible" : "hidden"}
        >
          <Box sx={{ pt: panelPadding }}>{tab.content}</Box>
        </Activity>
      ))}
    </>
  );
}
