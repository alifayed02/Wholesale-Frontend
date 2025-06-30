import React from 'react';
import { Select } from './Select';

interface PlatformSelectProps {
  platform: string;
  onChange: (platform: string) => void;
  options: string[];
}

export const PlatformSelect: React.FC<PlatformSelectProps> = ({ platform, onChange, options }) => {
  return (
    <Select
      value={platform}
      onChange={onChange}
      options={options}
      placeholder="Select Platform"
    />
  );
}; 