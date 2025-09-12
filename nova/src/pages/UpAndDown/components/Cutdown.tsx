import { forwardRef, memo, ReactNode, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { cn } from '@utils';

export interface CutdownProps {
  className?: string;
  countTime: number;
  /** 自动开启倒计时, 默认是true */
  autoStart?: boolean;
  /** 根据剩余时间更新倒计时样式, 返回[底层圆样式, 上面圆样式] */
  updateStyle: (leftTime: number) => { container: string; shadow: string; progress: string };
  onCompleted?: () => void;
  children?: (leftTime: number) => ReactNode;
}
export type CutdownInstance = { start: () => void; stop: () => void };
// svg直径
const diameter = 136;
// 环形宽度
const strokeWidth = 15;
const perimeter = Math.PI * (diameter - strokeWidth);

const Circle = forwardRef<CutdownInstance, CutdownProps>((props, ref) => {
  const { className, countTime, autoStart = true, onCompleted, updateStyle, children } = props;
  const [leftTime, setLeftTime] = useState(countTime);
  const prevLeftTimeRef = useRef(leftTime);
  // 真实剩余的时间, 当进入时会比countTime大，一直会计算到-1
  const leftRealTime = Math.min(leftTime + 1, countTime);
  const timerRef = useRef<NodeJS.Timer>();
  const start = useCallback(() => {
    if (countTime <= 0) return;

    requestAnimationFrame(() => {
      setLeftTime(countTime - 1);
    });

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setLeftTime((prev) => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [countTime]);

  const stop = useCallback(() => {
    clearInterval(timerRef.current);
  }, []);

  // 对外暴露开始和暂停的方法
  useImperativeHandle(ref, () => ({ start, stop }), [start, stop]);

  useEffect(() => {
    if (leftRealTime === 0 && onCompleted) {
      onCompleted();
    }
  }, [onCompleted, leftRealTime]);

  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [start, autoStart]);

  useEffect(() => {
    return () => {
      prevLeftTimeRef.current = leftTime;
    };
  }, [leftTime]);

  const statusStyles = updateStyle(leftRealTime);

  return (
    <div className={cn('relative transition-colors duration-1000', statusStyles.container, className)}>
      <svg className="w-full h-full" width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`}>
        <circle className="fill-layer2" cx={diameter / 2} cy={diameter / 2} r={diameter / 2} strokeWidth={0} />
        <circle
          className={cn(leftRealTime > 0 && 'transition-colors duration-1000', statusStyles.shadow)}
          cx={diameter / 2}
          cy={diameter / 2}
          r={diameter / 2 - strokeWidth / 2}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {leftRealTime > 0 && (
          <circle
            className={cn(
              'origin-center -rotate-90 stroke-current',
              prevLeftTimeRef.current >= leftTime && 'transition-all ease-linear duration-1000',
              statusStyles.progress
            )}
            strokeDashoffset={`${Math.max(leftTime / countTime - 1, -1) * perimeter}`}
            strokeDasharray={`${perimeter},1000`}
            strokeLinecap="round"
            cx={diameter / 2}
            cy={diameter / 2}
            r={diameter / 2 - strokeWidth / 2}
            strokeWidth={strokeWidth}
            fill="none"
          />
        )}
      </svg>

      {children ? (
        children(leftRealTime)
      ) : (
        <div className="abs-center flex-center flex-col">
          <div className="text-30 leading-none font-500">{leftRealTime}</div>
          <div className="text-14 font-600">SEC</div>
        </div>
      )}
    </div>
  );
});

const Cutdown = {
  /**
   * 该组件不能共享, 倒计时结束要重新开启需设置新的key让组件销毁重建
   */
  Circle: memo(Circle),
};

export default Cutdown;
