import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSWR, { mutate } from 'swr';
import { setBinaryConfig } from '@store/system';
import { useAccountType, useCurrency } from '@store/wallet';
import { request } from '@utils/axios';
import { OrderFilter } from '@pages/components/GameOrderFilter';
import { OrderStatus } from '@pages/Trade/type';
import { GameTypeNumber } from '@/type';
import { BinaryOrderInfo, LeaderBoardInfo, TimePeriods } from './types';

/**
 * 获取下单限额
 */
export function useAmountLimit() {
  const currency = useCurrency();
  const symbol = useActiveTradingPair();
  const binaryPeriods = useSelector((state) => state.binary.selectedTimePeriod);

  return useSWR(
    binaryPeriods ? ['binary-limit-amount', symbol.symbol, currency.name, binaryPeriods.time] : null,
    async ([, symbol, currency, binaryPeriodsTime]) => {
      const response = await request.get<{ maxAmount: number; minAmount: number; currency: string }>(
        '/api/transaction/symbol/binary/limit',
        {
          currency,
          symbol,
          second: binaryPeriodsTime,
        }
      );

      return {
        ...response,
        currency: currency, // 确保返回的currency是当前货币名称
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
    ['binary-leaderBoard', sort, timeType, accountType],
    async () => await request.get<LeaderBoardInfo[]>('/api/transaction/binaryOrder/rankings', { sort, timeType }),
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
    ['binary-public-orders'],
    async () => await request.get<BinaryOrderInfo[]>('/api/transaction/binaryOrder/public/list'),
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
  return useSWR(['binary-history-orders', accountType], () => fetchMarketOrders(OrderStatus.Closed), {
    fallbackData: [],
  });
}

/**
 * 获取position数据
 */
export function usePositionOrders() {
  const accountType = useAccountType();
  return useSWR(['binary-active-orders', accountType], () => fetchMarketOrders(OrderStatus.Ongoing), {
    fallbackData: [],
    dedupingInterval: 10 * 1000,
  });
}

async function fetchMarketOrders(status: OrderStatus) {
  const { items } = await request.get<{ items: BinaryOrderInfo[] }>('/api/transaction/binaryOrder/list', {
    page: 1,
    pageSize: 100,
    status,
  });
  return items;
}

/**
 * 乐观更新 - position order
 */
export async function optimisticUpdatePositionOrder(order: BinaryOrderInfo, type: 'add' | 'close') {
  mutate(
    (key: string[]) => key && key[0] === 'binary-active-orders',
    (data: BinaryOrderInfo[] = []) => {
      // 如果是close, 需要删除active订单
      if (type === 'close') return data.filter((it) => it.id !== order.id);
      // 如果是add, 直接添加
      return [order, ...data];
    },
    false
  );

  // close重新拉历史
  if (type === 'close') {
    mutate((key: string[]) => key && key[0] === 'binary-history-orders');
  }
}

/**
 * 乐观更新 - public order
 */
const createThrottledUpdater = () => {
  const queue: BinaryOrderInfo[] = [];
  let timer: NodeJS.Timeout | null = null;
  return (order: BinaryOrderInfo) => {
    queue.push(order);
    if (timer) return;

    timer = setInterval(() => {
      const item = queue.shift();
      if (item) {
        mutate(
          ['binary-public-orders'],
          (data: BinaryOrderInfo[] = []) => {
            return [item, ...data];
          },
          false
        );
      }
    }, 1000);
  };
};
const updatePublicOrder = createThrottledUpdater();
export async function optimisticUpdatePublicOrder(order: BinaryOrderInfo) {
  updatePublicOrder(order);
}

/**
 * 乐观更新 - 时间组赔率列表数据
 */
export async function optimisticUpdateTimePeriods(periods: TimePeriods) {
  mutate(
    (key: string[]) => key && key[0] === 'binary-odds-list',
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
 * 获取赔率列表
 */
export const useTimePeriods = () => {
  const { symbol } = useActiveTradingPair();
  return useSWR(
    symbol ? ['binary-odds-list', symbol] : null,
    async ([_, symbol]) => {
      const response = await request.get<TimePeriods[]>('/api/transaction/symbol/odds/list', {
        symbol,
        type: GameTypeNumber.Binary,
      });
      return response;
    },
    {
      fallbackData: [],
    }
  );
};

/**
 * 获取玩法1交易对列表
 */
export function useTradingPairs() {
  const accountType = useAccountType();
  const dispatch = useDispatch();
  const activeTradingPair = useSelector((state: StoreState) => state.system.binary.symbol);
  return useSWR(
    ['binary-trading-pairs', accountType],
    async () => {
      const pairs = await request.get<SymbolInfo[]>(`/api/transaction/symbol/list?type=${GameTypeNumber.Binary}`);
      const enables = pairs.filter((pair) => pair.onlineStatus);
      if (!enables.find((it) => it.symbol === activeTradingPair)) {
        dispatch(setBinaryConfig({ symbol: enables[0].symbol }));
      }
      return enables;
    },
    {
      suspense: true,
    }
  );
}

/**
 * 获取玩法1当前货币对
 */
export function useActiveTradingPair() {
  const { data: tradingPairs } = useTradingPairs();
  const selected = useSelector((state: StoreState) => state.system.binary.symbol);
  return useMemo(() => tradingPairs.find((it) => it.symbol === selected)!, [tradingPairs, selected]);
}
