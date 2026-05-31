/* eslint-disable react/prop-types */
import React from "react";

/**
 * Jest mock factory for `@shared/ui/button`.
 *
 * Usage:
 * ```ts
 * jest.mock("@shared/ui/button", () =>
 *   require("@shared/test-utils/mocks/sharedUiButton").sharedUiButtonMock,
 * );
 * ```
 *
 * Keep this in sync whenever a new component is added to `src/shared/ui/button`.
 * Centralising the mock prevents silent "Element type is invalid" failures when
 * a test only mocks a subset of the module's exports.
 */
export const sharedUiButtonMock = {
  AppButton: ({
    children,
    onClick,
    disabled,
    ...rest
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    tone?: string;
    variant?: string;
    size?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  ),
  AppIconButton: ({
    children,
    "aria-label": ariaLabel,
    onClick,
    disabled,
    ...rest
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    "aria-label": string;
    tone?: string;
    size?: string;
  }) => (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  ),
};
