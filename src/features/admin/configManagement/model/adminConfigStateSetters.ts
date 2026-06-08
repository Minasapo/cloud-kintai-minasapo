import type { AdminConfigFormState } from "@features/admin/configManagement/lib/formState";
import type { Dispatch, SetStateAction } from "react";

import type { AdminConfigStateSetters } from "./adminConfigFormTypes";

function resolveSetStateAction<T>(value: SetStateAction<T>, current: T): T {
    return typeof value === "function"
        ? (value as (prev: T) => T)(current)
        : value;
}

export function createAdminConfigStateSetters(
    setFormState: Dispatch<SetStateAction<AdminConfigFormState>>,
): AdminConfigStateSetters {
    return {
        setStartTime: (value) =>
            setFormState((prev) => ({
                ...prev,
                startTime: resolveSetStateAction(value, prev.startTime),
            })),
        setEndTime: (value) =>
            setFormState((prev) => ({
                ...prev,
                endTime: resolveSetStateAction(value, prev.endTime),
            })),
        setLunchRestStartTime: (value) =>
            setFormState((prev) => ({
                ...prev,
                lunchRestStartTime: resolveSetStateAction(
                    value,
                    prev.lunchRestStartTime,
                ),
            })),
        setLunchRestEndTime: (value) =>
            setFormState((prev) => ({
                ...prev,
                lunchRestEndTime: resolveSetStateAction(
                    value,
                    prev.lunchRestEndTime,
                ),
            })),
        setAmHolidayStartTime: (value) =>
            setFormState((prev) => ({
                ...prev,
                amHolidayStartTime: resolveSetStateAction(
                    value,
                    prev.amHolidayStartTime,
                ),
            })),
        setAmHolidayEndTime: (value) =>
            setFormState((prev) => ({
                ...prev,
                amHolidayEndTime: resolveSetStateAction(
                    value,
                    prev.amHolidayEndTime,
                ),
            })),
        setPmHolidayStartTime: (value) =>
            setFormState((prev) => ({
                ...prev,
                pmHolidayStartTime: resolveSetStateAction(
                    value,
                    prev.pmHolidayStartTime,
                ),
            })),
        setPmHolidayEndTime: (value) =>
            setFormState((prev) => ({
                ...prev,
                pmHolidayEndTime: resolveSetStateAction(
                    value,
                    prev.pmHolidayEndTime,
                ),
            })),
        setAmPmHolidayEnabled: (value) =>
            setFormState((prev) => ({
                ...prev,
                amPmHolidayEnabled: resolveSetStateAction(
                    value,
                    prev.amPmHolidayEnabled,
                ),
            })),
        setTimeRecorderAnnouncementEnabled: (value) =>
            setFormState((prev) => ({
                ...prev,
                timeRecorderAnnouncementEnabled: resolveSetStateAction(
                    value,
                    prev.timeRecorderAnnouncementEnabled,
                ),
            })),
        setTimeRecorderAnnouncementMessage: (value) =>
            setFormState((prev) => ({
                ...prev,
                timeRecorderAnnouncementMessage: resolveSetStateAction(
                    value,
                    prev.timeRecorderAnnouncementMessage,
                ),
            })),
    };
}