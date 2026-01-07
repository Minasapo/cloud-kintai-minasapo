import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers";
import { WorkflowCategory, WorkflowStatus } from "@shared/api/graphql/types";
import dayjs, { Dayjs } from "dayjs";
import {
  forwardRef,
  type Ref,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";

import type { UseWorkflowListFiltersResult } from "@/features/workflow/list/useWorkflowListFilters";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/workflowLabels";
import { designTokenVar } from "@/shared/designSystem";

export type WorkflowListFiltersHandle = {
  closeAllPopovers: () => void;
};

type WorkflowListFiltersProps = {
  filters: UseWorkflowListFiltersResult["filters"];
  setFilter: UseWorkflowListFiltersResult["setFilter"];
};

const DISPLAY_LABEL_APPLICATION = "申請日で絞込";
const DISPLAY_LABEL_CREATED = "作成日で絞込";
const STATUS_ALL_VALUE = "__ALL__";
const SELECT_SX = {
  width: "100%",
  ".MuiSelect-select": {
    display: "block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
} as const;

const FILTER_PANEL_PADDING = designTokenVar("spacing.lg", "16px");
const FILTER_PANEL_GAP = designTokenVar("spacing.md", "12px");
const FILTER_PANEL_BUTTON_GAP = designTokenVar("spacing.sm", "8px");

function WorkflowListFilters(
  { filters, setFilter }: WorkflowListFiltersProps,
  ref: Ref<WorkflowListFiltersHandle>
) {
  const {
    category: categoryFilter,
    status: statusFilter,
    applicationFrom,
    applicationTo,
    createdFrom,
    createdTo,
  } = filters;

  const [applicationAnchorEl, setApplicationAnchorEl] =
    useState<HTMLElement | null>(null);
  const [createdAnchorEl, setCreatedAnchorEl] = useState<HTMLElement | null>(
    null
  );

  const closeAllPopovers = useCallback(() => {
    setApplicationAnchorEl(null);
    setCreatedAnchorEl(null);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      closeAllPopovers,
    }),
    [closeAllPopovers]
  );

  const handleDateChange = useCallback(
    (
      key: "applicationFrom" | "applicationTo" | "createdFrom" | "createdTo",
      value: Dayjs | null
    ) => {
      const str = value ? value.format("YYYY-MM-DD") : "";
      setFilter(key, str);
    },
    [setFilter]
  );

  const handleApplicationFieldClick = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setApplicationAnchorEl(event.currentTarget);
  };

  const handleCreatedFieldClick = (event: React.MouseEvent<HTMLElement>) => {
    setCreatedAnchorEl(event.currentTarget);
  };

  const handleStatusChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const nextValue = typeof value === "string" ? value.split(",") : value;

    if (nextValue.includes(STATUS_ALL_VALUE)) {
      setFilter("status", []);
      return;
    }

    setFilter("status", nextValue);
  };

  return (
    <TableRow>
      <TableCell>
        <Select
          size="small"
          sx={SELECT_SX}
          displayEmpty
          value={categoryFilter}
          onChange={(e) => setFilter("category", e.target.value)}
        >
          <MenuItem value="">すべて</MenuItem>
          <MenuItem value={WorkflowCategory.PAID_LEAVE}>
            {CATEGORY_LABELS[WorkflowCategory.PAID_LEAVE]}
          </MenuItem>
          <MenuItem value={WorkflowCategory.ABSENCE}>
            {CATEGORY_LABELS[WorkflowCategory.ABSENCE]}
          </MenuItem>
          <MenuItem value={WorkflowCategory.OVERTIME}>
            {CATEGORY_LABELS[WorkflowCategory.OVERTIME]}
          </MenuItem>
        </Select>
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          fullWidth
          value={
            applicationFrom && applicationTo
              ? `${applicationFrom} → ${applicationTo}`
              : DISPLAY_LABEL_APPLICATION
          }
          onClick={handleApplicationFieldClick}
          InputProps={{ readOnly: true }}
        />
        <Popover
          open={Boolean(applicationAnchorEl)}
          anchorEl={applicationAnchorEl}
          onClose={() => setApplicationAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Box
            sx={{
              p: FILTER_PANEL_PADDING,
              display: "flex",
              gap: FILTER_PANEL_GAP,
            }}
          >
            <DatePicker
              label="From"
              value={applicationFrom ? dayjs(applicationFrom) : null}
              onChange={(v) => handleDateChange("applicationFrom", v)}
              slotProps={{ textField: { size: "small" } }}
            />
            <DatePicker
              label="To"
              value={applicationTo ? dayjs(applicationTo) : null}
              onChange={(v) => handleDateChange("applicationTo", v)}
              slotProps={{ textField: { size: "small" } }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                gap: FILTER_PANEL_BUTTON_GAP,
              }}
            >
              <Button
                size="small"
                onClick={() => {
                  setFilter("applicationFrom", "");
                  setFilter("applicationTo", "");
                  setApplicationAnchorEl(null);
                }}
              >
                クリア
              </Button>
            </Box>
          </Box>
        </Popover>
      </TableCell>
      <TableCell>
        <Select
          size="small"
          multiple
          sx={SELECT_SX}
          displayEmpty
          value={statusFilter ?? []}
          onChange={handleStatusChange}
          renderValue={(selected) =>
            selected.length === 0
              ? "すべて"
              : selected
                  .map(
                    (status) =>
                      STATUS_LABELS[status as WorkflowStatus] || String(status)
                  )
                  .join("、")
          }
        >
          <MenuItem value={STATUS_ALL_VALUE}>すべて</MenuItem>
          <MenuItem value={WorkflowStatus.DRAFT}>
            {STATUS_LABELS[WorkflowStatus.DRAFT]}
          </MenuItem>
          <MenuItem value={WorkflowStatus.SUBMITTED}>
            {STATUS_LABELS[WorkflowStatus.SUBMITTED]}
          </MenuItem>
          <MenuItem value={WorkflowStatus.PENDING}>
            {STATUS_LABELS[WorkflowStatus.PENDING]}
          </MenuItem>
          <MenuItem value={WorkflowStatus.APPROVED}>
            {STATUS_LABELS[WorkflowStatus.APPROVED]}
          </MenuItem>
          <MenuItem value={WorkflowStatus.REJECTED}>
            {STATUS_LABELS[WorkflowStatus.REJECTED]}
          </MenuItem>
          <MenuItem value={WorkflowStatus.CANCELLED}>
            {STATUS_LABELS[WorkflowStatus.CANCELLED]}
          </MenuItem>
        </Select>
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          fullWidth
          value={
            createdFrom && createdTo
              ? `${createdFrom} → ${createdTo}`
              : DISPLAY_LABEL_CREATED
          }
          onClick={handleCreatedFieldClick}
          InputProps={{ readOnly: true }}
        />
        <Popover
          open={Boolean(createdAnchorEl)}
          anchorEl={createdAnchorEl}
          onClose={() => setCreatedAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Box
            sx={{
              p: FILTER_PANEL_PADDING,
              display: "flex",
              gap: FILTER_PANEL_GAP,
            }}
          >
            <DatePicker
              label="From"
              value={createdFrom ? dayjs(createdFrom) : null}
              onChange={(v) => handleDateChange("createdFrom", v)}
              slotProps={{ textField: { size: "small" } }}
            />
            <DatePicker
              label="To"
              value={createdTo ? dayjs(createdTo) : null}
              onChange={(v) => handleDateChange("createdTo", v)}
              slotProps={{ textField: { size: "small" } }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                gap: FILTER_PANEL_BUTTON_GAP,
              }}
            >
              <Button
                size="small"
                onClick={() => {
                  setFilter("createdFrom", "");
                  setFilter("createdTo", "");
                  setCreatedAnchorEl(null);
                }}
              >
                クリア
              </Button>
            </Box>
          </Box>
        </Popover>
      </TableCell>
      <TableCell />
    </TableRow>
  );
}

export default forwardRef(WorkflowListFilters);
