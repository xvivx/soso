import { memo, useMemo } from 'react';
import useMemoCallback from '@hooks/useMemoCallback';
import { Slider as PrimitiveSlider } from '@components';
import { cn } from '@utils';

/* 实现效果: 非均匀分布, 按照[1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]这些数值进行滑动选择
 * 当value是35时正好滑块落在正中间, 越往右移动幅度越大, 接近1000时稍微一动一点就有很大的变化, 相反越往左移动越波动越小
 * 实现思路: 看作是0-1的一个均匀变化的范围, 在数轴上均匀填充上面刻度, 然后根据比例计算value的值, 同样根据比例用value值反推数轴位置
 **/
interface SliderProps {
  value: number;
  onChange: (value: number, offsetX?: number) => void;
  max?: number;
  className?: string;
  onDragStart?: (offsetX?: number) => void;
  onDragend?: (value: number) => void;
}
export const Slider = (props: SliderProps) => {
  const { value, onChange, max = 1000, className, onDragStart, onDragend } = props;
  const ticks = useMemo(() => {
    const values = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].filter((it) => it <= max);
    // 比如max=300
    if (max > values[values.length - 1]) values.push(max);
    return values;
  }, [max]);
  const progress = useMemo(() => {
    let progress = 0;
    if (value >= ticks[ticks.length - 1]) {
      progress = 1;
    } else if (value <= ticks[0]) {
      progress = 0;
    } else {
      const index = ticks.findIndex((it) => it > value) - 1;
      const unit = 1 / (ticks.length - 1);
      const percent = (value - ticks[index]) / (ticks[index + 1] - ticks[index]);
      progress = index * unit + percent * unit;
    }

    return progress;
  }, [value, ticks]);

  const handleChange = useMemoCallback((progress: number, offsetX?: number) => {
    // 根据x位置计算出的value
    let value: number;
    if (progress === 0) {
      value = ticks[0];
    } else if (progress === 1) {
      value = ticks[ticks.length - 1];
    } else {
      const unit = 1 / (ticks.length - 1);
      // units的逻辑:比如ticks: [1,2,5,10] => [0/3, 1/3, 2/3, 3/3]
      const units = ticks.map((_, index) => index / (ticks.length - 1));
      const index = units.findIndex((it) => it >= progress) - 1;
      // 取坐标的相对差计算比较合理
      value = ticks[index] + ((progress - units[index]) / unit) * (ticks[index + 1] - ticks[index]);
    }
    onChange(value, offsetX);
  });

  return (
    <PrimitiveSlider
      className={cn('lever-slider', className)}
      value={progress}
      onChange={handleChange}
      onDragStart={onDragStart}
      onDragend={onDragend}
    />
  );
};
export default memo(Slider);
