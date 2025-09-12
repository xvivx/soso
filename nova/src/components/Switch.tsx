import { ComponentPropsWithoutRef, ElementRef, forwardRef, memo } from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@utils';

const Switch = forwardRef<
  ElementRef<typeof SwitchPrimitives.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-all border border-layer1',
      'bg-layer5 data-[state=checked]:bg-brand',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block size-4 rounded-full drop-shadow transition-all -ml-px',
        'translate-x-1 bg-layer6 data-[state=checked]:translate-x-6 data-[state=checked]:bg-white'
      )}
    />
  </SwitchPrimitives.Root>
));

Switch.displayName = SwitchPrimitives.Root.displayName;
export default memo(Switch);
