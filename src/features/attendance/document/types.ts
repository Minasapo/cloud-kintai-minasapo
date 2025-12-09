export type DocumentFormInputs = {
  title: string | null | undefined;
  content: string | null | undefined;
  targetRole: string[];
};

export const documentFormDefaultValues: DocumentFormInputs = {
  title: undefined,
  content: undefined,
  targetRole: [],
};

export const documentTargetRoleOptions = ["スタッフ", "管理者"] as const;
