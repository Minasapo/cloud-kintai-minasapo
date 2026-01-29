import { Button, CircularProgress } from "@mui/material";
import { UseFormHandleSubmit } from "react-hook-form";

import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

export function RequestButtonItem({
  handleSubmit,
  onSubmit,
  isDirty: _isDirty,
  isValid: _isValid,
  isSubmitting,
}: {
  handleSubmit: UseFormHandleSubmit<AttendanceEditInputs>;
  onSubmit: (data: AttendanceEditInputs) => Promise<void>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}) {
  return (
    <Button
      variant="contained"
      size="medium"
      onClick={handleSubmit(onSubmit)}
      // disabled={!isDirty || !isValid || isSubmitting}
      startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
    >
      申請
    </Button>
  );
}
