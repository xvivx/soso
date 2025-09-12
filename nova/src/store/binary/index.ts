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

export type BinaryPresentOrderType = 'POSITIONS' | 'HISTORY' | 'PUBLIC' | 'LEADERBOARD';

interface BinaryState {
  presentOrderType: BinaryPresentOrderType;
  selectedTimePeriod?: TimePeriods;
}

const initialState: BinaryState = {
  selectedTimePeriod: undefined,
  presentOrderType: 'PUBLIC',
};

const slice = createSlice({
  name: 'Trade',
  initialState,
  reducers: {
    setSelectTimePeriod(state, action: PayloadAction<TimePeriods>) {
      state.selectedTimePeriod = action.payload;
    },
    setPresentOrderType(state, action: PayloadAction<BinaryState['presentOrderType']>) {
      state.presentOrderType = action.payload;
    },
  },
});

export const { setSelectTimePeriod, setPresentOrderType } = slice.actions;

export default slice.reducer;

export function useBinarySettings() {
  return useSelector((state: StoreState) => state.system.binary);
}

export function useBinaryPresentOrderType() {
  return useSelector((state: StoreState) => state.binary.presentOrderType);
}

export function useBinarySelectedTimePeriod() {
  return useSelector((state: StoreState) => state.binary.selectedTimePeriod);
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
      binaryOrder: {
        subscribe: `/binaryOrder/end/subscribe`,
        unsubscribe: `/binaryOrder/end/unsubscribe`,
        receive: `/binaryOrder/end`,
        create: `/binaryOrder/create`,
      },
      binaryOrderOdds: {
        subscribe: `/binaryOrder/odds/change/subscribe`,
        unsubscribe: `/binaryOrder/odds/change/unsubscribe`,
      },
    };
  }, []);

  // 收到消息
  useOnMessage((message) => {
    if (!message) return;
    const { resp, cmd } = message;
    if (cmds.binaryOrderOdds.subscribe.includes(cmd)) {
      if (resp.symbol !== symbol) return;
      // 更新赔率
      optimisticUpdateTimePeriods(resp);
    } else if (cmd === cmds.binaryOrder.receive) {
      if (resp.userId !== userId) {
        optimisticUpdatePublicOrder(resp);
      } else {
        // 我的结算订单
        optimisticUpdatePositionOrder(resp, 'close');
      }
    } else if (cmd === cmds.binaryOrder.create) {
      optimisticUpdatePositionOrder(resp, 'add');
    }
  });

  // 订阅消息
  useEffect(() => {
    // 订单
    sendMessage(cmds.binaryOrder.subscribe);
    // 赔率
    sendMessage(cmds.binaryOrderOdds.subscribe);
    return () => {
      sendMessage(cmds.binaryOrder.unsubscribe);
      sendMessage(cmds.binaryOrderOdds.unsubscribe);
    };
  }, [sendMessage, cmds]);
}
