import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from '@components';

export type OrderType = 'MARKET' | 'TP/SL';
function OderTypes(props: { value: OrderType; onChange(value: OrderType): void; className?: string }) {
  const { t } = useTranslation();
  const options = useMemo(
    () => [
      { label: t('Market'), value: 'MARKET' as const },
      { label: t('TP/SL'), value: 'TP/SL' as const },
    ],
    [t]
  );
  return <Select<OrderType> size="lg" options={options} {...props} />;
}

export default memo(OderTypes);
