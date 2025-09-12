import { ComponentPropsWithoutRef, ElementRef, forwardRef, memo, ReactNode, useId } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@utils';

interface RadioGroupProps extends ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  options?: { label: ReactNode; value: string }[];
}

const RadioGroup = forwardRef<ElementRef<typeof RadioGroupPrimitive.Root>, RadioGroupProps>(
  ({ className, options, children, orientation = 'horizontal', ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Root
        className={cn('flex', orientation === 'horizontal' ? 'items-center gap-8' : 'flex-col gap-2', className)}
        {...props}
        ref={ref}
      >
        {children ||
          options!.map((option) => {
            return (
              <Radio key={option.value} value={option.value} disabled={props.disabled}>
                {option.label}
              </Radio>
            );
          })}
      </RadioGroupPrimitive.Root>
    );
  }
);
RadioGroup.displayName = 'RadioGroup';

const Radio = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const id = useId();
  return (
    <div
      className={cn(
        'detrade-radio flex items-center gap-1.5 text-14 font-500',
        props.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className
      )}
    >
      <RadioGroupPrimitive.Item
        ref={ref}
        className="size-4 rounded-full border-thirdly border-2 text-primary bg-transparent transition-all disabled:opacity-50 cursor-[inherit]"
        id={id}
        {...props}
      />
      <label className="cursor-[inherit]" htmlFor={id}>
        {children}
      </label>
    </div>
  );
});
Radio.displayName = 'Radio';

export default Object.assign(memo(Radio), {
  Group: memo(RadioGroup),
});
