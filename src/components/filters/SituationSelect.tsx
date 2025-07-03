import React from 'react';
import { Select } from './Select';

interface SituationSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export const SituationSelect: React.FC<SituationSelectProps> = ({ value, onChange, options }) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select Situation"
    />
  );
}; 