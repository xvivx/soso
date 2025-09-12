import { useTranslation } from 'react-i18next';
import { BetButton } from '@pages/components';
import { Direction } from '@/type';
import { useBinarySpreadContext } from '../BinarySpreadProvider';

export default function PlaceButton({ onPlace }: { onPlace: (direction: Direction) => void }) {
  const { t } = useTranslation();
  const { selectedTimePeriod } = useBinarySpreadContext();

  return (
    <div className="relative flex h-12 s768:h-16 w-full rounded-2 overflow-hidden  s768:-space-x-2">
      {selectedTimePeriod && (
        <>
          <BetButton
            onClick={() => onPlace(Direction.BuyRise)}
            className="gap-2 s768:gap-3"
            iconClassName="size-6"
            skewClassName="skew-x-[10deg] s768:skew-x-[16deg]"
            direction={Direction.BuyRise}
          >
            <div className="text-18 relative">{t('Up')}</div>
          </BetButton>
          <BetButton
            onClick={() => onPlace(Direction.BuyFall)}
            className="flex-row-reverse gap-2 s768:gap-3"
            iconClassName="size-6"
            skewClassName="skew-x-[10deg] s768:skew-x-[16deg]"
            direction={Direction.BuyFall}
          >
            <div className="text-18 relative">{t('Down')}</div>
          </BetButton>
        </>
      )}
    </div>
  );
}
