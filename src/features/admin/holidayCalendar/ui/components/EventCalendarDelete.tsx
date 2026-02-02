import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import {
  DeleteEventCalendarInput,
  EventCalendar,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";

import { useAppDispatchV2 } from "@/app/hooks";
import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import { EventCalendarMessage } from "@/shared/lib/message/EventCalendarMessage";
import { MessageStatus } from "@/shared/lib/message/Message";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

export default function EventCalendarDelete({
  eventCalendar,
  deleteEventCalendar,
}: {
  eventCalendar: EventCalendar;
  deleteEventCalendar: (input: DeleteEventCalendarInput) => Promise<void>;
}) {
  const dispatch = useAppDispatchV2();

  const onSubmit = async () => {
    const beDeleteDate = dayjs(eventCalendar.eventDate).format(
      AttendanceDate.DisplayFormat
    );
    const beDeleteName = eventCalendar.name;
    const formattedDeleteMessage = `「${beDeleteDate}(${beDeleteName})」を削除しますか？\nこの操作は取り消せません。`;

    const confirmed = window.confirm(formattedDeleteMessage);
    if (!confirmed) {
      return;
    }

    const eventCalendarMessage = EventCalendarMessage();
    await deleteEventCalendar({ id: eventCalendar.id })
      .then(() => {
        dispatch(
          setSnackbarSuccess(
            eventCalendarMessage.delete(MessageStatus.SUCCESS)
          )
        );
      })
      .catch(() => {
        dispatch(
          setSnackbarError(eventCalendarMessage.delete(MessageStatus.ERROR))
        );
      });
  };

  return (
    <IconButton onClick={onSubmit}>
      <DeleteIcon fontSize="small" />
    </IconButton>
  );
}
