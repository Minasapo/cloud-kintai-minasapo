import React, { createContext, useContext } from "react";

export type WorkflowFormContextValue = {
  category: string;
  disabled: boolean;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  dateError: string;
  paidReason: string;
  setPaidReason: (v: string) => void;
  absenceDate: string;
  setAbsenceDate: (v: string) => void;
  absenceDateError: string;
  absenceReason: string;
  setAbsenceReason: (v: string) => void;
  overtimeDate: string;
  setOvertimeDate: (v: string) => void;
  overtimeDateError: string;
  overtimeStart: string | null;
  setOvertimeStart: (v: string | null) => void;
  overtimeEnd: string | null;
  setOvertimeEnd: (v: string | null) => void;
  overtimeError: string;
  overtimeReason: string;
  setOvertimeReason: (v: string) => void;
  customWorkflowTitle: string;
  setCustomWorkflowTitle: (v: string) => void;
  customWorkflowContent: string;
  setCustomWorkflowContent: (v: string) => void;
  customWorkflowTitleError: string;
  customWorkflowContentError: string;
  templateOptions?: Array<{ id: string; name: string }>;
  selectedTemplateId?: string;
  setSelectedTemplateId?: (v: string) => void;
  onApplyTemplate?: () => void;
  disableTemplateApply?: boolean;
};

const WorkflowFormContext = createContext<WorkflowFormContextValue | null>(null);

export function WorkflowFormProvider({
  value,
  children,
}: {
  value: WorkflowFormContextValue;
  children: React.ReactNode;
}) {
  return (
    <WorkflowFormContext.Provider value={value}>
      {children}
    </WorkflowFormContext.Provider>
  );
}

export function useWorkflowFormContext(): WorkflowFormContextValue {
  const ctx = useContext(WorkflowFormContext);
  if (!ctx) throw new Error("useWorkflowFormContext must be used within WorkflowFormProvider");
  return ctx;
}
