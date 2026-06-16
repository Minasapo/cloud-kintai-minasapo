import WorkflowStatusChip from "@entities/workflow/ui/WorkflowStatusChip";
import type { WorkflowListItem } from "@features/workflow/list/workflowListModel";
import { memo } from "react";

import {
  isCancelledWorkflow,
  resolveWorkflowStatusKey,
} from "../lib/workflowListUtils";
import {
  cx,
  EMPTY_VALUE,
  formatWorkflowDateValue,
  WORKFLOW_LIST_COLUMN_HEADER_IDS,
} from "./workflowListContentShared";

const DesktopWorkflowRowComponent = ({
  item,
  onClick,
}: {
  item: WorkflowListItem;
  onClick: (item: WorkflowListItem) => void;
}) => {
  const isCancelled = isCancelledWorkflow(item);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onClick(item);
  };

  return (
    <tr
      onClick={() => onClick(item)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${item.category || EMPTY_VALUE} の申請詳細を開く`}
      className={cx(
        "workflow-desktop-row",
        isCancelled && "workflow-desktop-row--cancelled",
      )}
    >
      <th
        scope="row"
        className="workflow-desktop-row__category"
        headers={WORKFLOW_LIST_COLUMN_HEADER_IDS[0]}
      >
        {item.category || EMPTY_VALUE}
      </th>
      <td headers={WORKFLOW_LIST_COLUMN_HEADER_IDS[1]}>
        {formatWorkflowDateValue(item.applicationDate)}
      </td>
      <td headers={WORKFLOW_LIST_COLUMN_HEADER_IDS[2]}>
        <WorkflowStatusChip status={resolveWorkflowStatusKey(item)} />
      </td>
      <td headers={WORKFLOW_LIST_COLUMN_HEADER_IDS[3]}>
        {formatWorkflowDateValue(item.createdAt)}
      </td>
    </tr>
  );
};

DesktopWorkflowRowComponent.displayName = "DesktopWorkflowRow";

export default memo(DesktopWorkflowRowComponent);
