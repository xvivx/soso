import { CSSProperties, forwardRef, memo, useMemo } from 'react';
import { cn } from '@utils';
import SvgIcon from './SvgIcon';

interface AvatarProps {
  src?: string;
  className?: string;
  /** xs: 20, sm: 24, md: 32, lg: 40, xl: 48 */
  size: 'xl' | 'lg' | 'md' | 'sm' | 'xs';
  // 做为动画组件时需要style
  style?: CSSProperties;
}
const Avatar = forwardRef<HTMLImageElement, AvatarProps>(function Avatar(props, ref) {
  const { className, size, src, style } = props;
  const classNames = useMemo(() => {
    return cn(
      'bg-layer2',
      {
        'size-5 rounded-full': size === 'xs',
        'size-6 rounded-full': size === 'sm',
        'size-7 rounded-2': size === 'md',
        'size-10 rounded-2': size === 'lg',
        'size-12 rounded': size === 'xl',
      },
      className
    );
  }, [className, size]);

  if (!src) {
    return (
      <div className={classNames} ref={ref} style={style}>
        <SvgIcon name="privateUser" className="size-full" />
      </div>
    );
  } else {
    return <img ref={ref} className={classNames} src={src} style={style} />;
  }
});

export default memo(Avatar);
