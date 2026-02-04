import {
  CloseDate,
  CreateCloseDateInput,
  DeleteCloseDateInput,
  UpdateCloseDateInput,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import createCloseDateData from "./closeDates/createCloseDateData";
import deleteCloseDateData from "./closeDates/deleteCloseDateData";
import fetchCloseDates from "./closeDates/fetchCloseDates";
import updateCloseDateData from "./closeDates/updateCloseDateData";

export default function useCloseDates() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [closeDates, setCloseDates] = useState<CloseDate[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
