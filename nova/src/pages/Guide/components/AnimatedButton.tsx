import React from 'react';
import { Button } from '@components';
import { cn } from '@utils';

const AnimatedButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}> = ({ children, onClick, className = '' }) => (
  <Button
    className={cn(
      'block mt-4 s1024:mt-8 text-16 s768:text-18 s1024:text-24 font-700 w-44  s1024:w-100 h-10 s768:h-12 s1024:h-16',
      className
    )}
    theme="primary"
    onClick={onClick}
  >
    {children}
  </Button>
);

export default React.memo(AnimatedButton);
