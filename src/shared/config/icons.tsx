import SettingsIcon from "@/features/admin/layout/ui/SettingsIcon";

export type PredefinedIconValue = "train" | "holiday" | "expense" | "LinkIcons";

export const predefinedIcons: ReadonlyArray<{
  label: string;
  value: PredefinedIconValue;
  component: JSX.Element;
}> = [
  {
    label: "交通費",
    value: "train",
    component: <SettingsIcon name="train" className="text-slate-600" />,
  },
  {
    label: "休暇申請",
    value: "holiday",
    component: <SettingsIcon name="holiday" className="text-slate-600" />,
  },
  {
    label: "経費申請",
    value: "expense",
    component: <SettingsIcon name="expense" className="text-slate-600" />,
  },
  {
    label: "その他",
    value: "LinkIcons",
    component: <SettingsIcon name="link" className="text-slate-600" />,
  },
] as const;
