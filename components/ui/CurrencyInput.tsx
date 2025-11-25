import React from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string | number;
  onValueChange: (value: string) => void;
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ 
  value, 
  onValueChange, 
  className = '', 
  ...props 
}) => {
  // Format display value: add dots as thousands separators
  const formatDisplay = (val: string | number) => {
    if (!val) return '';
    // Ensure we work with a string of digits
    const cleanVal = val.toString().replace(/\D/g, '');
    return cleanVal.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get raw input
    const rawValue = e.target.value;
    // Remove dots and non-digits to get the actual number string
    const cleanValue = rawValue.replace(/\./g, '').replace(/\D/g, '');
    
    // Pass the clean number string back to parent
    onValueChange(cleanValue);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
        Rp
      </span>
      <input
        type="text"
        inputMode="numeric"
        className={`w-full pl-10 pr-3 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white ${className}`}
        value={formatDisplay(value)}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
};