import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import { shiftPlanYearByTargetYear } from "@shared/api/graphql/documents/queries";
import type { ShiftPlanYearByTargetYearQuery } from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import { type GraphQLResult } from "aws-amplify/api";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

const logger = createLogger("ShiftPlanCapacities");

export const useShiftPlanCapacities = (targetMonth: string) => {
  const currentMonth = useMemo(() => dayjs(targetMonth), [targetMonth]);
  const [shiftPlanCapacities, setShiftPlanCapacities] = useState<number[]>([]);

  useEffect(() => {
    const fetchShiftPlan = async () => {
      try {
        const result = (await graphqlClient.graphql({
          query: shiftPlanYearByTargetYear,
          variables: { targetYear: currentMonth.year(), limit: 1 },
          authMode: "userPool",
        })) as GraphQLResult<ShiftPlanYearByTargetYearQuery>;

        if (result.errors?.length) {
          throw new Error(result.errors.map((error) => error.message).join(","));
        }

        const shiftPlanYear =
          result.data?.shiftPlanYearByTargetYear?.items?.find(
            (item): item is NonNullable<typeof item> => item !== null,
          ) ?? null;
        const monthPlan = shiftPlanYear?.plans?.find(
          (plan) => plan?.month === currentMonth.month() + 1,
        );

        if (monthPlan?.dailyCapacities) {
          setShiftPlanCapacities(
            monthPlan.dailyCapacities.map((capacity) => capacity ?? Number.NaN),
          );
          return;
        }
        setShiftPlanCapacities([]);
      } catch (error) {
        logger.error("Failed to fetch shift plan:", error);
        setShiftPlanCapacities([]);
      }
    };

    void fetchShiftPlan();
  }, [currentMonth]);

  return {
    currentMonth,
    shiftPlanCapacities,
  };
};
