import notificationReducer, {
  clearNotifications,
  dismissNotification,
  pushNotification,
} from "@/shared/lib/store/notificationSlice";

describe("notificationSlice", () => {
  it("global notification を既定値付きで enqueue する", () => {
    const state = notificationReducer(
      undefined,
      pushNotification({
        tone: "success",
        message: "保存しました",
        description: "データを更新しました",
      }),
    );

    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({
      tone: "success",
      message: "保存しました",
      description: "データを更新しました",
      placement: "top-right",
      autoHideMs: 5000,
      source: "global",
    });
    expect(state.items[0].id).toEqual(expect.any(String));
  });

  it("presence notification は bottom-right / 4000ms で enqueue する", () => {
    const state = notificationReducer(
      undefined,
      pushNotification({
        tone: "info",
        message: "他のユーザーが更新しました",
        source: "presence",
      }),
    );

    expect(state.items[0]).toMatchObject({
      tone: "info",
      message: "他のユーザーが更新しました",
      placement: "bottom-right",
      autoHideMs: 4000,
      source: "presence",
    });
  });

  it("dedupeKey が一致する通知は重複追加しない", () => {
    const firstState = notificationReducer(
      undefined,
      pushNotification({
        tone: "warning",
        message: "注意してください",
        dedupeKey: "warning-1",
      }),
    );

    const secondState = notificationReducer(
      firstState,
      pushNotification({
        tone: "warning",
        message: "注意してください",
        dedupeKey: "warning-1",
      }),
    );

    expect(secondState.items).toHaveLength(1);
  });

  it("dismissNotification と source 指定 clear が動作する", () => {
    const initialState = notificationReducer(
      undefined,
      pushNotification({
        id: "global-1",
        tone: "success",
        message: "保存しました",
      }),
    );
    const withPresence = notificationReducer(
      initialState,
      pushNotification({
        id: "presence-1",
        tone: "info",
        message: "参加しました",
        source: "presence",
      }),
    );

    const afterDismiss = notificationReducer(
      withPresence,
      dismissNotification("global-1"),
    );
    expect(afterDismiss.items.map((item) => item.id)).toEqual(["presence-1"]);

    const afterClear = notificationReducer(
      afterDismiss,
      clearNotifications({ source: "presence" }),
    );
    expect(afterClear.items).toEqual([]);
  });

  it("error notification は既定で auto-hide しない", () => {
    const state = notificationReducer(
      undefined,
      pushNotification({
        tone: "error",
        message: "保存に失敗しました",
      }),
    );

    expect(state.items[0]?.autoHideMs).toBeNull();
  });
});
