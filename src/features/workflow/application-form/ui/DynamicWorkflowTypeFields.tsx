import { getFieldConfigsByLabel } from "@features/workflow/config/workflowTypeLoader";

import { useDynamicWorkflowFormContext } from "../model/DynamicWorkflowFormContext";
import { FIELD_REGISTRY } from "./fields/index";

/**
 * YAML で定義されたワークフロー種別設定に基づき、フィールドを動的にレンダリングする。
 * WorkflowTypeFields.tsx の後継コンポーネント。
 */
export default function DynamicWorkflowTypeFields() {
  const { category, disabled, fields, setFieldValue, fieldErrors } =
    useDynamicWorkflowFormContext();

  const fieldConfigs = getFieldConfigsByLabel(category);

  // time / time_range フィールドの基準日: 同一フォーム内の最初の date フィールドの値
  const dateFieldKey = fieldConfigs.find((f) => f.type === "date")?.key;
  const baseDate = dateFieldKey
    ? (fields[dateFieldKey] as string | undefined)
    : undefined;

  if (fieldConfigs.length === 0) return null;

  return (
    <>
      {fieldConfigs.map((fieldConfig) => {
        const Component = FIELD_REGISTRY[fieldConfig.type];
        if (!Component) return null;

        return (
          <Component
            key={fieldConfig.key}
            config={fieldConfig}
            value={fields[fieldConfig.key]}
            onChange={(v) => setFieldValue(fieldConfig.key, v)}
            error={fieldErrors[fieldConfig.key]}
            disabled={disabled}
            baseDate={baseDate}
            onSetField={setFieldValue}
            fieldsSnapshot={fields}
          />
        );
      })}
    </>
  );
}
