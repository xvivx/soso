import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { keyBy } from 'lodash-es';
import useSWR, { mutate } from 'swr';
import { setLeverageConfig } from '@store/system';
import { useAccountType, useCurrency } from '@store/wallet';
import { request } from '@utils/axios';
import { OrderFilter } from '@pages/components/GameOrderFilter';
import { GameTypeNumber } from '@/type';
import { ContractOrderInfo, ContractOrderStatus, SymbolPrice } from './types';

export function useLeaderBoard(filters: OrderFilter & { symbol: string }) {
  const accountType = useAccountType();
  return useSWR(
    ['contract-leaderBoard', accountType, filters],
    async () => await request.get<ContractOrderInfo[]>(`/api/transaction/contractOrder/rankings`, filters),
    {
      fallbackData: [],
    }
  );
}
export function usePublicOrders() {
  return useSWR(
    ['contract-public-orders'],
    async () => await request.get<ContractOrderInfo[]>(`/api/transaction/contractOrder/public/list`),
    {
      fallbackData: [],
    }
  );
}

export function useHistoryOrders() {
  const accountType = useAccountType();
  return useSWR(['contract-history-orders', accountType], () => fetchMarketOrders(ContractOrderStatus.Closed), {
    fallbackData: [],
  });
}

export function usePositionOrders() {
  const accountType = useAccountType();
  return useSWR(['contract-active-orders', accountType], () => fetchMarketOrders(ContractOrderStatus.Position), {
    fallbackData: [],
  });
}

export async function optimisticUpdatePositionOrder(cashAll: true): Promise<void>;
export async function optimisticUpdatePositionOrder(order: ContractOrderInfo, type: 'add' | 'cash'): Promise<void>;
export async function optimisticUpdatePositionOrder(order: ContractOrderInfo | true, type?: 'add' | 'cash') {
  mutate(
    (key: string[]) => key && key[0] === 'contract-active-orders',
    (data: ContractOrderInfo[] = []) => {
      if (order === true) return [];
      if (type === 'cash') return data.filter((it) => it.id !== order.id);
      return [order, ...data];
    },
    false
  );

  // 一键平仓或者平仓时重新拉历史
  if (order === true || type === 'cash') {
    mutate((key: string[]) => key && key[0] === 'contract-history-orders');
  }
}

const createThrottledUpdater = () => {
  const queue: ContractOrderInfo[] = [];
  let timer: NodeJS.Timeout | null = null;

  return (order: ContractOrderInfo) => {
    queue.push(order);
    if (timer) return;

    timer = setInterval(() => {
      const item = queue.shift();
      if (item) {
        mutate(
          ['contract-public-orders'],
          (data: ContractOrderInfo[] = []) => {
            return [item, ...data];
          },
          false
        );
      }
    }, 1000);
  };
};
const updatePublicOrder = createThrottledUpdater();
export async function optimisticUpdatePublicOrder(order: ContractOrderInfo) {
  updatePublicOrder(order);
}

async function fetchMarketOrders(status: ContractOrderStatus) {
  const { items } = await request.get<{ items: ContractOrderInfo[] }>('/api/transaction/contractOrder/list', {
    page: 1,
    pageSize: 100,
    status,
  });
  return items;
}

export function useOrderAmountLimit() {
  const pair = useSelector((state: StoreState) => state.system.leverage.symbol);
  const currency = useCurrency();
  const apiData = useSWR(
    pair && currency.name ? ['contract-amount-limit', pair, currency.name] : null,
    async ([_, pair, currency]) => {
      return await request.get<{ minAmount: number; maxAmount: number }>('/api/transaction/symbol/contract/limit', {
        currency,
        symbol: pair,
      });
    },
    {
      fallbackData: { minAmount: 0, maxAmount: 0 },
    }
  );
  return {
    data: {
      ...apiData.data,
      currency: currency.name,
    },
  };
}

export function useTradingPairs() {
  const accountType = useAccountType();
  const dispatch = useDispatch();
  const activeTradingPair = useSelector((state) => state.system.leverage.symbol);
  return useSWR(
    ['contract-trading-pairs', accountType],
    async () => {
      const pairs = await request.get<SymbolInfo[]>(`/api/transaction/symbol/list?type=${GameTypeNumber.Contract}`);
      const enables = pairs.filter((pair) => pair.onlineStatus);
      if (!enables.find((it) => it.symbol === activeTradingPair)) {
        dispatch(setLeverageConfig({ symbol: enables[0].symbol }));
      }
      return enables;
    },
    {
      suspense: true,
    }
  );
}

export function useActiveTradingPair() {
  const { data: tradingPairs } = useTradingPairs();
  const selected = useSelector((state: StoreState) => state.system.leverage.symbol);
  return useMemo(() => tradingPairs.find((it) => it.symbol === selected)!, [tradingPairs, selected]);
}

export function useTradingPairsParams() {
  return useSWR(
    ['contract-pairs-params'],
    async () => {
      const tradingPairs = await request.get<SymbolPrice[]>('/api/transaction/symbol/contract/priceParameter/list');
      return keyBy(tradingPairs, (it) => `${it.name}/USD`);
    },
    {
      suspense: true,
    }
  );
}

export function useTradingPairParam(symbol: string) {
  const { data: params } = useTradingPairsParams();
  return params[symbol];
}
