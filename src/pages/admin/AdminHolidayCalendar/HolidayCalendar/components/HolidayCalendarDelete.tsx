import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import {
  DeleteHolidayCalendarInput,
  HolidayCalendar,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";

import { useAppDispatchV2 } from "@/app/hooks";
import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import { HolidayCalenderMessage } from "@/lib/message/HolidayCalenderMessage";
import { MessageStatus } from "@/lib/message/Message";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

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

    const holidayCalenderMessage = new HolidayCalenderMessage();
    await deleteHolidayCalendar({ id: holidayCalendar.id })
      .then(() => {
        dispatch(
          setSnackbarSuccess(
            holidayCalenderMessage.delete(MessageStatus.SUCCESS)
          )
        );
      })
      .catch(() => {
        dispatch(
          setSnackbarError(holidayCalenderMessage.delete(MessageStatus.ERROR))
        );
      });
  };

  return (
    <IconButton onClick={onSubmit}>
      <DeleteIcon fontSize="small" />
    </IconButton>
  );
}
