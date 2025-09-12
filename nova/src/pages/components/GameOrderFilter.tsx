/**
 * 排行榜订单筛选表单
 */
import { memo, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from '@components';
import { useGameContext } from '@pages/components/GameProvider';

export enum SortType {
  PNL = 'PNL',
  ROI = 'ROI',
}
export enum TimeType {
  Day = 'DAY',
  Week = 'WEEK',
  Month = 'MONTH',
}
export interface OrderFilter {
  sort: SortType;
  timeType: TimeType;
}

interface FiltersProps {
  filters: OrderFilter;
  onChange: (values: OrderFilter) => void;
  children?: ReactNode;
}

function GameOrderFilter(props: FiltersProps) {
  const { t } = useTranslation();
  const { filters, onChange, children } = props;
  // 利润
  const sortOptions = useMemo(() => {
    return [
      { label: 'PNL', value: SortType.PNL },
      { label: 'ROI', value: SortType.ROI },
    ];
  }, []);

  // 时间
  const dateOptions = useMemo(() => {
    return [
      { label: t('Day'), value: TimeType.Day },
      { label: t('Week'), value: TimeType.Week },
      { label: t('Month'), value: TimeType.Month },
    ];
  }, [t]);

  return (
    <div className="flex items-center gap-x-3">
      {children}
      <Select
        className="w-36 s768:w-40"
        size="md"
        options={sortOptions}
        value={filters.sort}
        onChange={(value) => onChange({ ...filters, sort: value })}
        compact
      />
      <Select
        className="w-36 s768:w-40"
        size="md"
        options={dateOptions}
        value={filters.timeType}
        onChange={(value) => onChange({ ...filters, timeType: value })}
        compact
      />
    </div>
  );
}

export default memo(GameOrderFilter);

export function TradingPairFilter(props: { value: string; onChange: (value: string) => void }) {
  const { t } = useTranslation();
  const { value, onChange } = props;
  const { symbols } = useGameContext();
  // 货币对
  const symbolOptions = useMemo(() => {
    return symbols.map((tradingPair) => {
      const [currency] = tradingPair.symbol.split('/');
      return {
        label: currency,
        value: tradingPair.symbol,
      };
    });
  }, [symbols]);
  return (
    <Select
      className="w-36 s768:w-40"
      size="md"
      options={symbolOptions}
      value={value}
      onChange={onChange}
      placeholder={t('Crypto')}
    />
  );
}
