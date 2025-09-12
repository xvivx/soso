import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContractOrderInfo, useLeaderBoard } from '@store/contract';
import Table, { Column } from '@components/Table';
import GameOrderFilter, { OrderFilter, SortType, TimeType, TradingPairFilter } from '@pages/components/GameOrderFilter';
import Player from '@pages/components/TablePlayer';
import useCommonColumns from './useCommonColumns';

function LeaderBoard() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<OrderFilter & { symbol: string }>({
    symbol: '',
    sort: SortType.PNL,
    timeType: TimeType.Day,
  });
  const { data: orders, isLoading: loading } = useLeaderBoard(filters);

  const commonColumns = useCommonColumns();
  const columns = useMemo<Column<ContractOrderInfo>[]>(() => {
    return [
      {
        title: t('Trader'),
        dataIndex: 'user',
        render(row) {
          return <Player {...row} />;
        },
      },
      ...commonColumns.filter((columns) => columns.dataIndex !== 'startTime'),
    ];
  }, [commonColumns, t]);

  return (
    <>
      <GameOrderFilter filters={filters} onChange={(values) => setFilters((prev) => ({ ...prev, ...values }))}>
        <TradingPairFilter value={filters.symbol} onChange={(symbol) => setFilters((prev) => ({ ...prev, symbol }))} />
      </GameOrderFilter>
      <Table columns={columns} dataSource={orders} loading={loading} />
    </>
  );
}
export default memo(LeaderBoard);
