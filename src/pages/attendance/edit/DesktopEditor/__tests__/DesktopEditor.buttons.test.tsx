import { render, screen } from "@testing-library/react";
import React from "react";

import AttendanceEditProvider, {
  AttendanceEditContext,
} from "../../AttendanceEditProvider";

// react-hook-formのuseFormState/Controllerを軽量モック
jest.mock("react-hook-form", () => ({
  useFormState: () => ({ errors: {} }),
  Controller: ({ render }: any) =>
    render({ field: {}, fieldState: {}, formState: {} }),
}));
jest.mock("@/hooks/useAppConfig/useAppConfig", () => () => ({
  getStartTime: () => undefined,
}));
jest.mock("@/hooks/useOperationLog/useOperationLog", () => () => ({
  create: jest.fn(),
}));

describe("DesktopEditor buttons", () => {
  const renderWithContext = async (
    ctx: Partial<React.ContextType<typeof AttendanceEditContext>>
  ) => {
    const watchMock = (arg: any) => {
      if (typeof arg === "string") return [];
      if (typeof arg === "function") return () => {};
      return undefined;
    };

    const value: React.ContextType<typeof AttendanceEditContext> = {
      workDate: null,
      attendance: null,
      staff: {} as any,
      onSubmit: async () => {},
      isDirty: false,
      isValid: false,
      isSubmitting: false,
      errorMessages: [],
      restFields: [],
      changeRequests: [],
      readOnly: false,
      isOnBreak: false,
      register: jest.fn() as any,
      control: {} as any,
      setValue: jest.fn() as any,
      getValues: ((name: any) => (name === "remarkTags" ? [] : null)) as any,
      watch: watchMock as any,
      handleSubmit: jest.fn() as any,
      systemCommentFields: [],
      systemCommentUpdate: undefined,
      systemCommentReplace: undefined,
      hourlyPaidHolidayTimeFields: [],
      hourlyPaidHolidayTimeAppend: () => {},
      hourlyPaidHolidayTimeRemove: () => {},
      hourlyPaidHolidayTimeUpdate: () => {},
      hourlyPaidHolidayTimeReplace: () => {},
      hourlyPaidHolidayEnabled: false,
      ...ctx,
    };

    const { default: DesktopEditor } = await import("../DesktopEditor");
    return render(
      <AttendanceEditProvider value={value}>
        <DesktopEditor />
      </AttendanceEditProvider>
    );
  };

  test("申請ボタンは isDirty=false で無効", async () => {
    await renderWithContext({
      isDirty: false,
      isValid: true,
      isSubmitting: false,
    });
    const btn = screen.getByTestId("attendance-submit-button");
    expect(btn).toBeDisabled();
  });

  test("申請ボタンは isValid=false で無効", async () => {
    await renderWithContext({
      isDirty: true,
      isValid: false,
      isSubmitting: false,
    });
    const btn = screen.getByTestId("attendance-submit-button");
    expect(btn).toBeDisabled();
  });

  test("申請ボタンは isSubmitting=true で無効", async () => {
    await renderWithContext({
      isDirty: true,
      isValid: true,
      isSubmitting: true,
    });
    const btn = screen.getByTestId("attendance-submit-button");
    expect(btn).toBeDisabled();
  });

  test("申請ボタンは changeRequests>0 で無効", async () => {
    await renderWithContext({
      isDirty: true,
      isValid: true,
      isSubmitting: false,
      changeRequests: [{} as any],
    });
    const btn = screen.getByTestId("attendance-submit-button");
    expect(btn).toBeDisabled();
  });

  test("申請ボタンは isDirty=true && isValid=true && isSubmitting=false && changeRequests=0 で有効", async () => {
    await renderWithContext({
      isDirty: true,
      isValid: true,
      isSubmitting: false,
      changeRequests: [],
    });
    const btn = screen.getByTestId("attendance-submit-button");
    expect(btn).toBeEnabled();
  });
});
