import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  SELECTOR_MAX_WIDTH,
  SELECTOR_MIN_WIDTH,
} from "@shared/config/uiDimensions";
import { AppButton } from "@shared/ui/button";
import { AppChip } from "@shared/ui/chips";
import { AppCheckbox, AppFormControlLabel } from "@shared/ui/form";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  staffs: StaffType[];
  selectedStaff: StaffType[];
  setSelectedStaff: (s: StaffType[]) => void;
};

type DropdownStyle = {
  top: number;
  left: number;
  width: number;
};

type SelectedStaffBadgesProps = {
  selectedStaff: StaffType[];
};

type StaffDropdownProps = {
  staffs: StaffType[];
  selectedStaff: StaffType[];
  selectedIds: Set<string>;
  dropdownStyle: DropdownStyle;
  dropdownRef: RefObject<HTMLDivElement | null>;
  setSelectedStaff: (s: StaffType[]) => void;
  toggleStaff: (staff: StaffType) => void;
};

function SelectedStaffBadges({ selectedStaff }: SelectedStaffBadgesProps) {
  if (selectedStaff.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {selectedStaff.map((staff) => (
        <AppChip
          key={staff.id}
          label={`${staff.familyName || ""} ${staff.givenName || ""}`.trim()}
          size="small"
          sx={{
            borderRadius: "999px",
            borderColor: "rgb(203 213 225 / 0.7)",
            backgroundColor: "rgb(255 255 255)",
            color: "rgb(51 65 85)",
            fontSize: "0.75rem",
            fontWeight: 600,
            "& .MuiChip-label": {
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "6px",
              paddingBottom: "6px",
            },
          }}
        />
      ))}
    </div>
  );
}

function StaffDropdown({
  staffs,
  selectedStaff,
  selectedIds,
  dropdownStyle,
  dropdownRef,
  setSelectedStaff,
  toggleStaff,
}: StaffDropdownProps) {
  return createPortal(
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
          <AppButton
            variant="outline"
            tone="secondary"
            size="sm"
            onClick={() => setSelectedStaff(staffs)}
            disabled={
              staffs.length === 0 ||
              staffs.every((staff) => selectedIds.has(staff.id))
            }
            className="rounded-full whitespace-nowrap text-xs"
            sx={{
              minHeight: 30,
              borderColor: "rgb(203 213 225 / 0.7)",
              color: "rgb(51 65 85)",
              backgroundColor: "rgb(255 255 255)",
              "&:hover": {
                backgroundColor: "rgb(248 250 252)",
              },
              "&.Mui-disabled": {
                borderColor: "rgb(226 232 240)",
                backgroundColor: "rgb(241 245 249)",
                color: "rgb(148 163 184)",
              },
            }}
          >
            全選択
          </AppButton>
          <AppButton
            variant="outline"
            tone="secondary"
            size="sm"
            onClick={() => setSelectedStaff([])}
            disabled={selectedStaff.length === 0}
            className="rounded-full whitespace-nowrap text-xs"
            sx={{
              minHeight: 30,
              borderColor: "rgb(203 213 225 / 0.7)",
              color: "rgb(51 65 85)",
              backgroundColor: "rgb(255 255 255)",
              "&:hover": {
                backgroundColor: "rgb(248 250 252)",
              },
              "&.Mui-disabled": {
                borderColor: "rgb(226 232 240)",
                backgroundColor: "rgb(241 245 249)",
                color: "rgb(148 163 184)",
              },
            }}
          >
            全解除
          </AppButton>
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
              const label =
                `${staff.familyName || ""} ${staff.givenName || ""}`.trim();
              const checked = selectedIds.has(staff.id);

              return (
                <AppFormControlLabel
                  key={staff.id}
                  control={
                    <AppCheckbox
                      size="small"
                      checked={checked}
                      onChange={() => toggleStaff(staff)}
                      sx={{
                        p: 0,
                        color: "rgb(148 163 184)",
                        "&.Mui-checked": {
                          color: "rgb(5 150 105)",
                        },
                      }}
                    />
                  }
                  label={<span className="min-w-0 truncate">{label}</span>}
                  sx={{
                    m: 0,
                    width: "100%",
                    alignItems: "center",
                    gap: "12px",
                    borderRadius: "16px",
                    border: checked
                      ? "1px solid rgb(167 243 208)"
                      : "1px solid transparent",
                    backgroundColor: checked
                      ? "rgb(236 253 245)"
                      : "rgb(255 255 255)",
                    color: checked ? "rgb(15 23 42)" : "rgb(51 65 85)",
                    px: "16px",
                    py: "12px",
                    transition:
                      "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    "&:hover": checked
                      ? undefined
                      : {
                          borderColor: "rgb(226 232 240)",
                          backgroundColor: "rgb(248 250 252)",
                        },
                    "& .MuiFormControlLabel-label": {
                      minWidth: 0,
                      fontSize: "0.875rem",
                      lineHeight: 1.25,
                    },
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default function StaffSelector({
  staffs,
  selectedStaff,
  setSelectedStaff,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<DropdownStyle | null>(
    null,
  );

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
        <label className="text-sm font-medium text-slate-600">
          対象者リスト
        </label>
        <div className="relative">
          <div
            ref={triggerRef}
            style={{
              minWidth: SELECTOR_MIN_WIDTH,
              maxWidth: SELECTOR_MAX_WIDTH,
            }}
          >
            <AppButton
              variant="outline"
              tone="secondary"
              size="sm"
              fullWidth
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              className={[
                "justify-between border bg-white px-4 py-2.5 normal-case transition",
                isOpen ? "rounded-t-[22px] rounded-b-[10px]" : "rounded-[22px]",
              ].join(" ")}
              endIcon={
                <span className="ml-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100">
                  {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </span>
              }
              sx={{
                justifyContent: "space-between",
                borderColor: isOpen
                  ? "rgb(16 185 129)"
                  : "rgb(203 213 225 / 0.7)",
                backgroundColor: "rgb(255 255 255)",
                boxShadow: isOpen
                  ? "0 0 0 3px rgba(16, 185, 129, 0.08)"
                  : undefined,
                "&:hover": {
                  borderColor: isOpen ? "rgb(16 185 129)" : "rgb(148 163 184)",
                  backgroundColor: "rgb(248 250 252)",
                },
              }}
            >
              <span
                className={[
                  "min-w-0 truncate text-sm",
                  selectedStaff.length === 0
                    ? "text-slate-400"
                    : "text-slate-900",
                ].join(" ")}
              >
                {selectedLabel}
              </span>
            </AppButton>
          </div>
        </div>
      </div>

      <SelectedStaffBadges selectedStaff={selectedStaff} />

      {isOpen && dropdownStyle && (
        <StaffDropdown
          staffs={staffs}
          selectedStaff={selectedStaff}
          selectedIds={selectedIds}
          dropdownStyle={dropdownStyle}
          dropdownRef={dropdownRef}
          setSelectedStaff={setSelectedStaff}
          toggleStaff={toggleStaff}
        />
      )}
    </div>
  );
}
