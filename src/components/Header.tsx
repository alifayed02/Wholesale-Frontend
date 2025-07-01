import React from 'react';
import { DateRangePickerButton } from "./DateRangePickerButton";

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-8 py-6 bg-transparent">
      <div className="flex items-center gap-3">
        {/* Placeholder for Logo */}
        <div className="w-8 h-8 bg-blue-600 rounded-lg" />
        <h1 className="text-xl font-bold text-white">Wholesale Launchpad</h1>
      </div>
      <div className="relative">
        <DateRangePickerButton
          value="May 1 – May 31, 2025"
          onChange={() => {}}
          className="flex items-center gap-2"
        />
      </div>
    </header>
  );
};