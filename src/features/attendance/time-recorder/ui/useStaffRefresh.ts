import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import { Staff } from "@shared/api/graphql/types";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

import * as MESSAGE_CODE from "@/errors";

type UseStaffRefreshParams = {
  cognitoId: string | undefined;
  dispatch: ReturnType<typeof useDispatch>;
};

export function useStaffRefresh({
  cognitoId,
  dispatch,
}: UseStaffRefreshParams) {
  const [staff, setStaff] = useState<Staff | undefined>(undefined);
  const refreshStaff = useCallback(async () => {
    if (!cognitoId) return;
    try {
      const latestStaff = await fetchStaff(cognitoId);
      setStaff(latestStaff);
    } catch {
      dispatch(
        pushNotification({ tone: "error", message: MESSAGE_CODE.E00001 }),
      );
    }
  }, [cognitoId, dispatch]);
  return { staff, refreshStaff };
}
