import { memo, useCallback, useEffect, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { useExchanges } from '@store/wallet';
import { AnimateNumber, Button, Column, Pagination, Table } from '@components';
import { formatter } from '@utils';
import { request } from '@utils/axios';
import { Card } from '@pages/components';

// ================ 常量定义 ================
/**
 * @description API接口地址配置
 */
const API = {
  PROMOTION_INFO: '/api/promotion/referralCommission/info',
  PROMOTION_LIST: '/api/promotion/referralCommission/details',
  PROMOTION_WITHDRAW: '/api/promotion/referralCommission/withdraw',
} as const;

/**
 * @description 初始化空数据
 */
const EMPTY_STATISTICS: IStatisticsData = {
  totalCommission: 0,
  balance: 0,
};

// ================ 类型定义 ================
/**
 * @description 统计数据接口类型
 */
interface IStatisticsData {
  totalCommission: number | null;
  balance: number | null;
}

/**
 * @description 返佣明细数据类型
 */
interface IListItem {
  id: number;
  userId: string;
  userName: string;
  totalCommission: number;
  wagered: number;
  referredAt: number;
}

/**
 * @description 分页参数类型
 */
interface IPaginationParams {
  page: number;
  pageSize: number;
}

/**
 * @description 完整的状态类型
 */
interface IState {
  statistics: IStatisticsData;
  list: IListItem[];
  total: number;
  loading: {
    list: boolean;
    statistics: boolean;
  };
  pagination: IPaginationParams;
}

/**
 * @description IAction类型
 */
type IAction =
  | { type: 'SET_LIST'; payload: { items: IListItem[]; total: number } }
  | { type: 'SET_LIST_LOADING'; payload: boolean }
  | { type: 'SET_STATISTICS_LOADING'; payload: boolean }
  | { type: 'SET_STATISTICS'; payload: IStatisticsData }
  | { type: 'SET_PAGINATION'; payload: Partial<IPaginationParams> };

// ================ 工具函数 ================

/**
 * @description reducer
 */
const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case 'SET_LIST':
      return {
        ...state,
        list: action.payload.items,
        total: action.payload.total,
      };
    case 'SET_LIST_LOADING':
      return {
        ...state,
        loading: { ...state.loading, list: action.payload },
      };
    case 'SET_STATISTICS_LOADING':
      return {
        ...state,
        loading: { ...state.loading, statistics: action.payload },
      };
    case 'SET_STATISTICS':
      return {
        ...state,
        statistics: action.payload,
      };
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      };
    default:
      return state;
  }
};

// ================ 子组件 ================
interface IStatisticsCardProps {
  statistics: IStatisticsData;
  loading: boolean;
  onClaim: () => Promise<void>;
}

/**
 * @description 统计卡片组件
 */
const StatisticsCard = memo(({ statistics, loading, onClaim }: IStatisticsCardProps) => {
  const { t } = useTranslation();
  const localCurrency = 'USDFIAT';
  const canClaim = useMemo(() => {
    return (
      formatter
        .amount(statistics.balance || 0, localCurrency)
        .floor()
        .toNumber() > 0
    );
  }, [statistics.balance, localCurrency]);
  const exchange = useExchanges();

  return (
    <div className="flex items-center justify-between p-6 rounded-3 bg-layer4 min-h-22 referral-gradient">
      <div className="flex flex-col gap-2">
        <div className="text-20 s768:text-24 text-brand font-700">
          <AnimateNumber
            value={formatter
              .amount((statistics.totalCommission ?? 0) / exchange[localCurrency], localCurrency)
              .floor()
              .toNumber()}
            currency={localCurrency}
          />
        </div>
        <div className="text-12 text-secondary font-500">{t('Total commission')}</div>
      </div>
      <Button onClick={onClaim} disabled={!canClaim || loading} size="lg">
        {`${t('Claim')} ${formatter
          .amount((statistics.balance ?? 0) / exchange[localCurrency], localCurrency)
          .floor()
          .toText()}
        `}
      </Button>
    </div>
  );
});

StatisticsCard.displayName = 'StatisticsCard';

// ================ 主组件 ================
/**
 * @description 我的奖励组件
 */
function MyReward() {
  const { t } = useTranslation();
  const localCurrency = 'USDFIAT';
  const exchange = useExchanges();
  const [state, dispatch] = useReducer(reducer, {
    statistics: EMPTY_STATISTICS,
    list: [],
    total: 0,
    loading: {
      list: false,
      statistics: false,
    },
    pagination: {
      page: 1,
      pageSize: 20,
    },
  });

  /**
   * @description 获取统计数据
   */
  const fetchStatistics = useCallback(async () => {
    try {
      dispatch({ type: 'SET_STATISTICS_LOADING', payload: true });
      const data = await request.get<IStatisticsData>(API.PROMOTION_INFO);
      dispatch({ type: 'SET_STATISTICS', payload: data });
    } finally {
      dispatch({ type: 'SET_STATISTICS_LOADING', payload: false });
    }
  }, []);

  /**
   * @description 获取列表数据
   */
  const fetchList = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LIST_LOADING', payload: true });
      const data = await request.get<{ total: number; items: IListItem[] }>(API.PROMOTION_LIST, state.pagination);
      if (data) {
        dispatch({
          type: 'SET_LIST',
          payload: { items: data.items, total: data.total },
        });
      }
    } finally {
      dispatch({ type: 'SET_LIST_LOADING', payload: false });
    }
  }, [state.pagination]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  /**
   * @description 处理分页变化
   */
  const handlePageChange = (page: number) => {
    dispatch({
      type: 'SET_PAGINATION',
      payload: { page },
    });
  };

  /**
   * @description 处理提现
   */
  const handleClaim = useCallback(async () => {
    await request.post(API.PROMOTION_WITHDRAW);
    dispatch({
      type: 'SET_STATISTICS',
      payload: {
        ...state.statistics,
        balance: 0,
      },
    });
  }, [state.statistics]);

  /**
   * @description 表格列配置
   */
  const columns = useMemo<Column<IListItem>[]>(
    () => [
      {
        title: t('User name'),
        dataIndex: 'userName',
        render: ({ userName }) => <span className="text-14 font-500">{userName}</span>,
      },
      {
        title: t('|PnL|'),
        dataIndex: 'wagered',
        align: 'right',
        render: ({ wagered }) => (
          <span className="text-brand text-14 font-600">
            {formatter
              .amount(wagered / exchange[localCurrency], localCurrency)
              .floor()
              .toText()}
          </span>
        ),
      },
      {
        title: t('Total commission'),
        dataIndex: 'totalCommission',
        align: 'right',
        render: ({ totalCommission }) => (
          <span className="text-brand text-14 font-600">
            {formatter
              .amount(totalCommission / exchange[localCurrency], localCurrency)
              .floor()
              .toText()}
          </span>
        ),
      },
      {
        title: t('Referred at'),
        dataIndex: 'referredAt',
        type: 'time',
      },
    ],
    [t, localCurrency, exchange]
  );

  return (
    <div className="flex flex-col gap-3">
      <StatisticsCard statistics={state.statistics} loading={state.loading.statistics} onClaim={handleClaim} />

      <Card
        className="s768:p-8 s768:pt-4"
        title={
          <div className="flex items-center gap-2 ">
            {t('Referred users')}: <span className="text-16 text-brand">{state.total}</span>
          </div>
        }
      >
        <Table<IListItem>
          rowKey="id"
          columns={columns}
          loading={state.loading.list}
          dataSource={state.list}
          size="lg"
        />

        {state.total > state.pagination.pageSize && (
          <Pagination
            current={state.pagination.page}
            pageSize={state.pagination.pageSize}
            total={state.total}
            onChange={handlePageChange}
            className="pt-2"
          />
        )}
      </Card>
    </div>
  );
}

MyReward.displayName = 'MyReward';

export default MyReward;
