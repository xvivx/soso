import React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@utils';

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & { enableX?: boolean; enableY?: boolean }
>(({ className, children, enableX, enableY = true, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    className={cn('detrade-scroll-container relative flex overflow-hidden overscroll-none', className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport ref={ref} className="detrade-scroll-viewport w-full">
      {children}
    </ScrollAreaPrimitive.Viewport>
    {enableX && (
      <ScrollBar orientation="horizontal">
        <ScrollAreaPrimitive.Thumb />
      </ScrollBar>
    )}
    {enableY && (
      <ScrollBar orientation="vertical">
        <ScrollAreaPrimitive.Thumb />
      </ScrollBar>
    )}
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'detrade-scrollbar z-0 flex touch-none select-none transition-colors',
      orientation === 'vertical' && 'h-full w-1.5 s768:w-2 p-px',
      orientation === 'horizontal' && 'h-1.5 s768:h-2 flex-col p-px',
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-white/30 light:bg-black/30" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
