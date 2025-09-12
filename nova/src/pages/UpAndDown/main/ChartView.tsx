import { memo, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Annotation, CircleSubject, HtmlLabel, LineSubject } from '@visx/annotation';
import { AxisRight } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { useUpdownGameLabel } from '@store/system';
import { KlineItem, useLastKlineItem, useRealtimeGame } from '@store/upDown';
import useDocumentVisible from '@hooks/useDocumentVisible';
import { useMediaQuery } from '@hooks/useResponsive';
import { SvgIcon } from '@components';
import { formatter, Systems } from '@utils';
import { useAnimateData } from '../common';
import * as Gradient from './Gradient';

type ViewBounding = { width: number; height: number };

function AnimateView(props: { viewBounding: ViewBounding }) {
  const { viewBounding } = props;
  const { gt1920, mobile } = useMediaQuery();
  const { t } = useTranslation();
  const game = useRealtimeGame();
  const { animate, xDomain, yRange, yDomain } = useAnimateData();
  const lastRealKlineItem = useLastKlineItem();

  const xScale = useMemo(() => {
    return scaleLinear<number>({
      domain: xDomain,
      range: [0, viewBounding.width],
    });
  }, [xDomain, viewBounding]);

  const yScale = useMemo(() => {
    return scaleLinear<number>({
      domain: yDomain,
      range: [viewBounding.height, 0],
    });
  }, [viewBounding, yDomain]);

  const startPrice = game.startPrice || 0;
  const endPrice = game.endPrice || 0;
  const upRectHeight = (() => {
    return Math.max(Math.min(viewBounding.height, yScale(startPrice || animate[1]) || 0), 0);
  })();
  const [upRectOpacity, downRectOpacity] = (() => {
    if (endPrice) {
      return endPrice > startPrice ? [1, 0.5] : [0.5, 1];
    } else if (startPrice) {
      return animate[1] > startPrice ? [1, 0.5] : [0.5, 1];
    } else {
      return [0.5, 0.5];
    }
  })();

  if (!game.id) return null;
  return (
    <g>
      {/* 上涨区块 */}
      <rect
        x="0"
        y="0"
        width="100%"
        height={upRectHeight}
        fill={`url(#${Gradient.UP_RECT_ID})`}
        opacity={upRectOpacity}
      />
      {/* 下跌区块 */}
      <rect
        x="0"
        y={upRectHeight}
        width="100%"
        height={viewBounding.height - upRectHeight}
        fill={`url(#${Gradient.DOWN_RECT_ID})`}
        opacity={downRectOpacity}
      />
      <AxisRight
        scale={yScale}
        left={viewBounding.width}
        hideAxisLine
        orientation="left"
        tickLength={viewBounding.width}
        numTicks={6}
        tickLineProps={{ className: 'stroke-thirdly' }}
        tickLabelProps={{
          className: 'fill-current text-tertiary',
          dx: viewBounding.width - 4,
          dy: -4,
          fontSize: '12px',
          fontWeight: 400,
          textAnchor: 'end',
        }}
        tickFormat={(tick) => {
          return formatter.price(tick.valueOf(), 4).toText();
        }}
      />

      {/* kline曲线 */}
      <LinePath<KlineItem>
        className="stroke-[#D7ED47] light:stroke-[#A8C200]"
        data={yRange}
        x={(item) => xScale(item[0])}
        y={(item) => yScale(item[1])}
        strokeWidth="2px"
        curve={curveMonotoneX}
      />

      {/* 开始价格线，从此禁止下单 */}
      <Annotation x={xScale(game.priceStartTime)} y={0}>
        <LineSubject
          orientation="vertical"
          strokeDasharray="1 2"
          stroke={`url(#${Gradient.START_PRICE_LINE_ID})`}
          min={0}
          max={viewBounding.height}
        />
        <HtmlLabel showAnchorLine={false} horizontalAnchor="middle" verticalAnchor="start">
          <SvgIcon name="flagOutlined" className="size-3 s768:size-4 s1366:size-5 text-primary" />
        </HtmlLabel>
      </Annotation>

      {/* 结束价格线, 之后出结果 */}
      <Annotation x={xScale(game.priceEndTime)} y={0}>
        <LineSubject
          orientation="vertical"
          stroke={`url(#${Gradient.END_PRICE_LINE_ID})`}
          min={0}
          max={viewBounding.height}
        />
        <HtmlLabel showAnchorLine={false} horizontalAnchor="middle" verticalAnchor="start">
          <SvgIcon name="flagFilled" className="size-3 s768:size-4 s1366:size-5 text-primary" />
        </HtmlLabel>
      </Annotation>

      {/* 浮标横线 */}
      <Annotation x={xScale(animate[0])} y={yScale(animate[1])}>
        <LineSubject
          className="stroke-main"
          min={0}
          max={viewBounding.width}
          orientation="horizontal"
          strokeWidth={2}
          strokeDasharray="2,2"
        />
      </Annotation>
      <Annotation x={xScale(animate[0])} y={yScale(animate[1])}>
        {Systems.browser.isChrome && (
          <HtmlLabel
            showAnchorLine={false}
            horizontalAnchor="middle"
            verticalAnchor="middle"
            containerStyle={{
              position: 'fixed',
              display: 'block',
              width: gt1920 ? 16 : 12,
              height: gt1920 ? 16 : 12,
            }}
          >
            <div className="size-full rounded-full bg-white animate-ping" />
          </HtmlLabel>
        )}
        <CircleSubject radius={gt1920 ? 5 : 4} fill="white" strokeWidth={0} />
      </Annotation>

      {/* 开始价格 */}
      {startPrice ? (
        <Annotation
          x={0}
          // 把entryPrice位置限制在可视区域
          y={Math.max(Math.min(viewBounding.height - 32, upRectHeight), mobile ? 70 : 122)}
        >
          <HtmlLabel showAnchorLine={false} horizontalAnchor="start" verticalAnchor="middle">
            <Price title={t('Start')} value={startPrice} />
          </HtmlLabel>
        </Annotation>
      ) : null}
      {/* 最新价格 */}
      {animate[1] ? (
        <Annotation x={xScale(xDomain[1])} y={Math.max(Math.min(yScale(animate[1]), viewBounding.height - 32), 64)}>
          <HtmlLabel showAnchorLine={false} horizontalAnchor="end" verticalAnchor="middle">
            <Price title={t('Live')} value={lastRealKlineItem[1]} />
          </HtmlLabel>
        </Annotation>
      ) : null}
    </g>
  );
}

function Price(props: { value: number; title: ReactNode }) {
  const { title, value } = props;
  const { gt1024 } = useMediaQuery();

  return (
    <div className="w-28 s1024:w-36 p-1 rounded-1.5 overflow-hidden text-primary_brand text-center bg-[#D7ED47] shadow-[0px_7px_9px_0px_#00000033]">
      <div className="text-12 font-500">{title}</div>
      <div
        className="h-px my-1.5"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(172, 206, 255, 0.00) 0.49%, #ACCEFF 50.06%, rgba(172, 206, 255, 0.00) 100%)`,
        }}
      />
      <div className="text-16 font-700">{formatter.price(value, gt1024 ? 5 : 4).toText()}</div>
    </div>
  );
}

function ChartView() {
  const visible = useDocumentVisible();
  const label = useUpdownGameLabel();
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBounding, setViewBounding] = useState<ViewBounding>(() => ({ width: 0, height: 0 }));
  useEffect(() => {
    const container = svgRef.current!;
    const observer = new window.ResizeObserver(() => {
      setViewBounding(container.getBoundingClientRect());
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  return (
    <svg className="size-full" ref={svgRef}>
      <Gradient.SvgGradient height={viewBounding.height} />
      {visible && <AnimateView key={label} viewBounding={viewBounding} />}
    </svg>
  );
}

export default memo(ChartView);
