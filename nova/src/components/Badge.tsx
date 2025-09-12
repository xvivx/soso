import { ReactNode } from 'react';
import { AnimatePresence, motion, MotionProps } from 'framer-motion';
import { cn } from '@utils';

interface BadgeProps {
  className?: string;
  wrapperClassName?: string;
  size?: 'normal' | 'small';
  children?: ReactNode;
}

export default function Badge(props: BadgeProps & { count: number }) {
  const { className, wrapperClassName, children, count, size = 'normal' } = props;

  if (!children) {
    return (
      <BadgeContent className={className} size={size}>
        {count}
      </BadgeContent>
    );
  }

  return (
    <div className={cn('inline-flex relative', wrapperClassName)}>
      {children}
      <AnimatePresence>
        {count > 0 && (
          <BadgeContent
            className={cn('absolute z-10 top-0 right-0', className)}
            motionProps={{ style: { x: '50%', y: '-50%', scale: size === 'small' ? 0.75 : 1 } }}
            size={size}
          >
            {count}
          </BadgeContent>
        )}
      </AnimatePresence>
    </div>
  );
}

function BadgeContent(props: BadgeProps & { motionProps?: MotionProps }) {
  const { className, size, children, motionProps } = props;
  return (
    <motion.div
      initial={false}
      exit={{ scale: 0 }}
      transition={{ delay: 0.3 }}
      {...motionProps}
      className={cn(
        'inline-flex justify-center items-center rounded-full bg-error min-w-5 h-5 px-1 text-12 text-white font-600',
        size === 'small' && 'scale-75',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
