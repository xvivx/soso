import { ComponentType, memo, SVGProps } from 'react';
import { cn } from '@utils';
import DirectionIcon from './DirectionIcon';
import Logo from './Logo';
import * as Icons from './public';
import Updown from './Updown';

type IconName = keyof typeof Icons;

interface SvgIconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  className?: string;
}

const SvgIcon = memo<SvgIconProps>(({ name, className, ...rest }) => {
  const Icon = Icons[name] as unknown as ComponentType<SVGProps<SVGSVGElement>>;
  return (
    <Icon
      className={cn(
        // 用于样式定位的基础类
        'detrade-icon',
        rest.onClick ? 'cursor-pointer' : '',
        // 自定义样式放最后，确保可以覆盖默认样式
        className
      )}
      {...rest}
    />
  );
});

SvgIcon.displayName = 'SvgIcon';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MixedSvg = Object.assign(SvgIcon, { Logo, Direction: DirectionIcon, Updown });
export default SvgIcon as typeof MixedSvg;
