import { useEffect, useState } from "react";

import {
  CompanyHolidayCalendar,
  CreateCompanyHolidayCalendarInput,
  DeleteCompanyHolidayCalendarInput,
  UpdateCompanyHolidayCalendarInput,
} from "../../API";
import createCompanyHolidayCalendarsData from "./createCompanyHolidayCalendarsData";
import deleteCompanyHolidayCalendarData from "./deleteCompanyHolidayCalendarData";
import fetchCompanyHolidayCalendars from "./fetchCompanyHolidayCalendars";
import updateCompanyHolidayCalendarData from "./updateCompanyHolidayCalendarData";

const LOCAL_STORAGE_KEY = "companyHolidayCalendars";

export default function useCompanyHolidayCalendars() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [companyHolidayCalendars, setCompanyHolidayCalendars] = useState<
    CompanyHolidayCalendar[]
  >([]);

  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      setCompanyHolidayCalendars(JSON.parse(cached));
    }
    setLoading(false);
  }, []);

  const saveToLocalStorage = (data: CompanyHolidayCalendar[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  const createCompanyHolidayCalendar = async (
    input: CreateCompanyHolidayCalendarInput
  ) =>
    createCompanyHolidayCalendarsData(input)
      .then((res) => {
        setCompanyHolidayCalendars((prev) => {
          const updated = [...prev, res];
          saveToLocalStorage(updated);
          return updated;
        });
        return res;
      })
      .catch(setError);

  const updateCompanyHolidayCalendar = async (
    input: UpdateCompanyHolidayCalendarInput
  ) =>
    updateCompanyHolidayCalendarData(input)
      .then((res) => {
        setCompanyHolidayCalendars((prev) => {
          const updated = prev.map((companyHolidayCalendar) =>
            companyHolidayCalendar.id === res.id ? res : companyHolidayCalendar
          );
          saveToLocalStorage(updated);
          return updated;
        });
        return res;
      })
      .catch((e) => {
        throw e;
      });

  const deleteCompanyHolidayCalendar = async (
    input: DeleteCompanyHolidayCalendarInput
  ) =>
    deleteCompanyHolidayCalendarData(input)
      .then((res) => {
        setCompanyHolidayCalendars((prev) => {
          const updated = prev.filter(
            (companyHolidayCalendar) => companyHolidayCalendar.id !== res.id
          );
          saveToLocalStorage(updated);
          return updated;
        });
        return res;
      })
      .catch((e) => {
        throw e;
      });

  const bulkCreateCompanyHolidayCalendar = async (
    inputs: CreateCompanyHolidayCalendarInput[]
  ) =>
    Promise.all(inputs.map((input) => createCompanyHolidayCalendarsData(input)))
      .then((res) => {
        setCompanyHolidayCalendars((prev) => {
          const updated = [...prev, ...res];
          saveToLocalStorage(updated);
          return updated;
        });
        return res;
      })
      .catch((e) => {
        throw e;
      });

  const fetchAllCompanyHolidayCalendars = async () => {
    setLoading(true);
    setError(null);
    try {
      const calendars = await fetchCompanyHolidayCalendars();
      setCompanyHolidayCalendars(calendars);
      saveToLocalStorage(calendars);
      return calendars;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    companyHolidayCalendars,
    createCompanyHolidayCalendar,
    updateCompanyHolidayCalendar,
    deleteCompanyHolidayCalendar,
    bulkCreateCompanyHolidayCalendar,
    fetchAllCompanyHolidayCalendars,
  };
}
