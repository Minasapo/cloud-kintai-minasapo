import WorkflowStatusChip from "@entities/workflow/ui/WorkflowStatusChip";
import { Step, StepContent, StepLabel, Stepper } from "@mui/material";
import { SubsectionTitle } from "@shared/ui/typography";

import type { WorkflowApprovalStepView } from "../types";

type Props = {
  title?: string;
  steps: WorkflowApprovalStepView[];
};

export default function WorkflowApprovalTimeline({
  title = "承認フロー",
  steps,
}: Props) {
  return (
    <section className="rounded-[14px] border border-slate-200/80 bg-slate-50/75 p-4">
      <SubsectionTitle className="mb-3 text-slate-950">{title}</SubsectionTitle>
      <Stepper orientation="vertical" nonLinear>
        {steps.map((step) => {
          const isApplicant = step.role === "申請者";
          const isDone = step.state === "承認済み";
          const isRejected = step.state === "却下" || step.state === "REJECTED";

          return (
            <Step
              key={step.id}
              expanded
              completed={isDone}
              active={!isDone && !isRejected}
            >
              <StepLabel
                error={isRejected}
                optional={
                  <span className="text-xs text-slate-500">
                    {step.role}
                    {step.date ? `・${step.date}` : ""}
                  </span>
                }
              >
                <span className="text-base font-bold text-slate-900">
                  {step.name}
                </span>
              </StepLabel>
              {!isApplicant && !isRejected && (
                <StepContent>
                  <div className="inline-flex">
                    <WorkflowStatusChip status={step.state} />
                  </div>
                </StepContent>
              )}
            </Step>
          );
        })}
      </Stepper>
    </section>
  );
}
