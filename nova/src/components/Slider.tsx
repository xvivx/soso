import { KeyboardEvent, memo, useEffect, useMemo, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import useMemoCallback from '@hooks/useMemoCallback';
import { cn } from '@utils';

/* 实现效果: 非均匀分布, 按照[1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]这些数值进行滑动选择
 * 当value是35时正好滑块落在正中间, 越往右移动幅度越大, 接近1000时稍微一动一点就有很大的变化, 相反越往左移动越波动越小
 * 实现思路: 看作是0-1的一个均匀变化的范围, 在数轴上均匀填充上面刻度, 然后根据比例计算value的值, 同样根据比例用value值反推数轴位置
 **/
interface SliderProps {
  value: number;
  onChange: (value: number, offsetX?: number) => void;
  onDragend?: (value: number) => void;
  onDragStart?: (offsetX?: number) => void;
  className?: string;
}
const size = 16;
export const Slider = (props: SliderProps) => {
  const { value, onChange, onDragend, onDragStart, className } = props;
  const constraintsRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const valueMotion = useMotionValue(value);
  const [moveDistance, setMoveDistance] = useState(0);
  useEffect(() => {
    const observer = new window.ResizeObserver(() => {
      if (!constraintsRef.current) return;
      // 设置滑动的总行程程
      setMoveDistance(parseInt(getComputedStyle(constraintsRef.current).width) - size);
    });
    observer.observe(constraintsRef.current!);
    return () => observer.disconnect();
  }, []);
  const x = useTransform(valueMotion, (value) => {
    if (!moveDistance) return -10000;
    return moveDistance * value;
  });

  useEffect(() => {
    if (draggingRef.current) return;
    const controls = animate(valueMotion, value);
    return () => controls.stop();
  }, [valueMotion, value]);

  const handleKeyDown = useMemoCallback((key: KeyboardEvent<HTMLDivElement>) => {
    key.preventDefault();
    if (key.code === 'ArrowRight' || key.code === 'ArrowUp') {
      onChange(Number(Math.min(1, value + 0.01).toFixed(15)));
    } else if (key.code === 'ArrowLeft' || key.code === 'ArrowDown') {
      onChange(Number(Math.max(0, value - 0.01).toFixed(15)));
    }
  });

  const handleDragStart = useMemoCallback(() => {
    onDragStart && onDragStart(x.get());
  });

  const handleDrag = useMemoCallback(() => {
    const value = x.get() / moveDistance;
    draggingRef.current = true;
    valueMotion.jump(value, true);
    onChange(value, x.get());
  });
  const handleDragend = useMemoCallback(() => {
    draggingRef.current = false;
    onDragend && onDragend(value);
    window.requestAnimationFrame(() => {
      if (Math.abs(moveDistance * value - x.get()) >= 1) {
        animate(x, moveDistance * value);
      }
    });
  });
  const moveBounding = useMemo(() => ({ top: 0, left: 0, bottom: 0, right: moveDistance }), [moveDistance]);
  return (
    <div
      className={cn('detrade-slider relative w-full flex items-center select-none', className)}
      onMouseDown={(event) => {
        const { width, left } = constraintsRef.current!.getBoundingClientRect();
        const pointX = event.clientX - left;
        let xPosition: number;

        if (pointX > width - size) {
          xPosition = width - 1.5 * size + (pointX - (width - size)) / 2;
        } else if (pointX < size) {
          xPosition = pointX / 2;
        } else {
          xPosition = pointX - size / 2;
        }
        const value = xPosition / moveDistance;
        onChange(value);
        onDragend && onDragend(value);
      }}
    >
      <div
        ref={constraintsRef}
        className="detrade-slider-track absolute top-1/2 -translate-y-1/2 inset-x-0 h-1.5 rounded-full bg-layer5"
      />

      <motion.div
        className="size-4 z-10 drop-shadow"
        drag="x"
        initial={false}
        dragConstraints={moveBounding}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragend}
        dragMomentum={false}
        dragElastic={0}
        style={{ x }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* 分两层不然点按动画和transform动画冲突 */}
        <motion.div
          className="detrade-slider-trigger size-full rounded-full bg-layer6 focus-visible:outline-none drop-shadow cursor-pointer"
          whileTap={{ scale: 1.2 }}
          onKeyDown={handleKeyDown}
        />
      </motion.div>
    </div>
  );
};
export default memo(Slider);
