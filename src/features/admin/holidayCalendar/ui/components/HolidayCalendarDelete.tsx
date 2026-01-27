import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import {
  DeleteHolidayCalendarInput,
  HolidayCalendar,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";

import { useAppDispatchV2 } from "@/app/hooks";
import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import { HolidayCalendarMessage } from "@/shared/lib/message/HolidayCalendarMessage";
import { MessageStatus } from "@/shared/lib/message/Message";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

export default function HolidayCalendarDelete({
  holidayCalendar,
  deleteHolidayCalendar,
}: {
  holidayCalendar: HolidayCalendar;
  deleteHolidayCalendar: (input: DeleteHolidayCalendarInput) => Promise<void>;
}) {
  const dispatch = useAppDispatchV2();

  const onSubmit = async () => {
    const beDeleteDate = dayjs(holidayCalendar.holidayDate).format(
      AttendanceDate.DisplayFormat
    );
    const beDeleteName = holidayCalendar.name;
    const formattedDeleteMessage = `「${beDeleteDate}(${beDeleteName})」を削除しますか？\nこの操作は取り消せません。`;

    const confirmed = window.confirm(formattedDeleteMessage);
    if (!confirmed) {
      return;
    }

    const holidayCalendarMessage = new HolidayCalendarMessage();
    await deleteHolidayCalendar({ id: holidayCalendar.id })
      .then(() => {
        dispatch(
          setSnackbarSuccess(
            holidayCalendarMessage.delete(MessageStatus.SUCCESS)
          )
        );
      })
      .catch(() => {
        dispatch(
          setSnackbarError(holidayCalendarMessage.delete(MessageStatus.ERROR))
        );
      });
  };

  return (
    <IconButton onClick={onSubmit}>
      <DeleteIcon fontSize="small" />
    </IconButton>
  );
}
