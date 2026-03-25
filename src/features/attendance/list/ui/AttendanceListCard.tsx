import "./AttendanceListCard.scss";

import { ReactNode } from "react";

type AttendanceListCardProps = {
  children: ReactNode;
};

export default function AttendanceListCard({
  children,
}: AttendanceListCardProps) {
  return <div className="attendance-list-card">{children}</div>;
}
