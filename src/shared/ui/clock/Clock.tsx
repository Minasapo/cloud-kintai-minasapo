import "./Clock.scss";

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
    <div className="clock">
      <p className="clock__text">
        {time}
      </p>
    </div>
  );
};

export default Clock;
