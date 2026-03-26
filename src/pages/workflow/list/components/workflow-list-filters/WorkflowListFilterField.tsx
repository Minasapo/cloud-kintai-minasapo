import FilterLabel from "./FilterLabel";
import type { WorkflowListFilterLayout } from "./WorkflowListFilterFields";

type WorkflowListFilterFieldProps = {
  children: React.ReactNode;
  label: string;
  layout: WorkflowListFilterLayout;
};

export default function WorkflowListFilterField({
  children,
  label,
  layout,
}: WorkflowListFilterFieldProps) {
  if (layout === "desktop") {
    return <td className="px-1 py-1 align-top">{children}</td>;
  }

  return (
    <div className="flex flex-col gap-1">
      <FilterLabel>{label}</FilterLabel>
      {children}
    </div>
  );
}
