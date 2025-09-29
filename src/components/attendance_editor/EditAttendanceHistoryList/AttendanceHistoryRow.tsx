import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useContext, useState } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceDateTime } from "@/lib/AttendanceDateTime";

import { AttendanceHistory } from "../../../API";

export function AttendanceHistoryRow({
  history,
}: {
  history: AttendanceHistory;
}) {
  const [open, setOpen] = useState(false);
  const { getHourlyPaidHolidayEnabled } = useContext(AppConfigContext);
  const hourlyPaidHolidayEnabled = getHourlyPaidHolidayEnabled();
  const rests = history.rests
    ? history.rests.filter(
        (item): item is NonNullable<typeof item> => item !== null
      )
    : [];

  const handleToggle = () => {
    // debug: 履歴オブジェクトの中身を確認（時間単位休暇があるか）
    // 実行時はブラウザのコンソールで確認してください
    // eslint-disable-next-line no-console
    console.debug("AttendanceHistoryRow toggle history:", history);
    setOpen(!open);
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton onClick={handleToggle}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <WorkDateTableCell history={history} />
        <WorkTimeTableCell history={history} />
        <GoDirectlyFlagTableCell history={history} />
        <ReturnDirectlyFlagTableCell history={history} />
        <PaidHolidayFlagTableCell history={history} />
        <SpecialHolidayFlagTableCell history={history} />
        <SubstituteHolidayDateTableCell history={history} />
        <RemarksTableCell history={history} />
        <CreatedAtTableCell history={history} />
        <StaffIdTableCell history={history} />
        <TableCell sx={{ flexGrow: 1 }} />
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={14}>
          <Collapse in={open} timeout="auto" unmountOnExit sx={{ py: 1 }}>
            <Typography variant="h6">休憩</Typography>
            {rests.length === 0 ? (
              <Typography variant="body1">登録はありません</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 100 }}>開始</TableCell>
                    <TableCell sx={{ width: 100 }}>終了</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rests.map((rest, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {rest.startTime
                          ? new AttendanceDateTime()
                              .setDateString(rest.startTime)
                              .toTimeFormat()
                          : "(なし)"}
                      </TableCell>
                      <TableCell>
                        {rest.endTime
                          ? new AttendanceDateTime()
                              .setDateString(rest.endTime)
                              .toTimeFormat()
                          : "(なし)"}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {/* 時間単位休暇セクションをフラグで制御 */}
            {hourlyPaidHolidayEnabled && (
              <>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  時間単位休暇
                </Typography>
                {!history.hourlyPaidHolidayTimes ||
                history.hourlyPaidHolidayTimes.filter(
                  (item): item is NonNullable<typeof item> => item !== null
                ).length === 0 ? (
                  <Typography variant="body1">登録はありません</Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 100 }}>開始</TableCell>
                        <TableCell sx={{ width: 100 }}>終了</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.hourlyPaidHolidayTimes &&
                        history.hourlyPaidHolidayTimes
                          .filter(
                            (item): item is NonNullable<typeof item> =>
                              item !== null
                          )
                          .map((holiday, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {holiday.startTime
                                  ? new AttendanceDateTime()
                                      .setDateString(holiday.startTime)
                                      .toTimeFormat()
                                  : "(なし)"}
                              </TableCell>
                              <TableCell>
                                {holiday.endTime
                                  ? new AttendanceDateTime()
                                      .setDateString(holiday.endTime)
                                      .toTimeFormat()
                                  : "(なし)"}
                              </TableCell>
                              <TableCell />
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function SubstituteHolidayDateTableCell({
  history,
}: {
  history: AttendanceHistory;
}) {
  if (!history.substituteHolidayDate) {
    return <TableCell>-</TableCell>;
  }

  const substituteHolidayDate = new AttendanceDateTime()
    .setDateString(history.substituteHolidayDate)
    .toDisplayDateFormat();

  return <TableCell>{substituteHolidayDate}</TableCell>;
}

function SpecialHolidayFlagTableCell({
  history,
}: {
  history: AttendanceHistory;
}) {
  return <TableCell>{history.specialHolidayFlag ? "◯" : "-"}</TableCell>;
}

function RemarksTableCell({ history }: { history: AttendanceHistory }) {
  return <TableCell>{history.remarks ? history.remarks : "-"}</TableCell>;
}

function WorkTimeTableCell({ history }: { history: AttendanceHistory }) {
  if (!history.startTime && !history.endTime) {
    return <TableCell>-</TableCell>;
  }

  const startTime = (() => {
    if (!history.startTime) {
      return "";
    }

    return new AttendanceDateTime()
      .setDateString(history.startTime)
      .toTimeFormat();
  })();

  const endTime = (() => {
    if (!history.endTime) {
      return "";
    }

    return new AttendanceDateTime()
      .setDateString(history.endTime)
      .toTimeFormat();
  })();

  return <TableCell>{`${startTime} 〜 ${endTime}`}</TableCell>;
}

function ReturnDirectlyFlagTableCell({
  history,
}: {
  history: AttendanceHistory;
}) {
  return <TableCell>{history.returnDirectlyFlag ? "◯" : "-"}</TableCell>;
}

function GoDirectlyFlagTableCell({ history }: { history: AttendanceHistory }) {
  return <TableCell>{history.goDirectlyFlag ? "◯" : "-"}</TableCell>;
}

function PaidHolidayFlagTableCell({ history }: { history: AttendanceHistory }) {
  return <TableCell>{history.paidHolidayFlag ? "◯" : "-"}</TableCell>;
}

function WorkDateTableCell({ history }: { history: AttendanceHistory }) {
  const workDate = new AttendanceDateTime()
    .setDateString(history.workDate)
    .toDisplayDateFormat();
  return <TableCell>{workDate}</TableCell>;
}

function StaffIdTableCell({ history }: { history: AttendanceHistory }) {
  return <TableCell>{history.staffId}</TableCell>;
}

function CreatedAtTableCell({ history }: { history: AttendanceHistory }) {
  const createdAt = new AttendanceDateTime()
    .setDateString(history.createdAt)
    .toDisplayDateTimeFormat();

  return <TableCell>{createdAt}</TableCell>;
}
