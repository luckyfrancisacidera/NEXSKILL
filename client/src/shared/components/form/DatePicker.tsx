import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const parseDateValue = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, monthIndex, day);

  if (Number.isNaN(date.getTime())) return null;
  if (date.getFullYear() !== year || date.getMonth() !== monthIndex || date.getDate() !== day) return null;

  return date;
};

const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const displayFormatter = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label, disabled = false, className = '' }) => {
  const initialDate = parseDateValue(value) ?? new Date();
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = parseDateValue(value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();

  const dayCells = useMemo(
    () => [
      ...Array.from({ length: firstDayOffset }, (_, index) => ({ key: `empty-${index}`, day: 0 })),
      ...Array.from({ length: daysInMonth }, (_, index) => ({ key: `day-${index + 1}`, day: index + 1 })),
    ],
    [daysInMonth, firstDayOffset],
  );

  const currentMonthLabel = useMemo(
    () => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(viewYear, viewMonth, 1)),
    [viewYear, viewMonth],
  );

  const changeMonth = (direction: -1 | 1) => {
    if (viewMonth === 0 && direction === -1) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
      return;
    }

    if (viewMonth === 11 && direction === 1) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
      return;
    }

    setViewMonth((prev) => prev + direction);
  };

  const handleDaySelect = (day: number) => {
    const nextDate = new Date(viewYear, viewMonth, day);
    onChange(formatDateValue(nextDate));
    setIsOpen(false);
  };

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      {label ? <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">{label}</label> : null}
      

      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          disabled={disabled}
          className="flex h-11 w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-3.5 text-left text-sm text-zinc-700 shadow-sm transition-colors hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/80 dark:disabled:border-zinc-800 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-600"
        >
          <span className={`truncate ${!selectedDate ? 'text-zinc-400 dark:text-zinc-600' : ''}`}>{selectedDate ? displayFormatter.format(selectedDate) : 'Select date'}</span>
          <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen ? (
          <div className="absolute z-50 mt-2 min-w-72 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
              <button type="button" onClick={() => changeMonth(-1)} className="rounded-lg p-1 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                <ChevronLeft size={18} />
              </button>

              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{currentMonthLabel}</span>

              <button type="button" onClick={() => changeMonth(1)} className="rounded-lg p-1 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <span key={day} className="text-center text-xs font-semibold text-zinc-500 dark:text-zinc-500">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {dayCells.map(({ key, day }) => {
                if (!day) return <span key={key} className="h-9" />;

                const isSelected =
                  !!selectedDate &&
                  selectedDate.getFullYear() === viewYear &&
                  selectedDate.getMonth() === viewMonth &&
                  selectedDate.getDate() === day;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleDaySelect(day)}
                    className={`h-9 rounded-md text-sm transition-colors ${isSelected ? 'bg-zinc-900 font-medium text-white dark:bg-zinc-100 dark:text-zinc-950' : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DatePicker;
