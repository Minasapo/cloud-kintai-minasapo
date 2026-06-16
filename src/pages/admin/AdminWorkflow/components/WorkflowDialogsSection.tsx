import AdminWorkflowSettingsDialog from "@features/admin-config-workflow/AdminWorkflowSettingsDialog";
import { Workflow as WorkflowType } from "@shared/api/graphql/types";

import WorkflowCarouselDialog from "./WorkflowCarouselDialog";

type WorkflowDialogsSectionProps = {
  isCarouselOpen: boolean;
  selectedWorkflowId: string | null;
  onCloseCarousel: () => void;
  filteredWorkflowIds: string[];
  workflowsById: Map<string, WorkflowType>;
  staffNamesById: Map<string, string>;
  onOpenInRightPanel: (workflowId: string) => void;
  isSettingsDialogOpen: boolean;
  onCloseSettings: () => void;
};

export default function WorkflowDialogsSection({
  isCarouselOpen,
  selectedWorkflowId,
  onCloseCarousel,
  filteredWorkflowIds,
  workflowsById,
  staffNamesById,
  onOpenInRightPanel,
  isSettingsDialogOpen,
  onCloseSettings,
}: WorkflowDialogsSectionProps) {
  return (
    <>
      {isCarouselOpen && selectedWorkflowId && (
        <WorkflowCarouselDialog
          key={selectedWorkflowId}
          open={isCarouselOpen}
          onClose={onCloseCarousel}
          selectedWorkflowId={selectedWorkflowId}
          filteredWorkflowIds={filteredWorkflowIds}
          workflowsById={workflowsById}
          staffNamesById={staffNamesById}
          onOpenInRightPanel={(workflowId) => {
            onOpenInRightPanel(workflowId);
            onCloseCarousel();
          }}
          enableApprovalActions
        />
      )}
      {isSettingsDialogOpen && (
        <AdminWorkflowSettingsDialog
          open={isSettingsDialogOpen}
          onClose={onCloseSettings}
        />
      )}
    </>
  );
}
