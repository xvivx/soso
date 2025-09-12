import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Game, GameStatus, KlineItem, useAmountPool, useKlineData, useRealtimeGame } from '@store/upDown';
import { IAmountPool } from '@store/upDown/types';
import { Direction } from '@/type';

export function calcRealProfit(
  investment: number,
  direction: Direction,
  game: Game,
  amountPool: IAmountPool,
  preview?: boolean
) {
  if (!game) return investment;

  // 收益
  let profit = 0;
  const { downPoolAmount, upPoolAmount } = amountPool;
  const extra = preview ? investment : 0;

  if (direction === Direction.BuyFall) {
    profit = (investment / (downPoolAmount + extra)) * upPoolAmount;

    return profit + investment;
  } else {
    profit = (investment / (upPoolAmount + extra)) * downPoolAmount;

    return profit + investment;
  }
}

export const animateOptions = { duration: 0.6, ease: 'easeIn' };

export const klineConfig = {
  left: 0,
  right: 0.5,
  bottom: 0.2,
  top: 0.1,
  itemInterval: 500,
  minFactor: 30000,
  maxFactor: window.screen.width >= 1024 ? 60000 : 50000,
};

export function useWinAmount(direction: Direction) {
  const game = useRealtimeGame();
  const amountPool = useAmountPool();
  return useMemo(() => {
    if (!game || !amountPool) return 0;
    // FINISHED之前展示各自的池子，之后输方的资金池转移到赢方的奖池
    if (game.status === GameStatus.FINISHED || game.status === GameStatus.READY_TO_START) {
      if (direction === game.winSide) {
        return amountPool.upPoolAmount + amountPool.downPoolAmount;
      } else {
        return 0;
      }
    } else {
      if (direction === Direction.BuyFall) {
        return amountPool.downPoolAmount;
      } else {
        return amountPool.upPoolAmount;
      }
    }
  }, [game, amountPool, direction]);
}

export function useGameResult() {
  const [showResultAnimation, setShowResultAnimation] = useState(false);
  const game = useRealtimeGame();

  useEffect(() => {
    if (!game.status) return;

    if (game.status === GameStatus.FINISHED) {
      const timer = setTimeout(() => {
        setShowResultAnimation(true);
      }, 2000);

      return () => {
        clearTimeout(timer);
      };
    } else if (game.status === GameStatus.STARTED) {
      setShowResultAnimation(false);
    }
  }, [game.status]);

  return [game.winSide || null, showResultAnimation] as [Direction | null, boolean];
}

function useGraphFactor() {
  const game = useRealtimeGame();
  const isCutoff = game.status === GameStatus.CUTOFF_TRADE;
  const mode = useSelector((state: StoreState) => state.system.updown.mode);
  const [minFactor, maxFactor] = useMemo(() => {
    const factor = mode === 'turbo' ? 2 : 1;
    return [klineConfig.minFactor / factor, klineConfig.maxFactor / factor];
  }, [mode]);

  return isCutoff ? minFactor : maxFactor;
}

export function filterRange([from, to]: [number, number], [back, forward]: [number, number]): [number, number] {
  const delta = to - from;
  return [from - delta * back, to + delta * forward];
}

function columnDomain(arr: KlineItem[], col: number) {
  return arr.reduce(
    (domain, item) => {
      const val = item[col];
      domain = [Math.min(val, domain[0]), Math.max(val, domain[1])];
      return domain;
    },
    [Infinity, -Infinity]
  );
}

let listeners: (() => void)[] = [];
const interval = 30;

function tween(duration: number, onUpdate: (percent: number) => void) {
  let start = 0;
  const callback = () => {
    start += interval;

    const process = Math.min(1, start / duration);
    onUpdate(process);
    if (process === 1) clear();
  };

  listeners.push(callback);
  const clear = () => {
    listeners = listeners.filter((it) => it !== callback);
  };

  return clear;
}

export function useAnimateData() {
  const tweenKlineDataRef = useRef<KlineItem[]>([]);
  const tweeFactorRef = useRef(0);
  const tweenDomainRef = useRef<Domain>([0, 0]);
  const allKlineData = useKlineData();
  const factor = useGraphFactor();
  const [data, setData] = useState(() => ({ ...store, factor }));
  const dataRef = useRef<Store>(data);

  useEffect(() => {
    tweeFactorRef.current = tweeFactorRef.current || dataRef.current.factor;
    const prev = tweeFactorRef.current;
    if (prev === factor) return;

    return tween(1500, (process) => {
      tweeFactorRef.current = (factor - prev) * process + prev;
    });
  }, [factor]);

  const [yMin, yMax] = useMemo<Domain>(() => {
    if (!allKlineData.length) return [0, 0];
    const last = allKlineData[allKlineData.length - 1];
    const left = last[0] - factor - klineConfig.itemInterval;
    const range = allKlineData.filter((it) => it[0] > left);
    return filterRange(columnDomain(range, 1), [klineConfig.bottom, klineConfig.top]);
  }, [allKlineData, factor]);
  useEffect(() => {
    if (yMax === 0) return;
    tweenDomainRef.current = tweenDomainRef.current[0] ? tweenDomainRef.current : [yMin, yMax];
    const prev = tweenDomainRef.current;
    const domain: Domain = [yMin, yMax];
    if (prev[0] === domain[0] && prev[1] === domain[1]) return;

    const [startLeft, startRight] = prev;
    const [endLeft, endRight] = domain;

    return tween(klineConfig.itemInterval, (process) => {
      const left = process * (endLeft - startLeft) + startLeft;
      const right = process * (endRight - startRight) + startRight;
      tweenDomainRef.current = [left, right];
    });
  }, [yMin, yMax]);

  useEffect(() => {
    if (allKlineData.length < 2) return;

    const [start, end] = allKlineData.slice(-2);
    const [startTime, startPrice] = start;
    const [endTime, endPrice] = end;
    const stable = allKlineData.slice(0, -1);
    tweenKlineDataRef.current = stable;

    return tween(klineConfig.itemInterval, (percent) => {
      const time = percent * (endTime - startTime) + startTime;
      const price = percent * (endPrice - startPrice) + startPrice;
      tweenKlineDataRef.current = [...stable, [time, price]];
    });
  }, [allKlineData]);

  useEffect(() => {
    const timer = setInterval(() => {
      listeners.forEach((it) => it());
      const animate = tweenKlineDataRef.current.slice(-1)[0] || [0, 0];
      const xRange: Range = [animate[0] - tweeFactorRef.current, animate[0]];
      const yRange = tweenKlineDataRef.current.filter((it) => it[0] > xRange[0] - klineConfig.itemInterval);

      setData({
        xDomain: filterRange(xRange, [klineConfig.left, klineConfig.right]),
        yDomain: tweenDomainRef.current,
        xRange,
        yRange,
        animate,
        factor: tweeFactorRef.current,
      });
    }, interval);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      listeners = [];
    };
  }, []);

  return data;
}

type Domain = [number, number];
type Range = [number, number];
interface Store {
  yDomain: Domain;
  yRange: KlineItem[];
  xDomain: Domain;
  xRange: Range;
  factor: number;
  animate: KlineItem;
}
const store: Store = {
  yDomain: [0, 0],
  yRange: [],
  xDomain: [0, 0],
  xRange: [0, 0],
  factor: 0,
  animate: [0, 0],
};
