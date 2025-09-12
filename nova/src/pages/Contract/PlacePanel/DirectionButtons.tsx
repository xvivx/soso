import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@utils';
import { BetButton } from '@pages/components';
import { Direction } from '@/type';

interface DirectionButtonsProps {
  direction: Direction;
  onDirectionChange: (direction: Direction) => void;
  // 没想好这个属性名, 这个模式下按钮颜色不受控
  uncontrolled?: boolean;
}

function DirectionButtons(props: DirectionButtonsProps) {
  const { t } = useTranslation();
  const { direction, onDirectionChange, uncontrolled } = props;
  const buyDirection = uncontrolled || direction === Direction.BuyRise;
  const sellDirection = uncontrolled || direction === Direction.BuyFall;
  return (
    <div className="h-10 flex -space-x-2 rounded-2 overflow-hidden">
      <BetButton
        direction={Direction.BuyRise}
        skewClassName={cn('skew-x-[23deg]', buyDirection ? 'bg-success' : 'bg-layer5')}
        iconClassName="hidden"
        onClick={() => onDirectionChange(Direction.BuyRise)}
      >
        <div className={cn('relative text-16 font-600', buyDirection ? '' : 'text-secondary')}>{t('UP')}</div>
      </BetButton>
      <BetButton
        direction={Direction.BuyFall}
        skewClassName={cn('skew-x-[23deg]', sellDirection ? 'bg-down' : 'bg-layer5')}
        iconClassName="hidden"
        onClick={() => onDirectionChange(Direction.BuyFall)}
      >
        <div className={cn('relative text-16 font-600', sellDirection ? 'text-white' : 'text-secondary')}>
          {t('DOWN')}
        </div>
      </BetButton>
    </div>
  );
}

export default memo(DirectionButtons);
