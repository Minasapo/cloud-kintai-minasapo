import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";

import notificationReducer, {
  pushNotification,
} from "@/shared/lib/store/notificationSlice";
import BaseDialog from "@/shared/ui/feedback/BaseDialog";
import { APP_LAYER_Z_INDEX } from "@/shared/ui/overlay/layers";

import NotificationViewport from "./NotificationViewport";

const renderWithStore = () => {
  const store = configureStore({
    reducer: {
      notifications: notificationReducer,
    },
  });

  const result = render(
    <Provider store={store}>
      <NotificationViewport />
    </Provider>,
  );

  return { store, ...result };
};

describe("NotificationViewport", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.clearAllTimers();
    });
    jest.useRealTimers();
    document.body.innerHTML = "";
  });

  it("portal 経由で top-right / bottom-right に通知を描画する", () => {
    const { store } = renderWithStore();

    act(() => {
      store.dispatch(
        pushNotification({
          id: "global-1",
          tone: "error",
          message: "保存に失敗しました",
        }),
      );
      store.dispatch(
        pushNotification({
          id: "presence-1",
          tone: "info",
          message: "他のユーザーが更新しました",
          source: "presence",
        }),
      );
    });

    expect(screen.getByText("保存に失敗しました")).toBeInTheDocument();
    expect(screen.getByText("他のユーザーが更新しました")).toBeInTheDocument();
    expect(screen.getByTestId("notification-viewport-top-right")).toHaveStyle({
      zIndex: `${APP_LAYER_Z_INDEX.notification}`,
    });
    expect(
      screen.getByTestId("notification-viewport-bottom-right"),
    ).toHaveStyle({ zIndex: `${APP_LAYER_Z_INDEX.notification}` });
  });

  it("success は auto-hide され、error は手動で閉じる", () => {
    const { store } = renderWithStore();

    act(() => {
      store.dispatch(
        pushNotification({
          id: "success-1",
          tone: "success",
          message: "保存しました",
        }),
      );
    });

    expect(screen.getByText("保存しました")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByText("保存しました")).not.toBeInTheDocument();

    act(() => {
      store.dispatch(
        pushNotification({
          id: "error-1",
          tone: "error",
          message: "保存に失敗しました",
        }),
      );
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Close notification",
      }),
    );

    expect(screen.queryByText("保存に失敗しました")).not.toBeInTheDocument();
  });

  it("BaseDialog は notification より上の layer で描画される", () => {
    const store = configureStore({
      reducer: {
        notifications: notificationReducer,
      },
    });

    render(
      <Provider store={store}>
        <>
          <NotificationViewport />
          <BaseDialog open title="確認" onClose={() => undefined} />
        </>
      </Provider>,
    );

    act(() => {
      store.dispatch(
        pushNotification({
          id: "error-1",
          tone: "error",
          message: "保存に失敗しました",
        }),
      );
    });

    expect(screen.getByRole("dialog")).toHaveStyle({
      zIndex: `${APP_LAYER_Z_INDEX.modal}`,
    });
    expect(screen.getByTestId("notification-viewport-top-right")).toHaveStyle({
      zIndex: `${APP_LAYER_Z_INDEX.notification}`,
    });
  });
});
