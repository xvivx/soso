import { useMemo } from 'react';
import { AxisBottom, AxisRight } from '@visx/axis';
import { scaleLinear } from '@visx/scale';
import { useActiveTradingPairInfo, useSettings } from '@store/tap';
import { formatter } from '@utils';
import GridsPrediction from './GridsPrediction';
import GridTraderOrder from './GridTraderOrder';
import { useGridSize } from './hooks';

type ViewBounding = { width: number; height: number };
type Scale = ReturnType<typeof scaleLinear<number>>;

function mod(price: number, gap: number) {
  const [intNumber, dotNumber = ''] = String(gap).split('.');
  if (dotNumber.length) {
    const tenPow = Math.pow(10, dotNumber.length);
    return ((price * tenPow) % (Number(intNumber) * tenPow + Number(dotNumber))) / tenPow;
  } else {
    return price % gap;
  }
}

interface GridsProps {
  x: number;
  y: number;
  xScale: Scale;
  yScale: Scale;
  bounding: ViewBounding;
  yDomain: [number, number];
}

function Grids(props: GridsProps) {
  const { x, y, xScale, yScale, bounding, yDomain } = props;
  const GridSize = useGridSize(bounding);
  const { width, height } = bounding;
  const { xGap, yGap, decimalPlaces } = useActiveTradingPairInfo();

  const xTicks = useMemo(() => {
    if (!x) return [];
    const start = x - mod(x, xGap);
    return new Array(Math.round(width / GridSize + 2)).fill('').map((_, index) => start + index * xGap);
  }, [x, width, xGap, GridSize]);
  const yTicks = useMemo(() => {
    if (!y) return [];
    const start = y - mod(y, yGap);
    return new Array(Math.round(height / GridSize + 2)).fill('').map((_, index) => start + index * yGap);
  }, [y, height, yGap, GridSize]);

  const yMinValue = yScale.invert(bounding.height - 8);
  const tickProps = useMemo(() => ({ className: 'stroke-thirdly', strokeDasharray: '2,2' }), []);
  const { showMultiplier, showPublicBets } = useSettings();

  return (
    <g>
      {showPublicBets && <GridTraderOrder xScale={xScale} yScale={yScale} bounding={bounding} yDomain={yDomain} />}

      {showMultiplier && (
        <GridsPrediction xScale={xScale} yScale={yScale} preXTicks={xTicks} preYTicks={yTicks} bounding={bounding} />
      )}

      <AxisBottom
        tickValues={xTicks}
        top={bounding.height}
        orientation="top"
        hideAxisLine
        scale={xScale}
        tickLength={bounding.height}
        tickLineProps={tickProps}
        tickLabelProps={{
          className: 'fill-current text-quarterary',
          textAnchor: 'middle',
          dy: bounding.height - 2,
          fontSize: 9,
        }}
        tickFormat={(tick) => {
          // eslint-disable-next-line no-restricted-syntax
          return new Date(tick.valueOf()).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
        }}
      />
      <AxisRight
        tickValues={yTicks}
        left={bounding.width}
        orientation="left"
        hideAxisLine
        scale={yScale}
        tickLength={bounding.width}
        tickLineProps={tickProps}
        tickLabelProps={{
          className: 'fill-current text-quarterary',
          dx: bounding.width - 2,
          dy: -2,
          fontSize: 9,
          textAnchor: 'end',
        }}
        tickFormat={(tick) => {
          const value = tick.valueOf();
          if (value > yMinValue) return formatter.price(value, decimalPlaces).toText();
        }}
      />
    </g>
  );
}

export default Grids;
