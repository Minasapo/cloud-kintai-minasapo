import StatusChip from "@shared/ui/chips/StatusChip";

import type { WorkflowListItem } from "@/features/workflow/list/workflowListModel";

import { resolveWorkflowStatusKey } from "../lib/workflowListUtils";
import MobileMetaBlock from "./MobileMetaBlock";
import { EMPTY_VALUE, formatWorkflowDateValue } from "./workflowListContentShared";

export default function MobileWorkflowCard({
  item,
  onClick,
}: {
  item: WorkflowListItem;
  onClick: (item: WorkflowListItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="workflow-mobile-card-button"
    >
      <div className="workflow-mobile-card">
        <div className="workflow-mobile-card__header">
          <div className="workflow-mobile-card__title">
            {item.category || EMPTY_VALUE}
          </div>
          <div className="workflow-mobile-card__status">
            <StatusChip status={resolveWorkflowStatusKey(item)} />
          </div>
        </div>

        <MobileMetaBlock label="申請日" value={formatWorkflowDateValue(item.applicationDate)} />

        <div className="workflow-mobile-card__meta-row">
          <MobileMetaBlock label="作成日" value={item.createdAt || EMPTY_VALUE} />
          <MobileMetaBlock
            label="ステータス"
            value={item.status || EMPTY_VALUE}
            alignEnd
          />
        </div>
      </div>
    </button>
  );
}
