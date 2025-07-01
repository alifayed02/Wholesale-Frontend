import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DateRangePickerProps {
  from: Date;
  to: Date;
  onChange: (range: { from: Date; to: Date }) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ from, to, onChange }) => {
  const [range, setRange] = useState({ from, to });

  const handleSelect = (selectedRange: any) => {
    if (selectedRange) {
      setRange(selectedRange);
      onChange(selectedRange);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex justify-start text-left font-normal bg-neutral-800 hover:bg-neutral-700 border-neutral-700"
        >
          <CalendarIcon className="mr-2 mt-1 h-4 w-4" />
          {range?.from ? (
            range.to ? (
              <>
                {format(range.from, 'LLL dd, y')} - {format(range.to, 'LLL dd, y')}
              </>
            ) : (
              format(range.from, 'LLL dd, y')
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-neutral-900 border-neutral-800" align="start">
        <DayPicker
          mode="range"
          defaultMonth={range?.from}
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={2}
          styles={{
            caption: { color: '#FFF' },
            day: { color: '#FFF' },
            head: { color: '#FF0000' },
          }}
        />
      </PopoverContent>
    </Popover>
  );
}; 