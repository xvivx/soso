import { createContext, MouseEvent, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { scaleLinear } from '@visx/scale';
import { PanInfo } from 'framer-motion';
import { useActiveTradingPairInfo } from '@store/tap';
import useMemoCallback from '@hooks/useMemoCallback';
import { tweening } from '@utils/tweening';
import { useCreateOrder, useGridSize, useKlines } from './hooks';
import { addRipple } from './Ripple';
import { calcGridXY, Domain, Kline, KlineGap, Scale, ViewBounding, XY } from './utils';

interface ChartContextProps {
  children: ReactNode;
}

interface ChartContextValue {
  events: {
    onPanStart: () => void;
    onPan: (_: PointerEvent, info: PanInfo) => void;
    onPanEnd: (_: PointerEvent, info: PanInfo) => void;
    onClick: (event: MouseEvent) => void;
  };
  xDomain: Domain;
  yDomain: Domain;
  xScale: Scale;
  yScale: Scale;
  updateBoundingInfo: (bounding: DOMRect) => void;
  klines: Kline[];
  bounding: ViewBounding;
  gotoCenter: () => void;
  GridSize: number;
}

const ChartContext = createContext<ChartContextValue>({
  events: {
    onPanStart: () => {},
    onPan: () => {},
    onPanEnd: () => {},
    onClick: () => {},
  },
  xDomain: [0, 0],
  yDomain: [0, 0],
  xScale: scaleLinear(),
  yScale: scaleLinear(),
  updateBoundingInfo: () => {},
  klines: [],
  bounding: { width: 0, height: 0 },
  gotoCenter: () => {},
  GridSize: 0,
});

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

export default function ChartContextProvider(props: ChartContextProps) {
  const [bounding, setBounding] = useState<ViewBounding>({ width: 0, height: 0 });
  const [chartPosition, setChartPosition] = useState({ top: 0, left: 0 });
  const { xGap, yGap, symbol } = useActiveTradingPairInfo();
  const GridSize = useGridSize(bounding);
  const klines = useKlines(bounding);
  const [yDomain, setYDomain] = useState<Domain>([0, 0]);
  const [xDomain, setXDomain] = useState<Domain>([0, 0]);
  const [tweenKline, setTweenKline] = useState<Kline[]>([]);
  const [isFollowLine, setIsFollowLine] = useState(true);

  const isReady = klines.length > 0;

  const xDelta = useMemo(() => (bounding.width / GridSize) * xGap, [GridSize, bounding.width, xGap]);
  const yDelta = useMemo(() => (bounding.height / GridSize) * yGap, [bounding.height, yGap, GridSize]);

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

    const firstKline = klines[0];
    if (!firstKline) return;

    const span = controller.xDomain[1] - controller.xDomain[0];
    const proposedLeft = controller.xDomain[0] - dx;
    const clampedLeft = Math.max(proposedLeft, firstKline[0]);
    const newXDomain: Domain = [clampedLeft, clampedLeft + span];
    const newYDomain: Domain = [controller.yDomain[0] + dy, controller.yDomain[1] + dy];

    setYDomain(newYDomain);
    setXDomain(newXDomain);

    if (isFollowLine) {
      setIsFollowLine(false);
    }
  });

  const onPanEnd = useMemoCallback((_: PointerEvent, info: PanInfo) => {
    const { x, y } = info.offset;
    const dy = (y / GridSize) * yGap;
    const dx = (x / GridSize) * xGap;

    const firstKline = klines[0];
    if (!firstKline) return;

    const span = controller.xDomain[1] - controller.xDomain[0];
    const proposedLeft = controller.xDomain[0] - dx;
    const clampedLeft = Math.max(proposedLeft, firstKline[0]);
    const newXDomain: Domain = [clampedLeft, clampedLeft + span];
    const newYDomain: Domain = [controller.yDomain[0] + dy, controller.yDomain[1] + dy];

    controller.yDomain = newXDomain;
    controller.xDomain = newXDomain;
    controller.moving = false;

    setYDomain(newYDomain);
    setXDomain(newXDomain);
  });

  const createOrder = useCreateOrder();
  const [xScale, yScale] = useScales(xDomain, yDomain, bounding);

  const onClick = useMemoCallback((event: MouseEvent) => {
    if (controller.moving || !xDomain[0]) return;
    const { left, top } = chartPosition;
    const xy: XY = [xScale.invert(event.clientX - left), yScale.invert(event.clientY - top)];
    const [lowerTimeLimit, lowerPriceLimit] = calcGridXY(xDomain, yDomain, xy, xGap, yGap);
    addRipple({ key: Date.now(), x: lowerTimeLimit, y: lowerPriceLimit });
    if (lowerTimeLimit < klines[klines.length - 1][0]) return;
    createOrder({ lowerTimeLimit, lowerPriceLimit });
  });

  const updateBoundingInfo = useMemoCallback((boundingInfo: DOMRect) => {
    const { width, height, left, top } = boundingInfo;

    setBounding({ width, height });
    setChartPosition({ left, top });
  });

  const gotoCenterImmediate = useMemoCallback(() => {
    const [x, y] = klines[klines.length - 1];

    controller.yDomain = [y - yDelta / 2, y + yDelta / 2];
    controller.xDomain = [x - xDelta / 2, x + xDelta / 2];

    setYDomain(controller.yDomain);
    setXDomain(controller.xDomain);
  });

  const gotoCenter = useMemoCallback(() => {
    const last = klines[klines.length - 1];

    if (!last) return;
    const [x, y] = last;

    const targetY: Domain = [y - yDelta / 2, y + yDelta / 2];
    const targetX: Domain = [x - xDelta / 2, x + xDelta / 2];
    const fromY: Domain = yDomain;
    const fromX: Domain = xDomain;
    const fromCenterY = (fromY[1] + fromY[0]) / 2;
    const fromCenterX = (fromX[1] + fromX[0]) / 2;
    const isTooClose = Math.abs(fromCenterY - y) < yGap * 2 && Math.abs(fromCenterX - x) < xGap;

    controller.moving = true;

    tweening({
      duration: isTooClose ? 1 : 500,
      easing: 'easeInOutCubic',
      onUpdate: (percent) => {
        const lerp = (a: number, b: number) => a + (b - a) * percent;

        controller.yDomain = [lerp(fromY[0], targetY[0]), lerp(fromY[1], targetY[1])];
        controller.xDomain = [lerp(fromX[0], targetX[0]), lerp(fromX[1], targetX[1])];

        setYDomain(controller.yDomain);
        setXDomain(controller.xDomain);
      },
      onComplete: () => {
        controller.moving = false;
        setIsFollowLine(true);
      },
    });
  });

  useEffect(() => {
    if (!isFollowLine || !tweenKline.length) return;

    const [x, y] = tweenKline[tweenKline.length - 1];

    controller.xDomain = [x - xDelta / 2, x + xDelta / 2];
    setXDomain(controller.xDomain);

    const yPadding = 2 * yGap;

    if (y + yPadding > yDomain[1]) {
      controller.yDomain = [y + yPadding - yDelta, y + yPadding];
      setYDomain(controller.yDomain);
    } else if (y - yPadding < yDomain[0]) {
      controller.yDomain = [y - yPadding, y - yPadding + yDelta];
      setYDomain(controller.yDomain);
    }
  }, [isFollowLine, tweenKline, xDelta, yDelta, yDomain, yGap]);

  useEffect(() => {
    return () => {
      setTweenKline([]);
    };
  }, [symbol]);

  useEffect(() => {
    if (klines.length < 2) {
      return;
    }

    const [start, end] = klines.slice(-2);
    const [startTime, startPrice] = start;
    const [endTime, endPrice] = end;
    const stable = klines.slice(0, -1);

    return tweening({
      duration: KlineGap,
      easing: 'linear',
      onUpdate: (percent) => {
        const time = percent * (endTime - startTime) + startTime;
        const price = percent * (endPrice - startPrice) + startPrice;

        setTweenKline([...stable, [time, price]]);
      },
    });
  }, [klines]);

  useEffect(() => {
    if (!isReady || !yDelta) return;

    gotoCenterImmediate();
  }, [gotoCenterImmediate, isReady, yDelta, xDelta]);

  return (
    <ChartContext.Provider
      value={{
        events: { onPanStart, onPan, onPanEnd, onClick },
        bounding,
        xDomain,
        yDomain,
        xScale,
        yScale,
        GridSize,
        updateBoundingInfo,
        gotoCenter,
        klines: klines.length ? tweenKline : klines,
      }}
    >
      {props.children}
    </ChartContext.Provider>
  );
}

export function useChartContext() {
  return useContext(ChartContext);
}
