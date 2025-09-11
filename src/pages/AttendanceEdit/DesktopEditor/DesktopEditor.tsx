import AddAlarmIcon from "@mui/icons-material/AddAlarm";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Stack,
  styled,
  Tab,
  Tabs,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";

import { GoDirectlyFlagCheckbox } from "@/components/attendance_editor/GoDirectlyFlagCheckbox";
import HourlyPaidHolidayTimeItem, {
  calcTotalHourlyPaidHolidayTime,
} from "@/components/attendance_editor/items/HourlyPaidHolidayTimeItem";
import QuickInputButtons from "@/components/attendance_editor/QuickInputButtons";
import GroupContainer from "@/components/ui/GroupContainer/GroupContainer";
import useAppConfig from "@/hooks/useAppConfig/useAppConfig";

import ProductionTimeItem from "../../../components/attendance_editor/items/ProductionTimeItem";
import StaffNameItem from "../../../components/attendance_editor/items/StaffNameItem";
import WorkTypeItem from "../../../components/attendance_editor/items/WorkTypeItem";
import Title from "../../../components/Title/Title";
import AttendanceEditBreadcrumb from "../AttendanceEditBreadcrumb";
import { AttendanceEditContext } from "../AttendanceEditProvider";
import ChangeRequestingAlert from "./ChangeRequestingMessage";
import NoDataAlert from "./NoDataAlert";
import PaidHolidayFlagInput from "./PaidHolidayFlagInput";
import RemarksInput from "./RemarksInput";
import { calcTotalRestTime } from "./RestTimeItem/RestTimeInput/RestTimeInput";
import RestTimeItem from "./RestTimeItem/RestTimeItem";
import ReturnDirectlyFlagInput from "./ReturnDirectlyFlagInput";
import StaffCommentInput from "./StaffCommentInput";
import { SubstituteHolidayDateInput } from "./SubstituteHolidayDateInput";
import WorkDateItem from "./WorkDateItem";
import {
  calcTotalWorkTime,
  WorkTimeInput,
} from "./WorkTimeInput/WorkTimeInput";

const DesktopContainer = styled(Container)(() => ({
  pt: 1,
  pb: 5,
}));

const BodyStack = styled(Stack)(() => ({
  padding: "0 239px",
}));

const RequestButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.primary.main,
  border: `3px solid ${theme.palette.primary.main}`,
  width: 150,
  "&:hover": {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.contrastText,
  },
  "&:disabled": {
    color: theme.palette.text.disabled,
    backgroundColor: theme.palette.action.disabledBackground,
    border: "3px solid #E0E0E0",
  },
}));

export default function DesktopEditor() {
  const {
    staff,
    onSubmit,
    register,
    control,
    setValue,
    watch,
    handleSubmit,
    isDirty,
    isValid,
    isSubmitting,
    changeRequests,
    hourlyPaidHolidayTimeFields,
    hourlyPaidHolidayTimeAppend,
    restReplace,
    hourlyPaidHolidayTimeReplace,
    workDate,
  } = useContext(AttendanceEditContext);
  const { getStartTime } = useAppConfig();
  const { hourlyPaidHolidayEnabled } = useContext(AttendanceEditContext);
  const [vacationTab, setVacationTab] = useState<number>(0);
  const [totalProductionTime, setTotalProductionTime] = useState<number>(0);
  const [totalHourlyPaidHolidayTime, setTotalHourlyPaidHolidayTime] =
    useState<number>(0);

  useEffect(() => {
    if (!watch) return;

    const unsubscribe = watch((data) => {
      if (!data.endTime) {
        setTotalProductionTime(0);
      } else {
        const totalWorkTime = calcTotalWorkTime(data.startTime, data.endTime);
        const totalRestTime =
          data.rests?.reduce((acc, rest) => {
            if (!rest) return acc;
            const diff = calcTotalRestTime(rest.startTime, rest.endTime);
            return acc + diff;
          }, 0) ?? 0;
        const totalTime = totalWorkTime - totalRestTime;
        setTotalProductionTime(totalTime);
      }
      // 合計時間単位休暇時間
      const totalHourly =
        data.hourlyPaidHolidayTimes?.reduce((acc, time) => {
          if (!time) return acc;
          if (!time.endTime) return acc;
          const diff = calcTotalHourlyPaidHolidayTime(
            time.startTime,
            time.endTime
          );
          return acc + diff;
        }, 0) ?? 0;
      setTotalHourlyPaidHolidayTime(totalHourly);
    });
    return typeof unsubscribe === "function" ? unsubscribe : undefined;
  }, [watch]);

  if (!staff || !control || !setValue || !watch || !handleSubmit || !register) {
    return null;
  }

  function TabPanel({
    children,
    value,
    index,
  }: {
    children: React.ReactNode;
    value: number;
    index: number;
  }) {
    return <>{value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null}</>;
  }

  return (
    <DesktopContainer maxWidth="xl">
      <Stack direction="column" spacing={2}>
        <AttendanceEditBreadcrumb />
        <BodyStack spacing={2}>
          <Title>勤怠編集</Title>
          <Stack direction="column" spacing={2}>
            <AttendanceEditBreadcrumb />
            <ChangeRequestingAlert changeRequests={changeRequests} />
          </Stack>
          <NoDataAlert />
          <GroupContainer>
            {setValue && restReplace && hourlyPaidHolidayTimeReplace && (
              <QuickInputButtons
                setValue={setValue}
                restReplace={restReplace}
                hourlyPaidHolidayTimeReplace={hourlyPaidHolidayTimeReplace}
                workDate={workDate ?? null}
                visibleMode="staff"
              />
            )}
          </GroupContainer>
          <GroupContainer>
            <WorkDateItem />
          </GroupContainer>
          <GroupContainer>
            <Stack spacing={2}>
              <StaffNameItem />
              <WorkTypeItem />
            </Stack>
          </GroupContainer>
          <GroupContainer>
            <WorkTimeInput />
            <GoDirectlyFlagCheckbox
              name="goDirectlyFlag"
              control={control}
              disabled={changeRequests.length > 0}
              onChangeExtra={(checked: boolean) => {
                if (checked && setValue) {
                  setValue("startTime", getStartTime().toISOString());
                }
              }}
            />
            <ReturnDirectlyFlagInput />
            <RestTimeItem />
            <Divider />
            <ProductionTimeItem
              time={totalProductionTime}
              hourlyPaidHolidayHours={totalHourlyPaidHolidayTime}
            />
          </GroupContainer>
          <GroupContainer>
            <Tabs
              value={vacationTab}
              onChange={(_, v) => setVacationTab(v)}
              aria-label="vacation-tabs-desktop"
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Tab label="代休" />
              <Tab label="有給(1日)" />
              {hourlyPaidHolidayEnabled && (
                <Tab
                  label={`時間単位(${hourlyPaidHolidayTimeFields.length})`}
                />
              )}
            </Tabs>

            <TabPanel value={vacationTab} index={0}>
              <SubstituteHolidayDateInput />
            </TabPanel>

            <TabPanel value={vacationTab} index={1}>
              <PaidHolidayFlagInput />
            </TabPanel>

            {hourlyPaidHolidayEnabled && (
              <TabPanel value={vacationTab} index={2}>
                <Stack direction="row">
                  <Box sx={{ fontWeight: "bold", width: "150px" }}>
                    {"時間単位休暇"}
                  </Box>
                  <Stack spacing={1} sx={{ flexGrow: 2 }}>
                    {hourlyPaidHolidayTimeFields.length === 0 && (
                      <Box sx={{ color: "text.secondary", fontSize: 14 }}>
                        時間単位休暇の時間帯を追加してください。
                      </Box>
                    )}
                    {hourlyPaidHolidayTimeFields.map(
                      (hourlyPaidHolidayTime, index) => (
                        <HourlyPaidHolidayTimeItem
                          key={hourlyPaidHolidayTime.id}
                          time={hourlyPaidHolidayTime}
                          index={index}
                        />
                      )
                    )}
                    <Box>
                      <IconButton
                        aria-label="add-hourly-paid-holiday-time"
                        onClick={() =>
                          hourlyPaidHolidayTimeAppend({
                            startTime: null,
                            endTime: null,
                          })
                        }
                        disabled={changeRequests.length > 0}
                      >
                        <AddAlarmIcon />
                      </IconButton>
                    </Box>
                  </Stack>
                </Stack>
              </TabPanel>
            )}
          </GroupContainer>
          <GroupContainer>
            <RemarksInput />
          </GroupContainer>
          <GroupContainer>
            <StaffCommentInput register={register} setValue={setValue} />
          </GroupContainer>
          <Box>
            <Stack
              direction="row"
              alignItems={"center"}
              justifyContent={"center"}
              spacing={3}
            >
              <Box sx={{ paddingBottom: 2 }}>
                <RequestButton
                  data-testid="attendance-submit-button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={
                    !isDirty ||
                    !isValid ||
                    isSubmitting ||
                    changeRequests.length > 0
                  }
                  startIcon={
                    isSubmitting ? <CircularProgress size={20} /> : null
                  }
                >
                  申請
                </RequestButton>
              </Box>
            </Stack>
          </Box>
        </BodyStack>
      </Stack>
    </DesktopContainer>
  );
}
