import { memo, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { GameStatus, Order, OrderStatus, useRealtimeGame } from '@store/upDown';
import { AccountType, useAccountType } from '@store/wallet';
import { Image, SvgIcon } from '@components';
import Table, { Column } from '@components/Table';
import { cn, formatter } from '@utils';
import { request } from '@utils/axios';
import { getCoinUrl } from '@utils/others';
import OrderCoupon from '@pages/components/OrderCoupon';
import { Direction } from '@/type';

function ClosedBets() {
  const game = useRealtimeGame();
  const filters: Filters = useMemo(() => ({ page: 1, pageSize: 20 }), []);
  return <Records filters={filters} refresh={game.status === GameStatus.PAY_OUT} />;
}

interface Props {
  filters: Filters;
  refresh?: boolean;
  className?: string;
  compact?: boolean;
  onTotalChange?: (total: number) => void;
}

export function Records(props: Props) {
  const { t } = useTranslation();
  const { filters, refresh, className, compact, onTotalChange } = props;
  const accountType = useAccountType();
  const {
    data: { items: orders },
    isValidating: loading,
    mutate,
  } = useSWR(
    ['up-down-history', accountType, filters],
    async () => {
      return await request.get<{ items: Order[]; total: number }>('/api/transaction/updown/order/history/user/get', {
        ...filters,
      });
    },
    {
      onSuccess(data) {
        onTotalChange && onTotalChange(data.total);
      },
      fallbackData: { items: [], total: 0 },
    }
  );

  useEffect(() => {
    refresh && mutate();
  }, [refresh, mutate]);

  const columns = useMemo<Column<Order>[]>(() => {
    return [
      // {
      //   title: t('order id'),
      //   dataIndex: 'id',
      // },
      {
        title: t('Time'),
        dataIndex: 'placeTime',
        type: 'time',
      },
      {
        title: t('Type'),
        dataIndex: 'direction',
        render(cell) {
          return (
            <div
              className={cn('flex items-center gap-1', cell.direction === Direction.BuyRise ? 'text-up' : 'text-down')}
            >
              <div>{cell.direction === Direction.BuyFall ? 'DOWN' : 'UP'}</div>
              <SvgIcon.Direction direction={cell.direction} className="size-3" />
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
              <Image className="size-3 rounded-full" src={getCoinUrl(currency)} />
              <div className="text-text-primary text-bodyMd font-500">{currency}</div>
            </div>
          );
        },
      },
      {
        title: t('Entry price'),
        dataIndex: 'startPrice',
        align: 'right',
        render(cell) {
          return formatter.price(cell.startPrice, 5).toText();
        },
      },
      {
        title: t('Exit price'),
        dataIndex: 'endPrice',
        align: 'right',
        render(cell) {
          return formatter.price(cell.endPrice, 5).toText();
        },
      },
      {
        title: t('Amount'),
        dataIndex: 'amount',
        align: 'right',
        render(cell) {
          const { amount, currency, useCoupon } = cell;
          return (
            <div className="flex justify-end items-center gap-2">
              {useCoupon && <OrderCoupon />}
              <div>{formatter.amount(amount, currency).toText(true)}</div>
            </div>
          );
        },
      },
      {
        title: t('Yield'),
        dataIndex: 'Yield',
        align: 'right',
        render({ profit, amount }) {
          if (profit > 0) {
            return <div className="text-up">{formatter.percent(profit / amount + 1)}</div>;
          } else {
            return '0%';
          }
        },
      },
      {
        title: t('Profit'),
        dataIndex: 'profit',
        align: 'right',
        render({ profit, currency }) {
          return (
            <div className={cn(profit > 0 ? 'text-up' : 'text-down')}>
              {formatter.amount(profit, currency).toText(true)}
            </div>
          );
        },
      },
      {
        title: t('Result'),
        dataIndex: 'Result',
        render({ profit, status }) {
          return (
            <div className={cn('flex justify-end font-600', profit > 0 ? 'text-up' : 'text-down')}>
              {status === OrderStatus.CANCEL ? t('Cancel') : profit > 0 ? t('Win') : t('Lose')}
            </div>
          );
        },
      },
    ];
  }, [t]);

  return (
    <Table<Order>
      size={compact ? 'sm' : 'md'}
      className={className}
      columns={columns}
      dataSource={orders}
      loading={loading}
    />
  );
}

export default memo(ClosedBets);

export type CloseBet = {
  accountType: AccountType;
  amount: number;
  usdAmount: number;
  commission: number;
  roundId: number;
  currency: 'string';
  direction: Direction;
  endTime: number;
  avatar: string;
  id: string;
  nickName: string;
  openId: string;
  placeTime: number;
  profit: number;
  startTime: number;
  status: OrderStatus;
  symbol: string;
  totalRevenue: number;
  userId: number;
  startPrice: number;
  endPrice: number;
  useCoupon: boolean;
};

export type Filters = {
  page: number;
  pageSize: number;
  // 货币对
  symbol?: string;
  direction?: Direction;
  currency?: string;
  accountType?: AccountType;
};
