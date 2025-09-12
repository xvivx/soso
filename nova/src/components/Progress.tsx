import { ReactNode, useMemo } from 'react';
import { cn } from '@utils';

interface ProgressProps {
  className?: string;
  progressCn?: string;
  value?: number;
  min?: number;
  max?: number;
  showTag?: boolean;
  tagValue?: number;
  customTag?: ReactNode;
}

const Progress = (props: ProgressProps) => {
  const { className, value = 0, min = 0, max = 100, tagValue = 0 } = props;

  const percentageValue = useMemo(() => {
    return Math.floor(((value - min) / (max - min)) * 100);
  }, [max, min, value]);

  const percentageTagValue = useMemo(() => {
    return Math.floor(((tagValue - min) / (max - min)) * 100);
  }, [max, min, tagValue]);

  const tagNode = useMemo(() => {
    if (props.showTag !== true) {
      return null;
    }

    if (props.customTag !== undefined) {
      return (
        <div
          className="absolute z-10"
          style={{ transform: 'translate(-50%, -50%)', top: '50%', left: `${percentageTagValue || percentageValue}%` }}
        >
          {props.customTag}
        </div>
      );
    }

    return (
      <div
        className="rounded-full size-3 bg-white absolute z-10"
        style={{ transform: 'translate(-50%, -50%)', top: '50%', left: `${percentageTagValue || percentageValue}%` }}
      />
    );
  }, [percentageTagValue, percentageValue, props.customTag, props.showTag]);

  return (
    <div className="relative">
      <div className={cn('relative h-4 overflow-hidden rounded-full bg-layer4', className)}>
        <div
          className={cn('size-full transition-all bg-brand rounded-full', props.progressCn)}
          style={{ transform: `translateX(-${100 - (percentageValue || 0)}%)` }}
        />
      </div>
      {tagNode}
    </div>
  );
};

Progress.displayName = 'Progress';

export default Progress;
