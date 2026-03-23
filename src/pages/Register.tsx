import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { AppConfigContext } from "@/context/AppConfigContext";
import TimeRecorder from "@/features/attendance/time-recorder/ui/TimeRecorder";
import TimeRecorderAnnouncementBanner from "@/features/attendance/time-recorder/ui/TimeRecorderAnnouncementBanner";

import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const { isCognitoUserRole } = useContext(AuthContext);
  const { getConfigId, getTimeRecorderAnnouncement } =
    useContext(AppConfigContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isCognitoUserRole(StaffRole.OPERATOR)) {
      navigate("/office/qr");
    }
  }, [isCognitoUserRole, navigate]);

  const isRegisterDisabled =
    import.meta.env.VITE_STANDARD_REGISTER_DISABLE === "true";

  if (isRegisterDisabled) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <div
          role="alert"
          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium leading-6 text-amber-950"
        >
          現在、こちらの機能は使用できません
        </div>
      </div>
    );
  }

  const announcement = getTimeRecorderAnnouncement();

  return (
    <div className="relative flex h-full flex-col overflow-x-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#ecfdf5_52%,#f8fafc_100%)] py-3 md:py-10">
      <TimeRecorderAnnouncementBanner
        configId={getConfigId()}
        announcement={announcement}
      />
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(15,168,94,0.18),transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(circle_at_bottom,rgba(15,23,42,0.08),transparent_65%)]" />
      <div className="flex justify-center">
        <TimeRecorder />
      </div>
    </div>
  );
}
