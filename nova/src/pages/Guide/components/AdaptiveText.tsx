import React from 'react';

const baseClasses = {
  h1: 'text-26 s1024:text-44 font-700 text-primary',
  h2: 'text-18 s768:text-24 s1024:text-32 font-700 text-primary',
  h3: 'text-18 s1024:text-44 font-700 text-primary',
  p: 'text-18 s1024:text-24 font-500 text-secondary',
};

const AdaptiveText: React.FC<{
  children: React.ReactNode;
  level?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
}> = ({ children, level = 'h1', className = '' }) => {
  const Tag = level as keyof JSX.IntrinsicElements;
  return <Tag className={`${baseClasses[level]} ${className}`}>{children}</Tag>;
};

export default React.memo(AdaptiveText);
