import {
  CloseDate,
  CreateCloseDateInput,
  DeleteCloseDateInput,
  UpdateCloseDateInput,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import createCloseDateData from "./createCloseDateData";
import deleteCloseDateData from "./deleteCloseDateData";
import fetchCloseDates from "./fetchCloseDates";
import updateCloseDateData from "./updateCloseDateData";

export default function useCloseDates() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [closeDates, setCloseDates] = useState<CloseDate[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchCloseDates()
      .then((res) => {
        setCloseDates(res);
      })
      .catch((e: Error) => {
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const createCloseDate = async (input: CreateCloseDateInput) =>
    createCloseDateData(input)
      .then((res) => {
        setCloseDates((prev) => [...prev, res]);
      })
      .catch((e) => {
        throw e;
      });

  const updateCloseDate = async (input: UpdateCloseDateInput) => {
    const updated = await updateCloseDateData(input);

    // Replace the target term with the updated one first
    const afterPrimaryUpdate = closeDates.map((item) =>
      item?.id === updated.id ? updated : item
    );

    // Determine the next term in chronological order
    const sortedByCloseDate = [...afterPrimaryUpdate].sort(
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
            id: nextTerm.id,
            closeDate: nextTerm.closeDate,
            startDate: desiredNextStart.toISOString(),
            endDate: nextTerm.endDate,
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
          const next = [...prev];
          next.splice(index, 1);
          return next;
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
