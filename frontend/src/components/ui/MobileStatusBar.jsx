import React, { useState, useEffect } from "react";
import { Wifi } from "lucide-react";

export default function MobileStatusBar() {
  const [time, setTime] = useState("9:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Use 9:41 as default stylistic mockup time or current hours/mins
      const hrs = now.getHours();
      const mins = String(now.getMinutes()).padStart(2, "0");
      setTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-6 pt-3 pb-1 select-none text-slate-800 text-[13px] font-semibold tracking-tight z-30">
      {/* Time */}
      <span className="font-semibold">{time}</span>

      {/* Dynamic Notch Pill */}
      <div className="h-4 w-20 bg-slate-900 rounded-full mx-auto -mt-1 hidden sm:block opacity-90" />

      {/* Status icons */}
      <div className="flex items-center gap-1.5 ml-auto">
        {/* Cellular Signal (4 bars) */}
        <div className="flex items-end gap-[2px] h-3">
          <span className="w-[3px] h-1.5 bg-slate-800 rounded-[1px]"></span>
          <span className="w-[3px] h-2 bg-slate-800 rounded-[1px]"></span>
          <span className="w-[3px] h-2.5 bg-slate-800 rounded-[1px]"></span>
          <span className="w-[3px] h-3 bg-slate-800 rounded-[1px]"></span>
        </div>

        {/* Wifi */}
        <Wifi className="w-3.5 h-3.5 text-slate-800 stroke-[2.5]" />

        {/* Battery */}
        <div className="flex items-center ml-0.5">
          <div className="w-5 h-2.5 border border-slate-800 rounded-[3px] p-[1.5px] flex items-center">
            <div className="w-full h-full bg-slate-800 rounded-[1px]"></div>
          </div>
          <div className="w-[1.5px] h-1 bg-slate-800 rounded-r-[1px]"></div>
        </div>
      </div>
    </div>
  );
}
