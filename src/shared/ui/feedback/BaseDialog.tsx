import { type ReactNode, useEffect } from "react";

type BaseDialogProps = {
  open: boolean;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  onClose: () => void;
  widthClassName?: string;
};

export default function BaseDialog({
  open,
  title,
  description,
  actions,
  children,
  onClose,
  widthClassName = "max-w-2xl",
}: BaseDialogProps) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`w-full ${widthClassName} overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]`}
        onClick={(event) => event.stopPropagation()}
      >
        {(title || description) && (
          <div className="border-b border-slate-200 px-6 py-5">
            {title ? (
              <h2 className="m-0 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            ) : null}
          </div>
        )}
        {children ? <div className="px-6 py-5">{children}</div> : null}
        {actions ? (
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
