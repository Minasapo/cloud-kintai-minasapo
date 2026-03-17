import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { ReactNode } from "react";

type MuiXDateProviderProps = {
  children: ReactNode;
};

export default function MuiXDateProvider({
  children,
}: MuiXDateProviderProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
      {children}
    </LocalizationProvider>
  );
}
