import type { SelectHTMLAttributes } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[];
  placeholder?: string;
};

export function Select({ options, placeholder, className = "", ...props }: SelectProps) {
  const baseClasses =
    "block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sablier-500 focus:border-sablier-500 text-sm";

  return (
    <select className={`${baseClasses} ${className}`} {...props}>
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
