import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import TimeRecorder from "@/features/attendance/time-recorder/ui/TimeRecorder";

import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const { isCognitoUserRole } = useContext(AuthContext);
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

  return (
    <div className="flex h-full justify-center py-2 md:py-10">
      <TimeRecorder />
    </div>
  );
}
