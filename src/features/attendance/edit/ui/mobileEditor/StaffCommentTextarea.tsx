import { UseFormRegisterReturn } from "react-hook-form";

import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

type StaffCommentTextareaProps = {
  disabled: boolean;
  registerProps: UseFormRegisterReturn<keyof AttendanceEditInputs>;
};

export function StaffCommentTextarea({
  disabled,
  registerProps,
}: StaffCommentTextareaProps) {
  return (
    <textarea
      {...registerProps}
      placeholder="修正理由欄：管理者へ伝えたいことを記載"
      disabled={disabled}
      data-testid="staff-comment-input-mobile"
      rows={3}
      className="staff-comment-input__textarea"
    />
  );
}
