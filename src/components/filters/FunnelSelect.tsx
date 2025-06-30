import React from 'react';
import { Select } from './Select';

interface FunnelSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export const FunnelSelect: React.FC<FunnelSelectProps> = ({ value, onChange, options }) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select Funnel"
    />
  );
}; 