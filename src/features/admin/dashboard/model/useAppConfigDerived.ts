import { useContext, useMemo } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";

export function useAppConfigDerived() {
  const { derived } = useContext(AppConfigContext);

  return useMemo(() => derived, [derived]);
}

export function useStandardWorkHours() {
  const { derived, getStandardWorkHours } = useContext(AppConfigContext);

  return useMemo(() => {
    if (typeof derived?.standardWorkHours === "number") {
      return derived.standardWorkHours;
    }

    return getStandardWorkHours();
  }, [derived?.standardWorkHours, getStandardWorkHours]);
}
