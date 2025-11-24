import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action }) => {
  return (
    <div className={`bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-sm p-5 ${className}`}>
      {(title || action) && (
        <div className="flex justify-between items-center mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};