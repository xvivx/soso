import { memo, ReactNode } from 'react';
import { cn } from '@utils';
import { useLevelColor } from '../hooks';

interface BenefitBadgeProps {
  label?: string;
  isValid?: boolean;
  content?: ReactNode;
  level?: number;
}

function BenefitBadge(props: BenefitBadgeProps) {
  const { levelLinearColor, levelBorderColor } = useLevelColor(props.level || 0);

  return (
    <div className="w-25 flex flex-col items-center gap-3 justify-self-center shrink-0">
      <div
        className={cn(
          'size-17 border rounded-full flex items-center justify-center',
          props.isValid ? levelBorderColor : 'border-thirdly bg-layer2'
        )}
      >
        <div
          className={cn(
            'size-15 rounded-full flex items-center justify-center',
            props.isValid ? cn('border', levelBorderColor) : ''
          )}
        >
          <div
            className={cn(
              'size-13 rounded-full flex items-center justify-center text-15',
              props.isValid ? `bg-gradient-to-b ${levelLinearColor}` : 'bg-layer4'
            )}
          >
            {props.content}
          </div>
        </div>
      </div>
      <span className="text-11 text-secondary line-clamp-2 text-center">{props.label}</span>
    </div>
  );
}

export default memo(BenefitBadge);
