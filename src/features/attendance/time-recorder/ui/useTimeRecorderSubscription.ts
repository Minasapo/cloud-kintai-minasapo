import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import { onUpdateAttendance } from "@shared/api/graphql/documents/subscriptions";
import { OnUpdateAttendanceSubscription } from "@shared/api/graphql/types";
import { Logger } from "@shared/lib/logger";
import { useEffect } from "react";

type UseTimeRecorderSubscriptionParams = {
  cognitoId: string | undefined;
  currentWorkDate: string;
  localAttendanceUpdateIgnoreUntilRef: React.MutableRefObject<number>;
  refreshTimeRecorderData: () => Promise<void>;
  logger: Logger;
};

export function useTimeRecorderSubscription({
  cognitoId,
  currentWorkDate,
  localAttendanceUpdateIgnoreUntilRef,
  refreshTimeRecorderData,
  logger,
}: UseTimeRecorderSubscriptionParams) {
  useEffect(() => {
    if (!cognitoId) return;
    const subscription = graphqlClient
      .graphql({
        query: onUpdateAttendance,
        variables: {
          filter: {
            staffId: { eq: cognitoId },
            workDate: { eq: currentWorkDate },
          },
        },
        authMode: "userPool",
      })
      .subscribe({
        next: (event) => {
          const updatedAttendance = (
            event.data as OnUpdateAttendanceSubscription
          )?.onUpdateAttendance;
          if (!updatedAttendance) return;
          if (Date.now() < localAttendanceUpdateIgnoreUntilRef.current) return;
          void refreshTimeRecorderData();
        },
        error: (error: unknown) => {
          logger.error("Subscription error:", error);
        },
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [
    cognitoId,
    currentWorkDate,
    localAttendanceUpdateIgnoreUntilRef,
    logger,
    refreshTimeRecorderData,
  ]);
}
