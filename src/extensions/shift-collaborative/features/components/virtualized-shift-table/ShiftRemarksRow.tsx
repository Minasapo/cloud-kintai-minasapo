import { Box, TableCell, TableRow, Typography } from "@mui/material";
import dayjs from "dayjs";

interface ShiftRemarksRowProps {
  days: dayjs.Dayjs[];
  getEventsForDay: (day: dayjs.Dayjs) => Array<{
    label: string;
    start: dayjs.Dayjs;
    end?: dayjs.Dayjs;
    color: string;
  }>;
}

const ShiftRemarksRow = ({ days, getEventsForDay }: ShiftRemarksRowProps) => (
  <TableRow>
    <TableCell
      sx={{
        position: "sticky",
        left: 0,
        zIndex: 2,
        bgcolor: "background.paper",
        fontWeight: 600,
      }}
    >
      備考
    </TableCell>
    {days.map((day) => {
      const events = getEventsForDay(day);
      return (
        <TableCell
          key={`remark-${day.format("DD")}`}
          sx={{ minWidth: 50, px: 2, py: 2, textAlign: "start", verticalAlign: "top" }}
        >
          {events.length > 0 && (
            <Box sx={{ display: "inline-block", writingMode: "vertical-rl" }}>
              {events.map((event) => (
                <Typography
                  key={`${event.label}-${event.start.format("YYYY-MM-DD")}`}
                  variant="caption"
                  component="span"
                  sx={{ fontWeight: 700, lineHeight: 1.2, display: "block" }}
                >
                  {event.label}
                </Typography>
              ))}
            </Box>
          )}
        </TableCell>
      );
    })}
  </TableRow>
);

export default ShiftRemarksRow;