export type FieldState = {
  error: boolean;
  helperText: string;
};

export type FieldRule = {
  when: boolean;
  helperText: string;
  error?: boolean;
};

export const resolveFieldState = (
  rules: FieldRule[],
  fallback: FieldState
): FieldState => {
  const matched = rules.find((rule) => rule.when);
  if (!matched) return fallback;
  return {
    error: matched.error ?? true,
    helperText: matched.helperText,
  };
};
