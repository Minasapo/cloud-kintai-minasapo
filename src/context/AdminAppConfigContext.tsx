import { createContext } from "react";

import { UpdateAppConfigInput } from "@/API";

type AdminAppConfigContextProps = {
  fetchAllConfigs: () => Promise<void>;
  deleteConfig: (configId: string) => Promise<void>;
  updateConfig: (
    configId: string,
    updatedConfig: UpdateAppConfigInput
  ) => Promise<void>;
};

export const AdminAppConfigContext = createContext<AdminAppConfigContextProps>({
  fetchAllConfigs: async () => {
    console.log("The process is not implemented.");
  },
  deleteConfig: async () => {
    console.log("The process is not implemented.");
  },
  updateConfig: async () => {
    console.log("The process is not implemented.");
  },
});
