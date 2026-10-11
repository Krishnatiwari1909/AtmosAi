import React from "react";

export default function SkylineSvg({ className = "" }) {
  return (
    <div className={`pointer-events-none select-none opacity-40 ${className}`}>
      <svg
        viewBox="0 0 400 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Background far towers */}
        <path
          d="M20 120V60H35V120M40 120V45H60V120M65 120V70H80V120M110 120V35H125V120M130 120V50H150V120M175 120V30H190V120M240 120V40H260V120M290 120V55H310V120M345 120V35H360V120M365 120V65H380V120"
          fill="#94A3B8"
          fillOpacity="0.4"
        />

        {/* Mid-ground modern skyscrapers */}
        <rect x="85" y="55" width="22" height="65" rx="1" fill="#64748B" fillOpacity="0.5" />
        <rect x="152" y="38" width="20" height="82" rx="1" fill="#64748B" fillOpacity="0.6" />
        {/* Spire */}
        <polygon points="162,15 160,38 164,38" fill="#475569" fillOpacity="0.7" />

        <rect x="195" y="48" width="38" height="72" rx="1" fill="#64748B" fillOpacity="0.55" />
        <rect x="265" y="25" width="24" height="95" rx="1" fill="#64748B" fillOpacity="0.6" />
        <polygon points="277,10 275,25 279,25" fill="#475569" fillOpacity="0.7" />

        <rect x="315" y="42" width="28" height="78" rx="1" fill="#64748B" fillOpacity="0.5" />

        {/* Foreground architectural blocks */}
        <rect x="5" y="80" width="30" height="40" fill="#475569" fillOpacity="0.6" />
        <rect x="45" y="72" width="35" height="48" fill="#475569" fillOpacity="0.65" />
        <rect x="90" y="85" width="40" height="35" fill="#475569" fillOpacity="0.7" />
        <rect x="135" y="68" width="35" height="52" fill="#475569" fillOpacity="0.65" />
        <rect x="175" y="75" width="45" height="45" fill="#475569" fillOpacity="0.7" />
        <rect x="225" y="60" width="35" height="60" fill="#475569" fillOpacity="0.75" />
        <rect x="268" y="70" width="38" height="50" fill="#475569" fillOpacity="0.65" />
        <rect x="310" y="78" width="45" height="42" fill="#475569" fillOpacity="0.7" />
        <rect x="360" y="82" width="35" height="38" fill="#475569" fillOpacity="0.6" />

        {/* Subtle bridge/flyover base */}
        <rect x="0" y="112" width="400" height="8" fill="#334155" fillOpacity="0.5" />
      </svg>
    </div>
  );
}
