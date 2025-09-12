import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Order, useAmountPool, usePositionOrders, useRealtimeGame } from '@store/upDown';
import { useExchanges } from '@store/wallet';
import { SvgIcon } from '@components';
import Table, { Column } from '@components/Table';
import { cn, formatter } from '@utils';
import { getCoinUrl } from '@utils/others';
import OrderCoupon from '@pages/components/OrderCoupon';
import { Direction } from '@/type';
import { calcRealProfit } from '../common';

/**
 * @component ActiveBets
 * @description 显示活跃中的上涨下跌游戏投注
 */
function ActiveBets() {
  const { t } = useTranslation();
  const { orders, loading } = usePositionOrders();
  const game = useRealtimeGame();
  const amountPool = useAmountPool();
  const exchange = useExchanges();

  /** 表格列配置 */
  const columns = useMemo<Column<Order>[]>(() => {
    return [
      {
        title: t('Start time'),
        dataIndex: 'startTime',
        render() {
          return game ? formatter.time(game.priceStartTime) : '--';
        },
      },
      {
        title: t('Type'),
        dataIndex: 'direction',
        render(order) {
          return (
            <div
              className={cn('flex items-center gap-1', order.direction === Direction.BuyRise ? 'text-up' : 'text-down')}
            >
              <div>{order.direction === Direction.BuyFall ? t('DOWN') : t('UP')}</div>
              <SvgIcon.Direction direction={order.direction} className="size-3" />
            </div>
          );
        },
      },
      {
        title: t('Currency'),
        dataIndex: 'currency',
        render(cell) {
          const { currency } = cell;
          return (
            <div className="flex items-center gap-1">
              <img className="size-3" src={getCoinUrl(currency)} alt="symbol" />
              <div className="text-primary">{currency}</div>
            </div>
          );
        },
      },
      {
        title: t('Amount'),
        dataIndex: 'amount',
        align: 'right',
        render({ amount, currency, useCoupon }) {
          return (
            <div className="flex justify-end items-center gap-2">
              {useCoupon && <OrderCoupon />}
              <div>{formatter.amount(amount, currency).toText(true)}</div>
            </div>
          );
        },
      },
      {
        title: t('Entry price'),
        dataIndex: 'startPrice',
        align: 'right',
        render() {
          return game.startPrice || '--';
        },
      },
      {
        title: t('Profit'),
        dataIndex: 'profit',
        width: 90,
        align: 'right',
        render({ usdAmount, direction }) {
          const profit = calcRealProfit(usdAmount, direction, game, amountPool);
          return formatter.amount(profit / exchange['USDFIAT'], 'USDFIAT').toText();
        },
      },
    ];
  }, [t, game, amountPool, exchange]);

  return <Table<Order> columns={columns} dataSource={orders} loading={loading} />;
}

export default memo(ActiveBets);
