import { OfficeQrPanel, useOfficeQr } from "@features/attendance/office-qr";
import React, { useContext, useEffect, useState } from "react";

import { AuthContext } from "@/context/AuthContext";
import { StaffRole } from "@/hooks/useStaffs/useStaffs";

import { AppConfigContext } from "../../../context/AppConfigContext";

const OfficeQRView: React.FC = () => {
  const { isCognitoUserRole } = useContext(AuthContext);
  const { getOfficeMode } = useContext(AppConfigContext);
  const [showAdminAlert, setShowAdminAlert] = useState(false);
  const [isOfficeModeEnabled, setIsOfficeModeEnabled] = useState(false);

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
    setIsOfficeModeEnabled(getOfficeMode());
  }, [getOfficeMode]);

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
};

export default OfficeQRView;
