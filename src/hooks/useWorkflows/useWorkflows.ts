import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  Workflow as APIWorkflow,
} from "@/API";

import { WorkflowDataManager } from "./WorkflowDataManager";

export default function useWorkflows() {
  const [workflows, setWorkflows] = useState<APIWorkflow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WorkflowDataManager を再生成しないように安定化
  const dataManager = useMemo(() => new WorkflowDataManager(), []);

  // fetchWorkflows を useCallback にして参照を安定化
  const fetchWorkflows = useCallback(async () => {
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
  }, [dataManager]);

  // create/update/remove も安定化（必要に応じて）
  const create = useCallback(
    async (input: CreateWorkflowInput) => {
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
    [dataManager]
  );

  const update = useCallback(
    async (input: UpdateWorkflowInput) => {
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
    [dataManager]
  );

  const remove = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await dataManager.delete({ id });
        setWorkflows((prev) => (prev ? prev.filter((w) => w.id !== id) : null));
      } finally {
        setLoading(false);
      }
    },
    [dataManager]
  );

  // eslint-disable コメントを削除し、fetchWorkflows を依存に指定
  useEffect(() => {
    fetchWorkflows();
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
