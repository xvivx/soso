import { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { useRealAssets } from '@store/wallet';
import { Column, Image, Modal, Pagination, Select, SvgIcon, Table } from '@components';
import { cn, formatter, request } from '@utils';
import { getCoinUrl } from '@utils/others';
import CopyButton from '@pages/components/CopyButton';
import { useTimeRangeOptions } from './common';
import Status from './components/Status';
import CryptoDetail from './Deposit/CryptoOrderDetail';
import FiatDepositOrderDetail from './Deposit/FiatOrderDetail';
import { CryptoOrder, FiatDepositOrder, FiatWithdrawOrder, TransitionStatus } from './types';
import FiatWithdrawOrderDetail from './Withdraw/FiatOrderDetail';

type TransitionOrder = {
  amount: number;
  currency: string;
  changeType: 1 | 0;
  createTime: number;
  icon: string;
  id: number;
  status: TransitionStatus;
  type: 1;
};

export default function Transactions() {
  const { t } = useTranslation();
  const changeTypeOptions = useMemo(
    () => [
      {
        label: t('Deposit'),
        value: 1 as const,
      },
      {
        label: t('Withdraw'),
        value: 0 as const,
      },
    ],
    [t]
  );
  const timeRangeOptions = useTimeRangeOptions();
  const currencyOptions = useCurrencyOptions();
  const statusOptions = useMemo(() => {
    return [
      {
        label: t('success'),
        value: TransitionStatus.SUCCESS,
      },
      {
        label: t('processing'),
        value: TransitionStatus.PROCESSING,
      },
      {
        label: t('failed'),
        value: TransitionStatus.FAILED,
      },
    ];
  }, [t]);
  const [filters, setFilters] = useState({
    changeType: 1 as const,
    status: undefined,
    currency: '',
    timeRange: '1',
    page: 1,
    pageSize: 10,
  });
  const {
    data: { items: orders, total },
    isValidating: loading,
  } = useSWR(
    ['wallet-transition-list', filters],
    () => {
      return request.post<{
        items: TransitionOrder[];
        total: number;
      }>('/api/account/payment/v2/list', { ...filters, status: filters.status || 0 });
    },
    { fallbackData: { items: [], total: 0 }, keepPreviousData: true }
  );

  function onFiltersChange(key: keyof typeof filters, value: number | string) {
    setFilters((prev) => {
      return {
        ...prev,
        [key]: value,
        page: 1,
      };
    });
  }

  const columns = useMemo<Column<TransitionOrder>[]>(() => {
    return [
      {
        title: t('Type'),
        dataIndex: 'changeType',
        render({ changeType }) {
          const item = changeTypeOptions.find((option) => option.value === changeType);
          return <div>{item!.label}</div>;
        },
      },
      {
        title: t('Time'),
        dataIndex: 'createTime',
        type: 'time',
        align: 'right',
      },
      {
        title: t('Amount'),
        dataIndex: 'amount',
        align: 'right',
        render({ changeType, currency, amount }) {
          return (
            <div className={cn('flex items-center gap-1', changeType === 1 ? 'text-up' : 'text-down')}>
              <div className="flex-1">{formatter.amount(amount, currency).sign().toText()}</div>
              <Image className="size-4 rounded-full" src={getCoinUrl(currency)} />
            </div>
          );
        },
      },
      {
        title: t('Order id'),
        dataIndex: 'id',
        align: 'right',
        render({ id }) {
          return (
            <div className="flex items-center justify-end gap-2 text-secondary">
              <div className="truncate max-w-50">{id}</div>
              <CopyButton size="sm" value={String(id)} />
            </div>
          );
        },
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        render(order) {
          return <OrderDetailButton order={order} />;
        },
      },
    ];
  }, [t, changeTypeOptions]);

  return (
    <div className="detrade-card">
      <div className="grid s1024:grid-cols-4 grid-cols-2 gap-1.5 mb-3">
        <Select
          value={filters.changeType}
          options={changeTypeOptions}
          onChange={(value) => onFiltersChange('changeType', value)}
          size="md"
        />
        <Select
          value={filters.currency}
          options={currencyOptions}
          onChange={(value) => onFiltersChange('currency', value)}
          searchable
          size="md"
          placeholder={t('all assets')}
        />
        <Select<number>
          value={filters.status}
          options={statusOptions}
          onChange={(value) => onFiltersChange('status', value)}
          size="md"
          placeholder={t('all status')}
        />
        <Select
          value={filters.timeRange}
          options={timeRangeOptions}
          onChange={(value) => onFiltersChange('timeRange', value)}
          size="md"
          align="end"
        />
      </div>
      <Table columns={columns} loading={loading} dataSource={orders} />
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

function useCurrencyOptions() {
  const assets = useRealAssets();
  return useMemo(() => {
    return assets.map((item) => {
      return {
        value: item.currency,
        label: (
          <div className="flex items-center gap-2">
            <Image src={getCoinUrl(item.currency)} className="rounded-full size-6" alt="symbol" />
            <div>{item.currency}</div>
          </div>
        ),
        filter(key: string) {
          return item.currency.toLowerCase().indexOf(key.toLowerCase()) > -1;
        },
      };
    });
  }, [assets]);
}

function OrderDetailButton(props: { order: TransitionOrder }) {
  const { t } = useTranslation();
  const { order } = props;
  const [loading, setLoading] = useState(false);
  return (
    <div
      className="flex items-center justify-end gap-2 cursor-pointer"
      onClick={async () => {
        try {
          setLoading(true);
          let orderDetail: ReactNode;
          if (order.changeType === 0) {
            if (order.type === 1) {
              orderDetail = (
                <FiatWithdrawOrderDetail
                  order={await request.get<FiatWithdrawOrder>(
                    `/api/account/fiat/payment/withdraw/detail?id=${order.id}`
                  )}
                />
              );
            } else {
              orderDetail = (
                <CryptoDetail
                  order={await request.get<CryptoOrder>(`/api/account/payment/v2/crypto/detail?id=${order.id}`)}
                />
              );
            }
          } else {
            if (order.type === 1) {
              orderDetail = (
                <FiatDepositOrderDetail
                  order={await request.get<FiatDepositOrder>(`/api/account/fiat/payment/deposit/detail?id=${order.id}`)}
                />
              );
            } else {
              orderDetail = (
                <CryptoDetail
                  order={await request.get<CryptoOrder>(`/api/account/payment/v2/crypto/detail?id=${order.id}`)}
                />
              );
            }
          }
          Modal.open({
            title: t('Transaction details'),
            children: orderDetail,
            size: 'md',
          });
        } finally {
          setLoading(false);
        }
      }}
    >
      <Status status={order.status} />
      <SvgIcon name={loading ? 'loading' : 'arrow'} className="size-4" />
    </div>
  );
}
