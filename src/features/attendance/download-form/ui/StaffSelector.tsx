import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { SELECTOR_MAX_WIDTH, SELECTOR_MIN_WIDTH } from "@/shared/config/uiDimensions";

type Props = {
  staffs: StaffType[];
  selectedStaff: StaffType[];
  setSelectedStaff: (s: StaffType[]) => void;
};

export default function StaffSelector({
  staffs,
  selectedStaff,
  setSelectedStaff,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const selectedIds = useMemo(
    () => new Set(selectedStaff.map((staff) => staff.id)),
    [selectedStaff],
  );

  const selectedLabel = useMemo(() => {
    if (selectedStaff.length === 0) return "対象者を選択";
    if (selectedStaff.length === 1) {
      return `${selectedStaff[0].familyName || ""} ${selectedStaff[0].givenName || ""}`.trim();
    }
    return `${selectedStaff.length}名を選択中`;
  }, [selectedStaff]);

  const toggleStaff = (staff: StaffType) => {
    if (selectedIds.has(staff.id)) {
      setSelectedStaff(selectedStaff.filter((item) => item.id !== staff.id));
      return;
    }
    setSelectedStaff([...selectedStaff, staff]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      if (dropdownRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setDropdownStyle({
        top: rect.bottom - 1,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      className="relative flex flex-col gap-3 overflow-visible"
      style={{ maxWidth: SELECTOR_MAX_WIDTH }}
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-600">対象者リスト</label>
        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={[
              "flex w-full items-center justify-between border bg-white px-4 py-2.5 text-left transition",
              isOpen
                ? "rounded-t-[22px] rounded-b-[10px] border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.08)]"
                : "rounded-[22px] border-slate-300/70 focus-within:border-emerald-500",
            ].join(" ")}
            style={{
              minWidth: SELECTOR_MIN_WIDTH,
              maxWidth: SELECTOR_MAX_WIDTH,
            }}
          >
            <span
              className={[
                "min-w-0 truncate text-sm",
                selectedStaff.length === 0 ? "text-slate-400" : "text-slate-900",
              ].join(" ")}
            >
              {selectedLabel}
            </span>
            <span className="ml-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100">
              {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </span>
          </button>

        </div>
      </div>

      {selectedStaff.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedStaff.map((staff) => (
            <span
              key={staff.id}
              className="inline-flex items-center rounded-full border border-slate-300/70 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              {`${staff.familyName || ""} ${staff.givenName || ""}`.trim()}
            </span>
          ))}
        </div>
      )}

      {isOpen && dropdownStyle &&
        createPortal(
          <div
            ref={dropdownRef}
            className="z-[1200] overflow-hidden rounded-b-[22px] rounded-t-[10px] border border-emerald-500 border-t-0 bg-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.22)]"
            style={{
              position: "fixed",
              top: dropdownStyle.top,
              left: dropdownStyle.left,
              width: dropdownStyle.width,
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-slate-50/45 px-3 py-2.5">
              <div className="text-xs font-medium text-slate-500">
                {staffs.length}件
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStaff(staffs)}
                  disabled={
                    staffs.length === 0 ||
                    staffs.every((staff) => selectedIds.has(staff.id))
                  }
                  className="inline-flex items-center justify-center rounded-full border border-slate-300/70 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  全選択
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStaff([])}
                  disabled={selectedStaff.length === 0}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300/70 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  全解除
                </button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto p-2">
              {staffs.length === 0 ? (
                <div className="px-3 py-6 text-sm text-slate-500">
                  該当するスタッフが見つかりません。
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {staffs.map((staff) => {
                    const label = `${staff.familyName || ""} ${staff.givenName || ""}`.trim();
                    const checked = selectedIds.has(staff.id);

                    return (
                      <label
                        key={staff.id}
                        className={[
                          "flex cursor-pointer items-center gap-3 rounded-[16px] border px-4 py-3 text-sm transition",
                          checked
                            ? "border-emerald-200 bg-emerald-50 text-slate-900"
                            : "border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleStaff(staff)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="min-w-0 truncate">{label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
