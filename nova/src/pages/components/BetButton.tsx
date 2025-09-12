import { CSSProperties, memo, ReactNode } from 'react';
import { SvgIcon } from '@components';
import Button, { ButtonProps } from '@components/Button';
import { cn } from '@utils';
import { Direction } from '@/type';

interface BaseButtonProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}

interface BetButtonProps extends BaseButtonProps, ButtonProps {
  direction: Direction;
  iconClassName?: string;
  skewClassName?: string;
}

export const BetButton = memo((props: BetButtonProps) => {
  const { direction, className, iconClassName, disabled, children, skewClassName, ...others } = props;

  return (
    <Button
      className={cn(
        'relative h-full flex-1 rounded-none text-white',
        direction === Direction.BuyRise ? 'origin-left' : 'origin-right',
        className
      )}
      disabled={disabled}
      theme="transparent"
      size="free"
      {...others}
    >
      <div
        className={cn(
          'absolute inset-0 z-0 !opacity-100',
          direction === Direction.BuyRise
            ? 'rounded-tr bg-up origin-bottom-right'
            : 'rounded-bl bg-down origin-top-left',
          skewClassName
        )}
      />
      {children}
      <SvgIcon.Direction className={cn('relative text-white', iconClassName)} direction={direction} />
    </Button>
  );
});

export default BetButton;
