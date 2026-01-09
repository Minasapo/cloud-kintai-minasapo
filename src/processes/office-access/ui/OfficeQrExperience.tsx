import { OfficeQrPanel, useOfficeQr } from "@features/attendance/office-qr";
import { useContext, useEffect, useState } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import { StaffRole } from "@/hooks/useStaffs/useStaffs";

export function OfficeQrExperience() {
  const { isCognitoUserRole } = useContext(AuthContext);
  const { getOfficeMode } = useContext(AppConfigContext);
  const [showAdminAlert, setShowAdminAlert] = useState(false);

  const isOfficeModeEnabled = getOfficeMode();

  const {
    qrUrl,
    timeLeft,
    progress,
    isRegisterMode,
    tooltipOpen,
    handleModeChange,
    handleManualRefresh,
    handleCopyUrl,
  } = useOfficeQr();

  useEffect(() => {
    if (isCognitoUserRole(StaffRole.ADMIN)) {
      setShowAdminAlert(true);
    }
  }, [isCognitoUserRole]);

  return (
    <OfficeQrPanel
      showAdminAlert={showAdminAlert}
      isOfficeModeEnabled={isOfficeModeEnabled}
      isRegisterMode={isRegisterMode}
      timeLeft={timeLeft}
      progress={progress}
      qrUrl={qrUrl}
      tooltipOpen={tooltipOpen}
      onModeChange={handleModeChange}
      onCopyUrl={handleCopyUrl}
      onManualRefresh={handleManualRefresh}
    />
  );
}
