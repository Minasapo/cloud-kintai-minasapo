import { Typography } from "@mui/material";
import dayjs from "dayjs";
import React from "react";

const Clock = () => {
  const [time, setTime] = React.useState(dayjs().format("YYYY/MM/DD HH:mm:ss"));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs().format("YYYY/MM/DD HH:mm:ss"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-[5px] bg-black p-3 text-center">
      <Typography variant="h1" color="white">
        {time}
      </Typography>
    </div>
  );
};

export default Clock;
