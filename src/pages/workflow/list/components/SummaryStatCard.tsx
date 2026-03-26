import { cx } from "./workflowListContentShared";
import { Surface } from "./WorkflowSharedUi";

export default function SummaryStatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "pending" | "approved";
}) {
  return (
    <Surface className="workflow-summary-card">
      <p className="workflow-summary-card__label">{label}</p>
      <p
        className={cx(
          "workflow-summary-card__value",
          tone === "pending" && "workflow-summary-card__value--pending",
          tone === "approved" && "workflow-summary-card__value--approved",
        )}
      >
        {value}
      </p>
    </Surface>
  );
}
