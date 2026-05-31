import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import {
  onCreateShiftRequest,
  onUpdateShiftRequest,
} from "@shared/api/graphql/documents/subscriptions";
import { createLogger } from "@shared/lib/logger";
import { MutableRefObject, useEffect } from "react";

import { normalizeShiftRequest } from "../lib/shiftTransformers";
import {
  ShiftRequestCommentData,
  ShiftRequestData,
} from "../types/collaborative.types";

const logger = createLogger("ShiftDataSubscriptions");

interface UseShiftDataSubscriptionsProps {
  staffIds: string[];
  staffIdsKey: string;
  targetMonth: string | undefined;
  currentUserId: string;
  updateShiftRequestState: (request: ShiftRequestData) => void;
  onAutoSyncReceivedRef: MutableRefObject<(() => void) | undefined>;
  onRemoteUpdateRef: MutableRefObject<
    ((staffId: string, request: ShiftRequestData) => void) | undefined
  >;
  onCommentsReceivedRef: MutableRefObject<
    | ((staffId: string, comments: ShiftRequestCommentData[]) => void)
    | undefined
  >;
}

/**
 * シフトデータのリアルタイム更新購読を管理するフック。
 *
 * 各スタッフの onCreateShiftRequest / onUpdateShiftRequest を購読し、
 * 他ユーザーの変更をローカルステートに即時反映する。
 * updatedBy === currentUserId の自己イベントは楽観的更新と重複するためスキップする。
 */
export const useShiftDataSubscriptions = ({
  staffIds,
  staffIdsKey,
  targetMonth,
  currentUserId,
  updateShiftRequestState,
  onAutoSyncReceivedRef,
  onRemoteUpdateRef,
  onCommentsReceivedRef,
}: UseShiftDataSubscriptionsProps): void => {
  useEffect(() => {
    if (!targetMonth || staffIds.length === 0) {
      return;
    }

    const handleRealtimeEvent = (
      request: ShiftRequestData,
      staffId: string,
    ) => {
      if (request.updatedBy === currentUserId) {
        return;
      }

      updateShiftRequestState(request);
      onAutoSyncReceivedRef.current?.();
      onRemoteUpdateRef.current?.(staffId, request);

      if (request.comments) {
        onCommentsReceivedRef.current?.(staffId, request.comments);
      }
    };

    const subscriptions = staffIds.flatMap((staffId) => {
      const variables = {
        filter: {
          staffId: { eq: staffId },
          targetMonth: { eq: targetMonth },
        },
      };

      const createSubscription = graphqlClient
        .graphql({
          query: onCreateShiftRequest,
          variables,
          authMode: "userPool",
        })
        .subscribe({
          next: ({ data }) => {
            if (!data?.onCreateShiftRequest) return;
            const createdRequest = normalizeShiftRequest(
              data.onCreateShiftRequest,
            );
            handleRealtimeEvent(createdRequest, staffId);
          },
          error: (error) => {
            logger.error(
              `Failed to subscribe create for staff ${staffId}:`,
              error,
            );
          },
        });

      const updateSubscription = graphqlClient
        .graphql({
          query: onUpdateShiftRequest,
          variables,
          authMode: "userPool",
        })
        .subscribe({
          next: ({ data }) => {
            if (!data?.onUpdateShiftRequest) return;
            const updatedRequest = normalizeShiftRequest(
              data.onUpdateShiftRequest,
            );
            handleRealtimeEvent(updatedRequest, staffId);
          },
          error: (error) => {
            logger.error(
              `Failed to subscribe update for staff ${staffId}:`,
              error,
            );
          },
        });

      return [createSubscription, updateSubscription];
    });

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [
    staffIdsKey,
    targetMonth,
    currentUserId,
    updateShiftRequestState,
    onAutoSyncReceivedRef,
    onRemoteUpdateRef,
    onCommentsReceivedRef,
  ]);
};
