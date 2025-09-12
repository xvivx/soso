import { memo, useMemo } from 'react';
import { Annotation, HtmlLabel } from '@visx/annotation';
import { useActivePrice } from '@store/symbol';
import { useActiveTradingPairInfo } from '@store/tap';
import useMemoCallback from '@hooks/useMemoCallback';
import { cn } from '@utils';
import formatter from '@utils/formatter';
import { useGridSize, useMixinOrdersRects, useProbabilityWorker } from './hooks';
import { Scale, ViewBounding } from './utils';

function mod(price: number, gap: number) {
  const [intNumber, dotNumber = ''] = String(gap).split('.');
  if (dotNumber.length) {
    const tenPow = Math.pow(10, dotNumber.length);
    return ((price * tenPow) % (Number(intNumber) * tenPow + Number(dotNumber))) / tenPow;
  } else {
    return price % gap;
  }
}

interface GridsPredictionProps {
  xScale: Scale;
  yScale: Scale;
  preXTicks: number[];
  preYTicks: number[];
  bounding: ViewBounding;
}

function GridsPrediction(props: GridsPredictionProps) {
  const { xScale, yScale, preXTicks, preYTicks, bounding } = props;
  const GSize = useGridSize(bounding);
  const { price, time } = useActivePrice();
  const orderRects = useMixinOrdersRects();
  const { xGap, yGap, volatility } = useActiveTradingPairInfo();
  const { probabilityResult, computeGrids } = useProbabilityWorker();

  const textXs = useMemo(() => {
    const preXs = [...Array(3)].map((_, index) => {
      return time - mod(time, xGap) + xGap + xGap * index;
    });

    const firstX = preXTicks[0];
    const lastX = preXTicks[preXTicks.length - 1];

    return [...Array(5)]
      .map((_, index) => firstX - (index + 1) * xGap)
      .concat(preXTicks)
      .concat([...Array(5)].map((_, index) => lastX + (index + 1) * xGap))
      .filter((x) => preXs.includes(x));
  }, [preXTicks, time, xGap]);

  const textYs = useMemo(() => {
    if (preYTicks.length === 0) return [];

    const firstY = preYTicks[0];
    const lastY = preYTicks[preYTicks.length - 1];

    return [...Array(5)]
      .map((_, index) => firstY - (index + 1) * yGap)
      .concat(preYTicks)
      .concat([...Array(5)].map((_, index) => lastY + (index + 1) * yGap));
  }, [preYTicks, yGap]);

  const colorFormatter = useMemoCallback((value: number) => {
    if (value > 100) return 'bg-up/45';
    if (value > 30) return 'bg-up/40';
    if (value > 9) return 'bg-up/35';
    if (value > 6) return 'bg-up/30';
    if (value > 3) return 'bg-up/25';

    return 'bg-up/20';
  });

  computeGrids({
    initPrice: price,
    initTime: time,
    timeTicks: textXs,
    timeGap: xGap,
    priceTicks: textYs,
    priceGap: yGap,
    volatility,
  });

  if (!probabilityResult.length) return null;

  return probabilityResult.map((p) => {
    if (orderRects.find((or) => or.x === p.time && or.y === p.price)) return null;

    return (
      <Annotation key={`${p.time}-${p.price}`} x={xScale(p.time)} y={yScale(p.price)} dy={-GSize}>
        <HtmlLabel showAnchorLine={false} horizontalAnchor="start" verticalAnchor="start">
          <div
            className={cn('text-10 text-brand flex justify-center items-center', colorFormatter(p.hit))}
            style={{ width: GSize, height: GSize }}
          >
            {formatter.stringify(p.hit, 1)}x
          </div>
        </HtmlLabel>
      </Annotation>
    );
  });
}

export default memo(GridsPrediction);
