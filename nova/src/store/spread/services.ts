import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSWR, { mutate } from 'swr';
import { setSpreadConfig } from '@store/system';
import { useAccountType, useCurrency } from '@store/wallet';
import { getServerTime, request } from '@utils/axios';
import { OrderFilter } from '@pages/components/GameOrderFilter';
import { OrderStatus } from '@pages/Trade/type';
import { GameTypeNumber } from '@/type';
import { LeaderBoardInfo, SpreadOrderInfo, TimePeriods } from './types';

/**
 * 获取下单限额
 */
export function useAmountLimit() {
  const currency = useCurrency();
  const symbol = useActiveTradingPair();
  const spreadPeriods = useSelector((state) => state.spread.selectedTimePeriod);

  return useSWR(
    spreadPeriods ? ['spread-limit-amount', symbol.symbol, currency.name, spreadPeriods.time] : null,
    async ([, symbol, currency, spreadPeriodsTime]) => {
      const response = await request.get<{ maxAmount: number; minAmount: number }>(
        '/api/transaction/symbol/binarySpread/limit',
        {
          currency,
          symbol,
          second: spreadPeriodsTime,
        }
      );

      return {
        ...response,
        currency,
      };
    },
    {
      fallbackData: { maxAmount: 0, minAmount: 0, currency: currency.name },
      keepPreviousData: true,
    }
  );
}

/**
 * 获取排行榜
 */
export function useLeaderBoard(props: OrderFilter) {
  const { sort, timeType } = props;
  const accountType = useAccountType();

  return useSWR(
    ['spread-leaderBoard', sort, timeType, accountType],
    async () => await request.get<LeaderBoardInfo[]>('/api/transaction/binarySpreadOrder/rankings', { sort, timeType }),
    {
      fallbackData: [],
    }
  );
}

/**
 * 获取public数据
 */
export function usePublicOrders() {
  return useSWR(
    ['spread-public-orders'],
    async () => await request.get<SpreadOrderInfo[]>('/api/transaction/binarySpreadOrder/public/list'),
    {
      fallbackData: [],
    }
  );
}

/**
 * 获取history数据
 */
export function useHistoryOrders() {
  const accountType = useAccountType();
  return useSWR(['spread-history-orders', accountType], () => fetchMarketOrders(OrderStatus.Closed), {
    fallbackData: [],
  });
}

/**
 * 获取position数据
 */
export function usePositionOrders() {
  const accountType = useAccountType();
  const serverTime = getServerTime();
  const res = useSWR(['spread-active-orders', accountType], () => fetchMarketOrders(OrderStatus.Ongoing), {
    fallbackData: [],
  });
  return { ...res, data: res.data.filter((order) => order.endTime > serverTime) }; // 筛选出未过期的订单,避免有时缓存未更新导致数据有误
}

async function fetchMarketOrders(status: OrderStatus) {
  const { items } = await request.get<{ items: SpreadOrderInfo[] }>('/api/transaction/binarySpreadOrder/list', {
    page: 1,
    pageSize: 100,
    status,
  });
  return items;
}

/**
 * 乐观更新 - position order
 */
export async function optimisticUpdatePositionOrder(order: SpreadOrderInfo, type: 'add' | 'close') {
  mutate(
    (key: string[]) => key && key[0] === 'spread-active-orders',
    (data: SpreadOrderInfo[] = []) => {
      // 如果是close, 需要删除active订单
      if (type === 'close') return data.filter((it) => it.id !== order.id);
      // 如果是add, 直接添加
      return [order, ...data];
    },
    false
  );

  // close重新拉历史
  if (type === 'close') {
    mutate((key: string[]) => key && key[0] === 'spread-history-orders');
  }
}

/**
 * 乐观更新 - public order
 */
const createThrottledUpdater = () => {
  const queue: SpreadOrderInfo[] = [];
  let timer: NodeJS.Timeout | null = null;
  return (order: SpreadOrderInfo) => {
    queue.push(order);
    if (timer) return;

    timer = setInterval(() => {
      const item = queue.shift();
      if (item) {
        mutate(
          ['spread-public-orders'],
          (data: SpreadOrderInfo[] = []) => {
            return [item, ...data];
          },
          false
        );
      }
    }, 1000);
  };
};
const updatePublicOrder = createThrottledUpdater();
export async function optimisticUpdatePublicOrder(order: SpreadOrderInfo) {
  updatePublicOrder(order);
}

/**
 * 乐观更新 - 时间组赔率列表数据
 */
export async function optimisticUpdateTimePeriods(periods: TimePeriods) {
  mutate(
    (key: string[]) => key && key[0] === 'spread-odds-list',
    (data: TimePeriods[] = []) => {
      return data.map((item) => {
        if (item.time === periods.time) {
          return periods;
        } else {
          return item;
        }
      });
    },
    false
  );
}

/**
 * 获取单个赔率列表
 */
export const useTimePeriods = () => {
  const { symbol } = useActiveTradingPair();
  return useSWR(
    symbol ? ['spread-odds-single', symbol] : null,
    async ([_, symbol]) => {
      const response = await request.get<TimePeriods[]>('/api/transaction/symbol/odds/list', {
        symbol,
        type: GameTypeNumber.BinarySpread,
      });
      return response;
    },
    {
      fallbackData: [],
    }
  );
};

/**
 * 获取所有赔率列表
 */
export const useAllTimePeriods = () => {
  return useSWR(
    'spread-odds-all',
    async ([_]) => {
      const response = await request.get<TimePeriods[]>('/api/transaction/symbol/odds/list', {
        type: GameTypeNumber.BinarySpread,
      });
      return response;
    },
    {
      fallbackData: [],
    }
  );
};

/**
 * 获取玩法4交易对列表
 */
export function useTradingPairs() {
  const accountType = useAccountType();
  const dispatch = useDispatch();
  const activeTradingPair = useSelector((state: StoreState) => state.system.spread.symbol);
  return useSWR(
    ['spread-trading-pairs', accountType],
    async () => {
      const pairs = await request.get<SymbolInfo[]>(`/api/transaction/symbol/list?type=${GameTypeNumber.BinarySpread}`);
      const enables = pairs.filter((pair) => pair.onlineStatus);
      if (!enables.find((it) => it.symbol === activeTradingPair)) {
        dispatch(setSpreadConfig({ symbol: enables[0].symbol }));
      }
      return enables;
    },
    {
      suspense: true,
    }
  );
}

/**
 * 获取玩法4当前货币对
 */
export function useActiveTradingPair() {
  const { data: tradingPairs } = useTradingPairs();
  const selected = useSelector((state: StoreState) => state.system.spread.symbol);
  return useMemo(() => tradingPairs.find((it) => it.symbol === selected)!, [tradingPairs, selected]);
}
