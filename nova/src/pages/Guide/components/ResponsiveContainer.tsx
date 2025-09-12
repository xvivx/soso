import React from 'react';

const ResponsiveContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  spacing?: 'compact' | 'normal' | 'spacious';
}> = ({ children, className = '' }) => {
  return <div className={`h-screen flex flex-col items-center justify-center relative  ${className}`}>{children}</div>;
};

export default React.memo(ResponsiveContainer);
