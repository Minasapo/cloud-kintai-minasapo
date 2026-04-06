import {
  CloseDate,
  CreateCloseDateInput,
  DeleteCloseDateInput,
  OnCreateCloseDateSubscription,
  OnDeleteCloseDateSubscription,
  OnUpdateCloseDateSubscription,
  UpdateCloseDateInput,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import {
  buildVersionOrUpdatedAtCondition,
  getNextVersion,
} from "@/shared/api/graphql/concurrency";
import {
  onCreateCloseDate,
  onDeleteCloseDate,
  onUpdateCloseDate,
} from "@/shared/api/graphql/documents/subscriptions";

import createCloseDateData from "./closeDates/createCloseDateData";
import deleteCloseDateData from "./closeDates/deleteCloseDateData";
import fetchCloseDates from "./closeDates/fetchCloseDates";
import updateCloseDateData from "./closeDates/updateCloseDateData";

export default function useCloseDates() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [closeDates, setCloseDates] = useState<CloseDate[]>([]);

  const reloadCloseDates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCloseDates();
      setCloseDates(res);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadCloseDates();
  }, [reloadCloseDates]);

  useEffect(() => {
    let isMounted = true;
    let reloadTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleReload = () => {
      if (reloadTimer) {
        clearTimeout(reloadTimer);
      }

      reloadTimer = setTimeout(() => {
        if (!isMounted) {
          return;
        }
        void reloadCloseDates();
      }, 300);
    };

    const createSubscription = graphqlClient
      .graphql({ query: onCreateCloseDate, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnCreateCloseDateSubscription }) => {
          if (!data?.onCreateCloseDate) {
            return;
          }
          scheduleReload();
        },
      });

    const updateSubscription = graphqlClient
      .graphql({ query: onUpdateCloseDate, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnUpdateCloseDateSubscription }) => {
          if (!data?.onUpdateCloseDate) {
            return;
          }
          scheduleReload();
        },
      });

    const deleteSubscription = graphqlClient
      .graphql({ query: onDeleteCloseDate, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnDeleteCloseDateSubscription }) => {
          if (!data?.onDeleteCloseDate) {
            return;
          }
          scheduleReload();
        },
      });

    return () => {
      isMounted = false;
      if (reloadTimer) {
        clearTimeout(reloadTimer);
      }
      createSubscription.unsubscribe();
      updateSubscription.unsubscribe();
      deleteSubscription.unsubscribe();
    };
  }, [reloadCloseDates]);

  const createCloseDate = async (input: CreateCloseDateInput) =>
    createCloseDateData(input)
      .then((res) => {
        setCloseDates((prev) => [...prev, res]);
      })
      .catch((e) => {
        throw e;
      });

  const updateCloseDate = async (input: UpdateCloseDateInput) => {
    const currentCloseDate = closeDates.find((item) => item.id === input.id);
    const updated = await updateCloseDateData({
      input: {
        ...input,
        version: getNextVersion(currentCloseDate?.version),
      },
      condition: buildVersionOrUpdatedAtCondition(
        currentCloseDate?.version,
        currentCloseDate?.updatedAt,
      ),
    });

    // Replace the target term with the updated one first
    const afterPrimaryUpdate = closeDates.map((item) =>
      item?.id === updated.id ? updated : item
    );

    // Determine the next term in chronological order
    const sortedByCloseDate = afterPrimaryUpdate.toSorted(
      (a, b) => dayjs(a.closeDate).valueOf() - dayjs(b.closeDate).valueOf()
    );
    const currentIndex = sortedByCloseDate.findIndex(
      (item) => item.id === updated.id
    );
    const nextTerm = sortedByCloseDate[currentIndex + 1];

    let finalState = afterPrimaryUpdate;

    if (nextTerm?.startDate && nextTerm.endDate && updated.endDate) {
      const desiredNextStart = dayjs(updated.endDate).add(1, "day");
      const currentNextStart = dayjs(nextTerm.startDate);
      const gapDays = currentNextStart.diff(desiredNextStart, "day");

      if (gapDays > 0) {
        try {
          const adjustedNext = await updateCloseDateData({
            input: {
              id: nextTerm.id,
              closeDate: nextTerm.closeDate,
              startDate: desiredNextStart.toISOString(),
              endDate: nextTerm.endDate,
              version: getNextVersion(nextTerm.version),
            },
            condition: buildVersionOrUpdatedAtCondition(
              nextTerm.version,
              nextTerm.updatedAt,
            ),
          });

          // Slide the next term's start date forward to fill the gap
          finalState = finalState.map((item) =>
            item?.id === adjustedNext.id ? adjustedNext : item
          );
        } catch (error) {
          setCloseDates(finalState);
          throw error;
        }
      }
    }

    setCloseDates(finalState);
  };

  const deleteCloseDate = async (input: DeleteCloseDateInput) =>
    deleteCloseDateData(input)
      .then((res) => {
        setCloseDates((prev) => {
          const index = prev.findIndex((c) => c?.id === res?.id);
          if (index === -1) {
            return prev;
          }
          return prev.toSpliced(index, 1);
        });
      })
      .catch((e) => {
        throw e;
      });

  return {
    loading,
    error,
    closeDates,
    createCloseDate,
    updateCloseDate,
    deleteCloseDate,
  };
}
