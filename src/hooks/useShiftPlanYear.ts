import { GraphQLResult } from "@aws-amplify/api";
import { API } from "aws-amplify";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ShiftPlanMonthSetting,
  ShiftPlanYearByTargetYearQuery,
  ShiftPlanYearByTargetYearQueryVariables,
} from "@/API";
import { shiftPlanYearByTargetYear } from "@/graphql/queries";

type UseShiftPlanYearResult = {
  plans: ShiftPlanMonthSetting[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const normalizePlans = (
  plans?: (ShiftPlanMonthSetting | null)[] | null
): ShiftPlanMonthSetting[] | null => {
  if (!plans?.length) return null;
  const filtered = plans.filter(
    (plan): plan is ShiftPlanMonthSetting => plan !== null
  );
  return filtered.length ? filtered : null;
};

const buildErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Unknown error";
};

const useShiftPlanYear = (targetYear: number): UseShiftPlanYearResult => {
  const [plans, setPlans] = useState<ShiftPlanMonthSetting[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = (await API.graphql({
        query: shiftPlanYearByTargetYear,
        variables: {
          targetYear,
          limit: 1,
        } as ShiftPlanYearByTargetYearQueryVariables,
        authMode: "AMAZON_COGNITO_USER_POOLS",
      })) as GraphQLResult<ShiftPlanYearByTargetYearQuery>;

      if (!isMountedRef.current) return;

      if (response.errors?.length) {
        throw new Error(response.errors.map((e) => e.message).join(","));
      }

      const record =
        response.data?.shiftPlanYearByTargetYear?.items?.find(
          (item): item is NonNullable<typeof item> => item !== null
        ) ?? null;

      setPlans(normalizePlans(record?.plans));
    } catch (err) {
      console.error(err);
      if (!isMountedRef.current) return;
      setError(buildErrorMessage(err));
      setPlans(null);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [targetYear]);

  useEffect(() => {
    void fetchPlans();
  }, [fetchPlans]);

  return { plans, loading, error, refetch: fetchPlans };
};

export default useShiftPlanYear;
