import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Column, Image, Pagination, Select, Table } from '@components';
import { cn, request } from '@utils';
import { getCoinUrl } from '@utils/others';
import { TimeRange, useTimeRangeOptions } from './common';

// 定义响应数据结构
interface ApiResponse<T> {
  items: T[];
  total: number;
}

// 定义表格数据类型
type TableItem = TipsItem | RewardItem;

function WalletOther() {
  const { t } = useTranslation();
  const [searchType, setSearchType] = useState(ShowType.Tips);
  const [filters, setFilters] = useState<Filters>({
    timeRange: TimeRange['24h'],
    page: 1,
    pageSize: 10,
  });
  const timeOptions = useTimeRangeOptions();
  const typeOptions = useMemo(
    () => [
      {
        label: t('Tips'),
        value: ShowType.Tips,
      },
      {
        label: t('Reward'),
        value: ShowType.Reward,
      },
    ],
    [t]
  );

  // 处理筛选条件变化
  function onFilterChange<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => {
      return {
        ...prev,
        page: 1,
        [key]: value,
      };
    });
  }

  const columns = useMemo<Column<TableItem>[]>(() => {
    const commons: Column<TableItem>[] = [
      {
        title: t('Type'),
        dataIndex: 'showType',
        render(record: TableItem) {
          if (searchType === ShowType.Reward) {
            return <div className="capitalize">{(record as RewardItem).type}</div>;
          } else {
            return <div>{t('Tips')}</div>;
          }
        },
      },
      {
        title: t('Time'),
        dataIndex: 'createTime',
        align: 'right',
        type: 'time',
      },
      {
        title: t('Amount'),
        dataIndex: 'amount',
        align: 'right',
        render({ amount, currency }) {
          return (
            <div className={cn('flex items-center justify-end gap-1', amount > 0 ? 'text-up' : 'text-down')}>
              <div>{`${amount} ${currency}`}</div>
              <Image className="size-4" src={getCoinUrl(currency)} />
            </div>
          );
        },
      },
    ];

    // Tips 类型特有的列
    if (searchType === ShowType.Tips) {
      return commons.concat([
        {
          title: t('From'),
          dataIndex: 'fromUserName',
          align: 'right',
          render(cell) {
            const { fromUserName } = cell as TipsItem;
            return (
              <div className="flex items-center justify-end gap-1">
                <div className="text-secondary">{t('From')}</div>
                <div className="truncate text-primary">{fromUserName}</div>
              </div>
            );
          },
        },
        {
          title: t('To'),
          dataIndex: 'toUserName',
          render(cell) {
            const { toUserName } = cell as TipsItem;
            return (
              <div className="flex items-center justify-end gap-1">
                <div className="text-secondary">{t('To')}</div>
                <div className="truncate text-primary">{toUserName}</div>
              </div>
            );
          },
        },
      ]);
    } else {
      return commons;
    }
  }, [searchType, t]);

  const {
    data: { items: tableData, total },
    isValidating: loading,
  } = useSWR(
    ['wallet-other', searchType, filters],
    () => {
      if (searchType === ShowType.Tips) {
        return request.post<ApiResponse<TableItem>>('/api/account/account/tip/list', filters);
      } else {
        return request.get<ApiResponse<TableItem>>('/api/account/account/reward/list', filters);
      }
    },
    { fallbackData: { items: [], total: 0 }, keepPreviousData: true }
  );

  return (
    <div className="detrade-card space-y-3">
      <div className="flex items-center gap-3">
        <Select
          className="w-52"
          size="md"
          value={searchType}
          options={typeOptions}
          onChange={(value) => {
            if (value === searchType) return;
            setSearchType(value);
            onFilterChange('page', 1);
          }}
        />
        <Select
          className="w-52"
          size="md"
          value={filters.timeRange}
          options={timeOptions}
          onChange={(value) => onFilterChange('timeRange', value)}
        />
      </div>
      <Table<TableItem> columns={columns} loading={loading} dataSource={tableData} />
      {total > filters.pageSize && (
        <Pagination
          current={filters.page}
          pageSize={filters.pageSize}
          total={total}
          onChange={(value) => onFilterChange('page', value)}
        />
      )}
    </div>
  );
}

export default WalletOther;

interface Filters {
  timeRange: TimeRange;
  page: number;
  pageSize: number;
}

enum ShowType {
  Tips = 1,
  Reward = 2,
}

interface TipsItem {
  id: number;
  currency: string;
  amount: number;
  usdAmount: number;
  fromUserId: number;
  toUserId: number;
  fromUserName: string;
  toUserName: string;
  createTime: string;
}

interface RewardItem {
  id: number;
  currency: string;
  amount: number;
  usdAmount: number;
  createTime: string;
  type: string;
}
