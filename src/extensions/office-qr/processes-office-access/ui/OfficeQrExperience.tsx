import { AuthContext } from "@app/providers/auth/AuthContext";
import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import { OfficeQrPanel, useOfficeQr } from "@extensions/office-qr/features/office-qr";
import { useContext } from "react";

export function OfficeQrExperience() {
  const { isCognitoUserRole } = useContext(AuthContext);
  const { getOfficeMode } = useContext(AppConfigContext);
  const showAdminAlert = isCognitoUserRole(StaffRole.ADMIN);

  const isOfficeModeEnabled = getOfficeMode();

  const {
    qrUrl,
    timeLeft,
    progress,
    errorMessage,
    isRegisterMode,
    tooltipOpen,
    handleModeChange,
    handleManualRefresh,
    handleCopyUrl,
  } = useOfficeQr();

  return (
    <OfficeQrPanel
      showAdminAlert={showAdminAlert}
      isOfficeModeEnabled={isOfficeModeEnabled}
      isRegisterMode={isRegisterMode}
      timeLeft={timeLeft}
      progress={progress}
      qrUrl={qrUrl}
      errorMessage={errorMessage}
      tooltipOpen={tooltipOpen}
      onModeChange={handleModeChange}
      onCopyUrl={handleCopyUrl}
      onManualRefresh={handleManualRefresh}
    />
  );
}
