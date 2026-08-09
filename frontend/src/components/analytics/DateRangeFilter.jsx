import React from 'react';
import { Calendar } from 'lucide-react';

const options = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' }
];

const DateRangeFilter = ({ selected, onChange }) => {
  return (
    <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
      <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 ml-2" />
      <div className="hidden md:flex space-x-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              selected === opt.value
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="md:hidden border-0 bg-transparent text-sm text-slate-700 focus:ring-0 py-1.5 pl-2 pr-6"
      >
        {options.map((opt) => (
          <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DateRangeFilter;
