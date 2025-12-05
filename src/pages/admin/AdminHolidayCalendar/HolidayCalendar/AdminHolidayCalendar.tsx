import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";
import Title from "@shared/ui/typography/Title";
import { useState } from "react";

import CompanyHolidayCalendarList from "../CompanyHolidayCalendar/CompanyHolidayCalendarList";
import HolidayCalendarList from "./HolidayCalendarList";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function AdminHolidayCalendar() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Stack spacing={2}>
      <Title>休日カレンダー管理</Title>
      <Typography>
        こちらでは、法定休日および会社休日のカレンダーを管理できます。
        <br />
        法定休日は労働基準法に基づく休日、会社休日は企業が独自に設定した休日です。
        <br />
      </Typography>
      <Typography>
        法定休日は、政府が公開する祝日データを元に作成されています。詳細は「ファイルからまとめて追加」をご参照ください。
      </Typography>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="法定休日" {...a11yProps(0)} />
            <Tab label="会社休日" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <HolidayCalendarList />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <CompanyHolidayCalendarList />
        </CustomTabPanel>
      </Box>
    </Stack>
  );
}
