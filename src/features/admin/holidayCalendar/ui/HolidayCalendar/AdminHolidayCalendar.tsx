import { type ReactNode, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import CompanyHolidayCalendarList from "../CompanyHolidayCalendar/CompanyHolidayCalendarList";
import EventCalendarList from "../EventCalendar/EventCalendarList";
import HolidayCalendarList from "./HolidayCalendarList";

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index ? <div className="pt-6">{children}</div> : null}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const tabParamKey = "tab";
const tabValues = ["legal", "company", "event"] as const;
type TabValue = (typeof tabValues)[number];

const getTabIndexFromParam = (param: string | null) => {
  if (!param) return 0;
  const index = tabValues.indexOf(param as TabValue);
  return index >= 0 ? index : 0;
};

const getTabParamFromIndex = (index: number): TabValue =>
  tabValues[index] ?? "legal";

export default function AdminHolidayCalendar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = useMemo(
    () => getTabIndexFromParam(searchParams.get(tabParamKey)),
    [searchParams],
  );

  const handleChange = (newValue: number) => {
    const next = new URLSearchParams(searchParams);
    next.set(tabParamKey, getTabParamFromIndex(newValue));
    setSearchParams(next, { replace: true });
  };

  const tabs = ["法定休日", "会社休日", "イベントカレンダー"];

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-slate-700">
        こちらでは、法定休日、会社休日、およびイベントカレンダーを管理できます。
        <br />
        法定休日は労働基準法に基づく休日、会社休日は企業が独自に設定した休日、イベントカレンダーは休日以外の周知したい情報です。
      </p>
      <p className="m-0 text-slate-700">
        法定休日は、政府が公開する祝日データを元に作成されています。詳細は「ファイルからまとめて追加」をご参照ください。
      </p>
      <div className="w-full">
        <div className="border-b border-slate-200">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                {...a11yProps(index)}
                onClick={() => handleChange(index)}
                className={[
                  "rounded-t-xl px-4 py-3 text-sm font-medium transition",
                  value === index
                    ? "border-b-2 border-emerald-600 text-emerald-700"
                    : "text-slate-500 hover:text-slate-800",
                ].join(" ")}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <CustomTabPanel value={value} index={0}>
          <HolidayCalendarList />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <CompanyHolidayCalendarList />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <EventCalendarList />
        </CustomTabPanel>
      </div>
    </div>
  );
}
