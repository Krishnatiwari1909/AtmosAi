import React from "react";
import { Home, Map, BarChart3, Bell, User } from "lucide-react";

export default function BottomNav({ activeTab, onSelectTab, alertCount = 2 }) {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "map", label: "Map", icon: Map },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "alerts", label: "Alerts", icon: Bell, badge: alertCount },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="w-full bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2 px-3 z-30 select-none">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 transition-colors relative group focus:outline-none"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? "text-blue-600 scale-110 stroke-[2.4]"
                      : "text-slate-400 group-hover:text-slate-600 stroke-[1.8]"
                  }`}
                />
                {item.badge && item.badge > 0 && item.id === "alerts" && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium transition-colors ${
                  isActive ? "text-blue-600 font-bold" : "text-slate-400 group-hover:text-slate-600"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
