import { createContext, useContext, useState, ReactNode } from 'react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns';

export type DatePreset = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';

interface DateRangeState {
  startDate: Date;
  endDate: Date;
  preset: DatePreset;
  setPreset: (preset: DatePreset) => void;
  setCustomRange: (start: Date, end: Date) => void;
}

const DateRangeContext = createContext<DateRangeState | undefined>(undefined);

function getPresetDates(preset: DatePreset): { start: Date; end: Date } {
  const now = new Date();
  switch (preset) {
    case 'this_week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'last_week': {
      const lastWeek = subWeeks(now, 1);
      return { start: startOfWeek(lastWeek, { weekStartsOn: 1 }), end: endOfWeek(lastWeek, { weekStartsOn: 1 }) };
    }
    case 'this_month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'last_month': {
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
    default:
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
  }
}

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState<DatePreset>('this_week');
  const initialDates = getPresetDates('this_week');
  const [startDate, setStartDate] = useState<Date>(initialDates.start);
  const [endDate, setEndDate] = useState<Date>(initialDates.end);

  const setPreset = (p: DatePreset) => {
    setPresetState(p);
    if (p !== 'custom') {
      const dates = getPresetDates(p);
      setStartDate(dates.start);
      setEndDate(dates.end);
    }
  };

  const setCustomRange = (start: Date, end: Date) => {
    setPresetState('custom');
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <DateRangeContext.Provider value={{ startDate, endDate, preset, setPreset, setCustomRange }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const ctx = useContext(DateRangeContext);
  if (!ctx) throw new Error('useDateRange must be used within DateRangeProvider');
  return ctx;
}
