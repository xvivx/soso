import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TapOrder } from '@store/tap';
import { Column, Image } from '@components';
import { formatter } from '@utils';

export default function useOrderFields() {
  const { t } = useTranslation();
  return useMemo<Column<TapOrder>[]>(() => {
    return [
      {
        title: t('Symbol'),
        dataIndex: 'symbol',
        render: ({ assetBaseImage, symbol }) => (
          <div className="flex items-center gap-2 text-14">
            <Image src={assetBaseImage} className="rounded-full size-4" />
            <span>
              {symbol.split('/')[0]}
              <span className="text-secondary">/USDT</span>
            </span>
          </div>
        ),
      },
      {
        title: t('Currency'),
        dataIndex: 'currency',
        render: ({ currency }) => currency.replace('FIAT', ''),
        align: 'right',
      },
      {
        title: t('Amount'),
        dataIndex: 'amount',
        render: ({ amount, currency }) => formatter.amount(amount, currency).floor().toText(true),
        align: 'right',
      },
      {
        title: t('Multiplier'),
        dataIndex: 'odds',
        render: ({ odds }) => `${odds}x`,
        align: 'right',
      },
      {
        title: t('Profit'),
        dataIndex: 'profit',
        align: 'right',
        render({ profit, currency }) {
          return (
            <div className={profit > 0 ? 'text-up' : 'text-down'}>
              {profit > 0 ? formatter.amount(profit, currency).floor().toText(true) : 0}
            </div>
          );
        },
      },
    ];
  }, [t]);
}
