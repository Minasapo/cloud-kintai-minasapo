import { AuthContext } from "@app/providers/auth/AuthContext";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import { ShiftCollaborativePageInner } from "@extensions/shift-collaborative/features/components/ShiftCollaborativePageInner";
import { InfoBadge } from "@extensions/shift-collaborative/features/components/ui/Badges";
import { InlineAlert } from "@extensions/shift-collaborative/features/components/ui/InlineAlert";
import { PageLoadingBar } from "@extensions/shift-collaborative/features/components/ui/PageLoadingBar";
import { CollaborativeShiftProvider } from "@extensions/shift-collaborative/features/providers/CollaborativeShiftProvider";
import { PageContent } from "@shared/ui/layout";
import Page from "@shared/ui/page/Page";
import dayjs from "dayjs";
import { useCallback, useContext, useMemo, useState } from "react";

export default function ShiftCollaborativePage() {
  const { authStatus, cognitoUser } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { staffs, loading: staffsLoading } = useStaffs({ isAuthenticated });

  const [targetMonth, setTargetMonth] = useState(() =>
    dayjs().format("YYYY-MM"),
  );

  const handlePrevMonth = useCallback(() => {
    setTargetMonth((prev) =>
      dayjs(prev).subtract(1, "month").format("YYYY-MM"),
    );
  }, []);

  const handleNextMonth = useCallback(() => {
    setTargetMonth((prev) => dayjs(prev).add(1, "month").format("YYYY-MM"));
  }, []);

  const currentUserId = useMemo(() => {
    if (!cognitoUser?.id) return "";
    const currentStaff = staffs.find(
      (staff) => staff.cognitoUserId === cognitoUser.id,
    );
    return currentStaff?.id ?? "";
  }, [cognitoUser, staffs]);

  const currentUserName = useMemo(() => {
    if (!cognitoUser?.id) return "Current User";
    const currentStaff = staffs.find(
      (staff) => staff.cognitoUserId === cognitoUser.id,
    );
    return currentStaff
      ? `${currentStaff.familyName || ""}${currentStaff.givenName || ""}`
      : "Current User";
  }, [cognitoUser, staffs]);

  const staffNameMap = useMemo(
    () =>
      new Map(
        staffs.map((staff) => [
          staff.id,
          `${staff.familyName || ""}${staff.givenName || ""}`.trim() ||
            staff.id,
        ]),
      ),
    [staffs],
  );

  const staffIds = useMemo(
    () =>
      staffs
        .filter(
          (staff) =>
            staff.enabled &&
            (staff as unknown as Record<string, unknown>).workType === "shift",
        )
        .map((staff) => staff.id),
    [staffs],
  );

  const shiftRequestId = staffIds[0] ?? "";

  if (staffsLoading) {
    return <PageLoadingBar />;
  }

  if (staffIds.length === 0) {
    return (
      <Page title="シフト調整(共同)" width="full" showDefaultHeader={false}>
        <PageContent width="full" className="px-1.5 py-1 sm:px-2.5">
          <div className="rounded-[28px] border border-emerald-500/15 bg-[linear-gradient(135deg,rgba(247,252,248,0.98)_0%,rgba(236,253,245,0.92)_58%,rgba(255,255,255,0.98)_100%)] p-4 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.35)] md:p-5">
            <InlineAlert tone="info" icon={<InfoBadge />}>
              スタッフデータが見つかりません
            </InlineAlert>
          </div>
        </PageContent>
      </Page>
    );
  }

  return (
    <CollaborativeShiftProvider
      staffIds={staffIds}
      targetMonth={targetMonth}
      currentUserId={currentUserId}
      currentUserName={currentUserName}
      shiftRequestId={shiftRequestId}
      staffNameMap={staffNameMap}
    >
      <ShiftCollaborativePageInner
        staffs={staffs}
        staffNameMap={staffNameMap}
        targetMonth={targetMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
    </CollaborativeShiftProvider>
  );
}
