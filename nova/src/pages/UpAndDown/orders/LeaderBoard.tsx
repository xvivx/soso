import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { useAccountType, useExchanges } from '@store/wallet';
import { Select } from '@components';
import Table, { Column } from '@components/Table';
import { cn, formatter } from '@utils';
import { request } from '@utils/axios';
import TablePlayer from '@pages/components/TablePlayer';

/**
 * @typedef {Object} RankItem - 排行榜项目类型
 * @property {string} avatar - 头像
 * @property {string} nickName - 昵称
 * @property {string} totalProfit - 总收益
 * @property {string} userId - 用户ID
 * @property {number} tradeTimes - 交易次数
 * @property {number} winTimes - 获胜次数
 * @property {number} winRate - 胜率
 * @property {number} roi - 投资回报率
 * * @property {number} platformName - 平台名称
 */
type RankItem = {
  avatar: string;
  nickName: string;
  totalProfit: string;
  userId: string;
  tradeTimes: number;
  winTimes: number;
  winRate: number;
  roi: number;
  privateHide: boolean;
  platformName: string;
};

/**
 * @enum {number} DateType - 时间范围类型
 */
enum DateType {
  Day = 1,
  Week = 2,
  Month = 3,
}

/**
 * @enum {string} SortType - 排序类型
 */
enum SortType {
  PNL = 'PNL',
  ROI = 'ROI',
}

/**
 * 获取时间范围的开始时间
 * @param {DateType} dateType - 时间范围类型
 * @returns {number} 开始时间戳
 */
function getStartTime(dateType: DateType): number {
  const end = Date.now();
  switch (dateType) {
    case DateType.Day:
      return end - 24 * 3600 * 1000;
    case DateType.Week:
      return end - 7 * 24 * 3600 * 1000;
    case DateType.Month:
      return end - 30 * 24 * 3600 * 1000;
    default:
      return 0;
  }
}

function Rank() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    date: DateType.Day,
    sortBy: SortType.PNL,
  });
  const accountType = useAccountType();
  const localCurrency = 'USDFIAT';
  const exchange = useExchanges();
  const { data: ranks, isValidating: loading } = useSWR(
    ['up-down-leader-board', formData.sortBy, formData.date, accountType],
    ([_, sortType, dateType]: [string, SortType, DateType]) => {
      return request.get<RankItem[]>('/api/transaction/updown/order/rankings', {
        end: Date.now(),
        start: getStartTime(dateType),
        sort: sortType,
      });
    },
    { fallbackData: [] }
  );
  const columns = useMemo<Column<RankItem>[]>(() => {
    return [
      {
        title: t('Trader'),
        dataIndex: 'avatar',
        render(cell) {
          return <TablePlayer {...cell} />;
        },
      },
      {
        title: t('Trades'),
        dataIndex: 'tradeTimes',
        align: 'right',
        width: 90,
      },
      {
        title: t('Winning'),
        dataIndex: 'winTimes',
        align: 'right',
        width: 90,
      },
      {
        title: t('Win rate'),
        dataIndex: 'winRate',
        align: 'right',
        width: 100,
        render({ winRate }) {
          return formatter.percent(winRate);
        },
      },
      {
        title: t('PnL%'),
        dataIndex: 'roi',
        width: 120,
        align: 'right',
        render: ({ roi }) => roi + '%',
      },
      {
        title: t('Total profit'),
        dataIndex: 'totalProfit',
        width: 110,
        render({ totalProfit }) {
          return (
            <div className={cn('flex justify-end font-600', Number(totalProfit) > 0 ? 'text-up' : 'text-down')}>
              {formatter.amount(Number(totalProfit) / exchange[localCurrency], localCurrency).toText()}
            </div>
          );
        },
      },
    ];
  }, [exchange, localCurrency, t]);

  // 排序选项
  const sortOptions = useMemo(() => {
    return [
      { label: 'PNL', value: SortType.PNL },
      { label: 'ROI', value: SortType.ROI },
    ];
  }, []);

  // 时间范围选项
  const dateOptions = useMemo(() => {
    return [
      { label: t('day'), value: DateType.Day },
      { label: t('week'), value: DateType.Week },
      { label: t('month'), value: DateType.Month },
    ];
  }, [t]);

  return (
    <>
      <div className="flex items-center gap-x-3">
        <Select
          options={sortOptions}
          value={formData.sortBy}
          onChange={(value) => setFormData((prev) => ({ ...prev, sortBy: value }))}
          compact
          size="md"
          className="w-34"
        />
        <Select
          options={dateOptions}
          value={formData.date}
          onChange={(value) => setFormData((prev) => ({ ...prev, date: value }))}
          compact
          size="md"
          className="w-34"
        />
      </div>
      <Table<RankItem> rowKey="index" columns={columns} dataSource={ranks} loading={loading} />
    </>
  );
}

export default memo(Rank);
