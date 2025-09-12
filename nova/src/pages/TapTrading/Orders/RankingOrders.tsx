import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TapOrder, useRankingOrders } from '@store/tap';
import { Column, Table } from '@components';
import { formatter } from '@utils';
import GameOrderFilter, { OrderFilter, SortType, TimeType } from '@pages/components/GameOrderFilter';
import Player from '@pages/components/TablePlayer';
import useOrderFields from './useOrderFields';

export default function RankingOrders() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<OrderFilter>({ timeType: TimeType.Day, sort: SortType.PNL });
  const { data: orders, isValidating: loading } = useRankingOrders(filters);
  const baseColumns = useOrderFields();
  const localCurrency = 'USDFIAT';
  const columns = useMemo<Column<TapOrder>[]>(() => {
    return [
      {
        title: t('Trader'),
        dataIndex: 'user',
        render(order) {
          return <Player {...order} />;
        },
      },
      ...baseColumns.slice(0, -1),
      {
        title: t('Profit'),
        dataIndex: 'profit',
        align: 'right',
        render({ profit, usdProfit }) {
          return (
            <div className={profit > 0 ? 'text-up' : 'text-down'}>
              {profit > 0 ? formatter.amount(usdProfit, localCurrency).floor().toText() : 0}
            </div>
          );
        },
      },
    ];
  }, [baseColumns, t]);

  return (
    <>
      <GameOrderFilter filters={filters} onChange={setFilters} />
      <Table columns={columns} dataSource={orders} loading={loading} />
    </>
  );
}
