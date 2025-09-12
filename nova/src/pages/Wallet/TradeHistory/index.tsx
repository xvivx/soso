import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { useRealAssets } from '@store/wallet';
import { Column, Image, Pagination, Select, Table } from '@components';
import { cn, request } from '@utils';
import { getCoinUrl } from '@utils/others';
import CopyButton from '@pages/components/CopyButton';
import { TimeRange, useTimeRangeOptions } from '../common';
import {
  BetHistoryItem,
  BetHistoryParams,
  BizType,
  ShowType,
  useProfitTypeOptions,
  useShowTypeOptions,
} from './config';

export default function TradeHistory() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<BetHistoryParams>({
    currency: '',
    page: 1,
    pageSize: 10,
    timeRange: TimeRange['24h'],
  });
  const timeOptions = useTimeRangeOptions();
  const profitTypeOptions = useProfitTypeOptions();
  const showTypeOptions = useShowTypeOptions();
  const assets = useRealAssets();
  const assetsOptions = useMemo(() => {
    return assets.map((token) => {
      return {
        label: (
          <div className="flex items-center gap-2">
            <Image src={getCoinUrl(token.currency)} className="rounded-full size-6" />
            <div>{token.currency}</div>
          </div>
        ),
        value: token.currency,
      };
    });
  }, [assets]);

  function onFromChange(key: string, value: number | string) {
    setFilters((prev) => {
      if (prev[key as keyof typeof prev] === value) return prev;
      if (key === 'showType' && value === undefined) {
        value = ShowType.All;
      }

      return {
        ...prev,
        [key]: value,
        page: 1,
      };
    });
  }

  const columns = useMemo<Column<BetHistoryItem>[]>(() => {
    return [
      {
        title: t('Type'),
        dataIndex: 'changeType',
        render({ bizType }) {
          return <div>{showTypeOptions.find((option) => option.value === bizType)!.label}</div>;
        },
      },
      {
        title: t('Time'),
        dataIndex: 'createTime',
        type: 'time',
        align: 'right',
      },
      {
        title: t('Order Id'),
        dataIndex: 'bizId',
        align: 'right',
        render({ bizId }) {
          return (
            <div className="gap-2 flex items-center justify-end">
              <div className="max-w-50 truncate">{bizId}</div>
              <CopyButton value={bizId} size="sm" />
            </div>
          );
        },
      },
      {
        title: t('Payout'),
        dataIndex: 'changeAmount',
        render(cell) {
          const { currency, changeAmount } = cell;
          return (
            <div className={cn('gap-1 flex items-center justify-end', changeAmount > 0 ? 'text-up' : 'text-down')}>
              <div>
                {changeAmount > 0 && <span>+</span>}
                {changeAmount}
              </div>
              <div>{currency}</div>
              <Image className="size-4" src={getCoinUrl(currency)} />
            </div>
          );
        },
      },
    ];
  }, [t, showTypeOptions]);

  const {
    data: { items: tableData, total },
    isValidating: loading,
  } = useSWR(
    ['wallet-trade-history', filters],
    () => {
      return request.post<{ items: BetHistoryItem[]; total: number }>(`/api/account/account/biz/list`, {
        ...filters,
        bizType: filters.bizType === BizType.All ? undefined : filters.bizType,
      });
    },
    { fallbackData: { items: [], total: 0 }, keepPreviousData: true }
  );

  return (
    <div className="detrade-card space-y-3">
      <div className="grid col-min-64 gap-3">
        <Select
          value={filters.bizType}
          options={showTypeOptions}
          onChange={(value) => onFromChange('bizType', value)}
          size="md"
          placeholder={t('All')}
        />
        <Select
          value={filters.currency}
          options={assetsOptions}
          onSearch={(key, option) => option.value.toLowerCase().indexOf(key.toLowerCase()) > -1}
          onChange={(value) => onFromChange('currency', value)}
          searchable
          size="md"
          placeholder={t('All Assets')}
        />
        <Select
          value={filters.profit}
          options={profitTypeOptions}
          onChange={(value) => onFromChange('profit', value)}
          size="md"
          placeholder={t('All')}
        />
        <Select
          value={filters.timeRange}
          options={timeOptions}
          onChange={(value) => onFromChange('timeRange', value)}
          size="md"
        />
      </div>
      <Table<BetHistoryItem> columns={columns} loading={loading} dataSource={tableData} />
      {total > filters.pageSize && (
        <Pagination
          current={filters.page}
          pageSize={filters.pageSize}
          total={total}
          onChange={(current) => setFilters((prev) => ({ ...prev, page: current }))}
        />
      )}
    </div>
  );
}
