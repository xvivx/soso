import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAsyncThunk, createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import useSWR, { mutate } from 'swr';
import { changeUpdown } from '@store/system';
import { useUserInfo } from '@store/user';
import { changeAccountType } from '@store/wallet';
import { ReadyState, useWebsocket } from '@store/ws';
import { getServerTime, request } from '@utils/axios';
import { createOrderToken } from '@utils/others';
import { Direction } from '@/type';
import { Game, GameStatus, IAmountPool, IGameRule, KlineItem, Order, UpDownState } from './types';

export { GameStatus, OrderStatus, type Game, type KlineItem, type Order } from './types';

const initialAmountPool: IAmountPool = {
  id: '',
  symbol: '',
  period: '',
  upPoolAmount: 0,
  downPoolAmount: 0,
};

const defaultGame: Game = {
  id: '',
  currentTime: 0,
  tradeCutoffTime: 0,
  priceStartTime: 0,
  priceEndTime: 0,
  status: GameStatus.UNKNOWN_STATUS,
  platformName: '',
  first5sDownPoolAmount: 0,
  second5sDownPoolAmount: 0,
  first5sUpPoolAmount: 0,
  second5sUpPoolAmount: 0,
  previousRoundResult: [],
};
const initialState: UpDownState = {
  wager: '',
  klineData: [],
  loading: false,
  amountPool: initialAmountPool,
  game: defaultGame,
  presentOrderType: 'LEADERBOARD',
};

const slice = createSlice({
  name: 'upDownStore',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setGame(state, action: PayloadAction<Game>) {
      if (state.game && state.game.id !== action.payload.id) {
        state.amountPool = initialAmountPool;
        optimisticUpdateRoundOrders(null);
      }
      state.game = action.payload;
    },
    setAmountPool(state, action: PayloadAction<IAmountPool>) {
      state.amountPool = action.payload;
    },
    setWager(state, action: PayloadAction<UpDownState['wager']>) {
      state.wager = action.payload;
    },
    addWebsocketKlineData(state, action: PayloadAction<KlineItem>) {
      state.klineData = [...state.klineData, action.payload].slice(-300);
    },
    doResetAfterUnmount(state) {
      state.game = defaultGame;
      state.klineData = [];
      state.amountPool = initialAmountPool;
    },
    setPresentOrderType(state, action: PayloadAction<UpDownState['presentOrderType']>) {
      state.presentOrderType = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchKlineHistory.pending, (state) => {
        state.klineData = [];
      })
      .addCase(fetchKlineHistory.fulfilled, (state, action) => {
        if (!state.klineData.length) {
          state.klineData = action.payload;
        } else {
          const [end] = state.klineData[0];
          state.klineData = action.payload
            .map((item, index) => {
              return [end - (action.payload.length - index) * 500, item[1]] as KlineItem;
            })
            .concat(state.klineData);
        }
      })
      .addMatcher(isAnyOf(changeAccountType, changeUpdown), (state) => {
        // 切换账号和时间组时重置游戏
        state.game = defaultGame;
        state.klineData = [];
        state.amountPool = initialAmountPool;
      });
  },
});

// 导出 reducer 和 actions
export const { setPresentOrderType } = slice.actions;

export default slice.reducer;

/**
 * @description 请求kline的历史数据
 * 使用abortController控制器, 解决快速切换数据错乱问题
 */
let abortController: AbortController | null = null;
const fetchKlineHistory = createAsyncThunk<KlineItem[], void, { state: StoreState }>(
  'upAndDown/history/kline',
  async (_, { getState }) => {
    // 取消上一个请求
    if (abortController) {
      abortController.abort();
    }
    // 创建新的控制器
    abortController = new AbortController();
    try {
      const { symbol } = getState().system.updown;
      const formattedSymbol = symbol.replace('/', '-');

      const data = await request.get<{ s: string; p: string; t: number }[]>(
        `/api/data/kline/history/ticker/latest?symbol=${formattedSymbol}&seconds=${300}`,
        undefined,
        { signal: abortController.signal } // 传递取消信号
      );
      return data.map((it) => [it.t, Number(it.p)]);
    } finally {
      // 清理控制器
      abortController = null;
    }
  }
);

export function useTradingPairs() {
  const current = useSelector((state: StoreState) => state.system.updown.symbol);
  const dispatch = useDispatch();
  return useSWR(
    ['updown-trading-paris'],
    async () => {
      const pairs = await request.get<SymbolInfo[]>('/api/transaction/symbol/list?type=4');
      const enables = pairs.filter((pair) => pair.onlineStatus);
      return enables;
    },
    {
      onSuccess(data) {
        if (!data.find((pair) => pair.symbol === current)) {
          dispatch(changeUpdown({ symbol: data[0].symbol }));
        }
      },
      suspense: true,
    }
  );
}

export function useTradingPeriods(symbol: string) {
  return useSWR(
    ['updown-pair-periods', symbol],
    () => {
      return request.get<IGameRule[]>(`/api/transaction/updown/symbolPeriod/list?symbol=${symbol}`);
    },
    {
      suspense: true,
      keepPreviousData: true,
    }
  );
}

/**
 * @description 下单
 */
export const createUpDownOrder = createAsyncThunk<
  void,
  { direction: Direction; txId?: string; network?: string },
  { state: StoreState }
>('upAndDown/create/order', async ({ direction, txId, network }, { getState }) => {
  const { upDown, account, system } = getState();
  const data = {
    roundId: upDown.game!.id,
    symbol: system.updown.symbol.replace('-', '/'),
    direction,
    currency: account.currency || 'USDT',
    amount: Number(upDown.wager),
    txId,
    network,
    label: system.updown.gameLabel,
  };

  await request.post<Order>(`/api/transaction/updown/order/create`, data, {
    headers: {
      ['X-Token']: createOrderToken(getServerTime()),
    },
  });
});

/**
 * @description 获取当前交易对
 */
export const useCurrentSymbol = () => {
  return useSelector((state: StoreState) => state.system.updown.symbol);
};

export const useAmountPool = () => {
  return useSelector((state: StoreState) => state.upDown.amountPool);
};

/**
 * @description 获取当前选中的游戏规则
 */
export const useSelectedGameRule = () => {
  const currentPair = useSelector((state: StoreState) => state.system.updown.symbol);
  const gameLabel = useSelector((state: StoreState) => state.system.updown.gameLabel);
  const { data: periods } = useTradingPeriods(currentPair);
  return useMemo(() => {
    return periods.find((rule) => rule.label === gameLabel);
  }, [periods, gameLabel]);
};

/**
 * @description 获取和更新下注金额的Hook
 * @returns {[string, (value: string) => void]} 下注金额和更新函数
 */
export const useWager = (): [string, (value: string) => void] => {
  // 获取下注金额
  const wager = useSelector((state) => state.upDown.wager);
  const dispatch = useDispatch();

  /**
   * @description 更新下注金额
   * @param {string} value - 新的下注金额
   */
  const update = useCallback(
    (value: string) => {
      dispatch(slice.actions.setWager(value));
    },
    [dispatch]
  );

  // 返回下注金额和更新函数
  return [wager, update];
};

export const useOrders = (direction?: Direction) => {
  const { data: orders } = useRoundOrders();
  return useMemo(() => {
    if (!direction) return orders;
    return orders.filter((it) => it.direction === direction);
  }, [orders, direction]);
};

export const usePlayers = (direction: Direction) => {
  const orders = useOrders(direction);
  return useMemo(() => {
    type Player = { id: string; amount: number; avatar: string; name: string; privateHide: boolean };
    const tempRecords: Record<string, Player> = {};
    const players: Player[] = [];

    orders.forEach((it) => {
      if (!tempRecords[it.userId]) {
        tempRecords[it.userId] = {
          id: it.userId,
          amount: it.usdAmount,
          avatar: it.avatar,
          name: it.nickName,
          privateHide: it.privateHide,
        };
        players.push(tempRecords[it.userId]);
      } else {
        tempRecords[it.userId].amount += it.usdAmount;
      }
    });

    return players;
  }, [orders]);
};

// Game selector
export const useRealtimeGame = () => {
  return useSelector((state) => state.upDown.game!);
};

export const useKlineData = () => {
  return useSelector((state) => state.upDown.klineData);
};

export const useLastKlineItem = () => {
  const klineData = useKlineData();
  return klineData.slice(-1)[0] || [0, 0];
};

/**
 * 订阅游戏实时信息
 */
export function useSubscribeGame() {
  const dispatch = useDispatch();
  const { readyState, sendMessage, useOnMessage } = useWebsocket();
  const { symbol, gameLabel } = useSelector((state: StoreState) => state.system.updown);
  const { data: periods } = useTradingPeriods(symbol);

  const timePeriodParam = useMemo(() => {
    const detail = periods.find((rule) => rule.label === gameLabel);
    return detail && detail.period;
  }, [periods, gameLabel]);

  useEffect(() => {
    if (!periods.find((period) => period.label === gameLabel)) {
      dispatch(changeUpdown({ gameLabel: periods[0].label }));
    }
  }, [dispatch, gameLabel, periods]);

  const cmds = useMemo(() => {
    if (!timePeriodParam) return null;
    const klineSymbol = symbol.replace('/', '-');
    return {
      game: {
        subscribe: `/contest/${symbol}/${timePeriodParam}/ticker/subscribe`,
        unsubscribe: `/contest/${symbol}/${timePeriodParam}/ticker/unsubscribe`,
        receive: `/contest/${symbol}/${timePeriodParam}/ticker`,
      },
      order: {
        subscribe: `/contest/${gameLabel}/newOrder/subscribe`,
        unsubscribe: `/contest/${gameLabel}/newOrder/unsubscribe`,
        receive: `/contest/${gameLabel}/newOrder`,
      },
      kline: {
        subscribe: `/kline/${klineSymbol}/ticker/subscribe`,
        unsubscribe: `/kline/${klineSymbol}/ticker/unsubscribe`,
        receive: `/kline/${klineSymbol}/ticker`,
      },
      amountPool: {
        subscribe: `/contest/${gameLabel}/amountPool/subscribe`,
        unsubscribe: `/contest/${gameLabel}/amountPool/unsubscribe`,
        receive: `/contest/${gameLabel}/amountPool`,
      },
    };
  }, [gameLabel, symbol, timePeriodParam]);

  useEffect(() => {
    if (!cmds) return;
    const commands = Object.values(cmds);
    commands.forEach((cmd) => {
      cmd.subscribe.startsWith('/kline') && dispatch(fetchKlineHistory());
      sendMessage(cmd.subscribe);
    });
    return () => {
      commands.forEach((cmd) => sendMessage(cmd.unsubscribe));
    };
  }, [cmds, sendMessage, dispatch]);

  useOnMessage((message) => {
    if (!cmds) return;
    if (message.cmd === cmds.game.receive) {
      dispatch(slice.actions.setGame(message.resp as Game));
    } else if (message.cmd === cmds.order.receive) {
      optimisticUpdateRoundOrders(message.resp as Order);
    } else if (message.cmd === cmds.kline.receive) {
      dispatch(slice.actions.addWebsocketKlineData([message.resp.t, Number(message.resp.p)]));
    } else if (message.cmd === cmds.amountPool.receive) {
      dispatch(slice.actions.setAmountPool(message.resp as IAmountPool));
    }
  });

  useEffect(() => {
    dispatch(slice.actions.setLoading(readyState !== ReadyState.OPEN));
    if (readyState !== ReadyState.OPEN) {
      dispatch(slice.actions.doResetAfterUnmount());
    }
  }, [readyState, dispatch]);
}

export function useRoundOrders() {
  const label = useSelector((state) => state.system.updown.gameLabel);
  const round = useSelector((state) => state.upDown.game && state.upDown.game.id);
  return useSWR(
    ['updown-round-orders'],
    () => {
      return request.get<Order[]>(`/api/transaction/updown/order/history/${round}/${label}/get`);
    },
    {
      fallbackData: [],
      revalidateOnFocus: false,
      revalidateOnMount: false,
      dedupingInterval: 3600 * 1000,
    }
  );
}

export function usePositionOrders() {
  const { data: user } = useUserInfo();
  const { data, mutate, isValidating: loading } = useRoundOrders();
  return {
    loading,
    mutate,
    orders: useMemo(() => data.filter((order) => order.userId === user.id), [data, user.id]),
  };
}

function optimisticUpdateRoundOrders(order: Order | null) {
  mutate(
    (key: string[]) => key && key[0] === 'updown-round-orders',
    (orders: Order[] = []) => (order ? [order, ...orders] : []),
    false
  );
}

export function useActiveTradingPair() {
  const { data: tradingPairs } = useTradingPairs();
  const selected = useSelector((state: StoreState) => state.system.updown.symbol);
  return useMemo(() => tradingPairs.find((it) => it.symbol === selected)!, [tradingPairs, selected]);
}
