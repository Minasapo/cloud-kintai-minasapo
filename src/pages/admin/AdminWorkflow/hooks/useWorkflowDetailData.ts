import { getWorkflow } from "@shared/api/graphql/documents/queries";
import { GetWorkflowQuery } from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";
import { useCallback, useEffect, useState } from "react";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

export const useWorkflowDetailData = (id?: string) => {
  const [workflow, setWorkflow] = useState<NonNullable<
    GetWorkflowQuery["getWorkflow"]
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflow = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const resp = (await graphqlClient.graphql({
        query: getWorkflow,
        variables: { id },
        authMode: "userPool",
      })) as GraphQLResult<GetWorkflowQuery>;

      if (resp.errors?.length) {
        throw new Error(resp.errors[0].message);
      }

      if (!resp.data?.getWorkflow) {
        setError("指定されたワークフローが見つかりませんでした");
        setWorkflow(null);
      } else {
        setWorkflow(resp.data.getWorkflow);
      }
    } catch (err) {
      // log in component if needed
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchWorkflow();
  }, [fetchWorkflow]);

  return { workflow, setWorkflow, loading, error, refetchWorkflow: fetchWorkflow };
};
