import { memo, useLayoutEffect, useRef } from 'react';
import { HtmlLabel } from '@visx/annotation';
import { curveMonotoneX } from '@visx/curve';
import { LinePath } from '@visx/shape';
import { motion } from 'framer-motion';
import { debounce } from 'lodash-es';
import { useActiveTradingPairInfo } from '@store/tap';
import { useAccountType } from '@store/wallet';
import useDocumentVisible from '@hooks/useDocumentVisible';
import useMemoCallback from '@hooks/useMemoCallback';
import { Loading } from '@components';
import WaterMark from '@pages/components/WaterMark';
import CheckoutEffect from './CheckoutEffect';
import { useChartContext } from './ContextChart';
import Grids from './Grids';
import OrderRects from './OrderRects';
import Ripple from './Ripple';
import { Kline } from './utils';

function ChartView() {
  const { xDomain, yDomain, xScale, yScale, klines, events, bounding } = useChartContext();

  return (
    <motion.svg className="size-full touch-none" {...events}>
      {klines.length ? (
        <>
          <Grids x={xDomain[0]} y={yDomain[0]} xScale={xScale} yScale={yScale} bounding={bounding} yDomain={yDomain} />
          <OrderRects xScale={xScale} yScale={yScale} bounding={bounding} />
          <LinePath<Kline>
            className="stroke-[#D7ED47] light:stroke-[#A8C200]"
            data={klines}
            x={(item) => xScale(item[0])}
            y={(item) => yScale(item[1])}
            strokeWidth={2}
            curve={curveMonotoneX}
          />
          <Ripple xScale={xScale} yScale={yScale} bounding={bounding} />
        </>
      ) : (
        <HtmlLabel
          x={bounding.width / 2}
          y={bounding.height / 2}
          showAnchorLine={false}
          horizontalAnchor="middle"
          verticalAnchor="middle"
        >
          <Loading.Svg className="size-5" />
        </HtmlLabel>
      )}
    </motion.svg>
  );
}

function ChartContainer() {
  const visible = useDocumentVisible();
  const accountType = useAccountType();
  const tradingPair = useActiveTradingPairInfo();
  const containerRef = useRef<HTMLDivElement>(null);
  const { updateBoundingInfo } = useChartContext();

  const updateByScroll = useMemoCallback(() => {
    const container = containerRef.current!;
    const debounceUpdate = debounce(() => updateBoundingInfo(container.getBoundingClientRect()), 500);

    addEventListener('scroll', debounceUpdate);
  });

  useLayoutEffect(() => {
    const container = containerRef.current!;
    const observer = new ResizeObserver(() => updateBoundingInfo(container.getBoundingClientRect()));

    observer.observe(container);

    updateByScroll();

    return () => {
      observer.disconnect();
      removeEventListener('scrollend', updateByScroll);
    };
  }, [updateBoundingInfo, updateByScroll]);

  return (
    <div id="chart-view" className="relative select-none bg-layer3 h-[450px] s768:h-[604px]" ref={containerRef}>
      {visible && <ChartView key={`${accountType}-${tradingPair.symbol}`} />}
      <WaterMark className="absolute left-3 bottom-3" />
      <CheckoutEffect />
    </div>
  );
}

export default memo(ChartContainer, () => true);
