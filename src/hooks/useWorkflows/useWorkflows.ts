import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  Workflow as APIWorkflow,
} from "@/API";
import { AuthContext } from "@/context/AuthContext";

import { WorkflowDataManager } from "./WorkflowDataManager";

export default function useWorkflows() {
  const [workflows, setWorkflows] = useState<APIWorkflow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";

  // WorkflowDataManager を再生成しないように安定化
  const dataManager = useMemo(() => new WorkflowDataManager(), []);

  // fetchWorkflows を useCallback にして参照を安定化
  const fetchWorkflows = useCallback(async () => {
    if (!isAuthenticated) {
      setWorkflows(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await dataManager.list();
      setWorkflows(items);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [dataManager, isAuthenticated]);

  // create/update/remove も安定化（必要に応じて）
  const create = useCallback(
    async (input: CreateWorkflowInput) => {
      if (!isAuthenticated) {
        throw new Error("User is not authenticated");
      }
      setLoading(true);
      try {
        const created = await dataManager.create(input);
        // append to list
        setWorkflows((prev) => (prev ? [created, ...prev] : [created]));
        return created;
      } finally {
        setLoading(false);
      }
    },
    [dataManager, isAuthenticated]
  );

  const update = useCallback(
    async (input: UpdateWorkflowInput) => {
      if (!isAuthenticated) {
        throw new Error("User is not authenticated");
      }
      setLoading(true);
      try {
        const updated = await dataManager.update(input);
        setWorkflows((prev) =>
          prev
            ? prev.map((w) => (w.id === updated.id ? updated : w))
            : [updated]
        );
        return updated;
      } finally {
        setLoading(false);
      }
    },
    [dataManager, isAuthenticated]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        throw new Error("User is not authenticated");
      }
      setLoading(true);
      try {
        await dataManager.delete({ id });
        setWorkflows((prev) => (prev ? prev.filter((w) => w.id !== id) : null));
      } finally {
        setLoading(false);
      }
    },
    [dataManager, isAuthenticated]
  );

  // eslint-disable コメントを削除し、fetchWorkflows を依存に指定
  useEffect(() => {
    void fetchWorkflows();
  }, [fetchWorkflows]);

  return {
    workflows,
    loading,
    error,
    fetchWorkflows,
    create,
    update,
    remove,
  };
}
