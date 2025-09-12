import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LeaderBoardInfo } from '@store/binary/types';
import Table, { Column } from '@components/Table';
import { cn, formatter } from '@utils';
import GameOrderFilter, { OrderFilter, SortType, TimeType } from '@pages/components/GameOrderFilter';
import Player from '@pages/components/TablePlayer';
import { useBinarySpreadContext } from '../BinarySpreadProvider';

const LeaderBoard = () => {
  const { useLeaderBoard } = useBinarySpreadContext();
  const [filters, setFilters] = useState<OrderFilter>({
    sort: SortType.PNL,
    timeType: TimeType.Day,
  });
  const { data, isLoading } = useLeaderBoard(filters);
  const { t } = useTranslation();

  const columns: Column<LeaderBoardInfo>[] = [
    {
      title: t('Trader'),
      dataIndex: 'nickName',
      fixed: 'width',
      render: (row) => <Player {...row} />,
    },
    {
      title: t('Trades'),
      dataIndex: 'tradesNum',
      align: 'right',
      render: ({ tradesNum }) => formatter.stringify(tradesNum),
    },
    {
      title: t('Winning'),
      dataIndex: 'winNum',
      align: 'right',
      render: ({ winNum }) => formatter.stringify(winNum),
    },
    {
      title: t('Win rate'),
      dataIndex: 'winRate',
      align: 'right',
      width: 100,
      render({ winRate }) {
        return formatter.percent(winRate / 100);
      },
    },
    {
      title: t('PnL%'),
      dataIndex: 'roi',
      align: 'right',
      render: (row) => row.roi + '%',
    },
    {
      title: t('Profit'),
      dataIndex: 'usdProfit',
      render: ({ usdProfit }) => (
        <div className={cn(usdProfit > 0 ? 'text-up' : 'text-down')}>
          {formatter.amount(usdProfit, 'USDFIAT').round().toText()}
        </div>
      ),
    },
  ];

  return (
    <>
      <GameOrderFilter filters={filters} onChange={setFilters} />
      <Table<LeaderBoardInfo> rowKey="index" columns={columns} dataSource={data} loading={isLoading} />
    </>
  );
};

export default memo(LeaderBoard);
