import WorkflowFiltersArea from "./WorkflowFiltersArea";
import WorkflowListHeader from "./WorkflowListHeader";
import WorkflowResults from "./WorkflowResults";
import { Surface } from "./WorkflowSharedUi";

export default function WorkflowListContent() {
  return (
    <Surface>
      <div className="workflow-list-content">
        <WorkflowListHeader />
        <WorkflowFiltersArea />
        <WorkflowResults />
      </div>
    </Surface>
  );
}
