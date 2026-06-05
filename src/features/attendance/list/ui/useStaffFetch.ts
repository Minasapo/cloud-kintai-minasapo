import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import { Staff } from "@shared/api/graphql/types";
import { Logger } from "@shared/lib/logger";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import * as MESSAGE_CODE from "@/errors";

type UseStaffFetchParams = {
  cognitoUser: { id: string } | null | undefined;
  logger: Logger;
  dispatch: ReturnType<typeof useDispatch>;
};

export function useStaffFetch({
  cognitoUser,
  logger,
  dispatch,
}: UseStaffFetchParams): Staff | undefined {
  const [staff, setStaff] = useState<Staff | undefined>(undefined);
  useEffect(() => {
    if (!cognitoUser) return;
    fetchStaff(cognitoUser.id)
      .then((res: Staff | undefined) => {
        setStaff(res);
      })
      .catch((error: unknown) => {
        logger.debug(error);
        dispatch(
          pushNotification({
            tone: "error",
            message: MESSAGE_CODE.E00001,
          }),
        );
      });
  }, [cognitoUser, dispatch, logger]);
  return staff;
}
