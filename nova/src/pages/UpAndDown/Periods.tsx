import { useDispatch } from 'react-redux';
import { changeUpdown, useUpdownGameLabel } from '@store/system';
import { useActiveTradingPair, useTradingPeriods } from '@store/upDown';
import { Button, Loading } from '@components';
import { cn } from '@utils';

function Periods() {
  const selectedSymbolPair = useActiveTradingPair();
  const gameLabel = useUpdownGameLabel();
  const { data: periods } = useTradingPeriods(selectedSymbolPair.symbol);
  const dispatch = useDispatch();

  return (
    <div className="flex items-center gap-2 flex-wrap relative min-h-10">
      {!periods.length && <Loading.Svg />}
      {periods.map((period) => (
        <Button
          key={period.id}
          theme="transparent"
          size="md"
          className={cn(
            'flex flex-col s768:flex-row -space-y-1 s768:space-y-0 s768:gap-2 min-w-18 leading-normal text-primary bg-layer5',
            period.label === gameLabel && 'bg-colorful12 text-primary_brand'
          )}
          onClick={() => {
            if (gameLabel !== period.label) {
              dispatch(
                changeUpdown({
                  gameLabel: period.label,
                })
              );
            }
          }}
        >
          <span className="text-12 s768:text-16">{period.period}s</span>
          <span className={cn('text-9 s768:text-12 text-secondary', period.label === gameLabel && 'text-inherit')}>
            ${period.minAmount}-{period.maxAmount}
          </span>
        </Button>
      ))}
    </div>
  );
}

export default Periods;
