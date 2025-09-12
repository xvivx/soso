import { cn } from '@utils';
import { Direction } from '@/type';

interface DirectionIconProps {
  direction: Direction;
  className?: string;
}

const DirectionIcon: React.FC<DirectionIconProps> = ({ direction, className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="38"
      height="38"
      viewBox="0 0 38 38"
      fill="none"
      className={cn(
        // 基础样式
        'transition-none',
        direction === Direction.BuyFall ? 'text-down -scale-x-100' : 'text-up rotate-180',
        className
      )}
    >
      <path
        d="M33.4286 14.2063L26.9648 20.6701L21.5916 15.295L15.5933 21.2933L19 24.7L9.50001 24.7L9.50001 15.2L12.9067 18.6067L21.5916 9.92181L26.9648 15.295L31.6673 10.5944C29.5328 7.38178 26.2568 5.10076 22.5032 4.21357C18.7495 3.32638 14.799 3.89939 11.452 5.81648C8.10514 7.73357 5.61222 10.8514 4.47845 14.538C3.34468 18.2247 3.65486 22.2045 5.34615 25.671C7.03743 29.1375 9.98331 31.8314 13.5868 33.2068C17.1903 34.5822 21.182 34.5362 24.7528 33.0781C28.3237 31.6201 31.2067 28.859 32.8177 25.3545C34.4286 21.8499 34.647 17.864 33.4286 14.2044L33.4286 14.2063ZM36.3508 11.2461L36.3698 11.2651L36.3622 11.2727C37.4453 13.7047 38.0034 16.3377 38 19C38 29.4937 29.4937 38 19 38C8.50631 38 2.36318e-05 29.4937 2.45492e-05 19C2.54666e-05 8.50631 8.50631 2.03098e-05 19 2.12272e-05C26.733 2.19032e-05 33.383 4.61702 36.3508 11.2461Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
    </svg>
  );
};

DirectionIcon.displayName = 'DirectionIcon';
export default DirectionIcon;
