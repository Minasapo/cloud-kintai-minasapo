import "./styles.scss";

import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  AlertTitle,
  Badge,
  Box,
  Container,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "@/API";
import { AttendanceStatusTooltip } from "@/components/AttendanceList/AttendanceStatusTooltip";
import CommonBreadcrumbs from "@/components/common/CommonBreadcrumbs";
import { AppContext } from "@/context/AppContext";
import fetchStaff from "@/hooks/useStaff/fetchStaff";
import { AttendanceDate } from "@/lib/AttendanceDate";
import { ChangeRequest } from "@/lib/ChangeRequest";
import { CompanyHoliday } from "@/lib/CompanyHoliday";
import { DayOfWeek, DayOfWeekString } from "@/lib/DayOfWeek";
import { Holiday } from "@/lib/Holiday";
import { calcTotalRestTime } from "@/pages/AttendanceEdit/DesktopEditor/RestTimeItem/RestTimeInput/RestTimeInput";
import { calcTotalWorkTime } from "@/pages/AttendanceEdit/DesktopEditor/WorkTimeInput/WorkTimeInput";

import { useAppDispatchV2 } from "../../../app/hooks";
import * as MESSAGE_CODE from "../../../errors";
import useAttendances from "../../../hooks/useAttendances/useAttendances";
import { setSnackbarError } from "../../../lib/reducers/snackbarReducer";
import { AttendanceGraph } from "./AttendanceGraph";
import { CreatedAtTableCell } from "./CreatedAtTableCell";
import { RestTimeTableCell } from "./RestTimeTableCell";
import { SummaryTableCell } from "./SummaryTableCell";
import { UpdatedAtTableCell } from "./UpdatedAtTableCell";
import { WorkDateTableCell } from "./WorkDateTableCell";
import { WorkTimeTableCell } from "./WorkTimeTableCell";

export function getTableRowClassName(
  attendance: Attendance,
  holidayCalendars: HolidayCalendar[],
  companyHolidayCalendars: CompanyHolidayCalendar[]
) {
  const { workDate } = attendance;

  const today = dayjs().format(AttendanceDate.DataFormat);
  if (workDate === today) {
    return "table-row--today";
  }

  const isHoliday = new Holiday(holidayCalendars, workDate).isHoliday();
  const isCompanyHoliday = new CompanyHoliday(
    companyHolidayCalendars,
    workDate
  ).isHoliday();

  if (isHoliday || isCompanyHoliday) {
    return "table-row--sunday";
  }

  const dayOfWeek = new DayOfWeek(holidayCalendars).getLabel(workDate);
  switch (dayOfWeek) {
    case DayOfWeekString.Sat:
      return "table-row--saturday";
    case DayOfWeekString.Sun:
    case DayOfWeekString.Holiday:
      return "table-row--sunday";
    default:
      return "table-row--default";
  }
}

export default function AdminStaffAttendanceList() {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatchV2();

  const { holidayCalendars, companyHolidayCalendars } = useContext(AppContext);
  const [staff, setStaff] = useState<Staff | undefined | null>(undefined);

  const { attendances, getAttendances } = useAttendances();

  useEffect(() => {
    if (!staffId) return;
    getAttendances(staffId).catch(() =>
      dispatch(setSnackbarError(MESSAGE_CODE.E02001))
    );

    fetchStaff(staffId)
      .then(setStaff)
      .catch(() => {
        dispatch(setSnackbarError(MESSAGE_CODE.E00001));
      });
  }, [staffId]);

  const totalTime = useMemo(() => {
    const totalWorkTime = attendances.reduce((acc, attendance) => {
      if (!attendance.startTime || !attendance.endTime) return acc;
      const workTime = calcTotalWorkTime(
        attendance.startTime,
        attendance.endTime
      );
      return acc + workTime;
    }, 0);

    const totalRestTime = attendances.reduce((acc, attendance) => {
      if (!attendance.rests) return acc;
      const restTime = attendance.rests
        .filter((item): item is NonNullable<typeof item> => !!item)
        .reduce((acc, rest) => {
          if (!rest.startTime || !rest.endTime) return acc;
          return acc + calcTotalRestTime(rest.startTime, rest.endTime);
        }, 0);
      return acc + restTime;
    }, 0);
    return totalWorkTime - totalRestTime;
  }, [attendances]);

  const handleEdit = useCallback(
    (workDate: string) => {
      navigate(`/admin/attendances/edit/${workDate}/${staffId}`);
    },
    [navigate, staffId]
  );

  const getBadgeContent = useCallback((attendance: Attendance) => {
    return new ChangeRequest(attendance.changeRequests).getUnapprovedCount();
  }, []);

  const pendingAttendances = useMemo(() => {
    return attendances.filter(
      (a) => new ChangeRequest(a.changeRequests).getUnapprovedCount() > 0
    );
  }, [attendances]);

  const getTableRowClassNameMemo = useCallback(
    (
      attendance: Attendance,
      holidayCalendars: HolidayCalendar[],
      companyHolidayCalendars: CompanyHolidayCalendar[]
    ) => {
      // 指定休日フラグが立っていれば日曜と同じスタイルにする
      if (staff?.workType === "shift" && attendance.isDeemedHoliday) {
        return "table-row--sunday";
      }

      // Shift勤務のスタッフは土日祝の色付けをしない
      if (staff?.workType === "shift") {
        return "table-row--default";
      }
      return getTableRowClassName(
        attendance,
        holidayCalendars,
        companyHolidayCalendars
      );
    },
    [staff, holidayCalendars, companyHolidayCalendars]
  );

  if (staff === null || !staffId) {
    return (
      <Container maxWidth="xl" sx={{ pt: 2 }}>
        <Typography>データ取得中に何らかの問題が発生しました</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Stack spacing={1} sx={{ pt: 1 }}>
        <Box>
          <CommonBreadcrumbs
            items={[
              { label: "TOP", href: "/" },
              { label: "勤怠管理", href: "/admin/attendances" },
            ]}
            current="勤怠一覧"
          />
        </Box>
        <Typography variant="h4">
          {`${staff?.familyName || "(不明)"} さんの勤怠(${totalTime.toFixed(
            1
          )}h)`}
        </Typography>
        <Box>
          <DatePicker
            value={dayjs()}
            format={AttendanceDate.DisplayFormat}
            label="日付を指定して移動"
            slotProps={{
              textField: { size: "small" },
            }}
            onChange={(date) => {
              if (date) {
                navigate(
                  `/admin/attendances/edit/${date.format(
                    AttendanceDate.QueryParamFormat
                  )}/${staffId}`
                );
              }
            }}
          />
        </Box>
        <Box>
          <AttendanceGraph attendances={attendances} />
        </Box>
        {pendingAttendances.length > 0 && (
          <Box sx={{ pb: 2 }}>
            {/* 目立たせるために枠と背景で囲む */}
            <Box
              sx={{
                border: "1px solid",
                borderColor: "warning.main",
                borderRadius: 2,
                p: 2,
                backgroundColor: "rgba(255,243,205,0.12)",
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                承認待ち一覧 ({pendingAttendances.length})
              </Typography>
              <Alert severity="warning">
                <AlertTitle sx={{ fontWeight: "bold" }}>
                  確認してください
                </AlertTitle>
                未承認の変更リクエストがあります
              </Alert>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        勤務日
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        勤務時間
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        休憩時間(直近)
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>摘要</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        作成日時
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        更新日時
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingAttendances.map((attendance, index) => (
                      <TableRow
                        key={`pending-${index}`}
                        className={getTableRowClassNameMemo(
                          attendance,
                          holidayCalendars,
                          companyHolidayCalendars
                        )}
                        data-testid={
                          index === pendingAttendances.length - 1
                            ? "last-row-pending"
                            : undefined
                        }
                      >
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <AttendanceStatusTooltip
                              staff={staff}
                              attendance={attendance}
                              holidayCalendars={holidayCalendars}
                              companyHolidayCalendars={companyHolidayCalendars}
                            />
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleEdit(
                                  dayjs(attendance.workDate).format(
                                    AttendanceDate.QueryParamFormat
                                  )
                                )
                              }
                              data-testid="edit-attendance"
                            >
                              <Badge
                                badgeContent={getBadgeContent(attendance)}
                                color="primary"
                              >
                                <EditIcon fontSize="small" />
                              </Badge>
                            </IconButton>
                          </Stack>
                        </TableCell>

                        {/* 勤務日 */}
                        <WorkDateTableCell
                          workDate={attendance.workDate}
                          holidayCalendars={holidayCalendars}
                          companyHolidayCalendars={companyHolidayCalendars}
                        />

                        {/* 勤務時間 */}
                        <WorkTimeTableCell attendance={attendance} />

                        {/* 休憩時間(最近) */}
                        <RestTimeTableCell attendance={attendance} />

                        {/* 摘要 */}
                        <SummaryTableCell
                          paidHolidayFlag={attendance.paidHolidayFlag}
                          substituteHolidayDate={
                            attendance.substituteHolidayDate
                          }
                          remarks={attendance.remarks}
                          // 特別休暇フラグを渡す
                          specialHolidayFlag={attendance.specialHolidayFlag}
                        />

                        {/* 作成日時 */}
                        <CreatedAtTableCell createdAt={attendance.createdAt} />

                        {/* 更新日時 */}
                        <UpdatedAtTableCell updatedAt={attendance.updatedAt} />

                        <TableCell sx={{ width: 1 }} />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}
        <Box sx={{ pb: 5 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell sx={{ whiteSpace: "nowrap" }}>勤務日</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>勤務時間</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    休憩時間(直近)
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>摘要</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>作成日時</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>更新日時</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {attendances.map((attendance, index) => (
                  <TableRow
                    key={index}
                    className={getTableRowClassNameMemo(
                      attendance,
                      holidayCalendars,
                      companyHolidayCalendars
                    )}
                    data-testid={
                      index === attendances.length - 1 ? "last-row" : undefined
                    }
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AttendanceStatusTooltip
                          staff={staff}
                          attendance={attendance}
                          holidayCalendars={holidayCalendars}
                          companyHolidayCalendars={companyHolidayCalendars}
                        />
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleEdit(
                              dayjs(attendance.workDate).format(
                                AttendanceDate.QueryParamFormat
                              )
                            )
                          }
                          data-testid="edit-attendance-button"
                        >
                          <Badge
                            badgeContent={getBadgeContent(attendance)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </Badge>
                        </IconButton>
                      </Stack>
                    </TableCell>

                    {/* 勤務日 */}
                    <WorkDateTableCell
                      workDate={attendance.workDate}
                      holidayCalendars={holidayCalendars}
                      companyHolidayCalendars={companyHolidayCalendars}
                    />

                    {/* 勤務時間 */}
                    <WorkTimeTableCell attendance={attendance} />

                    {/* 休憩時間(最近) */}
                    <RestTimeTableCell attendance={attendance} />

                    {/* 摘要 */}
                    <SummaryTableCell
                      paidHolidayFlag={attendance.paidHolidayFlag}
                      substituteHolidayDate={attendance.substituteHolidayDate}
                      remarks={attendance.remarks}
                      // 特別休暇フラグを渡す
                      specialHolidayFlag={attendance.specialHolidayFlag}
                    />

                    {/* 作成日時 */}
                    <CreatedAtTableCell createdAt={attendance.createdAt} />

                    {/* 更新日時 */}
                    <UpdatedAtTableCell updatedAt={attendance.updatedAt} />

                    <TableCell sx={{ width: 1 }} />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </Container>
  );
}
