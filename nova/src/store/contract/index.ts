import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setLeverageConfig } from '@store/system';
import { useUserInfo } from '@store/user';
import { useWebsocket } from '@store/ws';
import { optimisticUpdatePositionOrder, optimisticUpdatePublicOrder, useActiveTradingPair } from './services';
import { ContractOrderInfo, OrderPosition } from './types';

export * from './services';
export * from './types';

interface ContractState {
  positionOrder: OrderPosition | null;
  presentOrderType: 'MARKET' | 'HISTORY' | 'PUBLIC' | 'LEADERBOARD';
}

const initialState: ContractState = {
  positionOrder: null, // 需要在图表上定位价格线的订单
  presentOrderType: 'PUBLIC',
};

const slice = createSlice({
  name: 'Contract',
  initialState,
  reducers: {
    setPositionOrder(state, action: PayloadAction<OrderPosition>) {
      state.positionOrder = action.payload;
    },
    setPresentOrderType(state, action: PayloadAction<ContractState['presentOrderType']>) {
      state.presentOrderType = action.payload;
    },
  },
});

export function usePositionOrder() {
  return useSelector((state) => state.contract.positionOrder);
}

export function usePositionOrderActions() {
  const symbol = useActiveTradingPair();
  const dispatch = useDispatch();

  function onPositionOrder(order: OrderPosition) {
    if (!symbol) return;
    // 若需要定位的订单的货币对不是当前货币对, 则跳转到目标货币对
    if (symbol.symbol !== order.symbol) {
      dispatch(setLeverageConfig({ symbol: order.symbol }));
    }
    dispatch(slice.actions.setPositionOrder(order));
  }

  return { onPositionOrder };
}

export function useSettings() {
  return useSelector((state: StoreState) => state.system.leverage);
}

/**
 * 订阅游戏实时信息
 */
export function useSubscribeGame() {
  const dispatch = useDispatch();
  const { id } = useUserInfo().data;

  const cmds = useMemo(() => {
    return {
      contractOrder: {
        subscribe: `/contractOrder/end/subscribe`,
        unsubscribe: `/contractOrder/end/unsubscribe`,
        receive: '/contractOrder/end',
        close: `/contractOrder/close`,
        create: `/contractOrder/create`,
      },
    };
  }, []);

  const { sendMessage, useOnMessage } = useWebsocket();
  // 收到消息
  useOnMessage((message) => {
    if (!message) return;
    const { resp, cmd } = message;
    if (cmd === cmds.contractOrder.close) {
      // 通过socket关闭合约订单才会收到
    } else if (cmd === cmds.contractOrder.receive) {
      if (resp.userId === id) {
        // 我的结算订单
        optimisticUpdatePositionOrder(resp as ContractOrderInfo, 'cash');
        // 订单结束去掉订单定位
        dispatch(
          slice.actions.setPositionOrder({
            id: resp.id,
            show: false,
            symbol: resp.symbol,
          })
        );
      }
      optimisticUpdatePublicOrder(resp);
    } else if (cmd === cmds.contractOrder.create) {
      optimisticUpdatePositionOrder(resp as ContractOrderInfo, 'add');
      // 订单定位
      dispatch(
        slice.actions.setPositionOrder({
          id: resp.id,
          show: true,
          startPrice: resp.startPrice,
          bust: resp.burstPrice,
          stopLoss: resp.stopLossPrice,
          stopProfit: resp.stopProfitPrice,
          symbol: resp.symbol,
        })
      );
    }
  });

  // 发起消息
  useEffect(() => {
    // 订单
    sendMessage(cmds.contractOrder.subscribe);
    return () => {
      sendMessage(cmds.contractOrder.unsubscribe);
    };
  }, [sendMessage, cmds]);
}

export const { setPresentOrderType } = slice.actions;
export default slice.reducer;

export function useStonksCoin() {
  const currentCurrencyPairInfo = useActiveTradingPair();
  return currentCurrencyPairInfo.symbol === 'STONKS/USD';
}

export function useLever() {
  return useSelector((state: StoreState) => state.system.leverage.lever || 10);
}
