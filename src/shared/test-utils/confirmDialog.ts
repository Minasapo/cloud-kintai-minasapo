import { screen, within } from "@testing-library/react";
import type userEvent from "@testing-library/user-event";

/**
 * Click a button (default "OK") in the topmost open `role="dialog"`.
 *
 * Use this to drive interactions with `ConfirmDialog`/`AppDialog` in tests
 * instead of asserting on `window.confirm`, which has been removed from the
 * shared UI layer.
 */
export async function confirmInDialog(
  user: ReturnType<typeof userEvent.setup>,
  buttonName: string | RegExp = "OK",
): Promise<void> {
  const dialogs = await screen.findAllByRole("dialog");
  const dialog = dialogs[dialogs.length - 1];
  await user.click(within(dialog).getByRole("button", { name: buttonName }));
}

/**
 * Cancel (default button label "キャンセル") the topmost open dialog.
 */
export async function cancelInDialog(
  user: ReturnType<typeof userEvent.setup>,
  buttonName: string | RegExp = "キャンセル",
): Promise<void> {
  return confirmInDialog(user, buttonName);
}
