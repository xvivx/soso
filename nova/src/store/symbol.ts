import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { keyBy, memoize } from 'lodash-es';
import useSWR, { mutate } from 'swr';
import { formatter, request } from '@utils';
import { useUserInfo } from './user';
import { useWebsocket } from './ws';

export type KlineResponse = { t: number; p: string; c: string; s: string };
export type CandleResponse = {
  c: string; // 24h change/close
  s: string; // symbol: BTC-USD
  t: number; // time
  h: string; // high
  l: string; // low
  o: string; // open
  p: string; // change
};

type SymbolPairPriceChg = {
  c: string;
  p: string;
  s: string;
  t: number;
};

interface SymbolState {
  active: KlineResponse | CandleResponse;
  symbolPairPriceChangeList: SymbolPairPriceChg[];
}

const initialState: SymbolState = {
  symbolPairPriceChangeList: [],
  active: { c: '', p: '', s: '', t: 0 },
};

const slice = createSlice({
  name: 'symbol-data',
  initialState,
  reducers: {
    setSymbolPairPriceChangeList(state, action: PayloadAction<SymbolPairPriceChg[]>) {
      state.symbolPairPriceChangeList = action.payload;
    },
    setActive(state, action: PayloadAction<KlineResponse | CandleResponse | string>) {
      if (typeof action.payload === 'string') {
        state.active = state.symbolPairPriceChangeList.find((it) => it.s === action.payload) || state.active;
      } else {
        state.active = action.payload;
      }
    },
  },
});

export default slice.reducer;

export function useSubscribeActiveTradingPair(
  activePair: string,
  timePeriod: string,
  tradingPairs: SymbolInfo[]
): void {
  const dispatch = useDispatch();
  const { sendMessage, useOnMessage } = useWebsocket();
  const tradingPairMaps = useMemo(() => keyBy(tradingPairs, 'symbol'), [tradingPairs]);

  useEffect(() => {
    // 避免切换瞬间价格残留上一个币的信息
    dispatch(slice.actions.setActive(activePair));
  }, [dispatch, activePair]);

  const cmds = useMemo(() => {
    const symbol = activePair.replace('/', '-');
    const interval = timePeriod === '500ms' ? 'ticker' : timePeriod;
    return {
      receive: `/kline/${symbol}/${interval}`,
      subscribe: `/kline/${symbol}/${interval}/subscribe`,
      unsubscribe: `/kline/${symbol}/${interval}/unsubscribe`,
    };
  }, [activePair, timePeriod]);
  useEffect(() => {
    sendMessage(cmds.subscribe);
    return () => sendMessage(cmds.unsubscribe);
  }, [sendMessage, cmds]);

  useOnMessage((message) => {
    const { cmd, resp } = message;
    if (cmd === cmds.receive) {
      const data = resp as CandleResponse | KlineResponse;
      const tradingPair = data.s.replace('-', '/');
      const candle = 'o' in data;
      const precision = tradingPairMaps[tradingPair].decimalPlaces;
      const origin = candle ? data.c : data.p;
      const price = precision === undefined ? origin : formatter.price(origin, precision).toNumber().toString();
      dispatch(
        slice.actions.setActive({
          ...data,
          s: tradingPair,
          [candle ? 'c' : 'p']: price,
        })
      );
    }
  });
}

export function useSubscribeAllTradingPairs() {
  const dispatch = useDispatch();
  const { sendMessage, useOnMessage } = useWebsocket();

  useOnMessage((message) => {
    const { cmd, resp } = message || {};
    if (cmd !== '/kline/all/ticker') return;

    dispatch(
      slice.actions.setSymbolPairPriceChangeList(
        // 待后端修复去掉replace
        (resp as SymbolPairPriceChg[]).map((it) => {
          const tradingPair = it.s.replace('-', '/');
          return {
            ...it,
            s: tradingPair,
            p: it.p,
          };
        })
      )
    );
  });

  useEffect(() => {
    sendMessage('subscribe', JSON.stringify({ subCmd: ['/kline/all/ticker'] }));
    return () => {
      sendMessage('unsubscribe', JSON.stringify({ subCmd: ['/kline/all/ticker'] }));
    };
  }, [sendMessage]);
}

const activePriceSelector = createSelector(
  (state: StoreState) => state.symbol.active,
  (active) => {
    return {
      symbol: active.s,
      time: active.t,
      price: Number('o' in active ? active.c : active.p),
      change: Number('o' in active ? active.p : active.c),
    };
  }
);
export function useActivePrice() {
  return useSelector(activePriceSelector);
}

const symbolPricesMapSelector = createSelector(
  (state: StoreState) => state.symbol.symbolPairPriceChangeList,
  activePriceSelector,
  (changes, active) => {
    return changes.reduce(
      (map, curr) => {
        if (active && active.symbol === curr.s) {
          map[curr.s] = {
            c: active.change,
            p: active.price,
          };
        } else {
          map[curr.s] = { c: Number(curr.c), p: Number(curr.p) };
        }
        return map;
      },
      {} as { [key: string]: { c: number; p: number } }
    );
  }
);
/**
 * 获取symbol实时价格map, symbol用'/'拼接
 */
export function useSymbolPricesMap() {
  return useSelector(symbolPricesMapSelector);
}

export function toggleCollectSymbol(symbol: string) {
  return mutate(
    (key: string[]) => key && key[0] === 'collect-symbols',
    async (collects: string[] = []) => {
      if (collects.find((it) => it === symbol)) {
        await request.delete(`/api/transaction/symbol/collect/delete?symbol=${symbol}`);
        return collects.filter((it) => it !== symbol);
      } else {
        await request.post('/api/transaction/symbol/collect/create', { symbol });
        return collects.concat(symbol);
      }
    },
    false
  );
}

const collectsSelector = memoize((collects: string[]) => keyBy(collects));
export function useCollectSymbolsMap() {
  const { data: collects } = useCollectTradingPairs();
  return collectsSelector(collects);
}

function useCollectTradingPairs() {
  const { id } = useUserInfo().data;
  return useSWR(
    id ? ['collect-symbols', id] : null,
    async () => {
      return await request.get<string[]>('/api/transaction/symbol/collect/list');
    },
    { fallbackData: [] }
  );
}
