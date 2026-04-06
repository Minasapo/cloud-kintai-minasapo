import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { CreateStaffInput, UpdateStaffInput } from "@shared/api/graphql/types";
import { useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import * as MESSAGE_CODE from "@/errors";
import { handleSyncCognitoUser } from "@/features/admin/staff/model/handleSyncCognitoUser";
import { pushNotification } from "@/shared/lib/store/notificationSlice";

export default function SyncCognitoUser({ staffs, refreshStaff, createStaff, updateStaff, }: {
    staffs: StaffType[];
    refreshStaff: () => Promise<void>;
    createStaff: (input: CreateStaffInput) => Promise<void>;
    updateStaff: (input: UpdateStaffInput) => Promise<void>;
}) {
    const dispatch = useAppDispatchV2();
    const [cognitoUserLoading, setCognitoUserLoading] = useState(false);
    return (<button type="button" disabled={cognitoUserLoading} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-700/15 bg-white/90 px-4 text-xs font-semibold tracking-wide text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70" onClick={() => {
            setCognitoUserLoading(true);
            handleSyncCognitoUser(staffs, refreshStaff, createStaff, updateStaff)
                .then(() => {
                dispatch(pushNotification({
                    tone: "success",
                    message: MESSAGE_CODE.S05005
                }));
            })
                .catch((e) => {
                dispatch(pushNotification({
                    tone: "error",
                    message: e.message
                }));
            })
                .finally(() => {
                setCognitoUserLoading(false);
            });
        }}>
      {cognitoUserLoading ? (<svg className="h-4 w-4 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-30"/>
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>) : (<svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 0 1 15.3-6.3L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-15.3 6.3L3 16"/>
          <path d="M3 21v-5h5"/>
        </svg>)}
      ユーザー同期
    </button>);
}
