import { cn } from '@utils';
import { Direction } from '@/type';

interface UpdownIconProps {
  direction?: Direction;
  className?: string;
}

const Updown: React.FC<UpdownIconProps> = ({ direction, className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="23"
      height="24"
      viewBox="0 0 23 24"
      fill="none"
      className={cn(
        direction && 'transition-none',
        direction === Direction.BuyFall && 'rotate-180 text-down',
        direction === Direction.BuyRise && 'text-up',
        className
      )}
    >
      <path
        d="M11.3998 6.24695L5.60645 12.0402L6.92637 13.3602L11.3998 8.88681L15.8731 13.3602L17.1931 12.0402L11.3998 6.24695ZM11.3998 11.5202L5.60645 17.3134L6.92637 18.6335L11.3998 14.1601L15.8731 18.6335L17.1931 17.3134L11.3998 11.5202Z"
        fill="currentColor"
      />
    </svg>
  );
};

Updown.displayName = 'UpdownIcon';
export default Updown;
