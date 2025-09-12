import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type BinaryOrderInfo } from '@store/binary/types';
import { type SpreadOrderInfo } from '@store/spread/types';
import { Column } from '@components/Table';
import { cn, formatter } from '@utils';
import { useGameContext, useGameTradingPairsMap } from '@pages/components/GameProvider';
import OrderCoupon from '@pages/components/OrderCoupon';
import { TableSymbolPair } from '@pages/components/TableSymbolPair';
import { GameTypeNumber } from '@/type';

export default function useCommonColumns<T extends BinaryOrderInfo | SpreadOrderInfo>() {
  const { t } = useTranslation();
  const { type } = useGameContext();
  const tradingPairsMap = useGameTradingPairsMap();

  return useMemo<Column<T>[]>(() => {
    return [
      {
        title: t('Symbol'),
        dataIndex: 'pair',
        fixed: 'width',
        render: (order) => (
          <TableSymbolPair symbol={order.symbol} direction={order.direction} baseImage={order.assetBaseImage} />
        ),
      },
      {
        title: t('Currency'),
        dataIndex: 'currency',
        align: 'right',
      },
      {
        title: t('Amount'),
        dataIndex: 'amount',
        align: 'right',
        render: ({ amount, currency, useCoupon }) => (
          <div className="flex justify-end items-center gap-2">
            {useCoupon && <OrderCoupon />}
            <div>{formatter.amount(amount, currency).toText(true)}</div>
          </div>
        ),
      },
      ...(type === GameTypeNumber.BinarySpread
        ? ([
            {
              title: t('Spread'),
              dataIndex: 'spread',
              align: 'right',
            },
          ] as Column<T>[])
        : []),
      {
        title: t('Entry price'),
        dataIndex: 'startPrice',
        align: 'right',
        render: ({ startPrice, symbol }) => {
          return formatter.price(startPrice, tradingPairsMap[symbol]?.decimalPlaces).toText();
        },
      },
      {
        title: t('Exit price'),
        dataIndex: 'endPrice',
        align: 'right',
        render: ({ endPrice, symbol }) => {
          return formatter.price(endPrice, tradingPairsMap[symbol]?.decimalPlaces).toText();
        },
      },
      {
        title: t('Yield'),
        dataIndex: 'profitRate',
        align: 'right',
        render: (row) => row.profitRate + '%',
      },
      {
        title: t('Profit'),
        dataIndex: 'profit',
        width: 90,
        align: 'right',
        render: ({ profit, currency }) => (
          <div className={cn(profit > 0 ? 'text-up' : 'text-down')}>
            {formatter.amount(profit, currency).toText(true)}
          </div>
        ),
      },
    ];
  }, [type, tradingPairsMap, t]);
}
