import { memo, useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { formatter } from '@utils';

interface AnimateNumberBaseProps extends BaseProps {
  as?: 'div' | 'span';
  value?: number;
  /** 动画时间默认0.3s */
  duration?: number;
  /** 动画延迟时间 */
  delay?: number;
  /** 首次进入是否需要动画, 默认开启,
   *  开启后会从0开始动画, 否则第一次进入不动画, value再次变化时会动画 */
  immediate?: boolean;
}

// precision和currency必传一个, 互斥
type AnimateNumberProps =
  | (AnimateNumberBaseProps & { precision: number; currency?: never })
  | (AnimateNumberBaseProps & { precision?: never; currency: string });

function AnimateNumber(props: AnimateNumberProps) {
  const {
    className,
    value = 0,
    duration = 0.5,
    as = 'div',
    precision,
    currency,
    immediate = true,
    delay = 0,
    style,
  } = props;
  const motionValue = useMotionValue(immediate ? 0 : value);
  const formatValue = useTransform(motionValue, (value) => {
    if (precision !== undefined) {
      return formatter.stringify(value, precision);
    } else if (currency) {
      return formatter.amount(value, currency).toText();
    }
    return null as never;
  });

  useEffect(() => {
    const controls = animate(motionValue, value, { duration, delay });
    return () => controls.stop();
  }, [motionValue, value, duration, delay]);

  const MotionComponent = motion[as];
  return (
    <MotionComponent className={className} style={style}>
      {formatValue}
    </MotionComponent>
  );
}

export default memo(AnimateNumber);
