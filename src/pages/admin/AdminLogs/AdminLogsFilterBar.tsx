import {
  Autocomplete,
  Stack,
  TextField,
} from "@mui/material";

import { StaffOption } from "./adminLogsTypes";

type AdminLogsFilterBarProps = {
  resourceFilter: string;
  actorFilter: string;
  targetFilter: string;
  actionFilter: string;
  fromDate: string;
  toDate: string;
  staffOptions: StaffOption[];
  staffListLoading: boolean;
  onResourceFilterChange: (value: string) => void;
  onActorFilterChange: (value: string | undefined) => void;
  onTargetFilterChange: (value: string | undefined) => void;
  onActionFilterChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
};

export default function AdminLogsFilterBar({
  resourceFilter,
  actorFilter,
  targetFilter,
  actionFilter,
  fromDate,
  toDate,
  staffOptions,
  staffListLoading,
  onResourceFilterChange,
  onActorFilterChange,
  onTargetFilterChange,
  onActionFilterChange,
  onFromDateChange,
  onToDateChange,
}: AdminLogsFilterBarProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{ mb: 2 }}
    >
      <TextField
        size="small"
        label="リソース"
        value={resourceFilter}
        onChange={(event) => onResourceFilterChange(event.target.value)}
      />
      <Autocomplete
        size="small"
        options={staffOptions}
        value={
          staffOptions.find((option) => option.value === actorFilter) ?? null
        }
        loading={staffListLoading}
        onChange={(_, newValue) => onActorFilterChange(newValue?.value)}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        getOptionLabel={(option) => option.label}
        sx={{ minWidth: 220 }}
        renderInput={(params) => (
          <TextField {...params} label="操作者" placeholder="スタッフ名で検索" />
        )}
      />
      <Autocomplete
        size="small"
        options={staffOptions}
        value={
          staffOptions.find((option) => option.value === targetFilter) ?? null
        }
        loading={staffListLoading}
        onChange={(_, newValue) => onTargetFilterChange(newValue?.value)}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        getOptionLabel={(option) => option.label}
        sx={{ minWidth: 220 }}
        renderInput={(params) => (
          <TextField {...params} label="対象者" placeholder="スタッフ名で検索" />
        )}
      />
      <TextField
        size="small"
        label="アクション"
        value={actionFilter}
        onChange={(event) => onActionFilterChange(event.target.value)}
      />
      <TextField
        size="small"
        type="date"
        label="開始日"
        value={fromDate}
        onChange={(event) => onFromDateChange(event.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        size="small"
        type="date"
        label="終了日"
        value={toDate}
        onChange={(event) => onToDateChange(event.target.value)}
        InputLabelProps={{ shrink: true }}
      />
    </Stack>
  );
}
