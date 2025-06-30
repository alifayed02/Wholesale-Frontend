import React from 'react';
import { Select } from './Select';

interface CloserSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export const CloserSelect: React.FC<CloserSelectProps> = ({ value, onChange, options }) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select Closer"
    />
  );
}; 