import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { GraphQLResult } from "aws-amplify/api";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import {
  StaffRole,
  useStaffs,
} from "@/entities/staff/model/useStaffs/useStaffs";
import useWorkflows from "@/entities/workflow/model/useWorkflows";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import { listAttendances } from "@/shared/api/graphql/documents/queries";
import {
  onCreateAttendance,
  onDeleteAttendance,
  onUpdateAttendance,
} from "@/shared/api/graphql/documents/subscriptions";
import {
  AttendanceChangeRequest,
  ListAttendancesQuery,
  Workflow,
  WorkflowStatus,
} from "@/shared/api/graphql/types";
import { createLogger } from "@/shared/lib/logger";

const logger = createLogger("AdminPendingApprovalSummary");

const isWorkflowPendingForCurrentAdmin = (
  workflow: Workflow,
  currentStaffId: string | null,
) => {
  if (workflow.status !== WorkflowStatus.PENDING) {
    return false;
  }

  const approverIds = (workflow.assignedApproverStaffIds ?? []).filter(
    (id): id is string => Boolean(id),
  );

  if (approverIds.length === 0) {
    return true;
  }

  if (approverIds.includes("ADMINS")) {
    return true;
  }

  if (currentStaffId && approverIds.includes(currentStaffId)) {
    return true;
  }

  return false;
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
  const navigate = useNavigate();
  const { authStatus, cognitoUser, isCognitoUserRole } =
    useContext(AuthContext);
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

  const currentStaffId = useMemo(() => {
    if (!isAuthenticated || !cognitoUser?.id) {
      return null;
    }

    return (
      staffs.find((staff) => staff.cognitoUserId === cognitoUser.id)?.id ?? null
    );
  }, [cognitoUser?.id, isAuthenticated, staffs]);

  const [pendingAttendanceCount, setPendingAttendanceCount] = useState(0);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const pendingWorkflowCount = useMemo(() => {
    if (!isAdminUser || !workflows) {
      return 0;
    }

    return workflows.filter((workflow) =>
      isWorkflowPendingForCurrentAdmin(workflow, currentStaffId),
    ).length;
  }, [currentStaffId, isAdminUser, workflows]);

  const fetchPendingAttendanceCount = useCallback(async () => {
    if (!isAuthenticated || !isAdminUser) {
      return 0;
    }

    let nextToken: string | null = null;
    const pendingStaffIds = new Set<string>();

    do {
      const response = (await graphqlClient.graphql({
        query: listAttendances,
        variables: {
          limit: 100,
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
          pendingStaffIds.add(attendance.staffId);
        }
      });

      nextToken = connection?.nextToken ?? null;
    } while (nextToken);

    return pendingStaffIds.size;
  }, [isAdminUser, isAuthenticated]);

  const recalculatePendingAttendanceCount = useCallback(async () => {
    setAttendanceLoading(true);

    try {
      const total = await fetchPendingAttendanceCount();
      setPendingAttendanceCount(total);
    } catch (error) {
      logger.error("Failed to fetch pending attendance count", error);
    } finally {
      setAttendanceLoading(false);
    }
  }, [fetchPendingAttendanceCount]);

  useEffect(() => {
    if (!isAuthenticated || !isAdminUser) {
      setPendingAttendanceCount(0);
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
