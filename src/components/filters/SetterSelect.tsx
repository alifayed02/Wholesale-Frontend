import React from 'react';
import { Select } from './Select';

interface SetterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export const SetterSelect: React.FC<SetterSelectProps> = ({ value, onChange, options }) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select Setter"
    />
  );
}; 