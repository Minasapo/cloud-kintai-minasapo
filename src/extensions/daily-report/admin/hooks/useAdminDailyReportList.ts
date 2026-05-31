import { AuthContext } from "@app/providers/auth/AuthContext";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import { useSplitView } from "@features/splitView";
import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import { listDailyReports } from "@shared/api/graphql/documents/queries";
import type { ListDailyReportsQuery } from "@shared/api/graphql/types";
import type { GraphQLResult } from "aws-amplify/api";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DailyReportDetailPanel from "../DailyReportDetailPanel";
import {
  type AdminDailyReport,
  DISPLAY_STATUSES,
  type DisplayStatus,
  mapDailyReport,
  STATUS_META,
} from "../data";
import {
  buildDailyReportCsv,
  compareReportByDateDesc,
  formatDailyReportFileName,
} from "../services/dailyReportCsv";

export function useAdminDailyReportList() {
  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const navigate = useNavigate();
  const { enableSplitMode, setRightPanel } = useSplitView();
  const {
    staffs,
    loading: isStaffLoading,
    error: staffError,
  } = useStaffs({ isAuthenticated });
  const [statusFilter, setStatusFilter] = useState<DisplayStatus | "">("");
  const [staffFilter, setStaffFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [reports, setReports] = useState<AdminDailyReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<AdminDailyReport | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const buildStaffName = useCallback(
    (staffId: string) => {
      const staff = staffs.find((item) => item.id === staffId);
      if (!staff) return "スタッフ";
      const name = [staff.familyName, staff.givenName]
        .filter((part): part is string => Boolean(part && part.trim()))
        .join(" ");
      return name || "スタッフ";
    },
    [staffs],
  );

  const fetchReports = useCallback(async () => {
    setIsLoadingReports(true);
    setLoadError(null);
    try {
      const aggregated: AdminDailyReport[] = [];
      let nextToken: string | null | undefined = undefined;
      do {
        const response = (await graphqlClient.graphql({
          query: listDailyReports,
          variables: { limit: 100, nextToken },
          authMode: "userPool",
        })) as GraphQLResult<ListDailyReportsQuery>;
        if (response.errors?.length) {
          throw new Error(response.errors.map((err) => err.message).join("\n"));
        }
        const items = response.data?.listDailyReports?.items ?? [];
        items.forEach((record) => {
          if (!record) return;
          aggregated.push(mapDailyReport(record, buildStaffName(record.staffId)));
        });
        nextToken = response.data?.listDailyReports?.nextToken;
      } while (nextToken);
      setReports(aggregated.toSorted(compareReportByDateDesc));
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "日報の取得に失敗しました。",
      );
    } finally {
      setIsLoadingReports(false);
    }
  }, [buildStaffName]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const visibleReports = useMemo(
    () =>
      reports.filter((report) =>
        DISPLAY_STATUSES.includes(report.status as DisplayStatus),
      ),
    [reports],
  );

  const staffOptions = useMemo(() => {
    const unique = Array.from(
      new Set(visibleReports.map((report) => report.author)),
    );
    return unique.toSorted((a, b) => a.localeCompare(b, "ja"));
  }, [visibleReports]);

  const filteredReports = useMemo(() => {
    return visibleReports.filter((report) => {
      if (statusFilter && report.status !== statusFilter) return false;
      if (staffFilter && report.author !== staffFilter) return false;
      if (startDate && report.date < startDate) return false;
      if (endDate && report.date > endDate) return false;
      return true;
    });
  }, [endDate, staffFilter, startDate, statusFilter, visibleReports]);

  const paginatedReports = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredReports.slice(start, start + rowsPerPage);
  }, [filteredReports, page, rowsPerPage]);

  const statusSummary = useMemo(() => {
    return DISPLAY_STATUSES.map((key) => {
      const count = visibleReports.filter(
        (report) => report.status === key,
      ).length;
      return { ...STATUS_META[key], count, key };
    });
  }, [visibleReports]);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedReport(null);
  };

  const handleNavigateDetail = (report: AdminDailyReport) => {
    navigate(`/admin/daily-report/${report.id}`, { state: { report } });
  };

  const handleOpenInRightPanel = useCallback(
    (report: AdminDailyReport) => {
      enableSplitMode();
      setRightPanel({
        id: `daily-report-${report.id}`,
        title: `日報詳細 - ${report.date}`,
        component: DailyReportDetailPanel,
      });
    },
    [enableSplitMode, setRightPanel],
  );

  const handleOpenCarousel = () => {
    if (filteredReports.length > 0) {
      setSelectedReport(filteredReports[0]);
      setIsDialogOpen(true);
    }
  };

  const handleExportCsv = useCallback(() => {
    if (filteredReports.length === 0) return;
    const exportData = buildDailyReportCsv(filteredReports);
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, exportData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.download = formatDailyReportFileName();
    anchor.href = url;
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }, [filteredReports]);

  const totalPages = Math.ceil(filteredReports.length / rowsPerPage);
  const rangeStart = filteredReports.length > 0 ? page * rowsPerPage + 1 : 0;
  const rangeEnd = Math.min((page + 1) * rowsPerPage, filteredReports.length);

  return {
    isStaffLoading,
    staffError,
    statusFilter,
    setStatusFilter,
    staffFilter,
    setStaffFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    isLoadingReports,
    loadError,
    selectedReport,
    isDialogOpen,
    staffOptions,
    filteredReports,
    paginatedReports,
    statusSummary,
    visibleReports,
    totalPages,
    rangeStart,
    rangeEnd,
    handleCloseDialog,
    handleNavigateDetail,
    handleOpenInRightPanel,
    handleOpenCarousel,
    handleExportCsv,
  };
}
