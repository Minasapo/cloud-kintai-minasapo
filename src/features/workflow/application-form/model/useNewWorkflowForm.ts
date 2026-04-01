import { useMemo, useState } from "react";

import { type WorkflowFormErrors, type WorkflowFormState } from "./workflowFormModel";

const getTodayAsSlash = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
};

export function useNewWorkflowForm() {
  const [draftMode, setDraftMode] = useState(false);
  const [category, setCategory] = useState("");
  const applicationDate = getTodayAsSlash();

  // Form fields
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [absenceDate, setAbsenceDate] = useState("");
  const [absenceReason, setAbsenceReason] = useState("");
  const [paidReason, setPaidReason] = useState("");
  const [overtimeStart, setOvertimeStart] = useState<string | null>(null);
  const [overtimeEnd, setOvertimeEnd] = useState<string | null>(null);
  const [overtimeDate, setOvertimeDate] = useState("");
  const [overtimeReason, setOvertimeReason] = useState("");
  const [customWorkflowTitle, setCustomWorkflowTitle] = useState("");
  const [customWorkflowContent, setCustomWorkflowContent] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Required<WorkflowFormErrors>>({
    dateError: "",
    absenceDateError: "",
    overtimeDateError: "",
    overtimeError: "",
    customWorkflowTitleError: "",
    customWorkflowContentError: "",
  });

  const applyValidationErrors = (validationErrors: WorkflowFormErrors) => {
    setErrors({
      dateError: validationErrors.dateError ?? "",
      absenceDateError: validationErrors.absenceDateError ?? "",
      overtimeDateError: validationErrors.overtimeDateError ?? "",
      overtimeError: validationErrors.overtimeError ?? "",
      customWorkflowTitleError: validationErrors.customWorkflowTitleError ?? "",
      customWorkflowContentError:
        validationErrors.customWorkflowContentError ?? "",
    });
  };

  const handleDraftToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraftMode(e.target.checked);
  };

  const formState: WorkflowFormState = {
    categoryLabel: category,
    startDate,
    endDate,
    absenceDate,
    paidReason,
    absenceReason,
    overtimeDate,
    overtimeStart,
    overtimeEnd,
    overtimeReason,
    customWorkflowTitle,
    customWorkflowContent,
  };

  const isDirty = useMemo(
    () =>
      draftMode ||
      category !== "" ||
      startDate !== "" ||
      endDate !== "" ||
      absenceDate !== "" ||
      absenceReason !== "" ||
      paidReason !== "" ||
      overtimeStart !== null ||
      overtimeEnd !== null ||
      overtimeDate !== "" ||
      overtimeReason !== "" ||
      customWorkflowTitle !== "" ||
      customWorkflowContent !== "" ||
      selectedTemplateId !== "",
    [
      absenceDate,
      absenceReason,
      category,
      customWorkflowContent,
      customWorkflowTitle,
      draftMode,
      endDate,
      overtimeDate,
      overtimeEnd,
      overtimeReason,
      overtimeStart,
      paidReason,
      selectedTemplateId,
      startDate,
    ],
  );

  return {
    draftMode,
    handleDraftToggle,
    category,
    setCategory,
    applicationDate,
    formState,
    errors,
    applyValidationErrors,
    // Field setters (passed to WorkflowTypeFields)
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    absenceDate,
    setAbsenceDate,
    absenceReason,
    setAbsenceReason,
    paidReason,
    setPaidReason,
    overtimeStart,
    setOvertimeStart,
    overtimeEnd,
    setOvertimeEnd,
    overtimeDate,
    setOvertimeDate,
    overtimeReason,
    setOvertimeReason,
    customWorkflowTitle,
    setCustomWorkflowTitle,
    customWorkflowContent,
    setCustomWorkflowContent,
    selectedTemplateId,
    setSelectedTemplateId,
    isDirty,
  };
}
