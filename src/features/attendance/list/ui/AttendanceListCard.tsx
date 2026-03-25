import { ReactNode } from "react";
import "./AttendanceListCard.scss";

type AttendanceListCardProps = {
  children: ReactNode;
};

export default function AttendanceListCard({
  children,
}: AttendanceListCardProps) {
  return <div className="attendance-list-card">{children}</div>;
}
