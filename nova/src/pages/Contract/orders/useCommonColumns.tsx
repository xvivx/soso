import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ContractOrderInfo } from '@store/contract/types';
import { Column, Image, SvgIcon } from '@components';
import { cn, formatter } from '@utils';
import { useGameTradingPairsMap } from '@pages/components/GameProvider';
import OrderCoupon from '@pages/components/OrderCoupon';
import OrderStatus from './OrderStatus';
import ProfitAndLossInfo from './ProfitAndLossInfo';

function useCommonColumns() {
  const { t } = useTranslation();
  const tradingParisMap = useGameTradingPairsMap();

  return useMemo<Column<ContractOrderInfo>[]>(
    () => [
      {
        title: t('Symbol'),
        dataIndex: 'symbol',
        render: ({ assetBaseImage, symbol }) => (
          <div className="flex items-center space-x-2 text-14">
            <Image src={assetBaseImage} className="rounded-full size-4" />
            <span>
              {symbol.split('/')[0]}
              <span className="text-secondary">/USDT</span>
            </span>
          </div>
        ),
      },
      {
        title: t('Side'),
        dataIndex: 'direction',
        render: ({ direction }) => <SvgIcon.Updown className="size-6" direction={direction} />,
      },
      {
        title: t('Leverage'),
        dataIndex: 'lever',
        render: ({ lever }) => <span className="text-14 font-500">{lever}X</span>,
      },

      {
        title: t('Close type'),
        dataIndex: 'status',
        render: (order) => <OrderStatus order={order} />,
      },
      {
        title: t('Entry price'),
        dataIndex: 'startPrice',
        align: 'right',
        render({ startPrice, symbol }) {
          return formatter.price(startPrice, tradingParisMap[symbol]?.decimalPlaces).toText();
        },
      },
      {
        title: t('Exit price'),
        dataIndex: 'endPrice',
        align: 'right',
        render({ endPrice, symbol }) {
          return formatter.price(endPrice, tradingParisMap[symbol]?.decimalPlaces).toText();
        },
      },
      {
        title: t('Currency'),
        dataIndex: 'currency',
        align: 'right',
      },
      {
        title: t('Realized PnL'),
        dataIndex: 'pnl',
        align: 'right',
        render(order) {
          return <ProfitAndLossInfo order={order} profit={order.profit} />;
        },
      },
      {
        title: t('Realized PnL') + '%',
        dataIndex: 'pnl%',
        align: 'right',
        render({ profit, roi }) {
          return (
            <div className={cn('flex justify-end', profit < 0 ? 'text-down' : 'text-up')}>
              {formatter.percent(roi / 100, true)}
            </div>
          );
        },
      },
      {
        title: t('Amount'),
        dataIndex: 'amount',
        align: 'right',
        render: ({ amount, currency, useCoupon }) => (
          <div className="flex items-center justify-end gap-2">
            {useCoupon && <OrderCoupon />}
            <div>{formatter.amount(amount, currency).toText(true)}</div>
          </div>
        ),
      },
      {
        title: t('Time opened'),
        dataIndex: 'startTime',
        align: 'right',
        type: 'time',
      },
      {
        title: t('Time closed'),
        dataIndex: 'endTime',
        align: 'right',
        type: 'time',
      },
    ],
    [t, tradingParisMap]
  );
}

export default useCommonColumns;
