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
      <p className="m-0 text-4xl font-light leading-none text-white sm:text-5xl md:text-6xl">
        {time}
      </p>
    </div>
  );
};

export default Clock;
