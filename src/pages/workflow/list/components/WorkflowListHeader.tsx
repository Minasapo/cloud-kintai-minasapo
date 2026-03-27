import {
  WORKFLOW_LIST_DESCRIPTION,
  WORKFLOW_LIST_TITLE,
} from "./workflowListContentShared";

export default function WorkflowListHeader() {
  return (
    <div className="workflow-list-header">
      <div className="workflow-list-header__copy">
        <p className="workflow-list-header__title">{WORKFLOW_LIST_TITLE}</p>
        <p className="workflow-list-header__description">
          {WORKFLOW_LIST_DESCRIPTION}
        </p>
      </div>
    </div>
  );
}
