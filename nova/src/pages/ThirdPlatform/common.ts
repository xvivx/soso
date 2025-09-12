import type { AxiosRequestConfig } from 'axios';
import { CandleResponse, KlineResponse } from '@store/symbol';
import { request } from '@utils';
import { urlSplicing } from '@utils/others';

type ChartIqKlineItem = { DT?: Date; Date?: string; Close?: number; Open?: number; High?: number; Low?: number };

let gapInit = 3 * 60 * 2 * 500;
let endTime = Date.now();
let startTime = endTime - gapInit;

const timeConvert: Record<string, number> = {
  day: 24 * 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1 * 1000,
};

const candleApi = '/api/data/kline/history/candlestick';
const mountainApi = '/api/data/kline/history/ticker';

type ParamsType = {
  timeunit: string;
  interval: number;
};

function getParams(symbol: string, params: ParamsType, isInit?: boolean) {
  const { timeunit, interval } = params;
  const chartStyle = interval + timeunit === '500millisecond' ? 'mountain' : 'candle';

  if (chartStyle === 'mountain') {
    gapInit = 3 * 60 * 2 * 500;
  } else if (chartStyle === 'candle') {
    gapInit = timeConvert[timeunit] * 6 * 60 * interval; //初始数据时间间隔  360 个单位
  }

  if (isInit) {
    endTime = Date.now();
    startTime = endTime - gapInit;
  }
  let queryUrl = '';
  if (chartStyle === 'mountain') {
    queryUrl =
      mountainApi +
      urlSplicing({
        symbol,
        start: startTime,
        end: endTime,
      });
  } else {
    queryUrl =
      candleApi +
      urlSplicing({
        symbol,
        start: startTime,
        end: endTime,
        interval: CandleInterval[interval + timeunit],
      });
  }
  const callback = () => {
    endTime = startTime;
    startTime = endTime - gapInit;
  };

  return { queryUrl, chartStyle, callback };
}

export function formatChartData(payload: (CandleResponse | KlineResponse)[]): ChartIqKlineItem[] {
  return (payload || []).map((it) => {
    if ('o' in it) {
      return {
        DT: new Date(it.t),
        Date: String(it.t),
        Close: +it.c,
        Open: +it.o,
        High: +it.h,
        Low: +it.l,
      };
    } else {
      return {
        DT: new Date(it.t),
        Close: +it.p,
      };
    }
  });
}

export const apis = {
  initial: async (symbol: string, params: ParamsType, config?: AxiosRequestConfig) => {
    const { queryUrl, callback } = getParams(symbol.replace('/', '-'), params, true);
    const data = await request.get<(KlineResponse | CandleResponse)[]>(queryUrl, undefined, config);
    callback();
    return formatChartData(data);
  },
  pagination: async (_: number, __: number, symbol: string, params: ParamsType) => {
    const { queryUrl, callback } = getParams(symbol.replace('/', '-'), params);
    const data = await request.get<(KlineResponse | CandleResponse)[]>(queryUrl);
    callback();
    return formatChartData(data);
  },
};

const CandleInterval: Record<string, string> = {
  '5second': '5s',
  '15second': '15s',
  '30second': '30s',
  '1day': '1d',
  '1minute': '1m',
  '5minute': '5m',
  '60minute': '1h',
  '240minute': '4h',
};
