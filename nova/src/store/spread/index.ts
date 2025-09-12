import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useUserInfo } from '@store/user';
import { useWebsocket } from '../ws';
import {
  optimisticUpdatePositionOrder,
  optimisticUpdatePublicOrder,
  optimisticUpdateTimePeriods,
  useActiveTradingPair,
} from './services';
import { TimePeriods } from './types';

export * from './services';

interface SpreadState {
  presentOrderType: 'POSITIONS' | 'HISTORY' | 'PUBLIC' | 'LEADERBOARD';
  selectedTimePeriod?: TimePeriods;
}

const initialState: SpreadState = {
  selectedTimePeriod: undefined,
  presentOrderType: 'PUBLIC',
};

const slice = createSlice({
  name: 'Spread',
  initialState,
  reducers: {
    setSelectTimePeriod(state, action: PayloadAction<TimePeriods>) {
      state.selectedTimePeriod = action.payload;
    },
    setPresentOrderType(state, action: PayloadAction<SpreadState['presentOrderType']>) {
      state.presentOrderType = action.payload;
    },
  },
});

export const { setSelectTimePeriod, setPresentOrderType } = slice.actions;

export default slice.reducer;

export function useSpreadSettings() {
  return useSelector((state: StoreState) => state.system.spread);
}

export function useSpreadPresentOrderType() {
  return useSelector((state: StoreState) => state.spread.presentOrderType);
}

export function useSpreadSelectedTimePeriod() {
  return useSelector((state: StoreState) => state.spread.selectedTimePeriod);
}

/**
 * 订阅游戏实时信息
 */
export function useSubscribeGame() {
  const { id: userId } = useUserInfo().data;
  const { useOnMessage, sendMessage } = useWebsocket();
  const { symbol } = useActiveTradingPair();

  const cmds = useMemo(() => {
    return {
      spreadOrder: {
        subscribe: `/binarySpreadOrder/end/subscribe`,
        unsubscribe: `/binarySpreadOrder/end/unsubscribe`,
        receive: `/binarySpreadOrder/end`,
        create: `/binarySpreadOrder/create`,
      },
      spreadOrderOdds: {
        subscribe: `/binarySpreadOrder/odds/change/subscribe`,
        unsubscribe: `/binarySpreadOrder/odds/change/unsubscribe`,
      },
    };
  }, []);

  useOnMessage((message) => {
    if (!message) return;
    const { resp, cmd } = message;
    if (cmds.spreadOrderOdds.subscribe.includes(cmd)) {
      if (resp.symbol !== symbol) return;
      // 更新赔率
      optimisticUpdateTimePeriods(resp);
    } else if (cmd === cmds.spreadOrder.receive) {
      if (resp.userId !== userId) {
        optimisticUpdatePublicOrder(resp);
      } else {
        // 我的结算订单
        optimisticUpdatePositionOrder(resp, 'close');
      }
    } else if (cmd === cmds.spreadOrder.create) {
      optimisticUpdatePositionOrder(resp, 'add');
    }
  });

  // 订阅消息
  useEffect(() => {
    // 订单
    sendMessage(cmds.spreadOrder.subscribe);
    // 赔率
    sendMessage(cmds.spreadOrderOdds.subscribe);
    return () => {
      sendMessage(cmds.spreadOrder.unsubscribe);
      sendMessage(cmds.spreadOrderOdds.unsubscribe);
    };
  }, [sendMessage, cmds]);
}
