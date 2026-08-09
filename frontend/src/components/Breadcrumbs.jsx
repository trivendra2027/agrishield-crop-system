import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const routeNameMap = {
  "": "Dashboard",
  dashboard: "Dashboard",
  upload: "AI Scan Center",
  result: "Diagnostic Result",
  history: "Scan History",
  "farm-analytics": "Farm Analytics",
  devices: "IoT Devices",
  notifications: "Notifications",
  assistant: "AI Assistant",
  reports: "Reports",
  profile: "Profile",
  settings: "Settings",
  analytics: "Telemetry Analytics",
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Don't render on landing, login, register pages
  if (["/", "/login", "/register", "/404"].includes(location.pathname)) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
      <ol className="inline-flex items-center space-x-1 sm:space-x-2">
        <li className="inline-flex items-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </li>
        {pathnames.map((value, index) => {
          if (value === "dashboard") return null; // Already rendered as Home
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const name = routeNameMap[value] || value.replace(/-/g, " ");

          return (
            <li key={to} className="inline-flex items-center space-x-1 sm:space-x-2">
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
              {isLast ? (
                <span className="font-semibold text-slate-800 dark:text-slate-100 capitalize">
                  {name}
                </span>
              ) : (
                <Link
                  to={to}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors capitalize"
                >
                  {name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
