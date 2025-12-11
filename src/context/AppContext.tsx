import {
  CompanyHolidayCalendar,
  CreateCompanyHolidayCalendarInput,
  CreateHolidayCalendarInput,
  DeleteCompanyHolidayCalendarInput,
  DeleteHolidayCalendarInput,
  HolidayCalendar,
  UpdateCompanyHolidayCalendarInput,
  UpdateHolidayCalendarInput,
} from "@shared/api/graphql/types";
import { createContext } from "react";

type AppContextProps = {
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  createHolidayCalendar: (
    input: CreateHolidayCalendarInput
  ) => Promise<void | HolidayCalendar>;
  bulkCreateHolidayCalendar: (
    inputs: CreateHolidayCalendarInput[]
  ) => Promise<HolidayCalendar[]>;
  updateHolidayCalendar: (
    input: UpdateHolidayCalendarInput
  ) => Promise<HolidayCalendar>;
  deleteHolidayCalendar: (input: DeleteHolidayCalendarInput) => Promise<void>;
  createCompanyHolidayCalendar: (
    input: CreateCompanyHolidayCalendarInput
  ) => Promise<CompanyHolidayCalendar>;
  bulkCreateCompanyHolidayCalendar: (
    inputs: CreateCompanyHolidayCalendarInput[]
  ) => Promise<CompanyHolidayCalendar[]>;
  updateCompanyHolidayCalendar: (
    input: UpdateCompanyHolidayCalendarInput
  ) => Promise<CompanyHolidayCalendar>;
  deleteCompanyHolidayCalendar: (
    input: DeleteCompanyHolidayCalendarInput
  ) => Promise<CompanyHolidayCalendar>;
};

export const AppContext = createContext<AppContextProps>({
  holidayCalendars: [],
  companyHolidayCalendars: [],
  createHolidayCalendar: async () => {
    return;
  },
  bulkCreateHolidayCalendar: async () => {
    return [];
  },
  updateHolidayCalendar: async () => {
    return {} as HolidayCalendar;
  },
  deleteHolidayCalendar: async () => {
    return;
  },
  createCompanyHolidayCalendar: async () => {
    return {} as CompanyHolidayCalendar;
  },
  bulkCreateCompanyHolidayCalendar: async () => {
    return [];
  },
  updateCompanyHolidayCalendar: async () => {
    return {} as CompanyHolidayCalendar;
  },
  deleteCompanyHolidayCalendar: async () => {
    return {} as CompanyHolidayCalendar;
  },
});
