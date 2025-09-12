export type BackendKlineItem = { s: string; p: string; t: number };
export interface QuoteFeedFunction {
  (
    symbol: string,
    start: Date,
    ebd: Date,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any,
    cb: (data: { quotes: ChartIqKlineItem[] }) => void
  ): Promise<ChartIqKlineItem[]>;
}

export enum ChartMode {
  advanced = 'advanced',
  basic = 'basic',
}
export type ChartIqKlineItem = { DT?: Date; Date?: string; Close?: number; Open?: number; High?: number; Low?: number };

export interface ChartFeed {
  fetchInitialData: QuoteFeedFunction;
  fetchPaginationData: QuoteFeedFunction;
}

export const PeriodicityMap = {
  '500ms': { label: 'Tick', value: { period: 1, interval: 500, timeUnit: 'millisecond' } },
  '5s': { label: '5 Second', value: { period: 1, interval: 5, timeUnit: 'second' } },
  '15s': { label: '15 Second', value: { period: 1, interval: 15, timeUnit: 'second' } },
  '30s': { label: '30 Second', value: { period: 1, interval: 30, timeUnit: 'second' } },
  '1m': { label: '1 Min', value: { period: 1, interval: 1, timeUnit: 'minute' } },
  '5m': { label: '5 Min', value: { period: 1, interval: 5, timeUnit: 'minute' } },
  '1h': { label: '1 Hour', value: { period: 2, interval: 60, timeUnit: 'minute' } },
  '4h': { label: '4 Hours', value: { period: 2, interval: 240, timeUnit: 'minute' } },
  '1d': { label: '1 Day', value: { period: 1, interval: 1, timeUnit: 'day' } },
};

export type ChartOptions = {
  mode?: ChartMode;
  container: HTMLElement;
  symbol?: string;
  periodicity?: keyof typeof PeriodicityMap;
  fetchInitial?: QuoteFeedFunction;
  fetchPagination?: QuoteFeedFunction;
  onLoadingChange?: (loading: boolean) => void;
  theme?: 'lighten' | 'darken';
};

export type MarkerType = 'active' | 'closed' | 'public';
export type MarkerOptions = {
  markerType: MarkerType;
  label: string;
  x: number;
  y: number;
  innerHTML: string;
};

export type PositionMarker = {
  label: string;
  price?: number;
  color: string;
  id: string;
  show: boolean;
};

export type PositionSpacing = {
  price?: number;
  color?: string;
  startTime?: number;
  endTime?: number;
  id: string;
  show: boolean;
};

export type SpreadOrderLine = {
  spreadPrice?: number;
  startPrice?: number;
  color?: string;
  startTime?: number;
  endTime?: number;
  id: string;
  show: boolean;
};

export function formatQuoteFeedReturn(feedFunction?: QuoteFeedFunction): QuoteFeedFunction {
  return (symbol, start, end, params, cb) => {
    const format: typeof cb = (params) => {
      return cb({
        quotes: params.quotes.map((it) => {
          if (it.Close) {
            it.Close *= 1000;
          }
          if (it.High) {
            it.High *= 1000;
          }
          if (it.Low) {
            it.Low *= 1000;
          }
          if (it.Open) {
            it.Open *= 1000;
          }
          return it;
        }),
      });
    };

    if (feedFunction) {
      return feedFunction(symbol, start, end, params, format);
    } else {
      cb({ quotes: [] });
      return Promise.resolve([]);
    }
  };
}
