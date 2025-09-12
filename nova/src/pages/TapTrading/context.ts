import { MouseEvent, RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear } from '@visx/scale';
import { PanInfo } from 'framer-motion';
import { useActiveTradingPairInfo } from '@store/tap';
import useMemoCallback from '@hooks/useMemoCallback';
import { useCreateOrder, useGridSize, useKlines } from './hooks';
import { addRipple } from './Ripple';
import { calcGridXY, Domain, Kline, KlineGap, ViewBounding, XY } from './utils';

let listeners: (() => void)[] = [];
const interval = 30;

function tween(duration: number, onUpdate: (percent: number) => void) {
  const start = Date.now();
  const callback = () => {
    const process = Math.min(1, (Date.now() - start) / duration);
    onUpdate(process);
    if (process === 1) clear();
  };

  listeners.push(callback);
  const clear = () => {
    listeners = listeners.filter((it) => it !== callback);
  };

  return clear;
}

type Controller = { xDomain: Domain; yDomain: Domain; moving: boolean; reset: () => void };
const controller: Controller = {
  moving: false,
  xDomain: [0, 0],
  yDomain: [0, 0],
  reset() {
    this.moving = false;
    this.xDomain = [0, 0];
    this.yDomain = [0, 0];
  },
};

function useScales(xDomain: Domain, yDomain: Domain, bounding: ViewBounding) {
  const { width, height } = bounding;
  const xScale = useMemo(() => {
    return scaleLinear<number>({ domain: xDomain, range: [0, width] });
  }, [xDomain, width]);
  const yScale = useMemo(() => {
    return scaleLinear<number>({ domain: yDomain, range: [height, 0] });
  }, [height, yDomain]);
  return [xScale, yScale];
}

export function useContext(bounding: ViewBounding, svgRef: RefObject<SVGSVGElement>) {
  const { xGap, yGap } = useActiveTradingPairInfo();
  const GridSize = useGridSize(bounding);
  const klines = useKlines(bounding);
  const [yDomain, setYDomain] = useState<Domain>([0, 0]);
  const [xDomain, setXDomain] = useState<Domain>([0, 0]);

  const isReady = klines.length > 0;
  const klinesRef = useRef(klines);
  klinesRef.current = klines;

  const xDelta = useMemo(() => (bounding.width / GridSize) * xGap, [GridSize, bounding.width, xGap]);
  const yDelta = useMemo(() => (bounding.height / GridSize) * yGap, [bounding.height, yGap, GridSize]);

  useEffect(() => {
    if (!isReady || !yDelta) return;

    const [x, y] = klinesRef.current[klinesRef.current.length - 1];

    controller.yDomain = [y - yDelta / 2, y + yDelta / 2];
    controller.xDomain = [x - xDelta / 2, x + xDelta / 2];

    setYDomain(controller.yDomain);
    setXDomain(controller.xDomain);
  }, [isReady, xDelta, yDelta]);

  // 卸载时恢复初始状态
  useEffect(() => () => controller.reset(), []);

  const onPanStart = useMemoCallback(() => {
    controller.moving = true;
    controller.yDomain = yDomain;
    controller.xDomain = xDomain;
  });

  const onPan = useMemoCallback((_: PointerEvent, info: PanInfo) => {
    const { x, y } = info.offset;
    const dy = (y / GridSize) * yGap;
    const dx = (x / GridSize) * xGap;

    setYDomain([controller.yDomain[0] + dy, controller.yDomain[1] + dy]);
    setXDomain([controller.xDomain[0] - dx, controller.xDomain[1] - dx]);
  });

  const onPanEnd = useMemoCallback((_: PointerEvent, info: PanInfo) => {
    const { x, y } = info.offset;
    const dy = (y / GridSize) * yGap;
    const dx = (x / GridSize) * xGap;

    controller.yDomain = [controller.yDomain[0] + dy, controller.yDomain[1] + dy];
    controller.xDomain = [controller.xDomain[0] - dx, controller.xDomain[1] - dx];
    controller.moving = false;

    // const [yMin, yMax] = klines.reduce((range, next) => [Math.min(next[1], range[0]), Math.max(next[1], range[1])], [
    //   Infinity,
    //   -Infinity,
    // ] as const);
    // if (yMin > controller.yDomain[1]) {
    //   controller.yDomain = [yMax - (controller.yDomain[1] - controller.yDomain[0]), yMax];
    // } else if (yMax < controller.yDomain[0]) {
    //   controller.yDomain = [yMin, yMin + controller.yDomain[1] - controller.yDomain[0]];
    // }

    setYDomain(controller.yDomain);
    setXDomain(controller.xDomain);
  });

  const [data, setData] = useState(() => ({ ...store }));

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const tweenKlineDataRef = useRef<Kline[]>([]);

  useEffect(() => {
    if (klines.length < 2) return;

    const [start, end] = klines.slice(-2);
    const [startTime, startPrice] = start;
    const [endTime, endPrice] = end;
    const stable = klines.slice(0, -1);
    tweenKlineDataRef.current = stable;

    return tween(KlineGap, (percent) => {
      const time = percent * (endTime - startTime) + startTime;
      const price = percent * (endPrice - startPrice) + startPrice;
      tweenKlineDataRef.current = [...stable, [time, price]];
    });
  }, [klines]);

  const factor = (bounding.width / GridSize) * xGap;
  useEffect(() => {
    const timer = setInterval(() => {
      listeners.forEach((it) => it());
      const animate = tweenKlineDataRef.current.slice(-1)[0] || [0, 0];

      if (!controller.moving) {
        setData({
          klines: tweenKlineDataRef.current,
          animate,
        });
      } else {
        setData((prev) => ({ ...prev, klines: tweenKlineDataRef.current, animate }));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [factor]);

  useEffect(() => {
    return () => {
      listeners = [];
    };
  }, []);

  const createOrder = useCreateOrder();
  const [xScale, yScale] = useScales(xDomain, yDomain, bounding);

  const onClick = useMemoCallback((event: MouseEvent) => {
    if (controller.moving || !xDomain[0]) return;
    const { left, top } = svgRef.current!.getBoundingClientRect();
    const xy: XY = [xScale.invert(event.clientX - left), yScale.invert(event.clientY - top)];
    const [lowerTimeLimit, lowerPriceLimit] = calcGridXY(xDomain, yDomain, xy, xGap, yGap);
    addRipple({ key: Date.now(), x: lowerTimeLimit, y: lowerPriceLimit });
    if (lowerTimeLimit < klines[klines.length - 1][0]) return;
    createOrder({ lowerTimeLimit, lowerPriceLimit });
  });
  return {
    events: { onPanStart, onPan, onPanEnd, onClick },
    xDomain,
    yDomain,
    xScale,
    yScale,
    ...data,
  };
}

interface Store {
  klines: Kline[];
  // xDomain: Domain;
  animate: Kline;
}
const store: Store = {
  klines: [],
  // xDomain: [0, 0],
  animate: [0, 0],
};
