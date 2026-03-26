import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useSession } from "@/app/providers/session/useSession";
import { AppConfigContext } from "@/context/AppConfigContext";
import RegisterContent from "@/pages/register/RegisterContent";

export default function Register() {
  const { hasRole } = useSession();
  const { derived } = useContext(AppConfigContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasRole(StaffRole.OPERATOR)) {
      navigate("/office/qr");
    }
  }, [hasRole, navigate]);

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

  const announcement = derived?.timeRecorderAnnouncement ?? {
    enabled: false,
    message: "",
  };

  return (
    <RegisterContent
      configId={derived?.configId ?? null}
      announcement={announcement}
    />
  );
}
