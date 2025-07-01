import { NavLink } from "react-router-dom";
import { SidebarNavItem } from "./SidebarNavItem";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Target,
  TrendingUp,
  Handshake,
  FileText,
  Shield,
  LogOut
} from "lucide-react";
import { useQuery } from "react-query";
import axios from "axios";
import { Button } from "./ui/button";
import { Calendar } from "lucide-react";
import React, { useState, useRef } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import type { DateRange } from "react-day-picker";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import { emailCoachMap } from "../constants/emailCoachMap";

export function Sidebar() {
  const { logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const canSeeCoach = isAdmin || (user?.email && emailCoachMap[user.email.toLowerCase()]);

  const navItems = [
    { to: "/acquisition", label: "Dashboard", icon: LayoutDashboard },
    { to: "/acquisition-data", label: "Acquisition", icon: TrendingUp },
    { to: "/closer", label: "Closers", icon: Handshake },
    { to: "/setter", label: "Setters", icon: Users },
    { to: "/leads", label: "Leads", icon: Users },
    // ...(canSeeCoach ? [{ to: "/coach", label: "Coaches", icon: Briefcase }] : []),
    { to: "/invite", label: "Admin", icon: Shield },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="hidden border-r bg-neutral-900/50 md:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b px-6">
          <div className="flex items-center gap-3">
            <img src="sales.io.png" alt="Wholesale Launchpad" />
          </div>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map(({ to, label, icon }) => (
              <SidebarNavItem key={to} to={to} icon={icon}>
                {label}
              </SidebarNavItem>
            ))}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg mt-2 mb-2 px-3 py-2 text-neutral-400 transition-all hover:text-white hover:bg-blue-800">
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  delta?: string;
  loading?: boolean;
  error?: boolean;
}

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
}

interface MetricGridProps {
  children: React.ReactNode;
}

export function DashboardSection({ title, children }: DashboardSectionProps) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      {children}
    </div>
  );
}

export function MetricGrid({ children }: MetricGridProps) {
  return (
    <div className="grid gap-4">{children}</div>
  );
}

interface DashboardMetrics {
  revenue: number;
  showRate: number;
  // Add other fields as needed
}

function mapSheetRowsToMetrics(rows: any[]): DashboardMetrics {
  // TODO: Implement mapping logic
  return {
    revenue: 0,
    showRate: 0,
    // Add other fields as needed
  };
}

export function DateRangePickerButton() {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const ref = useRef<HTMLDivElement>(null);

  // Format the range for display
  const display =
    dateRange.from && dateRange.to
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
      : "Select date range";

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="white"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setOpen((v) => !v)}
      >
        <Calendar className="w-4 h-4 text-[#BDBDBD] mr-2" />
        {display}
        <span className="text-[#BDBDBD]">⌄</span>
      </Button>
      {open && (
        <div className="absolute left-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <DayPicker
            mode="range"
            selected={dateRange}
            onSelect={(selected) => {
              setDateRange(selected || { from: undefined, to: undefined });
              if (selected?.from && selected?.to) setOpen(false);
            }}
            numberOfMonths={2}
          />
        </div>
      )}
    </div>
  );
}