import dayjs from "dayjs";
import React, { type CSSProperties } from "react";

const Clock = () => {
  const [time, setTime] = React.useState(dayjs().format("YYYY/MM/DD HH:mm:ss"));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs().format("YYYY/MM/DD HH:mm:ss"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="rounded-[5px] bg-black px-3 py-3 text-center"
      style={
        {
          "--clock-font-size": "clamp(1.05rem, 3.6vw, 1.5rem)",
        } as CSSProperties & Record<`--${string}`, string>
      }
    >
      <p className="m-0 whitespace-nowrap text-[length:var(--clock-font-size)] font-normal leading-none tracking-[-0.02em] text-white [font-variant-numeric:tabular-nums]">
        {time}
      </p>
    </div>
  );
};

export default Clock;
