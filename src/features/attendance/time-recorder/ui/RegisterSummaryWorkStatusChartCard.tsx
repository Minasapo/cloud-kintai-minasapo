import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartData,
  type ChartOptions,
  Legend,
  LinearScale,
  Tooltip as ChartTooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

type RegisterSummaryWorkStatusChartCardProps = {
  chartData: ChartData<"bar">;
  chartOptions: ChartOptions<"bar">;
  hasChartData: boolean;
  workStatusDataCount: number;
};

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, Legend);

export default function RegisterSummaryWorkStatusChartCard({
  chartData,
  chartOptions,
  hasChartData,
  workStatusDataCount,
}: RegisterSummaryWorkStatusChartCardProps) {
  return (
    <div className="mt-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-xs font-medium tracking-[0.03em] text-slate-500">
          勤務状況チャート
        </p>
        <p
          data-testid="register-dashboard-work-status-chart-count"
          className="m-0 text-xs font-semibold text-slate-600"
        >
          対象データ {workStatusDataCount}件
        </p>
      </div>
      <div className="mt-2 h-52">
        {hasChartData ? (
          <Bar
            data={chartData}
            options={chartOptions}
            data-testid="register-dashboard-work-status-chart"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-medium text-slate-500">
            表示可能な勤務データがありません
          </div>
        )}
      </div>
    </div>
  );
}
