import { useCallback, useMemo, useState } from "react";

export type DynamicWorkflowFormState = {
  categoryLabel: string;
  fields: Record<string, unknown>;
};

type UseDynamicWorkflowFormOptions = {
  /** 編集時の初期フィールド値。省略時は空 */
  initialFields?: Record<string, unknown>;
};

export function useDynamicWorkflowForm(
  options: UseDynamicWorkflowFormOptions = {},
) {
  const { initialFields = {} } = options;
  const [fields, setFields] = useState<Record<string, unknown>>(initialFields);

  const setFieldValue = useCallback((key: string, value: unknown) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFields = useCallback(
    (newFields: Record<string, unknown> = {}) => {
      setFields(newFields);
    },
    [],
  );

  const isDirty = useMemo(
    () =>
      JSON.stringify(fields) !== JSON.stringify(initialFields),
    [fields, initialFields],
  );

  const formState: DynamicWorkflowFormState = useMemo(
    () => ({
      categoryLabel: "",
      fields,
    }),
    [fields],
  );

  return {
    fields,
    setFieldValue,
    resetFields,
    formState,
    isDirty,
  };
}
