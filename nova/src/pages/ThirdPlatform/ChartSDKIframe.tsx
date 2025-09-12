import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { type BinaryOrderInfo } from '@store/binary/types';
import { ContractOrderInfo } from '@store/contract';
import { useSpreadSelectedTimePeriod } from '@store/spread';
import { SpreadOrderInfo } from '@store/spread/types';
import { useTheme } from '@store/system';
import { useUserInfo } from '@store/user';
import { ReadyState, useWebsocket } from '@store/ws';
import { Loading } from '@components';
import { cn } from '@utils';
import { useGameContext } from '@pages/components/GameProvider';
import WaterMark from '@pages/components/WaterMark';
import {
  buildBinaryActiveMarker,
  buildBinaryClosedMarker,
  buildBinaryPublicMarker,
  buildContractActiveMarker,
  buildContractClosedMarker,
  buildContractPublicMarker,
} from '@pages/ThirdPlatform/marker';
import { Direction, GameTypeNumber } from '@/type';
import { apis, formatChartData } from './common';
import type { AppPostEvent, AppReceiveEvent } from './types';

type MarkerType = 'active' | 'closed' | 'public';
enum ChartMode {
  advanced = 'advanced',
  basic = 'basic',
}

const themes = {
  lighten: {
    klineBorderColor: '#A8C200',
    klineBottomColor: 'rgba(205, 233, 25, 0)',
    klineTopColor: 'rgba(205, 233, 25, 0.6)',
    klineWidth: '2px',
  },
  darken: {
    klineBorderColor: '#D7ED47',
    klineBottomColor: 'rgba(22, 29, 38, 0)',
    klineTopColor: 'rgba(205, 233, 25, 0.5)',
    klineWidth: '2px',
  },
};

export const ChartIframe = ({ onLoadingChange }: { onLoadingChange: (loading: boolean) => void }) => {
  const { selectedSymbolPair, type: gameType, usePositionOrders, usePositionOrder, settings } = useGameContext();
  const { useOnMessage } = useWebsocket();
  const klineLastItem = useSelector((state: StoreState) => state.symbol.active);
  const theme = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeEvent, postMessage] = useIframeMessage(iframeRef.current);
  const selectedTimePeriod = useSpreadSelectedTimePeriod();
  const { id: userId } = useUserInfo().data;
  const closedTimerRef = useRef<NodeJS.Timeout[]>([]);
  const activeOrders = usePositionOrders();
  const positionOrder = usePositionOrder();

  const addActiveMarker = useCallback(
    (orders: BinaryOrderInfo[] | ContractOrderInfo[], gameType: GameTypeNumber) => {
      const payload = orders.map((order) => {
        return {
          markerType: 'active' as MarkerType,
          label: `active_${order.id}`,
          x: order.startTime,
          y: order.startPrice,
          innerHTML:
            gameType === GameTypeNumber.Binary || gameType === GameTypeNumber.BinarySpread
              ? buildBinaryActiveMarker(order as BinaryOrderInfo)
              : buildContractActiveMarker(order as ContractOrderInfo),
        };
      });

      postMessage({
        type: 'addMarker',
        payload,
      });
    },
    [postMessage]
  );

  const addEndMarker = useCallback(
    (orders: BinaryOrderInfo[] | ContractOrderInfo[], gameType: GameTypeNumber, markerType: MarkerType) => {
      const payload = orders.map((order) => {
        return {
          markerType,
          label: `${markerType}_${order.id}`,
          x: order.endTime,
          y: order.endPrice,
          innerHTML:
            gameType === GameTypeNumber.Binary || gameType === GameTypeNumber.BinarySpread // 玩法1、玩法4使用相同的marker;玩法2使用单独的marker
              ? markerType === 'public'
                ? buildBinaryPublicMarker(order as BinaryOrderInfo)
                : buildBinaryClosedMarker(order as BinaryOrderInfo)
              : markerType === 'public'
                ? buildContractPublicMarker(order as ContractOrderInfo)
                : buildContractClosedMarker(order as ContractOrderInfo),
        };
      });

      postMessage({
        type: 'addMarker',
        payload,
      });

      const timeoutId = setTimeout(() => {
        const ids = orders.map((order) => `${markerType}_${order.id}`);
        postMessage({ type: 'removeMarker', payload: ids });
      }, 5000);

      // 存储定时器ID以便清理
      closedTimerRef.current.push(timeoutId);
    },
    [postMessage]
  );

  useEffect(() => {
    // 使用 AbortController 解决快速切换货币对可能出现的竞态条件问题, 取消未完成的请求
    let controller: AbortController;
    (async () => {
      try {
        if (!iframeEvent || !iframeEvent.type) return;
        if (iframeEvent.type === 'initial' && iframeEvent.payload) {
          const { symbol, params } = iframeEvent.payload;
          controller = new AbortController();
          postMessage({
            type: 'initial',
            payload: await apis.initial(symbol, params, {
              signal: controller.signal,
            }),
          });
        } else if (iframeEvent.type === 'pagination') {
          const { start, end, symbol, params } = iframeEvent.payload;
          postMessage({ type: 'pagination', payload: await apis.pagination(start, end, symbol, params) });
        } else if (iframeEvent.type === 'loading-change') {
          onLoadingChange(iframeEvent.payload);
        }
      } catch (error) {
        if (error.name !== 'CanceledError') {
          // 只处理非取消错误
          console.error('chart initial error:', error);
        }
      }
    })();
    return () => {
      controller && controller.abort();
    };
  }, [iframeEvent, postMessage, onLoadingChange]);
  // 设置主题
  useEffect(() => {
    postMessage({
      type: 'set-theme',
      payload: Object.assign({ theme }, themes[theme === 'lighten' ? 'lighten' : 'darken']),
    });
  }, [theme, postMessage]);

  const isAdvanced = settings.advancedChart;
  useEffect(() => {
    postMessage({
      type: 'render',
      payload: {
        periodicity: settings.tick,
        symbol: selectedSymbolPair.symbol,
        mode: (isAdvanced ? 'advanced' : 'basic') as ChartMode,
      },
    });
  }, [settings.tick, postMessage, selectedSymbolPair, isAdvanced]);

  // 图表画线
  useEffect(() => {
    if (!klineLastItem) return;
    postMessage({ type: 'draw', payload: formatChartData([klineLastItem]) });
  }, [klineLastItem, postMessage]);

  // spread点差线
  useEffect(() => {
    if (!selectedTimePeriod) return;
    if (gameType === GameTypeNumber.BinarySpread) {
      postMessage({
        type: 'drawSpreadLine',
        payload: Number(selectedTimePeriod.spread),
      });
    }
  }, [gameType, selectedTimePeriod, postMessage]);

  /** 玩法1订单线;这里会不断的重复画所有订单的所以需要整个activeOrders */
  useEffect(() => {
    if (gameType === GameTypeNumber.Binary) {
      const orders = activeOrders.filter((t) => t.symbol === selectedSymbolPair.symbol);

      if (settings.showMyBets) {
        postMessage({
          type: 'positionSpacing',
          payload: orders.map((t) => {
            return {
              id: t.id,
              show: true,
              startTime: t.startTime,
              endTime: t.endTime,
              price: t.startPrice,
              color: t.direction === Direction.BuyRise ? '#2ecc71' : '#ff5449',
            };
          }),
        });
      } else {
        postMessage({
          type: 'positionSpacing',
          payload: orders.map((t) => {
            return {
              id: t.id,
              show: false,
            };
          }),
        });
      }
    }
  }, [activeOrders, selectedSymbolPair, gameType, settings.showMyBets, postMessage]);

  /** 玩法4订单线同上 */
  useEffect(() => {
    if (gameType === GameTypeNumber.BinarySpread) {
      const orders = activeOrders.filter((t) => t.symbol === selectedSymbolPair.symbol);
      if (settings.showMyBets) {
        postMessage({
          type: 'drawSpreadOrderLine',
          payload: (orders as SpreadOrderInfo[]).map((t) => {
            return {
              id: t.id,
              show: true,
              startTime: t.startTime,
              endTime: t.endTime,
              spreadPrice: t.direction === Direction.BuyRise ? t.startPrice + t.spread : t.startPrice - t.spread,
              startPrice: t.startPrice,
              color: t.direction === Direction.BuyRise ? '#2ecc71' : '#ff5449',
            };
          }),
        });
      } else {
        postMessage({
          type: 'drawSpreadOrderLine',
          payload: orders.map((t) => {
            return {
              id: t.id,
              show: false,
            };
          }),
        });
      }
    }
  }, [activeOrders, selectedSymbolPair, gameType, settings.showMyBets, postMessage]);

  // 玩法2订单线
  useEffect(() => {
    if (!positionOrder) {
      postMessage({
        type: 'positionOrder',
        payload: [],
      });
      return;
    }
    const { id, show, startPrice, bust, stopLoss, stopProfit } = positionOrder;

    const list = [{ label: 'Entry P.', price: startPrice, color: '#b1b6c6', id, show }];
    if (bust) {
      list.push({ label: 'Bust P.', price: bust, color: '#FF5449', id, show });
    }
    if (stopLoss) {
      list.push({ label: 'Stop Loss', price: stopLoss, color: '#FF5449', id, show });
    }
    if (stopProfit) {
      list.push({
        label: 'Take Profit',
        price: stopProfit,
        color: '#2ECC71',
        id,
        show,
      });
    }
    postMessage({
      type: 'positionOrder',
      payload: list,
    });
  }, [positionOrder, postMessage]);

  /** 进行中订单marker */
  useEffect(() => {
    if (settings.showMyBets) {
      // 取当前货币对订单
      const orders = activeOrders.filter((order) => order.symbol === selectedSymbolPair.symbol);
      addActiveMarker(orders as BinaryOrderInfo[] | ContractOrderInfo[], gameType);
      return () => {
        const ids = orders.map((order) => `active_${order.id}`);
        postMessage({
          type: 'removeMarker',
          payload: ids,
        });
      };
    }
  }, [
    theme,
    activeOrders,
    gameType,
    selectedSymbolPair.symbol,
    settings.showMyBets,
    settings.tick,
    postMessage,
    addActiveMarker,
    isAdvanced,
  ]);

  /** 根据ws推送添加Closed订单 */
  useOnMessage((message) => {
    if (!message.cmd.includes('/end')) return;
    const closedOrder = message.resp;
    if (!closedOrder) return;
    // 过滤非当前货币对
    if (closedOrder.symbol !== selectedSymbolPair.symbol) return;
    const isOtherUser = closedOrder.userId !== userId;
    // 若开启 "不显示public订单" 则不显示
    if (isOtherUser && !settings.showPublicBets) return;
    // 根据订单所属, 添加closed/public订单
    const markerType = isOtherUser ? 'public' : 'closed';
    addEndMarker([closedOrder], gameType, markerType);
  });

  // 组件卸载时清理所有定时器
  useEffect(() => {
    return () => {
      closedTimerRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      closedTimerRef.current = [];
    };
  }, []);

  return (
    <iframe
      className="size-full"
      ref={iframeRef}
      src={`${import.meta.env.BASE_URL}chart-iframe/index.html`}
      // src="http://localhost:8088/chart-iframe/index.html"
    />
  );
};

function useIframeMessage(iframe: HTMLIFrameElement | null) {
  const [message, setMessage] = useState<AppReceiveEvent>();
  const [isReady, setReady] = useState(false);
  const postMessage = useCallback(
    (message: AppPostEvent) => {
      if (!isReady || !iframe || !iframe.contentWindow) return;
      iframe.contentWindow.postMessage(JSON.stringify(message), {
        targetOrigin: '*',
      });
    },
    [isReady, iframe]
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'string') return;
      try {
        const message = JSON.parse(event.data) as AppReceiveEvent;
        setMessage(message);
        if (message.type === 'ready-to-create') {
          setReady(true);
        }
      } catch {}
    };

    window.addEventListener('message', onMessage, false);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return [message, postMessage] as [AppReceiveEvent, typeof postMessage];
}

export interface ActiveOrderForChart {
  symbol: string;
  id: string;
  startTime: number;
  endTime?: number;
  startPrice: number;
  direction: Direction;
  spread?: number;
  amount: number;
  currency: string;
}

function ChartView({ className }: { className?: string }) {
  const { readyState } = useWebsocket();
  const { selectedSymbolPair } = useGameContext();
  const wsReady = readyState === ReadyState.OPEN;
  const [loading, setLoading] = useState(!wsReady);
  useEffect(() => {
    !wsReady && setLoading(true);
  }, [wsReady]);
  return (
    <div className={cn('relative', className)}>
      <WaterMark className="absolute left-3 bottom-6" />
      {loading && <Loading />}
      {wsReady && selectedSymbolPair && <ChartIframe onLoadingChange={setLoading} />}
    </div>
  );
}

export default memo(ChartView);
