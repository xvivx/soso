import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Annotation, HtmlLabel } from '@visx/annotation';
import { AxisBottom } from '@visx/axis';
import { curveBasis } from '@visx/curve';
import { scaleLinear, scaleUtc } from '@visx/scale';
import { AreaClosed, LinePath } from '@visx/shape';
import useSWR from 'swr';
import { useLocalCurrency } from '@store/system';
import { useUserInfo } from '@store/user';
import { useExchanges, useTotalLocaleAmount } from '@store/wallet';
import { useMediaQuery } from '@hooks/useResponsive';
import { Empty, Tabs } from '@components';
import { cn, formatter, request } from '@utils';
import { StatisticsCard, useUserStatistics } from '@pages/components/PersonalStatistics';
import { AssetsPanel } from '@/layouts/dashboard/header/Wallet';

type Asset = {
  asset: number;
  time: number;
};
function AssetsPage() {
  const { t } = useTranslation();
  const { data: userInfo } = useUserInfo();
  const { isValidating: statisticsLoading, data: statistics } = useUserStatistics(userInfo.id);
  const currency = useLocalCurrency();

  const totalAmount = useTotalLocaleAmount();
  return (
    <div className="space-y-3">
      <div className="flex flex-col s1024:flex-row gap-3">
        <div className="detrade-card flex-1 flex flex-col gap-3 p-4 s768:p-8">
          <div>
            <div className="text-16 s768:text-24">{t('Balance')}</div>
            <div className="flex items-center gap-3 mb-3 s768:mb-0  text-24 s768:text-36 font-600 truncate">
              {formatter.amount(totalAmount, currency).floor().toText()}
            </div>
          </div>

          <ChartViewContainer />
        </div>

        <AssetsPanel className="detrade-card flex flex-col s1024:w-100 h-100 s768:h-[600px] p-4 s768:p-8" />
      </div>

      <StatisticsCard
        className={cn(
          'detrade-card relative grid gap-2 grid-cols-2 s768:grid-cols-3',
          statisticsLoading && 'opacity-50'
        )}
        data={statistics}
      />
    </div>
  );
}

export default memo(AssetsPage);

export enum TimeRange {
  DAY = 1,
  WEEK = 2,
  MONTH = 3,
  SIX_MONTH = 4,
}

function ChartViewContainer() {
  const { t } = useTranslation();
  const [timeTabActiveIndex, setTimeTabActiveIndex] = useState(0);
  const timeTabs = useMemo(
    () => [
      { title: t('1D'), value: TimeRange.DAY },
      { title: t('1W'), value: TimeRange.WEEK },
      { title: t('1M'), value: TimeRange.MONTH },
      { title: t('6M'), value: TimeRange.SIX_MONTH },
    ],
    [t]
  );
  const timeRange = timeTabs[timeTabActiveIndex].value;

  return (
    <Tabs
      className="flex-1 flex flex-col"
      tabs={timeTabs}
      selectedIndex={timeTabActiveIndex}
      onChange={setTimeTabActiveIndex}
    >
      <Tabs.Header className="flex justify-end bg-transparent">
        {timeTabs.map((item, index) => (
          <Tabs.Item key={index} className="px-2 s1024:px-3" selectedClassName="bg-layer5">
            {item.title}
          </Tabs.Item>
        ))}
      </Tabs.Header>
      <ChartView timeRange={timeRange} />
    </Tabs>
  );
}

export function ChartView(props: { timeRange: TimeRange }) {
  const { mobile } = useMediaQuery();
  const { timeRange } = props;
  const [viewBounding, setViewBounding] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const localCurrency = useLocalCurrency();
  const exchanges = useExchanges();
  const localeExchange = exchanges[localCurrency];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new window.ResizeObserver(() => setViewBounding(container.getBoundingClientRect()));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const { data: assets, isValidating: loading } = useSWR(
    ['wallet-assets', timeRange],
    async () => {
      return (await request.get<Asset[]>('/api/account/account/asset', { timeRange })).map((it) => ({
        ...it,
        time: it.time * 1000,
      }));
    },
    { suspense: true, keepPreviousData: true }
  );

  const [minAsset, maxAsset] = useMemo(
    () =>
      assets.reduce(
        (domain, next) => {
          const [min, max] = domain;
          if (next.asset > max.asset) domain[1] = next;
          if (next.asset < min.asset) domain[0] = next;
          return domain;
        },
        [
          { time: 0, asset: Infinity },
          { time: 0, asset: -Infinity },
        ] as [Asset, Asset]
      ),
    [assets]
  );
  const yDomain = useMemo(() => {
    return filterRange([minAsset.asset === maxAsset.asset ? 0 : minAsset.asset, maxAsset.asset], [0.4, 0.2]);
  }, [minAsset, maxAsset]);
  const yScale = useMemo(() => {
    return scaleLinear<number>({
      domain: yDomain,
      range: [viewBounding.height, 0],
    });
  }, [yDomain, viewBounding]);

  const xDomain = useMemo(() => {
    if (assets.length === 0) return [0, 0];
    return [assets[0].time, assets[assets.length - 1].time];
  }, [assets]);

  const xScale = useMemo(() => {
    return scaleUtc<number>({
      domain: xDomain,
      range: [0, viewBounding.width],
    });
  }, [xDomain, viewBounding]);

  const isAssetNotEmpty = assets.length > 0;
  const isAssetDecreased = isAssetNotEmpty && assets[0].asset > assets[assets.length - 1].asset;
  const xAxisMaxValue = useMemo(
    () => (isAssetNotEmpty ? xScale(assets[assets.length - 1].time) : 0),
    [isAssetNotEmpty, assets, xScale]
  );
  return (
    <div ref={containerRef} className="relative w-full h-30 s1024:h-full">
      {assets.length > 0 && viewBounding.height > 0 ? (
        <svg className="size-full">
          <defs>
            <linearGradient id="asset-increase" x1="0" y1="0" x2="0" y2="1.2">
              <stop className="text-up/50" offset="0%" stopColor="currentColor" stopOpacity="0.2" />
              <stop className="text-up" offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="asset-decrease" x1="0" y1="0" x2="0" y2="1.2">
              <stop className="text-down/50" offset="0%" stopColor="currentColor" stopOpacity="0.2" />
              <stop className="text-down" offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* curve取值: 
                  curveMonotoneX - 严格保持数据点的单调性（上升/下降趋势）中等平滑，保留数据的 "棱角" 
                  curveBasis - 为了平滑度可能轻微偏离原始数据点, 线条更流畅但可能牺牲局部准确性*/}
          <LinePath<Asset>
            className={isAssetDecreased ? 'stroke-down' : 'stroke-up'}
            data={assets}
            x={(item) => xScale(item.time)}
            y={(item) => yScale(item.asset)}
            strokeWidth="2px"
            curve={curveBasis}
            shapeRendering="geometricPrecision"
          />
          <AreaClosed
            data={assets}
            x={(item) => xScale(item.time)}
            y={(item) => yScale(item.asset)}
            yScale={yScale}
            curve={curveBasis}
            fill={isAssetDecreased ? `url(#asset-decrease)` : `url(#asset-increase)`}
          />

          <Annotation x={xScale(maxAsset.time)} y={yScale(maxAsset.asset)}>
            <HtmlLabel
              className="text-0"
              showAnchorLine={false}
              horizontalAnchor={calcHorizontalAnchor(xScale(maxAsset.time), xAxisMaxValue)}
              verticalAnchor="end"
              containerStyle={{
                display: 'inline-block',
                textAlign: 'center',
              }}
            >
              <div className="text-secondary text-12">
                {formatter
                  .amount(maxAsset.asset / localeExchange, localCurrency)
                  .floor()
                  .toText()}
              </div>
            </HtmlLabel>
          </Annotation>

          <Annotation x={xScale(minAsset.time)} y={yScale(minAsset.asset)}>
            <HtmlLabel
              className="text-0"
              showAnchorLine={false}
              horizontalAnchor={calcHorizontalAnchor(xScale(minAsset.time), xAxisMaxValue)}
              verticalAnchor="start"
              containerStyle={{
                display: 'inline-block',
                textAlign: 'center',
              }}
            >
              <div className="text-secondary text-12">
                {formatter
                  .amount(minAsset.asset / localeExchange, localCurrency)
                  .floor()
                  .toText()}
              </div>
            </HtmlLabel>
          </Annotation>

          <AxisBottom
            top={viewBounding.height}
            hideTicks
            hideAxisLine
            orientation="top"
            numTicks={mobile ? 3 : 8}
            tickLabelProps={{
              className: 'text-secondary',
              fill: 'currentColor',
              textAnchor: 'middle',
            }}
            scale={xScale}
            tickFormat={(tick) => {
              if (loading) return '';
              return formatter.time(tick.valueOf(), timeRange === TimeRange.DAY ? 'time' : 'date');
            }}
          />
        </svg>
      ) : (
        <Empty className="min-h-0 absolute inset-0" />
      )}
    </div>
  );
}

function filterRange([from, to]: [number, number], [back, forward]: [number, number]): [number, number] {
  const delta = to - from;
  return [from - delta * back, to + delta * forward];
}

function calcHorizontalAnchor(value: number, max: number) {
  return value > max * 0.8 ? 'end' : value < max * 0.2 ? 'start' : 'middle';
}
