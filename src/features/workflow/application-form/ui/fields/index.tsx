import type { WorkflowFieldConfig, WorkflowFieldType } from "@features/workflow/config/workflowTypeConfig";
import type { ComponentType } from "react";

import { DateField } from "./DateField";
import { DateRangeField } from "./DateRangeField";
import { TemplateSelectField } from "./TemplateSelectField";
import { TextareaField } from "./TextareaField";
import { TextField } from "./TextField";
import { TimeField } from "./TimeField";
import { TimeRangeField } from "./TimeRangeField";

export type FieldComponentProps = {
  config: WorkflowFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
  /** time / time_range フィールド用の基準日 (YYYY-MM-DD) */
  baseDate?: string;
  /** スペシャライズドフィールドが他フィールドの値を書き込むために使う */
  onSetField?: (key: string, value: unknown) => void;
  /** template_select フィールドが現在の title/content 値を参照するために使う */
  fieldsSnapshot?: Record<string, unknown>;
};

export const FIELD_REGISTRY: Partial<
  Record<WorkflowFieldType, ComponentType<FieldComponentProps>>
> = {
  date: DateField as ComponentType<FieldComponentProps>,
  date_range: DateRangeField as ComponentType<FieldComponentProps>,
  time: TimeField as ComponentType<FieldComponentProps>,
  time_range: TimeRangeField as ComponentType<FieldComponentProps>,
  text: TextField as ComponentType<FieldComponentProps>,
  textarea: TextareaField as ComponentType<FieldComponentProps>,
  template_select: ((props: FieldComponentProps) => (
    <TemplateSelectField
      config={props.config}
      value={(props.value as string) ?? ""}
      onChange={props.onChange as (v: string) => void}
      disabled={props.disabled}
      onSetField={props.onSetField}
      currentTitle={(props.fieldsSnapshot?.["title"] as string) ?? ""}
      currentContent={(props.fieldsSnapshot?.["content"] as string) ?? ""}
    />
  )) as ComponentType<FieldComponentProps>,
};

export {
  DateField,
  DateRangeField,
  TemplateSelectField,
  TextareaField,
  TextField,
  TimeField,
  TimeRangeField,
};
