import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { throttle } from 'lodash-es';
import useSWR from 'swr';
import bridge from '@store/bridge';
import { useActivePrice } from '@store/symbol';
import { useMuted } from '@store/system';
import {
  setPresentOrderType,
  updateProgressingOrders,
  useActiveTradingPairInfo,
  useProgressingAndTempOrders,
  type TapOrder,
  type TempOrder,
} from '@store/tap';
import { useBalance, useCurrency } from '@store/wallet';
import useMemoCallback from '@hooks/useMemoCallback';
import { message } from '@components';
import { request } from '@utils';
import { Sound, SoundType } from '@utils/sound';
import { Kline, ViewBounding } from './utils';

export function usePlaySound() {
  const muted = useMuted();
  return useMemo(() => {
    return {
      place() {
        !muted && Sound.play(SoundType.CLICK);
      },
      success() {
        !muted && Sound.play(SoundType.SUCCESS);
      },
      fail() {
        !muted && Sound.play(SoundType.FAIL);
      },
    };
  }, [muted]);
}

export function useCreateOrder() {
  const { t } = useTranslation();
  const currency = useCurrency();
  const activePair = useSelector((state) => state.system.tap.symbol);
  const dispatch = useDispatch();
  const sound = usePlaySound();
  const amount = useSelector((state) => state.tap.amount);
  const balance = useBalance();
  return useMemoCallback(async (timeAndPrice: { lowerTimeLimit: number; lowerPriceLimit: number }) => {
    if (Number(amount) > balance) return message.error(t('Balance is not enough'));
    const data = {
      ...timeAndPrice,
      amount,
      currency: currency.name,
      symbol: activePair,
    };
    const tempOrder = { ...data, id: Math.random().toString(32) } as TempOrder;
    try {
      updateProgressingOrders(tempOrder, 'add');
      const order = await request.post<TapOrder>('/api/transaction/tapOrder/create', data, {
        silence: !bridge.get().micro,
      });
      updateProgressingOrders(order, 'update', tempOrder.id);
      dispatch(setPresentOrderType('PROGRESSING'));
      sound.place();
    } catch {
      updateProgressingOrders(tempOrder, 'cancel');
      sound.fail();
    }
  });
}

type OrderRect = { key: string; x: number; y: number; orders: TapOrder[] };
export function useMixinOrdersRects() {
  const { data: orders } = useProgressingAndTempOrders();
  return useMemo(() => {
    const rects: OrderRect[] = [];
    const temps: Record<string, TapOrder[]> = {};
    orders.forEach((order) => {
      const key = `${order.lowerTimeLimit}-${order.lowerPriceLimit}`;
      const isReal = 'odds' in order;
      if (temps[key]) {
        isReal && temps[key].unshift(order as TapOrder);
      } else {
        temps[key] = isReal ? [order as TapOrder] : [];
        rects.push({ key, orders: temps[key], x: order.lowerTimeLimit, y: order.lowerPriceLimit });
      }
    });
    return rects;
  }, [orders]);
}

function useKlineHistory(bounding: ViewBounding) {
  const { symbol: tradingPair, xGap } = useActiveTradingPairInfo();
  const GridSize = useGridSize(bounding);

  const { data, mutate, isValidating } = useSWR(
    bounding.width > 0 ? ['tap-trading-kline-history', tradingPair] : null,
    async () => {
      const data = await request.get<{ s: string; p: string; t: number }[]>(
        `/api/data/kline/history/ticker/latest?symbol=${tradingPair.replace('/', '-')}&seconds=${Math.ceil(((bounding.width / GridSize) * xGap) / 1000)}`
      );
      return data.map((it) => [it.t, Number(it.p)] as Kline);
    },
    { fallbackData: [] }
  );

  useEffect(() => {
    if (!tradingPair) return;

    mutate([], false).then(() => {
      mutate();
    });
  }, [tradingPair, mutate]);

  return { data, mutate, isValidating };
}

export function useKlines(bounding: ViewBounding) {
  const latest = useActivePrice();
  const { symbol: tradingPair } = useActiveTradingPairInfo();
  const { data: klines, mutate, isValidating } = useKlineHistory(bounding);

  useEffect(() => {
    if (!latest.symbol || isValidating || latest.symbol !== tradingPair) return;

    mutate((prev) => {
      if (!prev || !prev.length) return prev;

      if (latest.time <= prev[prev.length - 1][0]) return prev;

      const data = [...prev, [latest.time, latest.price]] as Kline[];

      return data.slice(-1 * 10000);
    }, false);
  }, [mutate, latest, tradingPair, isValidating, klines.length]);

  return klines;
}

export function useGridSize(bounding: ViewBounding) {
  return useMemo(() => Math.floor(bounding.height / 10), [bounding.height]);
}

interface ProbabilityParams {
  initPrice: number;
  initTime: number;
  timeTicks: number[];
  timeGap: number;
  priceTicks: number[];
  priceGap: number;
  volatility: number;
}

type Probability = {
  price: number;
  time: number;
  hit: number;
};

export function useProbabilityWorker() {
  const workerRef = useRef<Worker>();
  const blobUrlRef = useRef<string | null>(null);
  const throttledRef = useRef<((d: any) => void) | null>(null);
  const [results, setResults] = useState<Probability[]>([]);

  useEffect(() => {
    let mounted = true;

    // 构建 worker 的 blob 方式，避免直接跨域加载 worker 脚本
    (async () => {
      try {
        const scriptUrl = new URL('./probabilityWorker.js', import.meta.url).toString();
        const res = await fetch(scriptUrl, { credentials: 'include' });
        if (!res.ok) throw new Error(`fetch worker failed: ${res.status}`);
        const code = await res.text();

        // 如果 worker 脚本里使用了 importScripts 或相对导入，需要服务器端支持 CORS 或采用其他方式
        const blob = new Blob([code], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        if (!mounted) {
          URL.revokeObjectURL(blobUrl);
          return;
        }

        blobUrlRef.current = blobUrl;
        workerRef.current = new Worker(blobUrl, { type: 'module' });

        workerRef.current.onmessage = (e) => {
          setResults(e.data);
        };
        workerRef.current.onerror = (e) => {
          console.error('worker error', e);
        };
      } catch (err) {
        // 若 fetch/blbo 方式失败，可在此回退到直接创建（若同源可用）
        console.error('create worker from blob failed:', err);
      }
    })();

    return () => {
      mounted = false;
      if (workerRef.current) {
        try {
          workerRef.current.terminate();
        } catch {}
        workerRef.current = undefined;
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    throttledRef.current = throttle((d: ProbabilityParams) => {
      if (!workerRef.current) return;
      workerRef.current.postMessage(d);
    }, 500);

    return () => {
      if (throttledRef.current && (throttledRef.current as any).cancel) {
        (throttledRef.current as any).cancel();
      }
    };
  }, []);

  const computeGrids = useMemoCallback((data: ProbabilityParams) => {
    throttledRef.current?.(data);
  });

  return { probabilityResult: results, computeGrids };
}
