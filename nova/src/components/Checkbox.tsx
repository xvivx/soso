import {
  Children,
  cloneElement,
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  memo,
  ReactElement,
  ReactNode,
  useId,
} from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '@utils';

const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, children, ...props }, ref) => {
  const id = useId();
  return (
    // 这样对齐可以应对换行的情况, 比item-center更灵活些
    <div className={cn('detrade-checkbox flex gap-1.5 py-0.5 text-14 leading-5 text-primary', className)}>
      <CheckboxPrimitive.Root
        ref={ref}
        className="relative size-5 shrink-0 rounded border-2 border-thirdly transition-all"
        id={id}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="abs-center flex-center text-current">
          <CheckedIcon />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <label className="cursor-pointer" htmlFor={id}>
        {children}
      </label>
    </div>
  );
});
Checkbox.displayName = 'Checkbox';

export { Checkbox, CheckboxGroup };

interface CheckboxGroupProps {
  className?: string;
  options?: { label: ReactNode; value: string; className?: string }[];
  value?: string[];
  onChange?: (value: string[]) => void;
  children?: ReactElement | ReactElement[];
}

function CheckboxGroup(props: CheckboxGroupProps) {
  const { className, options, value, onChange, children } = props;
  const onCheckedChange = (checked: boolean, optionValue: string) => {
    if (!onChange) return;
    if (checked) {
      onChange((value || []).concat(optionValue));
    } else {
      onChange((value || []).filter((item) => item !== optionValue));
    }
  };

  function getItemChecked(itemValue: string) {
    const isControlled = Boolean(value || onChange);
    const checkedIndex = (value || []).findIndex((item) => item === itemValue);
    return checkedIndex > -1 ? true : isControlled ? false : undefined;
  }
  return (
    <div className={cn('relative flex gap-1.5', className)}>
      {children
        ? Children.map(children, (child, index) => {
            const itemValue = child.props.value as string;
            if (import.meta.env.MODE === 'development' && !itemValue) {
              throw new Error('Miss value prop in checkbox');
            }
            const checked = getItemChecked(itemValue);
            return cloneElement(child as JSX.Element, {
              key: child.props.value || index,
              checked,
              onCheckedChange: (checked: boolean) => onCheckedChange(checked, itemValue),
            });
          })
        : options?.map((option, index) => {
            const checked = getItemChecked(option.value);
            return (
              <Checkbox
                key={option.value || index}
                className={option.className}
                value={option.value}
                checked={checked}
                onCheckedChange={(checked) => onCheckedChange(checked as boolean, option.value)}
              >
                {option.label}
              </Checkbox>
            );
          })}
    </div>
  );
}
CheckboxGroup.displayName = 'CheckboxGroup';

function CheckedIcon(props: BaseProps) {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5982 2.60989L5.48031 8.9077C5.07321 9.32677 4.41317 9.32677 4.00606 8.9077L0.402344 5.198C0.889411 4.6009 1.7214 3.83115 2.16483 3.45437L4.74319 6.0509C4.74319 6.0509 8.7407 1.8018 9.70364 0.810546C10.2048 1.26384 11.0912 2.01161 11.5982 2.60989Z"
        fill="#232626"
      />
    </svg>
  );
}

export default Object.assign(memo(Checkbox), {
  Group: memo(CheckboxGroup),
});
