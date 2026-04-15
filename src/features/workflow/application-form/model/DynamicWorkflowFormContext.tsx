import React, { createContext, useContext } from "react";

export type DynamicWorkflowFormContextValue = {
  category: string;
  disabled: boolean;
  fields: Record<string, unknown>;
  setFieldValue: (key: string, value: unknown) => void;
  fieldErrors: Record<string, string>;
};

const DynamicWorkflowFormContext =
  createContext<DynamicWorkflowFormContextValue | null>(null);

export function DynamicWorkflowFormProvider({
  value,
  children,
}: {
  value: DynamicWorkflowFormContextValue;
  children: React.ReactNode;
}) {
  return (
    <DynamicWorkflowFormContext.Provider value={value}>
      {children}
    </DynamicWorkflowFormContext.Provider>
  );
}

export function useDynamicWorkflowFormContext(): DynamicWorkflowFormContextValue {
  const ctx = useContext(DynamicWorkflowFormContext);
  if (!ctx)
    throw new Error(
      "useDynamicWorkflowFormContext must be used within DynamicWorkflowFormProvider",
    );
  return ctx;
}
