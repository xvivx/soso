import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { keyBy, throttle } from 'lodash-es';
import useSWR, { mutate } from 'swr';
import { useSubscribeActiveTradingPair } from '@store/symbol';
import { setTapConfig } from '@store/system';
import { useAccountType, useCurrency } from '@store/wallet';
import { useWebsocket } from '@store/ws';
import useDocumentVisible from '@hooks/useDocumentVisible';
import { formatter, request } from '@utils';
import { OrderFilter } from '@pages/components/GameOrderFilter';

interface TapConfig {
  id: string;
  priceIncrement: number;
  symbol: string;
  timeIncrement: number;
  volatility: number;
}

const slice = createSlice({
  name: 'tap',
  initialState: {
    amount: '',
    presentOrderType: 'LEADERBOARD' as 'PROGRESSING' | 'HISTORY' | 'PUBLIC' | 'LEADERBOARD',
  },
  reducers: {
    setAmount(state, action: PayloadAction<string>) {
      state.amount = action.payload;
    },
    setPresentOrderType(state, action: PayloadAction<(typeof state)['presentOrderType']>) {
      state.presentOrderType = action.payload;
    },
  },
});

export default slice.reducer;
export const { setPresentOrderType } = slice.actions;

export enum OrderStatus {
  Progressing = 0,
  Finished = -1,
  Win = 1,
  Loss = 2,
  Error = 3,
}

export function useTradingPairs() {
  const accountType = useAccountType();
  const dispatch = useDispatch();
  const activePair = useSelector((state) => state.system.tap.symbol);
  return useSWR(
    ['tap-trading-pairs', accountType],
    async () => {
      const [pairs, configs] = await Promise.all([
        request.get<SymbolInfo[]>(`/api/transaction/symbol/list?type=5`),
        request.get<TapConfig[]>('/api/transaction/symbol/tapConfig/list'),
      ]);

      const enables = pairs.filter((pair) => pair.onlineStatus);
      if (!enables.find((it) => it.symbol === activePair)) {
        dispatch(setTapConfig({ symbol: enables[0].symbol }));
      }

      const configMap = keyBy(configs, 'symbol');
      return enables.map(
        (pair) =>
          ({
            ...pair,
            xGap: configMap[pair.symbol].timeIncrement * 1000,
            yGap: configMap[pair.symbol].priceIncrement,
            volatility: configMap[pair.symbol].volatility,
          }) as SymbolInfo & { xGap: number; yGap: number; volatility: number }
      );
    },
    {
      suspense: true,
    }
  );
}

export function useSubscribeGame() {
  const { data: tradingPairs } = useTradingPairs();
  const activePair = useSelector((state) => state.system.tap.symbol);
  const { sendMessage } = useWebsocket();
  const cmds = useMemo(
    () => ({
      subscribeEnd: '/tapOrder/end/subscribe',
      unsubscribeEnd: '/tapOrder/end/unsubscribe',
      // 订阅创建订单信息
      subscribeCreate: '/tapOrder/create/subscribe',
      unsubscribeCreate: '/tapOrder/create/unsubscribe',
      // 接收创建订单推送
      create: '/tapOrder/create',
    }),
    []
  );
  useSubscribeActiveTradingPair(activePair, '500ms', tradingPairs);

  // 发起订阅
  useEffect(() => {
    sendMessage(cmds.subscribeEnd);
    sendMessage(cmds.subscribeCreate);
    return () => {
      sendMessage(cmds.unsubscribeEnd);
      sendMessage(cmds.unsubscribeCreate);
    };
  }, [cmds, sendMessage]);

  const visible = useDocumentVisible();
  useEffect(() => {
    if (!visible) return;
    mutate(['tap-history-orders']);
    mutate(['tap-progressing-orders']);
    return () => {
      clearProgressingTimers();
    };
  }, [visible]);
}

export function useActiveTradingPairInfo() {
  const activePair = useSelector((state) => state.system.tap.symbol);
  const { data: tradingPairs } = useTradingPairs();
  return useMemo(() => tradingPairs.find((pair) => pair.symbol === activePair)!, [activePair, tradingPairs]);
}

const throttleUpdateHistoryOrders = throttle(
  function () {
    mutate(['tap-history-orders']);
  },
  500,
  { trailing: false }
);

const timers: Record<string, NodeJS.Timeout> = {};
const clearProgressingTimers = () => {
  Object.keys(timers).forEach((key) => {
    clearTimeout(timers[key]);
    delete timers[key];
  });
};
function checkout(time: number, price: number) {
  mutate(
    ['tap-progressing-orders'],
    (prev: (TempOrder | TapOrder)[] = []) => {
      return prev.filter((item) => item.lowerTimeLimit !== time || item.lowerPriceLimit !== price);
    },
    false
  );
}
export function updateProgressingOrders(order: TempOrder, type: 'add' | 'cancel'): void;
export function updateProgressingOrders(order: TapOrder, type: 'cash-out'): void;
export function updateProgressingOrders(order: TapOrder, type: 'update', tempId: string): void;
export function updateProgressingOrders(
  order: TempOrder | TapOrder,
  type: 'add' | 'cancel' | 'update' | 'cash-out',
  tempId?: string
): void {
  mutate(
    ['tap-progressing-orders'],
    (prev: (TempOrder | TapOrder)[] = []) => {
      if (type === 'update') {
        return prev.map((item) => (item.id === tempId ? order : item));
      } else if (type === 'cancel') {
        return prev.filter((item) => item.id !== order.id);
      } else if (type === 'cash-out') {
        throttleUpdateHistoryOrders();
        const { lowerTimeLimit, lowerPriceLimit } = order as TapOrder;
        const key = `${lowerTimeLimit}-${lowerPriceLimit}`;
        if (!timers[key]) {
          timers[key] = setTimeout(() => {
            delete timers[key];
            checkout(lowerTimeLimit, lowerPriceLimit);
          }, 2000);
        }
        return prev.map((item) => (item.id === order.id ? order : item));
      } else {
        return [order, ...prev];
      }
    },
    false
  );
}

export function usePlaceLimit() {
  const currency = useCurrency();
  const activePair = useSelector((state) => state.system.tap.symbol);
  return useSWR(
    ['tap-place-amount', currency.name, activePair],
    async ([_, currency, tradingPair]: string[]) => {
      const { minAmount, maxAmount } = await request.get<{ maxAmount: number; minAmount: number }>(
        '/api/transaction/symbol/tap/limit',
        {
          currency: currency,
          symbol: tradingPair,
        }
      );

      return {
        currency: currency,
        minAmount: formatter.amount(minAmount, currency).ceil().toNumber(),
        maxAmount: formatter.amount(maxAmount, currency).floor().toNumber(),
      };
    },
    {
      fallbackData: { minAmount: 0, maxAmount: 0, currency: currency.name },
      keepPreviousData: true,
    }
  );
}

export function usePlaceAmount() {
  const amount = useSelector((state) => state.tap.amount);
  const dispatch = useDispatch();
  const setAmount = useCallback((amount: string) => dispatch(slice.actions.setAmount(amount)), [dispatch]);
  return [amount, setAmount] as const;
}

export function useProgressingAndTempOrders() {
  return useSWR(
    ['tap-progressing-orders'],
    () => request.get<(TapOrder | TempOrder)[]>('/api/transaction/tapOrder/list', { status: 0 }),
    { fallbackData: [], revalidateOnMount: false }
  );
}
export function useProgressingOrders() {
  const { data: mixins, isValidating } = useProgressingAndTempOrders();
  const orders = useMemo(() => {
    return mixins.filter((order) => 'odds' in order && order.status === 0) as TapOrder[];
  }, [mixins]);
  return { orders, loading: isValidating };
}

export function useHistoryOrders() {
  return useSWR(
    ['tap-history-orders'],
    async () => await request.get<TapOrder[]>(`/api/transaction/tapOrder/list`, { status: -1 }),
    { fallbackData: [], revalidateOnMount: false }
  );
}

export function useLiveOrders() {
  return useSWR(
    ['tap-live-orders'],
    async () => await request.get<TapOrder[]>(`/api/transaction/tapOrder/public/list`),
    {
      fallbackData: [],
      keepPreviousData: true,
      revalidateOnFocus: false,
      // 只需要查一次后续根据ws更新
      dedupingInterval: 24 * 60 * 60 * 1000,
    }
  );
}

export function updateLiveOrders(order: TapOrder) {
  mutate(
    (key: string[]) => key && key[0] === 'tap-live-orders',
    (prev: TapOrder[] = []) => {
      const index = prev.findIndex((item) => item.id === order.id);
      if (index !== -1) {
        // 如果存在则更新
        return prev.map((item, i) => (i === index ? order : item));
      } else {
        // 如果不存在则添加
        return [order, ...prev];
      }
    },
    false
  );
}

export function useRankingOrders(filters: OrderFilter) {
  return useSWR(
    ['tap-rankings-orders', filters],
    async () => await request.get<TapOrder[]>(`/api/transaction/tapOrder/rankings`, filters),
    {
      fallbackData: [],
      keepPreviousData: true,
    }
  );
}

export function useSettings() {
  return useSelector((state: StoreState) => state.system.tap);
}

export type TapOrder = {
  id: string;
  userId: string;
  amount: number;
  assetBaseImage: string;
  currency: string;
  symbol: string;
  lowerPriceLimit: number;
  lowerTimeLimit: number;
  status: OrderStatus;
  profit: number;
  roi: number;
  odds: number;
  platformName: string;
  privateHide: boolean;
  avatar: string;
  nickName: string;
  usdProfit: number;
};

export type TempOrder = {
  id: string;
  lowerPriceLimit: number;
  lowerTimeLimit: number;
};
