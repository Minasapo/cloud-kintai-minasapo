import {
  Control,
  ControllerProps,
  ControllerRenderProps,
  FieldPath,
  FieldPathValue,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";

import { AttendanceEditInputs } from "@/pages/AttendanceEdit/common";

export type AttendanceControl = Control<AttendanceEditInputs>;
export type AttendanceFieldPath = FieldPath<AttendanceEditInputs>;
export type AttendanceControllerName =
  ControllerProps<AttendanceEditInputs>["name"];
export type AttendanceControllerField<
  TFieldName extends AttendanceFieldPath = AttendanceFieldPath
> = ControllerRenderProps<AttendanceEditInputs, TFieldName>;
export type AttendanceFieldValue<
  TFieldName extends AttendanceFieldPath = AttendanceFieldPath
> = FieldPathValue<AttendanceEditInputs, TFieldName>;
export type AttendanceSetValue = UseFormSetValue<AttendanceEditInputs>;
export type AttendanceGetValues = UseFormGetValues<AttendanceEditInputs>;
export type AttendanceBooleanFieldName = Extract<
  keyof AttendanceEditInputs,
  "goDirectlyFlag" | "returnDirectlyFlag"
>;
export type AttendanceTimeFieldName = Extract<
  keyof AttendanceEditInputs,
  "startTime" | "endTime"
>;
