import React from 'react';
import { Select } from './Select';

interface CoachSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export const CoachSelect: React.FC<CoachSelectProps> = ({ value, onChange, options }) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select Coach"
    />
  );
}; 