import { useOfficeQrRegister } from "../model/useOfficeQrRegister";
import { OfficeQrRegisterPanel } from "./OfficeQrRegisterPanel";

export function OfficeQrRegister() {
  const { isOfficeModeEnabled, errorMessage, mode, handleClockIn, handleClockOut } =
    useOfficeQrRegister();

  return (
    <OfficeQrRegisterPanel
      isOfficeModeEnabled={isOfficeModeEnabled}
      errorMessage={errorMessage}
      mode={mode}
      onClockIn={handleClockIn}
      onClockOut={handleClockOut}
    />
  );
}
