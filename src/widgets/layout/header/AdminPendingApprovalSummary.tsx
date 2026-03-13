import { Box, ButtonBase, Stack, Tooltip, Typography } from "@mui/material";
import { GraphQLResult } from "aws-amplify/api";
import dayjs from "dayjs";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import {
  StaffRole,
  useStaffs,
} from "@/entities/staff/model/useStaffs/useStaffs";
import useWorkflows from "@/entities/workflow/model/useWorkflows";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import {
  getStaff,
  listAttendances,
} from "@/shared/api/graphql/documents/queries";
import {
  onCreateAttendance,
  onDeleteAttendance,
  onUpdateAttendance,
} from "@/shared/api/graphql/documents/subscriptions";
import {
  AttendanceChangeRequest,
  GetStaffQuery,
  ListAttendancesQuery,
  Workflow,
  WorkflowStatus,
} from "@/shared/api/graphql/types";
import { createLogger } from "@/shared/lib/logger";

const logger = createLogger("AdminPendingApprovalSummary");
const ATTENDANCE_LOOKBACK_DAYS = 30;

const isWorkflowPendingForCurrentAdmin = (workflow: Workflow) => {
  const isUnapprovedStatus =
    workflow.status === WorkflowStatus.SUBMITTED ||
    workflow.status === WorkflowStatus.PENDING;

  if (!isUnapprovedStatus) {
    return false;
  }

  return true;
};

const isPendingAttendanceRequest = (
  request: AttendanceChangeRequest | null | undefined,
) => {
  if (!request) {
    return false;
  }

  if (request.completed === true) {
    return false;
  }

  const hasComment =
    typeof request.staffComment === "string" &&
    request.staffComment.trim().length > 0;
  const hasAdminComment =
    typeof request.comment === "string" && request.comment.trim().length > 0;

  return hasComment || hasAdminComment;
};

export default function AdminPendingApprovalSummary() {
  type PendingAttendanceEntry = {
    staffId: string;
    workDate: string;
  };

  const navigate = useNavigate();
  const { authStatus, isCognitoUserRole } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";

  const isAdminUser = useMemo(
    () =>
      isCognitoUserRole(StaffRole.ADMIN) ||
      isCognitoUserRole(StaffRole.STAFF_ADMIN) ||
      isCognitoUserRole(StaffRole.OWNER),
    [isCognitoUserRole],
  );

  const { staffs } = useStaffs({ isAuthenticated });
  const { workflows } = useWorkflows({ isAuthenticated });

  const [pendingAttendanceCount, setPendingAttendanceCount] = useState(0);
  const [pendingAttendanceEntries, setPendingAttendanceEntries] = useState<
    PendingAttendanceEntry[]
  >([]);
  const [resolvedStaffNameById, setResolvedStaffNameById] = useState<
    Record<string, string>
  >({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const staffNameById = useMemo(
    () =>
      new Map(
        staffs.flatMap((staff) => {
          const staffName =
            `${staff.familyName ?? ""}${staff.givenName ?? ""}` || "不明";
          const keys = [staff.id];

          if (staff.cognitoUserId) {
            keys.push(staff.cognitoUserId);
          }

          return keys.map((key) => [key, staffName] as const);
        }),
      ),
    [staffs],
  );

  const pendingWorkflowCount = useMemo(() => {
    if (!isAdminUser || !workflows) {
      return 0;
    }

    return workflows.filter((workflow) =>
      isWorkflowPendingForCurrentAdmin(workflow),
    ).length;
  }, [isAdminUser, workflows]);

  const tooltipStaffNameById = useMemo(() => {
    const map = new Map(staffNameById);
    Object.entries(resolvedStaffNameById).forEach(([staffId, staffName]) => {
      map.set(staffId, staffName);
    });
    return map;
  }, [resolvedStaffNameById, staffNameById]);

  const fetchPendingAttendanceSummary = useCallback(async () => {
    if (!isAuthenticated || !isAdminUser) {
      return {
        pendingStaffCount: 0,
        pendingEntries: [] as PendingAttendanceEntry[],
      };
    }

    const sinceWorkDate = dayjs()
      .subtract(ATTENDANCE_LOOKBACK_DAYS, "day")
      .format("YYYY-MM-DD");

    let nextToken: string | null = null;
    const pendingEntryKeys = new Set<string>();
    const pendingEntries: PendingAttendanceEntry[] = [];

    do {
      const response = (await graphqlClient.graphql({
        query: listAttendances,
        variables: {
          limit: 100,
          filter: {
            workDate: {
              ge: sinceWorkDate,
            },
          },
          nextToken,
        },
        authMode: "userPool",
      })) as GraphQLResult<ListAttendancesQuery>;

      if (response.errors?.length) {
        throw new Error(response.errors[0].message);
      }

      const connection = response.data?.listAttendances;
      const items = connection?.items ?? [];

      items.forEach((attendance) => {
        if (!attendance?.staffId) {
          return;
        }

        const hasPendingRequest = (attendance.changeRequests ?? []).some(
          (request) => isPendingAttendanceRequest(request),
        );

        if (hasPendingRequest) {
          const workDate = attendance.workDate ?? "";
          const entryKey = `${attendance.staffId}:${workDate}`;
          if (!pendingEntryKeys.has(entryKey)) {
            pendingEntryKeys.add(entryKey);
            pendingEntries.push({
              staffId: attendance.staffId,
              workDate,
            });
          }
        }
      });

      nextToken = connection?.nextToken ?? null;
    } while (nextToken);

    return {
      pendingStaffCount: pendingEntries.length,
      pendingEntries,
    };
  }, [isAdminUser, isAuthenticated]);

  const recalculatePendingAttendanceCount = useCallback(async () => {
    setAttendanceLoading(true);

    try {
      const summary = await fetchPendingAttendanceSummary();
      setPendingAttendanceCount(summary.pendingStaffCount);
      setPendingAttendanceEntries(summary.pendingEntries);
    } catch (error) {
      logger.error("Failed to fetch pending attendance count", error);
    } finally {
      setAttendanceLoading(false);
    }
  }, [fetchPendingAttendanceSummary]);

  useEffect(() => {
    if (!isAuthenticated || !isAdminUser) {
      setPendingAttendanceCount(0);
      setPendingAttendanceEntries([]);
      setAttendanceLoading(false);
      return;
    }

    let active = true;

    const run = async () => {
      await recalculatePendingAttendanceCount();

      if (!active) {
        return;
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [isAdminUser, isAuthenticated, recalculatePendingAttendanceCount]);

  useEffect(() => {
    if (
      !isAuthenticated ||
      !isAdminUser ||
      pendingAttendanceEntries.length === 0
    ) {
      return;
    }

    const unknownStaffIds = Array.from(
      new Set(
        pendingAttendanceEntries
          .map((entry) => entry.staffId)
          .filter(
            (staffId) =>
              !tooltipStaffNameById.has(staffId) &&
              !resolvedStaffNameById[staffId],
          ),
      ),
    );

    if (unknownStaffIds.length === 0) {
      return;
    }

    let isActive = true;

    const fetchMissingStaffNames = async () => {
      const resolvedEntries = await Promise.all(
        unknownStaffIds.map(async (staffId) => {
          try {
            const response = (await graphqlClient.graphql({
              query: getStaff,
              variables: { id: staffId },
              authMode: "userPool",
            })) as GraphQLResult<GetStaffQuery>;

            if (response.errors?.length) {
              throw new Error(response.errors[0].message);
            }

            const staff = response.data?.getStaff;
            const name =
              `${staff?.familyName ?? ""}${staff?.givenName ?? ""}`.trim();
            if (!name) {
              return null;
            }

            return [staffId, name] as const;
          } catch (error) {
            logger.warn("Failed to resolve staff name for tooltip", {
              staffId,
              error,
            });
            return null;
          }
        }),
      );

      if (!isActive) {
        return;
      }

      const nextResolvedNames = resolvedEntries.filter(
        (entry): entry is readonly [string, string] => Boolean(entry),
      );

      if (nextResolvedNames.length === 0) {
        return;
      }

      setResolvedStaffNameById((previous) => {
        const merged = { ...previous };
        nextResolvedNames.forEach(([staffId, staffName]) => {
          merged[staffId] = staffName;
        });
        return merged;
      });
    };

    void fetchMissingStaffNames();

    return () => {
      isActive = false;
    };
  }, [
    isAdminUser,
    isAuthenticated,
    pendingAttendanceEntries,
    resolvedStaffNameById,
    tooltipStaffNameById,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !isAdminUser) {
      return;
    }

    let isMounted = true;
    let recalcTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRecalc = () => {
      if (recalcTimer) {
        clearTimeout(recalcTimer);
      }

      recalcTimer = setTimeout(() => {
        if (!isMounted) {
          return;
        }

        void recalculatePendingAttendanceCount();
      }, 300);
    };

    const createSubscription = graphqlClient
      .graphql({
        query: onCreateAttendance,
        authMode: "userPool",
      })
      .subscribe({
        next: () => {
          scheduleRecalc();
        },
        error: (error: unknown) => {
          logger.error("Attendance create subscription error", error);
        },
      });

    const updateSubscription = graphqlClient
      .graphql({
        query: onUpdateAttendance,
        authMode: "userPool",
      })
      .subscribe({
        next: () => {
          scheduleRecalc();
        },
        error: (error: unknown) => {
          logger.error("Attendance update subscription error", error);
        },
      });

    const deleteSubscription = graphqlClient
      .graphql({
        query: onDeleteAttendance,
        authMode: "userPool",
      })
      .subscribe({
        next: () => {
          scheduleRecalc();
        },
        error: (error: unknown) => {
          logger.error("Attendance delete subscription error", error);
        },
      });

    const subscriptions = [
      createSubscription,
      updateSubscription,
      deleteSubscription,
    ];

    return () => {
      isMounted = false;

      if (recalcTimer) {
        clearTimeout(recalcTimer);
      }

      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, [isAdminUser, isAuthenticated, recalculatePendingAttendanceCount]);

  const pendingEntriesForTooltip = useMemo(
    () =>
      pendingAttendanceEntries
        .toSorted((a, b) => a.workDate.localeCompare(b.workDate))
        .slice(0, 8),
    [pendingAttendanceEntries],
  );

  const hiddenPendingEntriesCount =
    pendingAttendanceEntries.length - pendingEntriesForTooltip.length;

  if (!isAuthenticated || !isAdminUser) {
    return null;
  }

  const attendanceCountLabel = attendanceLoading
    ? "集計中"
    : `${pendingAttendanceCount}件`;
  const workflowCountLabel = `${pendingWorkflowCount}件`;

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="center"
      sx={{ minWidth: 0 }}
    >
      <Tooltip
        placement="bottom"
        title={
          <Box sx={{ py: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              未承認勤怠（直近30日）
            </Typography>
            {pendingEntriesForTooltip.length === 0 ? (
              <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                対象なし
              </Typography>
            ) : (
              pendingEntriesForTooltip.map((entry) => {
                const staffName =
                  tooltipStaffNameById.get(entry.staffId) ?? "不明なスタッフ";
                const displayDate = entry.workDate.replaceAll("-", "/");
                return (
                  <Typography
                    key={`${entry.staffId}-${entry.workDate}`}
                    variant="caption"
                    sx={{ display: "block" }}
                  >
                    {`${displayDate} の ${staffName}`}
                  </Typography>
                );
              })
            )}
            {hiddenPendingEntriesCount > 0 && (
              <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                他 {hiddenPendingEntriesCount} 件
              </Typography>
            )}
          </Box>
        }
      >
        <ButtonBase
          onClick={() => navigate("/admin/attendances")}
          sx={{
            borderRadius: 1,
            minWidth: 0,
            display: "block",
          }}
        >
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: "common.white",
              minWidth: { lg: "112px", xl: "124px" },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                lineHeight: 1.1,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              勤怠修正申請
            </Typography>
            <Typography
              variant="body2"
              sx={{
                display: "block",
                color: "text.primary",
                fontWeight: 700,
                lineHeight: 1.2,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {attendanceCountLabel}
            </Typography>
          </Box>
        </ButtonBase>
      </Tooltip>
      <ButtonBase
        onClick={() => navigate("/admin/workflow")}
        sx={{
          borderRadius: 1,
          minWidth: 0,
          display: "block",
        }}
      >
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: "common.white",
            minWidth: { lg: "112px", xl: "124px" },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              lineHeight: 1.1,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            ワークフロー申請
          </Typography>
          <Typography
            variant="body2"
            sx={{
              display: "block",
              color: "text.primary",
              fontWeight: 700,
              lineHeight: 1.2,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {workflowCountLabel}
          </Typography>
        </Box>
      </ButtonBase>
    </Stack>
  );
}
