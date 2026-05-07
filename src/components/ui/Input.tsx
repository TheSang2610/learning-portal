import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
          {label}
        </label>
      )}
      <input
        className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
          ${error 
            ? 'border-red-500 focus:ring-4 focus:ring-red-500/10' 
            : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900/50'}
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 ml-1 mt-1 font-medium">{error}</span>}
    </div>
  );
};
