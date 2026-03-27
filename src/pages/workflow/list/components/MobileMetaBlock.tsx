import { cx } from "./workflowListContentShared";

export default function MobileMetaBlock({
  label,
  value,
  alignEnd = false,
}: {
  label: string;
  value: string;
  alignEnd?: boolean;
}) {
  return (
    <div
      className={cx("workflow-mobile-meta", alignEnd && "workflow-mobile-meta--align-end")}
    >
      <div className="workflow-mobile-meta__label">{label}</div>
      <div className="workflow-mobile-meta__value">{value}</div>
    </div>
  );
}
