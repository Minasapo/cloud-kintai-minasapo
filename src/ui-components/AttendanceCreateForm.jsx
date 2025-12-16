/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Button,
  Flex,
  Grid,
  SwitchField,
  TextField,
} from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { createAttendance } from "../shared/api/graphql/documents/mutations";
const client = generateClient();
export default function AttendanceCreateForm(props) {
  const {
    clearOnSuccess = true,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    staffId: "",
    workDate: "",
    startTime: "",
    endTime: "",
    goDirectlyFlag: false,
    returnDirectlyFlag: false,
    absentFlag: false,
    remarks: "",
    paidHolidayFlag: false,
    specialHolidayFlag: false,
    isDeemedHoliday: false,
    hourlyPaidHolidayHours: "",
    substituteHolidayDate: "",
    revision: "",
  };
  const [staffId, setStaffId] = React.useState(initialValues.staffId);
  const [workDate, setWorkDate] = React.useState(initialValues.workDate);
  const [startTime, setStartTime] = React.useState(initialValues.startTime);
  const [endTime, setEndTime] = React.useState(initialValues.endTime);
  const [goDirectlyFlag, setGoDirectlyFlag] = React.useState(
    initialValues.goDirectlyFlag
  );
  const [returnDirectlyFlag, setReturnDirectlyFlag] = React.useState(
    initialValues.returnDirectlyFlag
  );
  const [absentFlag, setAbsentFlag] = React.useState(initialValues.absentFlag);
  const [remarks, setRemarks] = React.useState(initialValues.remarks);
  const [paidHolidayFlag, setPaidHolidayFlag] = React.useState(
    initialValues.paidHolidayFlag
  );
  const [specialHolidayFlag, setSpecialHolidayFlag] = React.useState(
    initialValues.specialHolidayFlag
  );
  const [isDeemedHoliday, setIsDeemedHoliday] = React.useState(
    initialValues.isDeemedHoliday
  );
  const [hourlyPaidHolidayHours, setHourlyPaidHolidayHours] = React.useState(
    initialValues.hourlyPaidHolidayHours
  );
  const [substituteHolidayDate, setSubstituteHolidayDate] = React.useState(
    initialValues.substituteHolidayDate
  );
  const [revision, setRevision] = React.useState(initialValues.revision);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setStaffId(initialValues.staffId);
    setWorkDate(initialValues.workDate);
    setStartTime(initialValues.startTime);
    setEndTime(initialValues.endTime);
    setGoDirectlyFlag(initialValues.goDirectlyFlag);
    setReturnDirectlyFlag(initialValues.returnDirectlyFlag);
    setAbsentFlag(initialValues.absentFlag);
    setRemarks(initialValues.remarks);
    setPaidHolidayFlag(initialValues.paidHolidayFlag);
    setSpecialHolidayFlag(initialValues.specialHolidayFlag);
    setIsDeemedHoliday(initialValues.isDeemedHoliday);
    setHourlyPaidHolidayHours(initialValues.hourlyPaidHolidayHours);
    setSubstituteHolidayDate(initialValues.substituteHolidayDate);
    setRevision(initialValues.revision);
    setErrors({});
  };
  const validations = {
    staffId: [{ type: "Required" }],
    workDate: [{ type: "Required" }],
    startTime: [],
    endTime: [],
    goDirectlyFlag: [],
    returnDirectlyFlag: [],
    absentFlag: [],
    remarks: [],
    paidHolidayFlag: [],
    specialHolidayFlag: [],
    isDeemedHoliday: [],
    hourlyPaidHolidayHours: [],
    substituteHolidayDate: [],
    revision: [],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          staffId,
          workDate,
          startTime,
          endTime,
          goDirectlyFlag,
          returnDirectlyFlag,
          absentFlag,
          remarks,
          paidHolidayFlag,
          specialHolidayFlag,
          isDeemedHoliday,
          hourlyPaidHolidayHours,
          substituteHolidayDate,
          revision,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value === "") {
              modelFields[key] = null;
            }
          });
          await client.graphql({
            query: createAttendance.replaceAll("__typename", ""),
            variables: {
              input: {
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
          if (clearOnSuccess) {
            resetStateValues();
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "AttendanceCreateForm")}
      {...rest}
    >
      <TextField
        label="Staff id"
        isRequired={true}
        isReadOnly={false}
        value={staffId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId: value,
              workDate,
              startTime,
              endTime,
              goDirectlyFlag,
              returnDirectlyFlag,
              absentFlag,
              remarks,
              paidHolidayFlag,
              specialHolidayFlag,
              isDeemedHoliday,
              hourlyPaidHolidayHours,
              substituteHolidayDate,
              revision,
            };
            const result = onChange(modelFields);
            value = result?.staffId ?? value;
          }
          if (errors.staffId?.hasError) {
            runValidationTasks("staffId", value);
          }
          setStaffId(value);
        }}
        onBlur={() => runValidationTasks("staffId", staffId)}
        errorMessage={errors.staffId?.errorMessage}
        hasError={errors.staffId?.hasError}
        {...getOverrideProps(overrides, "staffId")}
      ></TextField>
      <TextField
        label="Work date"
        isRequired={true}
        isReadOnly={false}
        value={workDate}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              workDate: value,
              startTime,
              endTime,
              goDirectlyFlag,
              returnDirectlyFlag,
              absentFlag,
              remarks,
              paidHolidayFlag,
              specialHolidayFlag,
              isDeemedHoliday,
              hourlyPaidHolidayHours,
              substituteHolidayDate,
              revision,
            };
            const result = onChange(modelFields);
            value = result?.workDate ?? value;
          }
          if (errors.workDate?.hasError) {
            runValidationTasks("workDate", value);
          }
          setWorkDate(value);
        }}
        onBlur={() => runValidationTasks("workDate", workDate)}
        errorMessage={errors.workDate?.errorMessage}
        hasError={errors.workDate?.hasError}
        {...getOverrideProps(overrides, "workDate")}
      ></TextField>
      <TextField
        label="Start time"
        isRequired={false}
        isReadOnly={false}
        value={startTime}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              workDate,
              startTime: value,
              endTime,
              goDirectlyFlag,
              returnDirectlyFlag,
              absentFlag,
              remarks,
              paidHolidayFlag,
              specialHolidayFlag,
              isDeemedHoliday,
              hourlyPaidHolidayHours,
              substituteHolidayDate,
              revision,
            };
            const result = onChange(modelFields);
            value = result?.startTime ?? value;
          }
          if (errors.startTime?.hasError) {
            runValidationTasks("startTime", value);
          }
          setStartTime(value);
        }}
        onBlur={() => runValidationTasks("startTime", startTime)}
        errorMessage={errors.startTime?.errorMessage}
        hasError={errors.startTime?.hasError}
        {...getOverrideProps(overrides, "startTime")}
      ></TextField>
      <TextField
        label="End time"
        isRequired={false}
        isReadOnly={false}
        value={endTime}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              workDate,
              startTime,
              endTime: value,
              goDirectlyFlag,
              returnDirectlyFlag,
              absentFlag,
              remarks,
              paidHolidayFlag,
              specialHolidayFlag,
              isDeemedHoliday,
              hourlyPaidHolidayHours,
              substituteHolidayDate,
              revision,
            };
            const result = onChange(modelFields);
            value = result?.endTime ?? value;
          }
          if (errors.endTime?.hasError) {
            runValidationTasks("endTime", value);
          }
          setEndTime(value);
        }}
        onBlur={() => runValidationTasks("endTime", endTime)}
        errorMessage={errors.endTime?.errorMessage}
        hasError={errors.endTime?.hasError}
        {...getOverrideProps(overrides, "endTime")}
      ></TextField>
      <SwitchField
        label="Go directly flag"
        defaultChecked={false}
        isDisabled={false}
        isChecked={goDirectlyFlag}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              staffId,
              workDate,
              startTime,
              endTime,
              goDirectlyFlag: value,
              returnDirectlyFlag,
              absentFlag,
              remarks,
              paidHolidayFlag,
              specialHolidayFlag,
              isDeemedHoliday,
              hourlyPaidHolidayHours,
              substituteHolidayDate,
              revision,
            };
            const result = onChange(modelFields);
            value = result?.goDirectlyFlag ?? value;
          }
          if (errors.goDirectlyFlag?.hasError) {
            runValidationTasks("goDirectlyFlag", value);
          }
          setGoDirectlyFlag(value);
        }}
        onBlur={() => runValidationTasks("goDirectlyFlag", goDirectlyFlag)}
        errorMessage={errors.goDirectlyFlag?.errorMessage}
        hasError={errors.goDirectlyFlag?.hasError}
        {...getOverrideProps(overrides, "goDirectlyFlag")}
      ></SwitchField>
      <SwitchField
        label="Return directly flag"
        defaultChecked={false}
        isDisabled={false}
        isChecked={returnDirectlyFlag}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              staffId,
              workDate,
              startTime,
              endTime,
              goDirectlyFlag,
              returnDirectlyFlag: value,
              absentFlag,
              remarks,
              paidHolidayFlag,
              specialHolidayFlag,
              isDeemedHoliday,
              hourlyPaidHolidayHours,
              substituteHolidayDate,
              revision,
            };
            const result = onChange(modelFields);
            value = result?.returnDirectlyFlag ?? value;
          }
          if (errors.returnDirectlyFlag?.hasError) {
            runValidationTasks("returnDirectlyFlag", value);
          }
          setReturnDirectlyFlag(value);
        }}
        onBlur={() =>
          runValidationTasks("returnDirectlyFlag", returnDirectlyFlag)
        }
        errorMessage={errors.returnDirectlyFlag?.errorMessage}
        hasError={errors.returnDirectlyFlag?.hasError}
        {...getOverrideProps(overrides, "returnDirectlyFlag")}
      ></SwitchField>
      <SwitchField
        label="Absent flag"
        defaultChecked={false}
        isDisabled={false}
        isChecked={absentFlag}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              staffId,
              workDate,
              startTime,
              endTime,
              goDirectlyFlag,
              returnDirectlyFlag,
              absentFlag: value,
              remarks,
              paidHolidayFlag,
              specialHolidayFlag,
              isDeemedHoliday,
              hourlyPaidHolidayHours,
              substituteHolidayDate,
              revision,
            };
            const result = onChange(modelFields);
            value = result?.absentFlag ?? value;
          }
          if (errors.absentFlag?.hasError) {
            runValidationTasks("absentFlag", value);
          }
          setAbsentFlag(value);
        }}
        onBlur={() => runValidationTasks("absentFlag", absentFlag)}
        errorMessage={errors.absentFlag?.errorMessage}
        hasError={errors.absentFlag?.hasError}
        {...getOverrideProps(overrides, "absentFlag")}
      ></SwitchField>
      <TextField
        label="Remarks"
        isRequired={false}
        isReadOnly={false}
        value={remarks}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              workDate,
              startTime,
              endTime,
              goDirectlyFlag,
              returnDirectlyFlag,
              absentFlag,
              remarks: value,
              paidHolidayFlag,
              specialHolidayFlag,
              isDeemedHoliday,
              hourlyPaidHolidayHours,
              substituteHolidayDate,
              revision,
            };
            const result = onChange(modelFields);
            value = result?.remarks ?? value;
          }
          if (errors.remarks?.hasError) {
            runValidationTasks("remarks", value);
          }
          setRemarks(value);
        }}
        onBlur={() => runValidationTasks("remarks", remarks)}
        errorMessage={errors.remarks?.errorMessage}
        hasError={errors.remarks?.hasError}
        {...getOverrideProps(overrides, "remarks")}
      ></TextField>
      <SwitchField
        label="Paid holiday flag"
        defaultChecked={false}
        isDisabled={false}
        isChecked={paidHolidayFlag}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              staffId,
              workDate,
              startTime,
              endTime,
              goDirectlyFlag,
              returnDirectlyFlag,
              absentFlag,
              remarks,
              paidHolidayFlag: value,
              specialHolidayFlag,
              isDeemedHoliday,
              hourlyPaidHolidayHours,
              substituteHolidayDate,
              revision,
            };
            const result = onChange(modelFields);
            value = result?.paidHolidayFlag ?? value;
          }
          if (errors.paidHolidayFlag?.hasError) {
            runValidationTasks("paidHolidayFlag", value);
          }
          setPaidHolidayFlag(value);
        }}
        onBlur={() => runValidationTasks("paidHolidayFlag", paidHolidayFlag)}
        errorMessage={errors.paidHolidayFlag?.errorMessage}
        hasError={errors.paidHolidayFlag?.hasError}
        {...getOverrideProps(overrides, "paidHolidayFlag")}
      ></SwitchField>
      <SwitchField
        label="Special holiday flag"
        defaultChecked={false}
        isDisabled={false}
        isChecked={specialHolidayFlag}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              staffId,
              workDate,
              startTime,
              endTime,
              goDirectlyFlag,
              returnDirectlyFlag,
              absentFlag,
              remarks,
              paidHolidayFlag,
              specialHolidayFlag: value,
              isDeemedHoliday,
              hourlyPaidHolidayHours,
              substituteHolidayDate,
              revision,
            };
            const result = onChange(modelFields);
            value = result?.specialHolidayFlag ?? value;
          }
          if (errors.specialHolidayFlag?.hasError) {
            runValidationTasks("specialHolidayFlag", value);
          }
          setSpecialHolidayFlag(value);
        }}
        onBlur={() =>
          runValidationTasks("specialHolidayFlag", specialHolidayFlag)
        }
        errorMessage={errors.specialHolidayFlag?.errorMessage}
        hasError={errors.specialHolidayFlag?.hasError}
        {...getOverrideProps(overrides, "specialHolidayFlag")}
      ></SwitchField>
      <SwitchField
        label="Is deemed holiday"
        defaultChecked={false}
        isDisabled={false}
        isChecked={isDeemedHoliday}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              staffId,
              workDate,
              startTime,
              endTime,
              goDirectlyFlag,
              returnDirectlyFlag,
              absentFlag,
              remarks,
              paidHolidayFlag,
              specialHolidayFlag,
              isDeemedHoliday: value,
              hourlyPaidHolidayHours,
              substituteHolidayDate,
              revision,
            };
            const result = onChange(modelFields);
            value = result?.isDeemedHoliday ?? value;
          }
          if (errors.isDeemedHoliday?.hasError) {
            runValidationTasks("isDeemedHoliday", value);
          }
          setIsDeemedHoliday(value);
        }}
        onBlur={() => runValidationTasks("isDeemedHoliday", isDeemedHoliday)}
        errorMessage={errors.isDeemedHoliday?.errorMessage}
        hasError={errors.isDeemedHoliday?.hasError}
        {...getOverrideProps(overrides, "isDeemedHoliday")}
      ></SwitchField>
      <TextField
        label="Hourly paid holiday hours"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={hourlyPaidHolidayHours}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              staffId,
              workDate,
              startTime,
              endTime,
              goDirectlyFlag,
              returnDirectlyFlag,
              absentFlag,
              remarks,
              paidHolidayFlag,
              specialHolidayFlag,
              isDeemedHoliday,
              hourlyPaidHolidayHours: value,
              substituteHolidayDate,
              revision,
            };
            const result = onChange(modelFields);
            value = result?.hourlyPaidHolidayHours ?? value;
          }
          if (errors.hourlyPaidHolidayHours?.hasError) {
            runValidationTasks("hourlyPaidHolidayHours", value);
          }
          setHourlyPaidHolidayHours(value);
        }}
        onBlur={() =>
          runValidationTasks("hourlyPaidHolidayHours", hourlyPaidHolidayHours)
        }
        errorMessage={errors.hourlyPaidHolidayHours?.errorMessage}
        hasError={errors.hourlyPaidHolidayHours?.hasError}
        {...getOverrideProps(overrides, "hourlyPaidHolidayHours")}
      ></TextField>
      <TextField
        label="Substitute holiday date"
        isRequired={false}
        isReadOnly={false}
        value={substituteHolidayDate}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              workDate,
              startTime,
              endTime,
              goDirectlyFlag,
              returnDirectlyFlag,
              absentFlag,
              remarks,
              paidHolidayFlag,
              specialHolidayFlag,
              isDeemedHoliday,
              hourlyPaidHolidayHours,
              substituteHolidayDate: value,
              revision,
            };
            const result = onChange(modelFields);
            value = result?.substituteHolidayDate ?? value;
          }
          if (errors.substituteHolidayDate?.hasError) {
            runValidationTasks("substituteHolidayDate", value);
          }
          setSubstituteHolidayDate(value);
        }}
        onBlur={() =>
          runValidationTasks("substituteHolidayDate", substituteHolidayDate)
        }
        errorMessage={errors.substituteHolidayDate?.errorMessage}
        hasError={errors.substituteHolidayDate?.hasError}
        {...getOverrideProps(overrides, "substituteHolidayDate")}
      ></TextField>
      <TextField
        label="Revision"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={revision}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              staffId,
              workDate,
              startTime,
              endTime,
              goDirectlyFlag,
              returnDirectlyFlag,
              absentFlag,
              remarks,
              paidHolidayFlag,
              specialHolidayFlag,
              isDeemedHoliday,
              hourlyPaidHolidayHours,
              substituteHolidayDate,
              revision: value,
            };
            const result = onChange(modelFields);
            value = result?.revision ?? value;
          }
          if (errors.revision?.hasError) {
            runValidationTasks("revision", value);
          }
          setRevision(value);
        }}
        onBlur={() => runValidationTasks("revision", revision)}
        errorMessage={errors.revision?.errorMessage}
        hasError={errors.revision?.hasError}
        {...getOverrideProps(overrides, "revision")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Clear"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          {...getOverrideProps(overrides, "ClearButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={Object.values(errors).some((e) => e?.hasError)}
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
